# 🌍 Traveloop — Personalized Travel Planning

A full-stack personalized travel planning application built with FastAPI + React.

---

## 🔑 Test Accounts

| Role | Email | Password | User ID |
|------|-------|----------|---------|
| **Admin** | `admin@traveloop.com` | `Admin123!@` | `b6e29b89-7c8e-40b9-bce5-00012609cfdc` |
| **Regular User** | `test@traveloop.com` | `Test123!@` | `4e1280ac-0e45-4e1c-ab1a-f09a768d273b` |

> **Note:** The admin account has access to the Admin Panel (`/admin`) for user management and app-wide stats. You can also create new accounts via the Sign Up page.

---

## Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Backend** | FastAPI (Python 3.11+) | Async-native, auto OpenAPI docs, first-class Pydantic integration |
| **ORM** | SQLAlchemy (async) | Non-blocking DB I/O via asyncpg; mature migration story with Alembic |
| **Database** | PostgreSQL | Robust relational DB with UUID support, full-text search, JSONB |
| **Auth** | JWT (access + refresh) | Stateless access tokens + secure HTTP-only refresh cookies |
| **Frontend** | React 18 + TypeScript | Component-based UI with strong typing for maintainability |
| **Styling** | Tailwind CSS | Enforces design consistency via utility classes; no override wars |
| **State** | Zustand | Lower boilerplate than Redux, sufficient for this scope |
| **Forms** | react-hook-form + Zod | Minimal re-renders, best-in-class validation UX |
| **Charts** | Recharts | Composable, works natively with React state |
| **Drag & Drop** | @hello-pangea/dnd | Maintained fork of react-beautiful-dnd, stable API |
| **Notifications** | react-hot-toast | Lightweight, customizable toast system |

---

## Project Structure

```
traveloop/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── routers/       # API route handlers
│   │   ├── services/      # Business logic layer
│   │   ├── utils/         # JWT, password hashing, helpers
│   │   ├── middleware/    # Auth, admin middleware
│   │   ├── main.py        # FastAPI app entry point
│   │   ├── database.py    # DB connection setup
│   │   └── config.py      # App configuration
│   ├── alembic/           # Database migrations
│   └── seed.py            # Seed data script
├── frontend/              # React + Vite application
│   └── src/
│       ├── api/           # Axios instances & API calls
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level page components
│       ├── stores/        # Zustand state stores
│       ├── utils/         # Formatters, validators, constants
│       ├── App.tsx        # Main React component
│       └── main.tsx       # React entry point
└── .github/               # PR templates, CI config
```

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 13+ (local instance)

---

## Getting Started

### 1. Database Setup
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE traveloop;"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Run migrations
alembic upgrade head

# Seed the database
python seed.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy and configure environment
cp .env.example .env

# Start dev server
npm run dev
```

### 4. Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## API Documentation

All endpoints are documented via OpenAPI. Visit `/docs` (Swagger UI) or `/redoc` when the backend is running.

---

## License

MIT