# JobLens.online 🔍

**AI-Powered Job Matching Platform for Fresh Graduates**

Find jobs that match your skills — not just keywords. Paste your CV, let Gemini AI score every job match 0–100, identify skill gaps, and apply with confidence.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL (prod) / SQLite (dev) via SQLAlchemy |
| AI | Google Gemini 2.0 Flash |
| Jobs | JSearch API (RapidAPI) |
| Auth | JWT tokens (python-jose + bcrypt) |
| Hosting | Railway |

---

## Project Structure

```
joblens/
├── frontend/                    ← Next.js 14 app
│   ├── app/
│   │   ├── page.tsx             ← Landing page with CV paste + hero
│   │   ├── results/page.tsx     ← Job results with filter sidebar
│   │   ├── jobs/[id]/page.tsx   ← Job detail + AI analysis panel
│   │   ├── profile/page.tsx     ← User profile management
│   │   ├── saved/page.tsx       ← Saved jobs grid
│   │   ├── login/page.tsx       ← Login page
│   │   └── register/page.tsx    ← Registration page
│   ├── components/
│   │   ├── Navbar.tsx           ← Sticky navbar with auth state
│   │   ├── JobCard.tsx          ← Job card with AI scores
│   │   ├── MatchScore.tsx       ← Color-coded match score widget
│   │   ├── SearchBar.tsx        ← Search inputs
│   │   └── CVPasteBox.tsx       ← CV paste + auto-extract
│   ├── lib/
│   │   └── api.ts               ← Axios API client + AI cache
│   └── public/
│       └── logo.png             ← JobLens logo
│
└── backend/                     ← FastAPI app
    ├── main.py                  ← App entry point + CORS
    ├── routes/
    │   ├── auth.py              ← Register + login endpoints
    │   ├── jobs.py              ← Search + analyze + parse-cv
    │   ├── users.py             ← Profile CRUD
    │   └── saved.py             ← Saved jobs CRUD
    ├── services/
    │   ├── gemini.py            ← Gemini AI integration
    │   └── jsearch.py           ← JSearch API integration
    └── models/
        ├── database.py          ← SQLAlchemy models + engine
        └── schemas.py           ← Pydantic request/response schemas
```

---

## Quick Start

### 1. Get API Keys

- **Gemini API**: [aistudio.google.com](https://aistudio.google.com) → Create API Key (free tier available)
- **JSearch API**: [rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) → Subscribe (free tier: 200 requests/month)

---

### 2. Backend Setup

```bash
cd joblens/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys:
#   GEMINI_API_KEY=your_key
#   JSEARCH_API_KEY=your_key
#   JWT_SECRET=any_random_secret

# Run the server
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

---

### 3. Frontend Setup

```bash
cd joblens/frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# .env.local content:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run the dev server
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## API Endpoints

### Auth
```
POST /auth/register     { email, password, name } → { access_token }
POST /auth/login        { email, password }        → { access_token }
```

### Jobs
```
POST /jobs/search       { cv_text?, skills?, location?, job_type? } → Job[]
POST /jobs/analyze      { jobs: Job[], user_profile: Profile }      → JobAnalysis[]
POST /jobs/parse-cv     { cv_text }                                  → { role, skills, location, years_experience }
```

### Users (requires auth)
```
GET  /users/profile     → UserProfile
PUT  /users/profile     { name, role, years_experience, skills, location } → UserProfile
```

### Saved Jobs (requires auth)
```
POST   /saved/          { job_id, job_title, company, match_score? } → SavedJob
GET    /saved/          → SavedJob[]
DELETE /saved/{job_id}  → { message }
```

---

## AI Features

### CV Parsing (Gemini)
Automatically extracts from pasted CV text:
- Current/target role
- Years of experience
- Skills array
- Location

### Job Match Analysis (Gemini)
For each job × user profile:
- **match_score** (0–100): AI-computed fit percentage
- **summary**: 3–5 bullet points about the role
- **skill_gaps**: Missing skills to close
- **why_good_fit**: One-line fit explanation

Match score colors:
- 🟢 80–100: Strong match (green)
- 🔵 60–79: Good match (blue)
- ⚫ 0–59: Partial match (gray)

### AI Response Caching
Analyses are cached in `localStorage` by `job_id` to avoid redundant API calls. Cache persists across page navigations within the session.

---

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id               SERIAL PRIMARY KEY,
  email            VARCHAR UNIQUE NOT NULL,
  hashed_password  VARCHAR NOT NULL,
  name             VARCHAR NOT NULL,
  role             VARCHAR DEFAULT '',
  years_experience INTEGER DEFAULT 0,
  skills           JSON DEFAULT '[]',
  location         VARCHAR DEFAULT '',
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Saved jobs table
CREATE TABLE saved_jobs (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
  job_id      VARCHAR NOT NULL,
  job_title   VARCHAR DEFAULT '',
  company     VARCHAR DEFAULT '',
  match_score FLOAT,
  date_saved  TIMESTAMP DEFAULT NOW()
);
```

Tables are auto-created on first startup via SQLAlchemy's `create_all()`.

---

## Deployment on Railway

### Backend

1. Create a new Railway project
2. Add a PostgreSQL service → copy the `DATABASE_URL`
3. Deploy the `/backend` folder
4. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   GEMINI_API_KEY=...
   JSEARCH_API_KEY=...
   JWT_SECRET=...
   PORT=8000
   ```
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend

1. Add another Railway service for the frontend
2. Deploy the `/frontend` folder
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```
4. Build command: `npm run build`
5. Start command: `npm start`

---

## Design System

| Token | Value |
|---|---|
| Primary Dark | `#0A2540` |
| Primary Blue | `#0A66C2` |
| Accent Blue | `#2F80ED` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Heading font | Sora (Google Fonts) |
| Body font | Inter (Google Fonts) |

---

## Development Tips

- **SQLite for local dev**: The default `DATABASE_URL` uses SQLite (`joblens.db`) — no Postgres setup needed locally.
- **AI caching**: Job analysis results are cached in `localStorage`; clear browser storage to re-analyze.
- **Rate limits**: JSearch free tier = 200 req/month. Gemini free tier = 1,500 req/day.
- **CORS**: Backend allows all origins in dev — restrict `allow_origins` to your frontend URL in production.

---

## License

MIT © 2026 JobLens.online
