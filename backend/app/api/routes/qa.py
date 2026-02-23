"""QA routes – AI-powered document Q&A."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.qa import QARequest, QAResponse
from app.services.qa_service import QAService

router = APIRouter(prefix="/qa", tags=["AI Q&A"])


@router.post("/{document_id}", response_model=QAResponse)
async def ask_question(
    document_id: str,
    body: QARequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from uuid import UUID
    service = QAService(db)
    result = await service.ask_question(
        document_id=UUID(document_id),
        user_id=current_user.id,
        question=body.question,
    )
    return QAResponse(**result)
