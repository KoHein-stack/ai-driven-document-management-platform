"""Auth routes – register, login, refresh."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token, create_access_token
from app.schemas.auth import (
    RegisterRequest, LoginRequest, RefreshRequest,
    TokenResponse, UserResponse,
)
from app.services.auth_service import AuthService
from app.exceptions.http_exceptions import UnauthorizedException
from app.repositories.user_repo import UserRepository
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user, access_token, refresh_token = await service.register(
        email=body.email, password=body.password, full_name=body.full_name
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user, access_token, refresh_token = await service.login(
        email=body.email, password=body.password
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise UnauthorizedException("Invalid or expired refresh token")

    user_id = payload.get("sub")
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise UnauthorizedException("User not found")

    access_token = create_access_token(str(user.id), {"role": user.role.value})
    return TokenResponse(
        access_token=access_token,
        refresh_token=body.refresh_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        created_at=str(current_user.created_at),
    )
