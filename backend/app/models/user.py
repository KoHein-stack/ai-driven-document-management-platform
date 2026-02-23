"""User ORM model."""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, PyEnum):
    ADMIN = "ADMIN"
    USER = "USER"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.USER, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    documents = relationship("Document", back_populates="owner", lazy="selectin")
    qa_sessions = relationship("QASession", back_populates="user", lazy="selectin")
