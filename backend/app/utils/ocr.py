"""OCR text extraction utility."""

import os
import logging
from pathlib import Path

from app.core.database import async_session_factory
from app.repositories.document_repo import DocumentRepository

logger = logging.getLogger(__name__)


def extract_text_from_file(file_path: str) -> str:
    """Extract text from PDF or image file. Runs synchronously (called from background task)."""
    path = Path(file_path)
    ext = path.suffix.lower()

    try:
        if ext == ".pdf":
            return _extract_from_pdf(file_path)
        elif ext in (".jpg", ".jpeg", ".png"):
            return _extract_from_image(file_path)
        else:
            return ""
    except Exception as e:
        logger.error(f"OCR extraction failed for {file_path}: {e}")
        return f"[OCR extraction failed: {str(e)}]"


def _extract_from_pdf(file_path: str) -> str:
    """Extract text from PDF using PyPDF2."""
    from PyPDF2 import PdfReader

    reader = PdfReader(file_path)
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)

    text = "\n\n".join(text_parts)

    # If PyPDF2 found no text (scanned PDF), try OCR
    if not text.strip():
        try:
            return _extract_from_image(file_path)
        except Exception:
            return text

    return text


def _extract_from_image(file_path: str) -> str:
    """Extract text from image using pytesseract."""
    try:
        import pytesseract
        from PIL import Image

        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except ImportError:
        logger.warning("pytesseract not installed – skipping OCR")
        return "[OCR not available – pytesseract not installed]"
    except Exception as e:
        logger.error(f"pytesseract failed: {e}")
        return f"[OCR failed: {str(e)}]"


async def process_ocr_background(doc_id: str, file_path: str) -> None:
    """Background task: extract text and update the document record."""
    import uuid
    import asyncio

    logger.info(f"Starting OCR for document {doc_id}")

    # Run CPU-bound OCR in thread pool
    loop = asyncio.get_event_loop()
    text = await loop.run_in_executor(None, extract_text_from_file, file_path)

    # Update database
    async with async_session_factory() as session:
        try:
            repo = DocumentRepository(session)
            await repo.update_extracted_text(uuid.UUID(doc_id), text)
            await session.commit()
            logger.info(f"OCR complete for document {doc_id}: {len(text)} chars extracted")
        except Exception as e:
            logger.error(f"Failed to save OCR result for {doc_id}: {e}")
            await session.rollback()
