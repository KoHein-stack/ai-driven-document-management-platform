"""Document repository – database queries for Document and Tag models."""

from uuid import UUID
from datetime import datetime, timezone, timedelta

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.document import Document, Tag, document_tags


class DocumentRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, document: Document) -> Document:
        self.db.add(document)
        await self.db.flush()
        await self.db.refresh(document)
        return document

    async def get_by_id(self, doc_id: UUID) -> Document | None:
        result = await self.db.execute(
            select(Document)
            .options(selectinload(Document.tags), selectinload(Document.owner))
            .where(Document.id == doc_id, Document.is_deleted == False)
        )
        return result.scalar_one_or_none()

    async def get_list(
        self,
        page: int = 1,
        size: int = 20,
        file_type: str | None = None,
        tag: str | None = None,
        title_search: str | None = None,
        user_id: UUID | None = None,
    ) -> tuple[list[Document], int]:
        query = (
            select(Document)
            .options(selectinload(Document.tags))
            .where(Document.is_deleted == False)
        )

        if user_id:
            query = query.where(Document.uploaded_by == user_id)
        if file_type:
            query = query.where(Document.file_type == file_type)
        if title_search:
            query = query.where(Document.title.ilike(f"%{title_search}%"))
        if tag:
            query = query.join(document_tags).join(Tag).where(Tag.name == tag)

        # Count
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar_one()

        # Paginate
        query = query.order_by(Document.created_at.desc())
        query = query.offset((page - 1) * size).limit(size)
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def update(self, document: Document) -> Document:
        await self.db.flush()
        await self.db.refresh(document)
        return document

    async def soft_delete(self, document: Document) -> None:
        document.is_deleted = True
        await self.db.flush()

    async def update_extracted_text(self, doc_id: UUID, text: str) -> None:
        result = await self.db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalar_one_or_none()
        if doc:
            doc.extracted_text = text
            await self.db.flush()

    async def search(
        self, query_text: str, page: int = 1, size: int = 20
    ) -> tuple[list[Document], int]:
        query = (
            select(Document)
            .options(selectinload(Document.tags))
            .where(
                Document.is_deleted == False,
                or_(
                    Document.title.ilike(f"%{query_text}%"),
                    Document.extracted_text.ilike(f"%{query_text}%"),
                ),
            )
        )
        count_query = select(func.count()).select_from(query.subquery())
        total = (await self.db.execute(count_query)).scalar_one()

        query = query.order_by(Document.created_at.desc())
        query = query.offset((page - 1) * size).limit(size)
        result = await self.db.execute(query)
        items = list(result.scalars().all())

        return items, total

    async def count(self, include_deleted: bool = False) -> int:
        q = select(func.count(Document.id))
        if not include_deleted:
            q = q.where(Document.is_deleted == False)
        result = await self.db.execute(q)
        return result.scalar_one()

    async def count_deleted(self) -> int:
        result = await self.db.execute(
            select(func.count(Document.id)).where(Document.is_deleted == True)
        )
        return result.scalar_one()

    async def count_uploads_today(self) -> int:
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(func.count(Document.id)).where(
                Document.created_at >= today_start,
                Document.is_deleted == False,
            )
        )
        return result.scalar_one()


class TagRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create(self, name: str) -> Tag:
        result = await self.db.execute(select(Tag).where(Tag.name == name.lower().strip()))
        tag = result.scalar_one_or_none()
        if not tag:
            tag = Tag(name=name.lower().strip())
            self.db.add(tag)
            await self.db.flush()
            await self.db.refresh(tag)
        return tag

    async def get_or_create_many(self, names: list[str]) -> list[Tag]:
        tags = []
        for name in names:
            tags.append(await self.get_or_create(name))
        return tags
