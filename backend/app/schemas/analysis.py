from typing import Any

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


class ResumeStrength(BaseModel):
    category: str
    evidence: str


class ResumeGap(BaseModel):
    category: str
    severity: str
    problem: str
    suggestion: str
    example_bullet: str


class SuggestedAnalysisBullet(BaseModel):
    category: str
    bullet: str
    why_it_helps: str


class KeywordDetails(BaseModel):
    matched: list[str]
    missing: list[str]
    note: str


class ATSScoreResponse(BaseModel):
    resume_id: int
    job_id: int
    industry: str
    ats_score: int
    match_level: str
    summary: str
    breakdown: ScoreBreakdown
    matching_skills: list[str]
    missing_skills: list[str]
    matched_keywords: list[str]
    missing_keywords: list[str]
    strengths: list[ResumeStrength]
    resume_gaps: list[ResumeGap]
    priority_actions: list[str]
    suggested_bullets: list[SuggestedAnalysisBullet]
    keyword_details: KeywordDetails
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


class AISectionFeedback(BaseModel):
    section: str
    score: int
    feedback: str
    improved_version: str


class AIResumeBullet(BaseModel):
    current_or_target_section: str
    improved_bullet: str
    why_it_helps: str
    truthfulness_note: str


class AIProjectEnhancement(BaseModel):
    project: str
    enhancement_to_build: str
    resume_bullet_after_building: str
    difficulty: str


class AIResumeOptimizerResponse(BaseModel):
    resume_id: int
    job_id: int
    industry: str
    ats_score: int
    provider_used: str
    fallback_used: bool
    ai_overall_feedback: str
    section_feedback: list[AISectionFeedback]
    improved_bullets: list[AIResumeBullet]
    missing_keywords_to_add_truthfully: list[str]
    project_enhancements: list[AIProjectEnhancement]
    certifications_or_learning: list[str]
    final_warning: str
