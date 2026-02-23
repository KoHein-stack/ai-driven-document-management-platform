"""Search routes."""

import math
from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentListResponse
from app.services.document_service import DocumentService

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("", response_model=DocumentListResponse)
async def search_documents(
    q: str = QueryParam(..., min_length=1, description="Search query"),
    page: int = QueryParam(1, ge=1),
    size: int = QueryParam(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DocumentService(db)
    items, total = await service.search(query=q, page=page, size=size)
    return DocumentListResponse(
        items=[
            DocumentResponse(
                id=str(d.id),
                title=d.title,
                file_type=d.file_type,
                file_size=d.file_size,
                is_deleted=d.is_deleted,
                created_at=str(d.created_at),
                updated_at=str(d.updated_at),
                uploaded_by=str(d.uploaded_by),
                tags=[{"id": t.id, "name": t.name} for t in d.tags],
            )
            for d in items
        ],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0,
    )
