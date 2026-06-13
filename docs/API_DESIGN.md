# CareerCopilot AI - API Design

CareerCopilot AI uses a FastAPI backend with PostgreSQL persistence. The API supports resume parsing, job description intake, ATS-style analysis, and application tracking.

---

## API Overview

Base URL for local development:

    http://localhost:8000

API style:

- REST API
- JSON request and response bodies
- Multipart upload support for resume/job description files
- PostgreSQL-backed persistence
- Pydantic schemas for validation
- SQLAlchemy models for database access

---

## Core API Modules

Current backend modules:

- `/health`
- `/resumes`
- `/job-descriptions`
- `/analysis`
- `/applications`

Planned modules:

- `/reports`
- `/interview-prep`
- `/roadmap`
- `/auth`

---

## Health Check

### GET `/health`

Checks whether the backend and database are running.

Response example:

    {
      "status": "healthy",
      "database": "connected"
    }

---

## Resume APIs

Resume APIs support uploading, parsing, and storing resume content.

### POST `/resumes/upload`

Uploads a resume file and extracts parsed text.

Request type:

- `multipart/form-data`

Fields:

- `file`: PDF resume file
- `user_id`: user ID

Response example:

    {
      "resume_id": 3,
      "filename": "Swati_Resume.pdf",
      "status": "uploaded",
      "parsed_text_preview": "New Grad Software Engineer..."
    }

Use cases:

- Upload existing resume
- Extract text for ATS scoring
- Store resume record for later analysis

---

## Job Description APIs

Job description APIs support saving job postings and extracting role signals.

### POST `/job-descriptions/upload`

Uploads or saves a job description and extracts text.

Request type:

- `multipart/form-data` or JSON depending on frontend flow

Fields may include:

- `company_name`
- `role_title`
- `job_location`
- `job_url`
- `description`
- `file`

Response example:

    {
      "job_id": 5,
      "filename": "visa_backend_engineer.txt",
      "status": "uploaded",
      "parsed_text_preview": "Backend Engineer..."
    }

Use cases:

- Save target role
- Extract job requirements
- Connect job description to ATS analysis
- Power job intelligence UI

---

## Analysis APIs

Analysis APIs compare a resume with a job description and generate ATS-style fit insights.

### POST `/analysis/ats-score`

Generates an ATS-style score between a resume and job description.

Request example:

    {
      "resume_id": 3,
      "job_id": 5,
      "industry": "technology"
    }

Response example:

    {
      "ats_score": 89,
      "overall_match": "Excellent match",
      "summary": "The resume is strongly aligned with the backend engineer role.",
      "score_breakdown": {
        "skills_match": 92,
        "experience_match": 85,
        "keyword_match": 88,
        "education_match": 90
      },
      "strengths": [
        "Strong backend API experience",
        "Relevant FastAPI and PostgreSQL skills",
        "Project experience aligned with the role"
      ],
      "gaps": [
        "Add more cloud deployment details",
        "Include stronger metrics",
        "Mention CI/CD experience more clearly"
      ],
      "priority_actions": [
        "Add role-specific backend keywords",
        "Quantify project impact",
        "Highlight deployment and testing experience"
      ]
    }

Use cases:

- ATS score generation
- Resume gap analysis
- Resume improvement recommendations
- Report page foundation
- Interview preparation foundation
- Roadmap generation foundation

---

## Applications APIs

Applications APIs support the job-search pipeline dashboard.

### GET `/applications`

Returns all tracked applications for a user.

Response example:

    [
      {
        "id": 1,
        "company_name": "Visa",
        "role_title": "Backend Engineer",
        "job_url": "https://example.com/job",
        "job_location": "Seattle, WA",
        "status": "applied",
        "priority": "high",
        "source": "Company Website",
        "notes": "Strong backend match.",
        "next_action": "Follow up with recruiter",
        "applied_date": "2026-06-10",
        "follow_up_date": "2026-06-17",
        "ats_score": 89,
        "created_at": "2026-06-10T12:00:00"
      }
    ]

---

### POST `/applications`

Creates a new application record.

Request example:

    {
      "company_name": "Visa",
      "role_title": "Backend Engineer",
      "job_url": "https://example.com/job",
      "job_location": "Seattle, WA",
      "status": "saved",
      "priority": "high",
      "source": "Company Website",
      "notes": "Good backend fit.",
      "next_action": "Tailor resume and apply",
      "applied_date": null,
      "follow_up_date": "2026-06-17",
      "ats_score": 89
    }

Response example:

    {
      "id": 1,
      "company_name": "Visa",
      "role_title": "Backend Engineer",
      "status": "saved",
      "priority": "high"
    }

---

### PATCH `/applications/{application_id}`

Updates an existing application.

Request example:

    {
      "status": "interviewing",
      "next_action": "Prepare system design examples"
    }

Use cases:

- Move application through pipeline stages
- Update next action
- Update follow-up date
- Update priority
- Update notes

---

### DELETE `/applications/{application_id}`

Deletes an application record.

Response example:

    {
      "message": "Application deleted successfully"
    }

---

### GET `/applications/dashboard`

Returns application dashboard summary.

Response example:

    {
      "total_applications": 12,
      "saved": 4,
      "applied": 5,
      "interviewing": 2,
      "offers": 1,
      "rejected": 0,
      "upcoming_followups": 3,
      "average_ats_score": 84
    }

Use cases:

- Application stats cards
- Command center
- Follow-up tracking
- Pipeline dashboard summary

---

## Application Status Values

Supported application statuses:

- `saved`
- `applied`
- `oa_received`
- `oa_completed`
- `phone_screen`
- `interviewing`
- `final_round`
- `offer`
- `rejected`
- `withdrawn`
- `ghosted`

---

## Application Priority Values

Supported priority values:

- `low`
- `medium`
- `high`

---

## Planned Report APIs

### GET `/reports/{analysis_id}`

Planned endpoint for generating a complete job-fit report.

Expected response areas:

- Overall score
- Executive summary
- Resume strengths
- Resume gaps
- Keyword recommendations
- Skill gap recommendations
- Suggested resume edits
- Export-ready report data

---

## Planned Interview Prep APIs

### POST `/interview-prep/generate`

Planned endpoint for generating interview questions from resume and job description context.

Expected request:

    {
      "resume_id": 3,
      "job_id": 5,
      "role_title": "Backend Engineer"
    }

Expected response areas:

- Technical questions
- Behavioral questions
- Resume/project-based questions
- System design prompts
- Suggested answer approach

---

## Planned Roadmap APIs

### POST `/roadmap/generate`

Planned endpoint for generating a personalized learning plan based on ATS gaps.

Expected request:

    {
      "analysis_id": 10,
      "target_role": "Backend Engineer"
    }

Expected response areas:

- Missing skills
- Weekly learning plan
- Project recommendations
- Resources
- Priority order

---

## Data Model Summary

Core database entities:

- `User`
- `Resume`
- `JobDescription`
- `Application`

Planned entities:

- `AnalysisReport`
- `InterviewPrepSession`
- `LearningRoadmap`

---

## API Design Principles

- Keep endpoints simple and product-focused
- Separate resume, job, analysis, and application workflows
- Return frontend-friendly response shapes
- Store parsed text and generated insights for reuse
- Support future AI features without rewriting core APIs
- Keep backend modular for testing and deployment

---

## Future API Improvements

- Add authentication and user-scoped authorization
- Add pagination for applications and jobs
- Add backend tests for all core endpoints
- Add OpenAPI examples for request and response models
- Add report export endpoint
- Add LLM-backed analysis endpoints
- Add RAG/vector search for resume and job memory
- Add CI validation for API tests

