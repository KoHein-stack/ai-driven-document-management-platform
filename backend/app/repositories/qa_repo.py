"""QA repository – database queries for QASession and QAMessage models."""

from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.qa import QASession, QAMessage


class QARepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session(self, user_id: UUID, document_id: UUID) -> QASession:
        session = QASession(user_id=user_id, document_id=document_id)
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session)
        return session

    async def get_session(self, session_id: int) -> QASession | None:
        result = await self.db.execute(
            select(QASession)
            .options(selectinload(QASession.messages))
            .where(QASession.id == session_id)
        )
        return result.scalar_one_or_none()

    async def get_sessions_for_document(self, user_id: UUID, document_id: UUID) -> list[QASession]:
        result = await self.db.execute(
            select(QASession)
            .options(selectinload(QASession.messages))
            .where(QASession.user_id == user_id, QASession.document_id == document_id)
            .order_by(QASession.created_at.desc())
        )
        return list(result.scalars().all())

    async def add_message(self, session_id: int, role: str, content: str) -> QAMessage:
        msg = QAMessage(session_id=session_id, role=role, content=content)
        self.db.add(msg)
        await self.db.flush()
        await self.db.refresh(msg)
        return msg
