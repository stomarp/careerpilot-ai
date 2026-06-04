from pydantic import BaseModel


class ATSScoreRequest(BaseModel):
    resume_id: int
    job_id: int
    industry: str = "general"


class ScoreBreakdown(BaseModel):
    skills_match: int
    keyword_match: int
    industry_alignment: int
    experience_alignment: int
    formatting: int
    measurable_impact: int


class ATSScoreResponse(BaseModel):
    resume_id: int
    job_id: int
    industry: str
    ats_score: int
    breakdown: ScoreBreakdown
    matching_skills: list[str]
    missing_skills: list[str]
    matched_keywords: list[str]
    missing_keywords: list[str]
    recommendations: list[str]


class ResumeATSRequest(BaseModel):
    resume_id: int
    industry: str = "general"


class GeneralResumeBreakdown(BaseModel):
    contact_info: int
    resume_sections: int
    industry_keywords: int
    action_verbs: int
    measurable_impact: int
    formatting: int


class ResumeATSResponse(BaseModel):
    resume_id: int
    industry: str
    ats_score: int
    breakdown: GeneralResumeBreakdown
    strengths: list[str]
    issues: list[str]
    recommendations: list[str]


class ResumeOptimizerRequest(BaseModel):
    resume_id: int
    job_id: int
    industry: str = "general"


class SuggestedBullet(BaseModel):
    section: str
    skill: str
    bullet: str
    why: str


class ProjectEnhancement(BaseModel):
    project: str
    enhancement: str
    resume_bullet_after_building: str


class SectionSuggestion(BaseModel):
    section: str
    priority: str
    issue: str
    suggestion: str
    example: str
    truthfulness_note: str


class ResumeOptimizerResponse(BaseModel):
    resume_id: int
    job_id: int
    industry: str
    overall_strategy: str
    section_suggestions: list[SectionSuggestion]
    suggested_bullets: list[SuggestedBullet]
    project_enhancements: list[ProjectEnhancement]
    skills_to_learn: list[str]
    truthfulness_warning: str
