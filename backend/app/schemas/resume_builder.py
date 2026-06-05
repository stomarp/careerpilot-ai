from pydantic import BaseModel


class ResumeTemplate(BaseModel):
    template_id: str
    name: str
    best_for: str
    description: str
    experience_level: str
    role_type: str
    design_style: str
    section_order: list[str]


class EducationItem(BaseModel):
    school: str
    degree: str
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    details: list[str] = []


class ExperienceItem(BaseModel):
    title: str
    company: str
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    bullets: list[str] = []


class ProjectItem(BaseModel):
    name: str
    tech_stack: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    bullets: list[str] = []


class ResumeCreateRequest(BaseModel):
    template_id: str = "ats_simple"
    experience_level: str = "new_grad"
    role_type: str = "software_engineer"
    design_style: str = "ats_simple"

    full_name: str
    email: str
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    github: str | None = None

    target_role: str | None = None
    summary: str | None = None
    skills: list[str] = []
    education: list[EducationItem] = []
    experience: list[ExperienceItem] = []
    projects: list[ProjectItem] = []


class ResumeCreateResponse(BaseModel):
    template_id: str
    experience_level: str
    role_type: str
    design_style: str
    section_order: list[str]
    resume_markdown: str
    suggestions: list[str]


class ResumeSuggestionRequest(BaseModel):
    target_role: str
    industry: str = "general"
    experience_level: str = "new_grad"
    role_type: str = "software_engineer"
    design_style: str = "ats_simple"


class ResumeSuggestionResponse(BaseModel):
    recommended_template: str
    experience_level: str
    role_type: str
    design_style: str
    suggested_sections: list[str]
    suggested_keywords: list[str]
    design_guidance: list[str]
    suggestions: list[str]


class AIResumeEnhanceRequest(BaseModel):
    target_role: str
    experience_level: str = "new_grad"
    role_type: str = "software_engineer"
    rough_summary: str | None = None
    rough_skills: list[str] = []
    rough_experience: list[str] = []
    rough_projects: list[str] = []


class EnhancedResumeSection(BaseModel):
    section: str
    content: str


class EnhancedResumeBullet(BaseModel):
    section: str
    original: str
    improved: str
    why_it_is_better: str


class AIResumeEnhanceResponse(BaseModel):
    target_role: str
    experience_level: str
    role_type: str
    provider_used: str
    fallback_used: bool
    enhanced_summary: str
    enhanced_skills: list[str]
    enhanced_bullets: list[EnhancedResumeBullet]
    section_suggestions: list[EnhancedResumeSection]
    final_notes: list[str]


class ResumeProfile(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    location: str | None = None
    linkedin: str | None = None
    github: str | None = None


class AIFullResumeGenerateRequest(BaseModel):
    target_role: str
    experience_level: str = "new_grad"
    role_type: str = "software_engineer"
    template_id: str = "ats_simple"
    design_style: str = "ats_simple"

    profile: ResumeProfile
    summary_notes: str | None = None
    skills: list[str] = []
    education: list[EducationItem] = []
    experience: list[ExperienceItem] = []
    projects: list[ProjectItem] = []


class AIFullResumeGenerateResponse(BaseModel):
    target_role: str
    experience_level: str
    role_type: str
    template_id: str
    design_style: str
    provider_used: str
    fallback_used: bool
    resume_markdown: str
    generated_summary: str
    generated_skills: list[str]
    suggestions: list[str]
    final_warning: str


class ResumePreviewRequest(BaseModel):
    resume_markdown: str
    design_style: str = "ats_simple"


class ResumePreviewResponse(BaseModel):
    design_style: str
    resume_markdown: str
    resume_html: str
    preview_notes: list[str]


class ResumeFromUploadRequest(BaseModel):
    resume_id: int
    template_id: str = "ats_simple"
    experience_level: str = "new_grad"
    role_type: str = "software_engineer"
    design_style: str = "ats_simple"


class ResumeFromUploadResponse(BaseModel):
    resume_id: int
    template_id: str
    experience_level: str
    role_type: str
    design_style: str
    provider_used: str
    fallback_used: bool
    resume_markdown: str
    resume_html: str
    suggestions: list[str]


class ResumeExportRequest(BaseModel):
    filename: str
    resume_markdown: str


class ResumeExportResponse(BaseModel):
    filename: str
    file_path: str
    message: str

class ResumePDFExportRequest(BaseModel):
    filename: str
    resume_html: str
