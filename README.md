# 🧠 SmartArchive — AI-Driven Document Management Platform

A secure, scalable web application for uploading, managing, and intelligently searching documents with AI-powered Q&A.

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Register, login, refresh tokens, role-based access (ADMIN / USER) |
| 📁 **Document Management** | Upload PDF / JPG / PNG (max 10MB), CRUD with soft-delete |
| 🔍 **OCR Text Extraction** | Automatic text extraction via PyPDF2 + Tesseract (background task) |
| 🔎 **Full-Text Search** | Search inside document titles and extracted text with pagination |
| 🤖 **AI Q&A** | Ask questions about documents — powered by OpenAI (with keyword fallback) |
| 🛡️ **Admin Dashboard** | View users, platform stats, manage documents |
| 🏷️ **Tagging System** | Add/filter documents by tags |
| 🐳 **Docker-Ready** | One-command deployment with `docker-compose` |

---

## 🏗️ Tech Stack

### Backend
- **FastAPI** — async Python web framework
- **SQLAlchemy 2.0** — async ORM with `asyncpg`
- **PostgreSQL** — primary database
- **Pydantic v2** — request/response validation
- **python-jose** + **passlib** — JWT & bcrypt password hashing
- **PyPDF2** + **pytesseract** — PDF & image OCR
- **Alembic** — database migrations

### Frontend
- **React 18** + **TypeScript**
- **Vite** — fast dev server & build
- **Tailwind CSS** — utility-first styling (dark glassmorphism theme)
- **TanStack React Query** — server state management
- **Zustand** — client state with localStorage persistence
- **Axios** — HTTP client with JWT interceptor & auto-refresh
- **react-dropzone** — drag-and-drop file uploads

---

## 📂 Project Structure

```
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py              # FastAPI entry point
│       ├── core/                 # Config, database, security (JWT/bcrypt)
│       ├── models/               # SQLAlchemy models (User, Document, Tag, QA)
│       ├── schemas/              # Pydantic schemas
│       ├── repositories/         # Data access layer
│       ├── services/             # Business logic layer
│       ├── api/
│       │   ├── dependencies.py   # Auth guards (get_current_user, require_admin)
│       │   └── routes/           # auth, documents, search, qa, admin
│       ├── utils/ocr.py          # OCR extraction (PDF + image)
│       └── exceptions/           # Custom HTTP exceptions
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── api/                  # Axios client + endpoint functions
        ├── store/                # Zustand auth store
        ├── layouts/              # AppLayout (sidebar), AuthLayout
        ├── routes/               # Protected, Admin, Guest route guards
        └── pages/                # 9 pages (see UI section below)
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register new user |
| `POST` | `/api/auth/login` | — | Login, get tokens |
| `POST` | `/api/auth/refresh` | — | Refresh access token |
| `GET` | `/api/auth/me` | ✅ | Get current user info |
| `POST` | `/api/documents` | ✅ | Upload document (multipart) |
| `GET` | `/api/documents` | ✅ | List documents (paginated, filterable) |
| `GET` | `/api/documents/{id}` | ✅ | Document detail + extracted text |
| `PUT` | `/api/documents/{id}` | ✅ | Update title / tags |
| `DELETE` | `/api/documents/{id}` | ✅ | Soft delete (owner or admin) |
| `GET` | `/api/search?q=keyword` | ✅ | Full-text search |
| `POST` | `/api/qa/{document_id}` | ✅ | Ask AI about a document |
| `GET` | `/api/admin/users` | 🔒 | List all users (admin only) |
| `GET` | `/api/admin/stats` | 🔒 | Platform statistics |
| `DELETE` | `/api/admin/documents/{id}` | 🔒 | Admin delete document |

---

## 🎨 UI Pages

| Page | Description |
|------|-------------|
| **Landing** | Hero section with feature cards and gradient CTAs |
| **Login / Register** | Animated glassmorphism auth forms |
| **Dashboard** | Stats overview, quick actions, recent documents |
| **Upload** | Drag-and-drop with title & tag inputs |
| **Documents** | Card grid with type filter, search, pagination |
| **Document Detail** | File preview, extracted text, AI Q&A chat, edit/delete |
| **Search** | Full-text search with result highlighting |
| **Admin** | User table, platform stats (users, docs, uploads today) |
| **Profile** | User info display |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **Tesseract OCR** (optional — for image OCR)

### 1. Clone the Repository

```bash
git clone https://github.com/KoHein-stack/ai-driven-document-management-platform.git
cd ai-driven-document-management-platform
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create the database
psql -U postgres -c "CREATE DATABASE smartarchive;"

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Start the server
uvicorn app.main:app --reload
```

Backend runs at **http://localhost:8000**. Swagger docs at **http://localhost:8000/docs**.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:5173** with API proxy to the backend.

### 4. Docker (All-in-One)

```bash
docker-compose up --build
```

This starts PostgreSQL, backend, and frontend automatically.

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/smartarchive` | Async PostgreSQL connection |
| `JWT_SECRET_KEY` | — | Secret key for JWT signing |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `UPLOAD_DIR` | `uploads` | File upload directory |
| `MAX_FILE_SIZE_MB` | `10` | Max upload size |
| `OPENAI_API_KEY` | — | OpenAI API key (optional — enables AI Q&A) |
| `OPENAI_MODEL` | `gpt-3.5-turbo` | LLM model for Q&A |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed CORS origins |

---

## 🏛️ Architecture

```
┌──────────┐     ┌────────────────────────────────────────────┐
│ Frontend │────▶│ API Routes                                 │
│ React+TS │     │   ├── auth   (register/login/refresh)      │
│ Vite     │◀────│   ├── documents (CRUD + upload)            │
│ Tailwind │     │   ├── search (full-text)                   │
└──────────┘     │   ├── qa     (AI Q&A)                      │
                 │   └── admin  (users/stats)                 │
                 │                                            │
                 │ Services (business logic)                  │
                 │   └── auth / document / qa                 │
                 │                                            │
                 │ Repositories (data access)                 │
                 │   └── user / document / qa                 │
                 │                                            │
                 │ Models (SQLAlchemy ORM)                    │
                 │   └── User, Document, Tag, QASession       │
                 └──────────────┬─────────────────────────────┘
                                │
                         ┌──────┴──────┐
                         │ PostgreSQL  │
                         └─────────────┘
```

---

## 🧪 What This Project Demonstrates

- ✅ Clean layered architecture (Routes → Services → Repositories → Models)
- ✅ JWT authentication with auto-refresh
- ✅ Role-based access control (ADMIN / USER)
- ✅ Async file handling with background OCR processing
- ✅ Full-text search across document content
- ✅ AI integration (OpenAI-compatible with graceful fallback)
- ✅ Modern React patterns (hooks, TanStack Query, Zustand)
- ✅ Dark mode UI with glassmorphism design
- ✅ Docker containerization
- ✅ Enterprise-level backend mindset

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
