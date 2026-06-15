from pydantic import BaseModel, Field


class InterviewQuestionRequest(BaseModel):
    application_id: int | None = None
    analysis_report_id: int | None = None
    resume_id: int | None = None
    job_description_id: int | None = None

    target_role: str
    company_name: str | None = None
    role_type: str = "general"
    industry: str = "general"
    experience_level: str = "entry_level"

    question_count: int = Field(default=12, ge=5, le=30)

    question_style: str = "company_and_role_pattern"
    include_company_prep: bool = True
    include_platform_patterns: bool = True

    difficulty: str | None = None
    job_description_text: str | None = None
    resume_context: str | None = None
    focus_areas: list[str] | None = None


class InterviewQuestion(BaseModel):
    question: str
    difficulty: str
    source_style: str
    practice_priority: str
    what_interviewer_is_testing: str
    answer_hint: str


class InterviewQuestionSet(BaseModel):
    category: str
    why_this_category_matters: str
    questions: list[InterviewQuestion]


class CompanyPrepInsight(BaseModel):
    area: str
    guidance: str


class InterviewQuestionResponse(BaseModel):
    target_role: str
    company_name: str | None
    role_type: str
    industry: str
    experience_level: str

    provider_used: str
    fallback_used: bool

    question_sets: list[InterviewQuestionSet]
    company_prep: list[CompanyPrepInsight]
    preparation_tips: list[str]
    focus_areas: list[str]
