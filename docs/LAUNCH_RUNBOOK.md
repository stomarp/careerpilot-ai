# CareerPilot AI Launch Runbook

## 1. Deployment targets

- Backend API: Render Web Service
- Database: Render PostgreSQL
- Frontend: Vercel Next.js app

## 2. Render backend setup

1. Push render.yaml to GitHub.
2. In Render, create a new Blueprint from the repository.
3. Render should create:
   - careerpilot-api
   - careerpilot-postgres

4. Confirm backend build command:

    cd backend && pip install --upgrade pip && pip install -r requirements.txt

5. Confirm backend start command:

    cd backend && alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT

6. Add required Render environment variables:

    ENVIRONMENT=production
    APP_ENV=production
    LOG_LEVEL=info
    FRONTEND_URL=https://your-vercel-app.vercel.app
    BACKEND_CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000

7. Confirm Render injects:

    DATABASE_URL
    SECRET_KEY

## 3. Vercel frontend setup

1. Import the GitHub repository into Vercel.

2. Set the Vercel root directory to:

    frontend

3. Add Vercel environment variables:

    NEXT_PUBLIC_API_BASE_URL=https://your-render-api.onrender.com
    NEXT_PUBLIC_APP_NAME=CareerPilot AI
    NEXT_PUBLIC_APP_ENV=production

4. Deploy the frontend.
5. Copy the Vercel production URL.

6. Add the Vercel URL back into Render:

    FRONTEND_URL=https://your-vercel-app.vercel.app
    BACKEND_CORS_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000

7. Redeploy the Render backend.

## 4. Production smoke test

Run this after both services deploy:

    API_URL=https://your-render-api.onrender.com WEB_URL=https://your-vercel-app.vercel.app ./scripts/smoke_production.sh

Expected result:

    Production smoke test passed

## 5. Manual launch checks

- Backend /health returns healthy.
- Backend /openapi.json loads.
- Frontend home page loads.
- Resume upload works.
- Job description upload works.
- ATS analysis works without manual database changes.
- CORS does not block frontend API calls.
- Render logs show Alembic migrations completed successfully.
- No secrets are committed to GitHub.

## 6. Rollback plan

If backend deployment fails:

    git revert <bad_commit_sha>
    git push origin main

Then trigger Render redeploy.

If frontend deployment fails:

    git revert <bad_commit_sha>
    git push origin main

Then trigger Vercel redeploy.

If database migration fails:

    cd backend
    alembic current
    alembic history

Review the failing migration before applying any downgrade in production.

## 7. Launch notes

CareerPilot AI production launch should feel like a real SaaS product:

- Stable hosted frontend
- Stable hosted backend
- Managed PostgreSQL
- Automatic migrations
- Clear production environment variables
- Repeatable smoke test
- Documented rollback path
