from pydantic import BaseModel


class AdvancedATSRequest(BaseModel):
    resume_id: int
    job_id: int
    industry: str = "general"
    role_type: str = "general"


class ScoreBreakdown(BaseModel):
    keyword_score: int
    skills_score: int
    formatting_score: int
    section_score: int
    impact_score: int


class KeywordAnalysis(BaseModel):
    matched_keywords: list[str]
    missing_keywords: list[str]
    high_priority_missing_keywords: list[str]
    keyword_match_percentage: int


class SkillsAnalysis(BaseModel):
    matched_skills: list[str]
    missing_skills: list[str]
    transferable_skills: list[str]


class FormattingCheck(BaseModel):
    name: str
    status: str
    feedback: str


class SectionFeedback(BaseModel):
    section: str
    status: str
    feedback: str


class AdvancedATSResponse(BaseModel):
    resume_id: int
    job_id: int
    industry: str
    role_type: str
    overall_score: int
    score_breakdown: ScoreBreakdown
    keyword_analysis: KeywordAnalysis
    skills_analysis: SkillsAnalysis
    formatting_checks: list[FormattingCheck]
    section_feedback: list[SectionFeedback]
    recommendations: list[str]
