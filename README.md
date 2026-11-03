# Dataquest

A form builder with manual editing and Gemini-based schema generation. Forms are stored as versioned JSON schemas, validated with Pydantic, and rendered by the frontend to collect responses.

## Features

- Gemini generation, manual editing, and 10 field types.
- Form versioning, duplication, archiving, and submission controls.
- Public forms, paginated responses, basic analytics, and CSV exports.
- JWT authentication, refresh-token rotation, ownership checks, and CSRF protection.

## Stack

Next.js, TypeScript, Tailwind CSS, FastAPI, Pydantic, SQLAlchemy, PostgreSQL, and Gemini. Local setup uses SQLite and mock generation by default.

## Run locally

Requires Python 3.12+, uv, Node.js 22, and pnpm 10.12.4.

```sh
cd backend
cp .env.example .env
uv sync --frozen
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

In another terminal, start the frontend:

```sh
cd frontend
cp .env.example .env.local
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open **http://127.0.0.1:3000**. API docs: **http://127.0.0.1:8000/docs**.

For real AI generation, set `AI_PROVIDER=gemini` and `GEMINI_API_KEY` in `backend/.env`, then restart the API.

## Checks

- Backend: `cd backend && uv run pytest`
- Frontend: `cd frontend && corepack pnpm lint && corepack pnpm typecheck && corepack pnpm build`
