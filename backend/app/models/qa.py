"""QA session and message ORM models."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, ForeignKey, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class QASession(Base):
    __tablename__ = "qa_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user = relationship("User", back_populates="qa_sessions")
    document = relationship("Document", back_populates="qa_sessions")
    messages = relationship("QAMessage", back_populates="session", lazy="selectin", order_by="QAMessage.created_at")


class QAMessage(Base):
    __tablename__ = "qa_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("qa_sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # "user" or "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    session = relationship("QASession", back_populates="messages")
