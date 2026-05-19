# 🌍 Traveloop — Personalized Travel Planning

Video Link : https://drive.google.com/file/d/1mtFCtGENQ5gkehu3XtfNJDx77Ae3hbZI/view?usp=sharing

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

## ⚡ Performance Optimizations

The following optimizations have been applied to deliver a fast, smooth loading experience.

### Frontend

| Optimization | File(s) Changed | Details |
|---|---|---|
| **Route-level Code Splitting** | `src/App.tsx` | All 17+ pages converted to `React.lazy()` imports, wrapped in `<Suspense>`. The browser only downloads the JS for the current page — dramatically reduces initial bundle size. |
| **Animated Page Fallback** | `src/App.tsx` | A polished `PageLoader` spinner (with pulse text) is shown during lazy route loading instead of a blank screen. |
| **Manual Chunk Splitting** | `vite.config.ts` | Vendor libraries split into 5 separate chunks: `vendor-react`, `vendor-ui`, `vendor-maps`, `vendor-charts`, `vendor-utils`. Browser caches each chunk independently — a UI-only change won't force users to re-download map or chart code. |
| **`React.memo` on List Cards** | `TripCard.tsx`, `ActivityCard.tsx`, `CityCard.tsx` | High-frequency list components memoized to skip re-renders when parent state changes but props are identical. |

### Backend

| Optimization | File(s) Changed | Details |
|---|---|---|
| **GZip Compression** | `app/main.py` | `GZipMiddleware` added for all responses > 1 KB. Large JSON payloads (trips with stops, city lists) are compressed 60–80% before transmission. |
| **In-Memory TTL Cache** | `app/utils/cache.py` *(new)* | Thread-safe key/value cache with configurable TTL. No external dependency (no Redis needed). Backed by SHA-256-keyed hashing for deterministic cache hits. |
| **Cities Endpoint Caching** | `app/routers/cities.py` | `GET /cities` cached for **10 minutes** per unique query (name, country, region, page). `GET /cities/{id}` cached for **30 minutes**. |
| **Activities Endpoint Caching** | `app/routers/activities.py` | `GET /activities` cached for **10 minutes** per unique filter combo. `GET /activities/{id}` cached for **30 minutes**. |
| **AI Trip Optimizer Caching** | `app/routers/ai_optimizer.py` | Identical optimization requests (same cities, dates, budget, style) return instantly from a **1-hour cache** instead of calling the Gemini API again — saves cost and eliminates wait time. |
| **Public Trip Caching** | `app/routers/trips.py` | Shared trip links (`GET /trips/public/{share_code}`) cached for **5 minutes** — handles viral link sharing without hammering the DB. |

### CSS / UX Polish

| Optimization | File | Details |
|---|---|---|
| **Page Enter Animation** | `src/index.css` | `.page-enter` utility class: 200ms fade + 6px slide-up when a new route renders. Makes navigation feel native-app smooth. |
| **Skeleton Shimmer** | `src/index.css` | `.skeleton` + `::after` shimmer class ready to use on any loading placeholder — horizontal gradient sweep animation at 1.5s. |
| **No Scrollbar Layout Shift** | `src/index.css` | `overflow-y: scroll` on `html` prevents the content from jumping when navigating between short and long pages. |

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
│   │   ├── utils/         # JWT, password hashing, cache, helpers
│   │   ├── middleware/    # Auth, admin middleware
│   │   ├── main.py        # FastAPI app entry point (GZip + CORS)
│   │   ├── database.py    # DB connection setup
│   │   └── config.py      # App configuration
│   ├── alembic/           # Database migrations
│   └── seed.py            # Seed data script
├── frontend/              # React + Vite application
│   └── src/
│       ├── api/           # Axios instances & API calls
│       ├── components/    # Reusable UI components (memoized)
│       ├── pages/         # Route-level page components (lazy-loaded)
│       ├── stores/        # Zustand state stores
│       ├── utils/         # Formatters, validators, constants
│       ├── App.tsx        # Main React component (code-split routing)
│       ├── index.css      # Global styles + animations
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
