"""Pydantic schemas for admin endpoints."""

from pydantic import BaseModel


class AdminUserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    role: str
    created_at: str
    document_count: int = 0

    model_config = {"from_attributes": True}


class AdminStatsResponse(BaseModel):
    total_users: int
    total_documents: int
    total_deleted_documents: int
    uploads_today: int
