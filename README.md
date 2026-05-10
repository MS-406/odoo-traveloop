# 🌍 Traveloop — Personalized Travel Planning

A full-stack personalized travel planning application built with FastAPI + React.

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
│   │   └── middleware/    # Auth, admin middleware
│   ├── alembic/           # Database migrations
│   └── seed.py            # Seed data script
├── frontend/              # React + Vite application
│   └── src/
│       ├── api/           # Axios instances & API calls
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level page components
│       ├── stores/        # Zustand state stores
│       ├── hooks/         # Custom React hooks
│       ├── types/         # TypeScript type definitions
│       └── utils/         # Formatters, validators, constants
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