"""SmartArchive – FastAPI Application Entry Point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown."""
    logger.info(f"🚀 Starting {settings.APP_NAME}")
    # Create tables (development fallback – use Alembic in production)
    await init_db()
    # Ensure upload directory exists
    settings.upload_path  # triggers mkdir
    logger.info("✅ Database initialized, upload directory ready")
    yield
    logger.info(f"👋 Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Driven Document Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (serve uploaded documents) ──────────
import os
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ── Routers ──────────────────────────────────────────
from app.api.routes import auth, documents, search, qa, admin

app.include_router(auth.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(qa.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "app": settings.APP_NAME, "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
