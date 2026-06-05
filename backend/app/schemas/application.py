from datetime import date, datetime
from pydantic import BaseModel, Field


VALID_STATUSES = {
    "saved",
    "applied",
    "oa_received",
    "oa_completed",
    "phone_screen",
    "interviewing",
    "final_round",
    "offer",
    "rejected",
    "withdrawn",
    "ghosted",
}

VALID_PRIORITIES = {
    "low",
    "medium",
    "high",
}

VALID_WORK_TYPES = {
    "remote",
    "hybrid",
    "onsite",
}

VALID_EMPLOYMENT_TYPES = {
    "full_time",
    "internship",
    "contract",
    "part_time",
}


class ApplicationCreate(BaseModel):
    company_name: str
    role_title: str
    job_url: str | None = None
    job_location: str | None = None

    status: str = "saved"
    priority: str = "medium"

    source: str | None = None
    work_type: str | None = None
    employment_type: str | None = None

    salary_min: int | None = None
    salary_max: int | None = None
    salary_currency: str | None = "USD"

    resume_id: int | None = None
    job_description_id: int | None = None

    ats_score: int | None = Field(default=None, ge=0, le=100)
    match_score: float | None = Field(default=None, ge=0, le=100)

    recruiter_name: str | None = None
    recruiter_email: str | None = None
    contact_person: str | None = None

    saved_date: date | None = None
    applied_date: date | None = None
    oa_date: date | None = None
    interview_date: date | None = None
    follow_up_date: date | None = None
    decision_date: date | None = None

    notes: str | None = None
    next_action: str | None = None


class ApplicationUpdate(BaseModel):
    company_name: str | None = None
    role_title: str | None = None
    job_url: str | None = None
    job_location: str | None = None

    status: str | None = None
    priority: str | None = None

    source: str | None = None
    work_type: str | None = None
    employment_type: str | None = None

    salary_min: int | None = None
    salary_max: int | None = None
    salary_currency: str | None = None

    resume_id: int | None = None
    job_description_id: int | None = None

    ats_score: int | None = Field(default=None, ge=0, le=100)
    match_score: float | None = Field(default=None, ge=0, le=100)

    recruiter_name: str | None = None
    recruiter_email: str | None = None
    contact_person: str | None = None

    saved_date: date | None = None
    applied_date: date | None = None
    oa_date: date | None = None
    interview_date: date | None = None
    follow_up_date: date | None = None
    decision_date: date | None = None

    notes: str | None = None
    next_action: str | None = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int

    company_name: str
    role_title: str
    job_url: str | None
    job_location: str | None

    status: str
    priority: str

    source: str | None
    work_type: str | None
    employment_type: str | None

    salary_min: int | None
    salary_max: int | None
    salary_currency: str | None

    resume_id: int | None
    job_description_id: int | None

    ats_score: int | None
    match_score: float | None

    recruiter_name: str | None
    recruiter_email: str | None
    contact_person: str | None

    saved_date: date | None
    applied_date: date | None
    oa_date: date | None
    interview_date: date | None
    follow_up_date: date | None
    decision_date: date | None

    notes: str | None
    next_action: str | None

    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True


class ApplicationDashboardStats(BaseModel):
    total_applications: int
    saved: int
    applied: int
    interviewing: int
    offers: int
    rejected: int
    upcoming_followups: int
    average_ats_score: float | None


class ApplicationStatusOption(BaseModel):
    value: str
    label: str
