BACKEND_DIR := backend
FRONTEND_DIR := frontend
DATABASE_URL ?= postgresql+psycopg://dataquest:dataquest@127.0.0.1:5432/dataquest

.PHONY: postgres-up
postgres-up:
	docker compose up -d postgres

.PHONY: postgres-down
postgres-down:
	docker compose down

.PHONY: postgres-reset
postgres-reset:
	docker compose down -v

.PHONY: migrate
migrate:
	cd $(BACKEND_DIR) && DATABASE_URL="$(DATABASE_URL)" alembic upgrade head

.PHONY: backend-dev
backend-dev:
	cd $(BACKEND_DIR) && DATABASE_URL="$(DATABASE_URL)" uvicorn app.main:app --reload

.PHONY: frontend-dev
frontend-dev:
	cd $(FRONTEND_DIR) && pnpm dev

.PHONY: backend-test
backend-test:
	cd $(BACKEND_DIR) && uv run pytest

.PHONY: frontend-check
frontend-check:
	cd $(FRONTEND_DIR) && pnpm lint && pnpm typecheck

.PHONY: check
check: backend-test frontend-check
