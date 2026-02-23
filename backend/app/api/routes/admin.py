"""Admin routes – user management and statistics."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import require_admin
from app.models.user import User
from app.schemas.admin import AdminUserResponse, AdminStatsResponse
from app.repositories.user_repo import UserRepository
from app.repositories.document_repo import DocumentRepository
from app.services.document_service import DocumentService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[AdminUserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    repo = UserRepository(db)
    users = await repo.get_all()
    return [
        AdminUserResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            role=u.role.value,
            created_at=str(u.created_at),
            document_count=len(u.documents) if u.documents else 0,
        )
        for u in users
    ]


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user_repo = UserRepository(db)
    doc_repo = DocumentRepository(db)
    return AdminStatsResponse(
        total_users=await user_repo.count(),
        total_documents=await doc_repo.count(),
        total_deleted_documents=await doc_repo.count_deleted(),
        uploads_today=await doc_repo.count_uploads_today(),
    )


@router.delete("/documents/{doc_id}", status_code=204)
async def admin_delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    from uuid import UUID
    service = DocumentService(db)
    doc = await service.get_document(UUID(doc_id))
    await DocumentRepository(db).soft_delete(doc)
