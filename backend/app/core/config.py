"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # ── App ──────────────────────────────────────────
    APP_NAME: str = "SmartArchive"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ── Database ─────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/smartarchive"

    # ── JWT ──────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── File Upload ──────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10

    # ── OpenAI (optional) ────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-3.5-turbo"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        path = Path(self.UPLOAD_DIR)
        path.mkdir(parents=True, exist_ok=True)
        return path

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
