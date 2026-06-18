# CareerPilot AI Deployment Guide

CareerPilot AI is a full-stack AI career platform built with Next.js, FastAPI, PostgreSQL, SQLAlchemy, Alembic, and AI provider integrations.

## Production Architecture

User
  ↓
Next.js frontend
  ↓ REST API
FastAPI backend
  ↓ SQLAlchemy
PostgreSQL
  ↓
AI provider API

## Recommended Hosting

Frontend: Vercel  
Backend: Render, Railway, Fly.io, or similar Python platform  
Database: Neon, Supabase, Render Postgres, or Railway Postgres

## Backend Environment Variables

ENVIRONMENT=production
DATABASE_URL=
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=
GEMINI_API_KEY=
GOOGLE_API_KEY=
FRONTEND_URL=
CORS_ORIGINS=

CORS_ORIGINS should be comma-separated:

https://your-frontend.vercel.app,https://your-custom-domain.com

## Frontend Environment Variables

NEXT_PUBLIC_API_BASE_URL=https://your-backend-url

## Backend Start Command

uvicorn app.main:app --host 0.0.0.0 --port $PORT

## Migration Command

alembic upgrade head

## Local Verification

make check-env
make migrate
make test
make build

With backend running:

make demo-check

## Pre-Demo Checklist

- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Production database connected
- [ ] Alembic migrations applied
- [ ] CORS allows frontend URL
- [ ] AI provider key configured
- [ ] /health returns healthy
- [ ] /ready returns ready
- [ ] Demo user can log in
- [ ] Resume upload works
- [ ] Job save works
- [ ] Job Workspace runs
- [ ] Export Center works
- [ ] Application Pack can be saved
