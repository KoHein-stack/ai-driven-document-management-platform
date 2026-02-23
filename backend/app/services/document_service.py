"""Document service – business logic for document management."""

import os
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.document import Document
from app.repositories.document_repo import DocumentRepository, TagRepository
from app.exceptions.http_exceptions import (
    BadRequestException,
    NotFoundException,
    ForbiddenException,
)

ALLOWED_TYPES = {"application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png"}
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}


class DocumentService:

    def __init__(self, db: AsyncSession):
        self.repo = DocumentRepository(db)
        self.tag_repo = TagRepository(db)

    async def upload(
        self, file: UploadFile, title: str, user_id: uuid.UUID, tag_names: list[str] | None = None
    ) -> Document:
        # Validate extension
        ext = Path(file.filename or "").suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise BadRequestException(f"File type '{ext}' not allowed. Allowed: {ALLOWED_EXTENSIONS}")

        # Read file & validate size
        content = await file.read()
        if len(content) > settings.max_file_size_bytes:
            raise BadRequestException(f"File too large. Maximum: {settings.MAX_FILE_SIZE_MB}MB")

        # Determine file type
        file_type = ext.lstrip(".")
        if file_type == "jpeg":
            file_type = "jpg"

        # Save to disk
        file_id = uuid.uuid4()
        filename = f"{file_id}{ext}"
        file_path = settings.upload_path / filename
        with open(file_path, "wb") as f:
            f.write(content)

        # Create document record
        doc = Document(
            id=file_id,
            title=title or file.filename or "Untitled",
            file_path=str(file_path),
            file_type=file_type,
            file_size=len(content),
            uploaded_by=user_id,
        )

        # Handle tags
        if tag_names:
            tags = await self.tag_repo.get_or_create_many(tag_names)
            doc.tags = tags

        doc = await self.repo.create(doc)
        return doc

    async def get_document(self, doc_id: uuid.UUID) -> Document:
        doc = await self.repo.get_by_id(doc_id)
        if not doc:
            raise NotFoundException("Document not found")
        return doc

    async def list_documents(
        self,
        page: int = 1,
        size: int = 20,
        file_type: str | None = None,
        tag: str | None = None,
        title_search: str | None = None,
        user_id: uuid.UUID | None = None,
    ) -> tuple[list[Document], int]:
        return await self.repo.get_list(
            page=page, size=size, file_type=file_type, tag=tag,
            title_search=title_search, user_id=user_id,
        )

    async def update_document(
        self, doc_id: uuid.UUID, user_id: uuid.UUID, user_role: str,
        title: str | None = None, tag_names: list[str] | None = None
    ) -> Document:
        doc = await self.get_document(doc_id)
        if str(doc.uploaded_by) != str(user_id) and user_role != "ADMIN":
            raise ForbiddenException("You can only update your own documents")

        if title is not None:
            doc.title = title
        if tag_names is not None:
            doc.tags = await self.tag_repo.get_or_create_many(tag_names)

        return await self.repo.update(doc)

    async def delete_document(self, doc_id: uuid.UUID, user_id: uuid.UUID, user_role: str) -> None:
        doc = await self.get_document(doc_id)
        if str(doc.uploaded_by) != str(user_id) and user_role != "ADMIN":
            raise ForbiddenException("You can only delete your own documents")
        await self.repo.soft_delete(doc)

    async def search(self, query: str, page: int = 1, size: int = 20) -> tuple[list[Document], int]:
        return await self.repo.search(query, page, size)
