"""QA service – AI question-answering business logic."""

import uuid
import httpx

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.repositories.qa_repo import QARepository
from app.repositories.document_repo import DocumentRepository
from app.exceptions.http_exceptions import NotFoundException, BadRequestException


class QAService:

    def __init__(self, db: AsyncSession):
        self.qa_repo = QARepository(db)
        self.doc_repo = DocumentRepository(db)

    async def ask_question(
        self, document_id: uuid.UUID, user_id: uuid.UUID, question: str
    ) -> dict:
        # Verify document exists
        doc = await self.doc_repo.get_by_id(document_id)
        if not doc:
            raise NotFoundException("Document not found")

        if not doc.extracted_text:
            raise BadRequestException(
                "No extracted text available for this document. OCR may still be processing."
            )

        # Check if AI is configured
        if not settings.OPENAI_API_KEY:
            return await self._fallback_answer(document_id, user_id, question, doc.extracted_text)

        # Create or reuse session
        sessions = await self.qa_repo.get_sessions_for_document(user_id, document_id)
        if sessions:
            session = sessions[0]
        else:
            session = await self.qa_repo.create_session(user_id, document_id)

        # Save user message
        await self.qa_repo.add_message(session.id, "user", question)

        # Prepare context - chunk text
        chunks = self._chunk_text(doc.extracted_text, max_chars=3000)
        context = "\n---\n".join(chunks[:3])  # Use first 3 chunks

        # Call LLM
        answer = await self._call_llm(question, context)

        # Save assistant message
        await self.qa_repo.add_message(session.id, "assistant", answer)

        # Reload session with messages
        session = await self.qa_repo.get_session(session.id)

        return {
            "answer": answer,
            "session_id": session.id,
            "messages": [
                {"role": m.role, "content": m.content, "created_at": str(m.created_at)}
                for m in session.messages
            ],
        }

    async def _call_llm(self, question: str, context: str) -> str:
        """Call OpenAI-compatible API."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.OPENAI_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a helpful document assistant. Answer questions based "
                                "on the provided document context. If you cannot find the answer "
                                "in the context, say so clearly."
                            ),
                        },
                        {
                            "role": "user",
                            "content": f"Document context:\n{context}\n\nQuestion: {question}",
                        },
                    ],
                    "max_tokens": 1000,
                    "temperature": 0.3,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _fallback_answer(
        self, document_id: uuid.UUID, user_id: uuid.UUID, question: str, text: str
    ) -> dict:
        """Provide a simple keyword-based answer when no LLM API key is configured."""
        session = await self.qa_repo.create_session(user_id, document_id)
        await self.qa_repo.add_message(session.id, "user", question)

        # Simple: find paragraphs that contain question keywords
        keywords = [w.lower() for w in question.split() if len(w) > 3]
        paragraphs = text.split("\n\n")
        relevant = [p for p in paragraphs if any(k in p.lower() for k in keywords)]

        if relevant:
            answer = (
                "⚠️ AI is not configured (no OPENAI_API_KEY). Here are relevant excerpts:\n\n"
                + "\n\n".join(relevant[:3])
            )
        else:
            answer = (
                "⚠️ AI is not configured (no OPENAI_API_KEY). "
                "No relevant excerpts found for your question."
            )

        await self.qa_repo.add_message(session.id, "assistant", answer)
        session = await self.qa_repo.get_session(session.id)

        return {
            "answer": answer,
            "session_id": session.id,
            "messages": [
                {"role": m.role, "content": m.content, "created_at": str(m.created_at)}
                for m in session.messages
            ],
        }

    @staticmethod
    def _chunk_text(text: str, max_chars: int = 3000) -> list[str]:
        """Split text into chunks for LLM context windows."""
        chunks = []
        current = ""
        for paragraph in text.split("\n\n"):
            if len(current) + len(paragraph) > max_chars:
                if current:
                    chunks.append(current.strip())
                current = paragraph
            else:
                current += "\n\n" + paragraph
        if current.strip():
            chunks.append(current.strip())
        return chunks or [text[:max_chars]]
