"""Pydantic schemas for Q&A."""

from pydantic import BaseModel


class QARequest(BaseModel):
    question: str


class QAMessageResponse(BaseModel):
    role: str
    content: str
    created_at: str

    model_config = {"from_attributes": True}


class QAResponse(BaseModel):
    answer: str
    session_id: int
    messages: list[QAMessageResponse] = []
