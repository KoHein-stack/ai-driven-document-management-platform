"""Document routes – upload, list, detail, update, delete."""

import asyncio
import math

from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.document import (
    DocumentResponse, DocumentDetailResponse, DocumentListResponse, DocumentUpdate,
)
from app.services.document_service import DocumentService
from app.utils.ocr import process_ocr_background

router = APIRouter(prefix="/documents", tags=["Documents"])


def _doc_to_response(doc) -> DocumentResponse:
    return DocumentResponse(
        id=str(doc.id),
        title=doc.title,
        file_type=doc.file_type,
        file_size=doc.file_size,
        is_deleted=doc.is_deleted,
        created_at=str(doc.created_at),
        updated_at=str(doc.updated_at),
        uploaded_by=str(doc.uploaded_by),
        tags=[{"id": t.id, "name": t.name} for t in doc.tags],
    )


def _doc_to_detail(doc) -> DocumentDetailResponse:
    return DocumentDetailResponse(
        id=str(doc.id),
        title=doc.title,
        file_type=doc.file_type,
        file_size=doc.file_size,
        file_path=doc.file_path,
        extracted_text=doc.extracted_text,
        is_deleted=doc.is_deleted,
        created_at=str(doc.created_at),
        updated_at=str(doc.updated_at),
        uploaded_by=str(doc.uploaded_by),
        owner_email=doc.owner.email if doc.owner else None,
        tags=[{"id": t.id, "name": t.name} for t in doc.tags],
    )


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(""),
    tags: str = Form(""),  # comma-separated
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tag_names = [t.strip() for t in tags.split(",") if t.strip()] if tags else None
    service = DocumentService(db)
    doc = await service.upload(
        file=file, title=title, user_id=current_user.id, tag_names=tag_names
    )

    # Trigger OCR in background
    background_tasks.add_task(process_ocr_background, str(doc.id), doc.file_path)

    return _doc_to_response(doc)


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    file_type: str | None = Query(None),
    tag: str | None = Query(None),
    title: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DocumentService(db)
    items, total = await service.list_documents(
        page=page, size=size, file_type=file_type, tag=tag, title_search=title,
    )
    return DocumentListResponse(
        items=[_doc_to_response(d) for d in items],
        total=total,
        page=page,
        size=size,
        pages=math.ceil(total / size) if total > 0 else 0,
    )


@router.get("/{doc_id}", response_model=DocumentDetailResponse)
async def get_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from uuid import UUID
    service = DocumentService(db)
    doc = await service.get_document(UUID(doc_id))
    return _doc_to_detail(doc)


@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document(
    doc_id: str,
    body: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from uuid import UUID
    service = DocumentService(db)
    doc = await service.update_document(
        doc_id=UUID(doc_id),
        user_id=current_user.id,
        user_role=current_user.role.value,
        title=body.title,
        tag_names=body.tags,
    )
    return _doc_to_response(doc)


@router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from uuid import UUID
    service = DocumentService(db)
    await service.delete_document(
        doc_id=UUID(doc_id),
        user_id=current_user.id,
        user_role=current_user.role.value,
    )
