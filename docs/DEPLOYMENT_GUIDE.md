# CareerPilot AI Deployment Guide

This guide explains how to deploy CareerPilot AI as a production-style SaaS app.

## Production architecture

CareerPilot AI uses:

- Frontend: Next.js on Vercel
- Backend: FastAPI on Render
- Database: PostgreSQL on Render
- Migrations: Alembic
- Production smoke test: scripts/smoke_production.sh

## Deployment order

Deploy in this order:

1. Merge deployment code to main.
2. Create Render Blueprint from render.yaml.
3. Deploy backend and PostgreSQL on Render.
4. Create Vercel frontend project.
5. Add backend URL to Vercel.
6. Add frontend URL to Render CORS settings.
7. Redeploy backend.
8. Run production smoke test.

## Render backend setup

Render should use the root-level render.yaml file.

Backend service name:

    careerpilot-api

Database name:

    careerpilot-postgres

Backend build command:

    cd backend && pip install --upgrade pip && pip install -r requirements.txt

Backend start command:

    cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT

Backend health check path:

    /health

## Render environment variables

Add these in Render:

    ENVIRONMENT=production
    APP_ENV=production
    LOG_LEVEL=info
    FRONTEND_URL=https://your-vercel-app.vercel.app
    CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
    BACKEND_CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000

Render should inject these:

    DATABASE_URL
    SECRET_KEY

Do not commit real secrets.

## Vercel frontend setup

Set the Vercel root directory to:

    frontend

Add these Vercel environment variables:

    NEXT_PUBLIC_API_BASE_URL=https://your-render-api.onrender.com
    NEXT_PUBLIC_APP_NAME=CareerPilot AI
    NEXT_PUBLIC_APP_ENV=production

## Production smoke test

After Render and Vercel are deployed, run:

    API_URL=https://your-render-api.onrender.com WEB_URL=https://your-vercel-app.vercel.app ./scripts/smoke_production.sh

Expected output:

    Production smoke test passed

## Manual checks before sharing the app

Check these before calling the project production-ready:

- Frontend loads on Vercel.
- Backend /health returns healthy.
- Backend /openapi.json loads.
- Resume upload works.
- Job description upload works.
- ATS analysis works.
- Application tracker page loads.
- No CORS errors appear in browser console.
- Render logs show Alembic migrations completed.
- No secrets are committed to GitHub.

## Common deployment issues

### CORS error in browser

Fix Render variables:

    FRONTEND_URL=https://your-vercel-app.vercel.app
    CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
    BACKEND_CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000

Then redeploy backend.

### Backend cannot connect to database

Check Render DATABASE_URL is present.

The backend supports Render-style postgres:// URLs by normalizing them to postgresql://.

### Frontend calls localhost in production

Check Vercel has:

    NEXT_PUBLIC_API_BASE_URL=https://your-render-api.onrender.com

Then redeploy frontend.

### Migrations fail

Check migration status locally:

    cd backend
    alembic current
    alembic history

Do not downgrade production without reviewing the failing migration.

## Rollback

If a deployment commit breaks production:

    git revert <bad_commit_sha>
    git push origin main

Then redeploy Render and Vercel.
