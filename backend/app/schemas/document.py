"""Pydantic schemas for documents."""

from datetime import datetime
from pydantic import BaseModel


# ── Requests ─────────────────────────────────────────
class DocumentUpdate(BaseModel):
    title: str | None = None
    tags: list[str] | None = None


# ── Responses ────────────────────────────────────────
class TagResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class DocumentResponse(BaseModel):
    id: str
    title: str
    file_type: str
    file_size: int
    is_deleted: bool
    created_at: str
    updated_at: str
    uploaded_by: str
    tags: list[TagResponse] = []

    model_config = {"from_attributes": True}


class DocumentDetailResponse(DocumentResponse):
    file_path: str
    extracted_text: str | None = None
    owner_email: str | None = None


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int
    page: int
    size: int
    pages: int
