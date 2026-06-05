from pydantic import BaseModel, Field


class InterviewQuestionRequest(BaseModel):
    application_id: int | None = None
    analysis_report_id: int | None = None
    resume_id: int | None = None
    job_description_id: int | None = None

    target_role: str
    role_type: str = "general"
    industry: str = "general"
    experience_level: str = "entry_level"

    question_count: int = Field(default=12, ge=5, le=30)


class InterviewQuestion(BaseModel):
    question: str
    difficulty: str
    what_interviewer_is_testing: str
    answer_hint: str


class InterviewQuestionSet(BaseModel):
    category: str
    questions: list[InterviewQuestion]


class InterviewQuestionResponse(BaseModel):
    target_role: str
    role_type: str
    industry: str
    experience_level: str

    provider_used: str
    fallback_used: bool

    question_sets: list[InterviewQuestionSet]
    preparation_tips: list[str]
    focus_areas: list[str]
