# API Design

## Health

GET /health

## Resume

POST /resumes/upload
GET /resumes/{resume_id}

## Job Description

POST /jobs
GET /jobs/{job_id}

## ATS Analysis

POST /analysis/ats-score

## Interview Questions

POST /interview/questions

## Applications

POST /applications
GET /applications
PATCH /applications/{application_id}
DELETE /applications/{application_id}
