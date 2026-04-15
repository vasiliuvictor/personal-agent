# AgentScout

A multi-user web app where each user creates keyword-monitoring "agents" that periodically search the web, summarize findings using AI, and optionally send email notifications.

**Stack:** Angular v18 · Node.js/Express · Supabase (PostgreSQL + Auth) · Brave Search API · Gemini 1.5 Flash · Nodemailer · Render (hosting)

---

## Project Structure

```
personal-agent/
├── backend/    # Node.js + Express + TypeScript API
└── frontend/   # Angular v18 SPA
```

---

## Prerequisites

Sign up for free accounts on all of the following:

| Service | Purpose | Free tier |
|---|---|---|
| [Supabase](https://supabase.com) | PostgreSQL DB + Auth | 2 free projects |
| [Brave Search API](https://api.search.brave.com) | Web search | $5/mo credit (plenty for personal use) |
| [Google AI Studio](https://aistudio.google.com) | Gemini 1.5 Flash | Free quota |
| [Render](https://render.com) | Hosting (backend + frontend) | Free tier |
| [cron-job.org](https://cron-job.org) | Scheduling | Free |
| Gmail account | Email notifications | Free (App Password required) |

---

## Setup

### 1. Supabase

1. Create a new Supabase project.
2. Go to **SQL Editor** and run the contents of `backend/src/db/schema.sql`.
3. Go to **Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: your Render frontend URL (or `http://localhost:4200` for local dev)
   - **Redirect URLs**: add `http://localhost:4200/**` and your production frontend URL

### 2. Brave Search API

1. Sign up at [api.search.brave.com](https://api.search.brave.com).
2. Create an API key → `BRAVE_API_KEY`.

### 3. Google Gemini

1. Go to [aistudio.google.com](https://aistudio.google.com) → **Get API Key**.
2. Copy the key → `GEMINI_API_KEY`.

### 4. Gmail App Password (for email notifications)

1. Enable 2-Factor Authentication on your Google account.
2. Go to **Google Account → Security → 2-Step Verification → App passwords**.
3. Create an app password (name it "AgentScout").
4. Copy the 16-character password → `GMAIL_APP_PASSWORD`.

### 5. Backend — Local Development

```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
# Fill in all values in .env
```

Start the dev server:
```bash
npm run dev
```

Verify it works:
```bash
curl http://localhost:3000/api/health
# → {"status":"ok","timestamp":"..."}
```

### 6. Frontend — Local Development

```bash
cd frontend
npm install
```

Edit `src/environments/environment.ts` and fill in your `supabaseUrl` and `supabaseAnonKey`.

Start the dev server:
```bash
npm start
# → http://localhost:4200
```

---

## Testing Locally (End-to-End)

1. Start both backend (`npm run dev`) and frontend (`npm start`).
2. Open `http://localhost:4200` — you'll be redirected to `/login`.
3. Click **Create one** to register a new account.
4. Check your email for Supabase's confirmation link and click it.
5. Sign in. You'll land on the Dashboard (empty state).
6. Navigate to **My Agents** → **New Agent**.
7. Fill in a name, keywords (comma-separated), frequency, and optionally toggle email notifications.
8. Click **Create Agent**.
9. Manually trigger the agent runner to generate an insight:
   ```bash
   curl -X POST http://localhost:3000/api/trigger-agents \
     -H "x-cron-secret: YOUR_CRON_SECRET"
   # → {"ran":1,"errors":[]}
   ```
10. Refresh the Dashboard — your insight will appear with a summary and clickable source links.
11. Click **Mark as read** — the unread badge disappears without a page reload.

---

## Deployment on Render

### Backend (Web Service)

1. Push this repo to GitHub.
2. In Render: **New → Web Service** → connect your repo.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Plan**: Free
4. Add all environment variables from `backend/.env.example` under **Environment**.
5. Set `FRONTEND_URL` to your Render Static Site URL (you'll get this after deploying the frontend).
6. Deploy and copy the backend service URL.

### Frontend (Static Site)

1. In Render: **New → Static Site** → connect your repo.
2. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && ng build --configuration=production`
   - **Publish Directory**: `dist/frontend/browser`
3. Under **Redirects/Rewrites**, add:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
   *(Required for Angular's client-side routing)*
4. Before deploying, update `frontend/src/environments/environment.prod.ts`:
   - Set `apiUrl` to your backend Render URL + `/api`
   - Set `supabaseUrl` and `supabaseAnonKey`
5. Deploy.

---

## Scheduling with cron-job.org

Render's free tier spins down after **15 minutes of inactivity**. Use cron-job.org **only** to keep the server alive with a health ping — the backend manages agent scheduling internally.

### How agent scheduling works

The backend runs its own internal scheduler (`setInterval`, every 5 minutes). On each tick it queries the database for agents where `next_run_at ≤ NOW()` and runs them automatically. No external cron trigger is needed for agents.

- Agents are run based on their `next_run_at` value in the database (set at creation time and updated after each run).
- Each run advances `next_run_at` by the agent's configured frequency (hourly / daily / weekly).
- The scheduler also fires once immediately on server startup to catch any overdue agents.

### Setup — Keep-Alive Ping only

1. Register a free account at [cron-job.org](https://cron-job.org).
2. Create **one** cron job:

| Setting | Value |
|---|---|
| URL | `https://YOUR_BACKEND.onrender.com/api/health` |
| Method | `GET` |
| Schedule | Every 14 minutes: `*/14 * * * *` |
| Headers | *(none)* |

This ping prevents the Render free-tier instance from spinning down. As long as the server stays alive, the internal scheduler keeps running and processing due agents.

### Manual trigger (optional, for testing)

`POST /api/trigger-agents` is still available if you want to run agents on demand:

```bash
curl -X POST https://YOUR_BACKEND.onrender.com/api/trigger-agents \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | Yes | CORS origin for the Angular frontend |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret!) |
| `BRAVE_API_KEY` | Yes | Brave Search API subscription token |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `CRON_SECRET` | Yes | Secret for authenticating cron trigger calls |
| `GMAIL_USER` | Yes | Gmail address for sending notifications |
| `GMAIL_APP_PASSWORD` | Yes | Gmail App Password (not your account password) |

---

## API Reference

All endpoints prefixed with `/api`. Protected routes require `Authorization: Bearer <supabase_jwt>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check / keep-alive |
| `POST` | `/api/trigger-agents` | `x-cron-secret` header | Run all due agents |
| `GET` | `/api/agents` | JWT | List user's agents |
| `POST` | `/api/agents` | JWT | Create a new agent |
| `PUT` | `/api/agents/:id` | JWT | Update an agent |
| `DELETE` | `/api/agents/:id` | JWT | Delete an agent |
| `GET` | `/api/insights` | JWT | List insights (paginated, filterable by `agent_id`) |
| `PATCH` | `/api/insights/:id/read` | JWT | Mark insight as read |
