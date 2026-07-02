# CareerPilot AI

Live Demo: https://careerpilot-live.vercel.app
GitHub: https://github.com/stomarp/careerpilot-ai


CareerPilot AI is a full-stack AI-assisted job-search command center that helps candidates move from resume and job description to a complete application strategy.

It combines resume upload, job intake, ATS analysis, AI resume optimization, interview preparation, learning roadmaps, exports, saved application packs, and application tracking into one workflow.

## Quick Links

- Live Demo: https://careerpilot-live.vercel.app
- GitHub Repo: https://github.com/stomarp/careerpilot-ai
- Backend API Health: https://careercopilot-api.onrender.com/health
- Backend Readiness: https://careercopilot-api.onrender.com/ready
- CI Workflow: GitHub Actions backend/frontend validation

[![CI](https://github.com/stomarp/careerpilot-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/stomarp/careerpilot-ai/actions/workflows/ci.yml)

## Screenshots

### Landing Page
![CareerPilot AI Landing Page](docs/screenshots/landing.png)

### Dashboard
![CareerPilot AI Dashboard](docs/screenshots/dashboard.png)

### Smart Job Intake
![CareerPilot AI Smart Job Intake](docs/screenshots/jobs.png)

### Interview Prep Generator
![CareerPilot AI Interview Prep Generator](docs/screenshots/interview-prep.png)

### Roadmap Generator
![CareerPilot AI Roadmap Generator](docs/screenshots/roadmap.png)

### Export Center
![CareerPilot AI Export Center](docs/screenshots/export-center.png)

### Resume Templates
![CareerPilot AI Resume Templates](docs/screenshots/resume-templates.png)

## AI Implementation Note

CareerPilot AI includes backend AI generation services for interview preparation and learning roadmaps.

The backend supports Gemini-backed generation through production API routes and returns provider metadata such as `provider_used` and `fallback_used`. If `GEMINI_API_KEY` is unavailable or the AI provider fails, the services automatically return structured rule-based fallback output so the product remains usable.

Current AI-backed backend routes:

~~~text
POST /interview/generate
POST /interview/questions

POST /learning-roadmap/generate
POST /learning-roadmap
~~~

Accuracy note:

- Interview Prep and Learning Roadmap generation are Gemini-backed when the backend has `GEMINI_API_KEY` configured.
- ATS scoring is ATS-style rule-based career matching, not a certified ATS score.
- Fallback behavior is intentional for production resilience.

## Architecture Diagram

~~~mermaid
flowchart LR
    User["User / Job Seeker"] --> Frontend["Vercel Frontend<br/>Next.js + React + TypeScript"]

    Frontend --> API["Render Backend API<br/>FastAPI + Python"]
    Frontend --> Auth["JWT Auth<br/>Login / Register"]

    API --> DB[("PostgreSQL<br/>Users, Resumes, Jobs,<br/>Reports, Packs, Applications")]
    API --> Gemini["Gemini API<br/>Interview Prep + Roadmaps"]
    API --> Parser["Resume / Job Parsers<br/>PDF, DOCX, Text"]
    API --> Scoring["ATS-Style Scoring<br/>Skill Match + Gap Analysis"]
    API --> Export["Export Engine<br/>Markdown, Print/PDF, Saved Packs"]

    GitHub["GitHub"] --> CI["GitHub Actions CI<br/>Backend Compile + Frontend Build"]
    GitHub --> Vercel["Vercel Auto Deploy"]
    GitHub --> Render["Render Auto Deploy"]

    Vercel --> Frontend
    Render --> API
~~~

## Product Flow

Dashboard  
→ Resume Upload / Resume Builder  
→ Job Intake  
→ Guided Job Workspace  
→ ATS Analysis  
→ AI Resume Optimizer  
→ Interview Prep  
→ Learning Roadmap  
→ Export Center  
→ Application Packs  
→ Applications Tracker

## Core Features

### Resume Workflow

- Upload PDF/DOCX resumes
- Parse resume text
- Store user-owned resume records
- Resume builder and template gallery

### Job Intake

- Save job descriptions
- Capture title, company, and job text
- Store job records for later analysis
- Use saved jobs inside the guided workspace

### Guided Job Workspace

- Select saved job from dropdown
- Select uploaded resume from dropdown
- Run the full AI workspace without manually entering IDs
- Generate ATS match, optimizer, interview prep, roadmap, and pipeline strategy

### ATS Analysis

- Resume-to-job match score
- Matched skills
- Missing skills
- Keywords
- Priority actions
- Candidate fit summary

### AI Resume Optimizer

- Job-specific resume strategy
- Section feedback
- Suggested bullet improvements
- Project enhancement ideas
- Truthfulness warning so users do not add fake experience

### Interview Prep

- Role-specific technical questions
- Behavioral questions
- Company-aware prompts
- Answer hints
- Practice priorities

### Learning Roadmap

- Weekly plan
- Daily plan
- Skill gap learning path
- Portfolio project actions
- Interview preparation actions

### Export Center

- Export full application packs
- Export analysis, optimizer, interview prep, roadmap, or recruiter note
- Copy to clipboard
- Download as Markdown
- Print or save as PDF
- Save output as a persistent Application Pack

### Application Packs

- Save generated career artifacts
- Reopen saved packs later
- Search packs
- Copy, download, print, or delete packs

### Applications Tracker

- Track job applications
- Manage status, priority, follow-up date, notes, and next actions
- Use pipeline-style workflow for job search organization

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- Lucide icons

### Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- PostgreSQL
- Alembic migrations

### Tools

- Docker
- GitHub Actions
- REST APIs
- AI provider integrations
- Makefile-based local workflow

## API Areas

- /resumes
- /jobs
- /analysis
- /interview
- /learning-roadmap
- /application-packs
- /applications
- /resume-builder
- /auth
- /health
- /ready

## Local Development

### Backend

~~~bash
cd backend
cp .env.example .env
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
~~~

Backend runs at:

~~~text
http://127.0.0.1:8000
~~~

### Frontend

~~~bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
~~~

Frontend runs at:

~~~text
http://localhost:3000
~~~

## Useful Commands

make check-env
make migrate
make test
make build
make demo-check

## Demo Flow

1. Upload a resume
2. Save a job description
3. Open Job Workspace
4. Select saved job and resume
5. Run AI workspace
6. Review ATS match, optimizer, interview prep, and roadmap
7. Open Export Center
8. Save Application Pack
9. Reopen it from Application Packs
10. Track the application in Applications

See:

- docs/DEMO_FLOW.md
- docs/DEPLOYMENT.md
- docs/PRODUCTION_READINESS.md

## Recruiter Scan

CareerPilot AI demonstrates:

- Full-stack product development with Next.js, TypeScript, FastAPI, PostgreSQL, SQLAlchemy, and Alembic
- Gemini-backed backend generation services for interview preparation and learning roadmaps
- ATS-style resume/job matching, resume parsing, job intake, exportable application packs, and application tracking
- Production deployment using Vercel, Render, PostgreSQL, environment variables, and CORS configuration
- GitHub Actions CI for backend and frontend validation
- Product thinking across the full job-search workflow, not just a single feature demo

## Why This Project Matters

CareerPilot AI demonstrates end-to-end software engineering and product thinking:

- Backend API design
- Database modeling
- AI-assisted workflows
- User-owned persistent data
- Full-stack product architecture
- Candidate-focused UX
- Exportable artifacts
- Deployment readiness
- Production-style project organization

## Resume-Ready Project Summary

Built and deployed CareerPilot AI, a full-stack AI-assisted job-search platform using FastAPI, PostgreSQL, SQLAlchemy, Alembic, Next.js, TypeScript, and Gemini-backed backend generation services. The platform parses resumes and job descriptions, performs ATS-style match analysis, generates interview prep and learning roadmaps, exports application packs, saves generated artifacts, and tracks job applications through a candidate pipeline with GitHub Actions CI and Vercel/Render deployment.

## Limitations / Future Work

CareerPilot AI is an actively evolving portfolio product.

Current limitations and planned improvements:

- ATS scoring is rule-based and should be described as ATS-style matching, not a certified ATS score.
- Gemini-backed generation requires `GEMINI_API_KEY` in the backend production environment.
- AI provider failures intentionally fall back to structured rule-based output for reliability.
- Future improvements may include deeper resume optimization, richer analytics, stronger automated tests, advanced prompt evaluation, and more detailed observability.

## Live Project

- Live App: https://careerpilot-live.vercel.app
- GitHub Repo: https://github.com/stomarp/careerpilot-ai
- Backend API: https://careercopilot-api.onrender.com
  - Internal production API used by the Vercel frontend.

## CI/CD & Deployment

CareerPilot AI uses GitHub Actions for CI and Vercel/Render for deployment.

### CI

GitHub Actions runs on pull requests and pushes to `main`.

The CI workflow checks:

- Backend dependency installation
- Backend Python compilation
- Frontend dependency installation
- Next.js production build

Workflow file:

~~~text
.github/workflows/ci.yml
~~~

### Production Deployment

Production stack:

- Frontend: Vercel Next.js app
- Backend: Render FastAPI web service
- Database: PostgreSQL
- Migrations: Alembic
- AI provider: Gemini API through backend environment variables

Required Render environment variables include:

~~~text
ENVIRONMENT=production
APP_ENV=production
FRONTEND_URL=https://careerpilot-live.vercel.app
BACKEND_CORS_ORIGINS=https://careerpilot-live.vercel.app,http://localhost:3000
GEMINI_API_KEY=<backend-only-secret>
~~~

Required Vercel environment variables include:

~~~text
NEXT_PUBLIC_API_BASE_URL=https://careercopilot-api.onrender.com
NEXT_PUBLIC_APP_NAME=CareerPilot AI
NEXT_PUBLIC_APP_ENV=production
~~~

## License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

