"""Auth service – business logic for user registration and login."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository
from app.exceptions.http_exceptions import BadRequestException, UnauthorizedException


class AuthService:

    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def register(self, email: str, password: str, full_name: str | None = None) -> tuple[User, str, str]:
        """Register a new user. Returns (user, access_token, refresh_token)."""
        existing = await self.repo.get_by_email(email)
        if existing:
            raise BadRequestException("Email already registered")

        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            role=UserRole.USER,
        )
        user = await self.repo.create(user)

        access_token = create_access_token(str(user.id), {"role": user.role.value})
        refresh_token = create_refresh_token(str(user.id))
        return user, access_token, refresh_token

    async def login(self, email: str, password: str) -> tuple[User, str, str]:
        """Login a user. Returns (user, access_token, refresh_token)."""
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")

        access_token = create_access_token(str(user.id), {"role": user.role.value})
        refresh_token = create_refresh_token(str(user.id))
        return user, access_token, refresh_token
