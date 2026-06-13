# CareerCopilot AI - Project Plan

CareerCopilot AI is a full-stack AI-powered career platform designed to help candidates manage the complete job-search workflow.

The product helps users build or upload resumes, save job descriptions, analyze resume-job fit, identify ATS gaps, and track applications through a structured pipeline.

---

## Product Vision

CareerCopilot AI is designed as a job-search operating system for candidates.

Instead of acting as only a resume builder or only an application tracker, it connects the full workflow:

Resume → Job Description → ATS Analysis → Resume Improvements → Application Pipeline

---

## Current Product Modules

### 1. Dashboard

Status: Built

Purpose:

- Provide product overview
- Show major workflow areas
- Guide users through resume, jobs, analysis, and applications

---

### 2. Resume Builder

Status: Built

Current capabilities:

- Resume template gallery
- Resume builder form
- Resume preview
- Template selection
- Resume customization controls
- Resume upload and parsing support

Value:

- Shows frontend product design
- Supports candidate resume workflow
- Connects resume content to analysis

---

### 3. Smart Job Intake

Status: Built

Current capabilities:

- Save job descriptions
- Capture company, role, source, and job details
- Parse job description text
- Show live job intelligence
- Detect skills, responsibilities, seniority, and ATS keywords
- Continue into analysis flow

Value:

- Turns raw job descriptions into structured hiring signals
- Connects job descriptions to resume scoring

---

### 4. ATS Analysis

Status: Built

Current capabilities:

- Compare resume with job description
- Generate ATS-style score
- Show overall match level
- Display score breakdown
- Identify resume gaps
- Recommend priority actions

Value:

- Core intelligence layer of the product
- Helps candidates understand why a resume does or does not match a job

---

### 5. Applications Pipeline

Status: Built

Current capabilities:

- Job Search Command Center
- Smart filters by keyword, status, and priority
- Kanban-style pipeline grouped by stage
- Add Application modal
- Follow-up date tracking
- Priority tracking
- Next-action tracking
- Detailed application list
- Dashboard summary stats

Value:

- Makes the product feel like a real job-search CRM
- Helps users manage applications after analysis

---

## Planned Product Modules

### 6. Report Page

Status: Planned

Purpose:

- Convert ATS analysis into a polished report
- Show final recommendations
- Make results easier to share, review, and export

Planned features:

- Executive summary
- Score breakdown
- Resume strengths
- Resume gaps
- Keyword recommendations
- Priority improvements
- Export-ready report layout

---

### 7. Interview Prep

Status: Planned

Purpose:

- Generate interview preparation from resume and job description context

Planned features:

- Technical questions
- Behavioral questions
- Resume/project-based questions
- System design prompts
- Suggested answer strategy
- Role-specific preparation checklist

---

### 8. Roadmap / Learning Plan

Status: Planned

Purpose:

- Convert skill gaps into a learning roadmap

Planned features:

- Missing skill analysis
- Weekly learning plan
- Project recommendations
- Resource suggestions
- Priority order for learning

---

## Technical Architecture

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Component-based UI

Backend:

- FastAPI
- Python
- Pydantic
- SQLAlchemy
- Alembic
- PostgreSQL

Infrastructure:

- Docker
- Docker Compose
- GitHub
- REST APIs

---

## Completed Milestones

- Initialized FastAPI backend
- Configured PostgreSQL with Docker
- Added SQLAlchemy models and Alembic migrations
- Built resume upload and parsing flow
- Built job description intake flow
- Built ATS scoring endpoint
- Built resume builder UI
- Built smart job intake UI
- Built ATS analysis UI
- Built applications CRUD flow
- Built premium applications pipeline dashboard
- Added project screenshots for README
- Updated product README

---

## Current Status

CareerCopilot AI currently includes:

- Dashboard
- Resume Builder
- Smart Job Intake
- ATS Analysis
- Applications Pipeline
- Product screenshots
- README documentation

This is now a strong job-ready project foundation.

---

## Next Milestones

Priority order:

1. Add backend tests
2. Add GitHub Actions CI
3. Add Report page
4. Add Interview Prep page
5. Add Roadmap page
6. Add production deployment
7. Add authentication cleanup
8. Add AI/LLM-backed suggestions
9. Add RAG/vector search
10. Add PDF report export

---

## Job-Readiness Goals

Before using heavily in applications:

- Keep README polished
- Include screenshots
- Add at least basic backend tests
- Add CI workflow
- Deploy frontend and backend
- Add strong resume bullet
- Pin repository on GitHub
- Add project to LinkedIn

---

## Resume Bullet

Built CareerCopilot AI, a full-stack AI career platform using FastAPI, PostgreSQL, Docker, Next.js, and TypeScript that parses resumes and job descriptions, generates ATS-style match analysis, identifies resume gaps, and tracks job applications through a Kanban-style pipeline.

