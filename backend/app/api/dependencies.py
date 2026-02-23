"""FastAPI dependencies – auth, DB session, role checks."""

from uuid import UUID
from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository
from app.exceptions.http_exceptions import UnauthorizedException, ForbiddenException


async def get_current_user(
    authorization: str = Header(..., description="Bearer <token>"),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract and validate JWT from Authorization header."""
    if not authorization.startswith("Bearer "):
        raise UnauthorizedException("Invalid authorization header")

    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload")

    repo = UserRepository(db)
    user = await repo.get_by_id(UUID(user_id))
    if not user:
        raise UnauthorizedException("User not found")

    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user has ADMIN role."""
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenException("Admin access required")
    return current_user
