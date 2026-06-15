.PHONY: help backend frontend test build check-env migrate demo-check

help:
	@echo "CareerCopilot AI commands"
	@echo ""
	@echo "make backend      Start FastAPI backend"
	@echo "make frontend     Start Next.js frontend"
	@echo "make migrate      Run Alembic migrations"
	@echo "make test         Run backend tests"
	@echo "make build        Build frontend"
	@echo "make check-env    Check backend .env formatting"
	@echo "make demo-check   Verify local demo endpoints"

backend:
	cd backend && uvicorn app.main:app --reload

frontend:
	cd frontend && npm run dev

migrate:
	cd backend && alembic upgrade head

test:
	cd backend && python -m pytest -q

build:
	cd frontend && npm run build

check-env:
	cd backend && python check_env_format.py

demo-check:
	bash scripts/verify_demo.sh
