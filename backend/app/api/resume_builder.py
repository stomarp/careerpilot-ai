from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.resume import Resume
from app.schemas.resume_builder import (
    AIFullResumeGenerateRequest,
    AIFullResumeGenerateResponse,
    AIResumeEnhanceRequest,
    AIResumeEnhanceResponse,
    ResumeCreateRequest,
    ResumeCreateResponse,
    ResumeFromUploadRequest,
    ResumeFromUploadResponse,
    ResumePreviewRequest,
    ResumePreviewResponse,
    ResumeSuggestionRequest,
    ResumeSuggestionResponse,
    ResumeTemplate,
)
from app.services.ai_full_resume_generator import generate_full_resume_with_ai
from app.services.ai_resume_builder import enhance_resume_with_ai
from app.services.resume_builder import (
    build_resume_markdown,
    generate_resume_suggestions,
    generate_template_suggestions,
)
from app.services.resume_html_preview import build_resume_html
from app.services.resume_templates import get_templates
from app.services.resume_upload_to_builder import build_resume_from_uploaded_text

router = APIRouter(
    prefix="/resume-builder",
    tags=["Resume Builder"],
)


@router.get("/templates", response_model=list[ResumeTemplate])
def list_resume_templates():
    return get_templates()


@router.post("/create", response_model=ResumeCreateResponse)
def create_resume(
    request: ResumeCreateRequest,
):
    result = build_resume_markdown(request)
    suggestions = generate_resume_suggestions(request)

    return ResumeCreateResponse(
        template_id=request.template_id,
        experience_level=request.experience_level,
        role_type=request.role_type,
        design_style=request.design_style,
        section_order=result["section_order"],
        resume_markdown=result["resume_markdown"],
        suggestions=suggestions,
    )


@router.post("/suggestions", response_model=ResumeSuggestionResponse)
def get_resume_builder_suggestions(
    request: ResumeSuggestionRequest,
):
    result = generate_template_suggestions(
        target_role=request.target_role,
        industry=request.industry,
        experience_level=request.experience_level,
        role_type=request.role_type,
        design_style=request.design_style,
    )

    return ResumeSuggestionResponse(
        recommended_template=result["recommended_template"],
        experience_level=result["experience_level"],
        role_type=result["role_type"],
        design_style=result["design_style"],
        suggested_sections=result["suggested_sections"],
        suggested_keywords=result["suggested_keywords"],
        design_guidance=result["design_guidance"],
        suggestions=result["suggestions"],
    )


@router.post("/ai-enhance", response_model=AIResumeEnhanceResponse)
def ai_enhance_resume(
    request: AIResumeEnhanceRequest,
):
    result = enhance_resume_with_ai(
        target_role=request.target_role,
        experience_level=request.experience_level,
        role_type=request.role_type,
        rough_summary=request.rough_summary,
        rough_skills=request.rough_skills,
        rough_experience=request.rough_experience,
        rough_projects=request.rough_projects,
    )

    return AIResumeEnhanceResponse(
        target_role=request.target_role,
        experience_level=request.experience_level,
        role_type=request.role_type,
        provider_used=result["provider_used"],
        fallback_used=result["fallback_used"],
        enhanced_summary=result["enhanced_summary"],
        enhanced_skills=result["enhanced_skills"],
        enhanced_bullets=result["enhanced_bullets"],
        section_suggestions=result["section_suggestions"],
        final_notes=result["final_notes"],
    )


@router.post("/ai-generate", response_model=AIFullResumeGenerateResponse)
def ai_generate_resume(
    request: AIFullResumeGenerateRequest,
):
    result = generate_full_resume_with_ai(request)

    return AIFullResumeGenerateResponse(
        target_role=request.target_role,
        experience_level=request.experience_level,
        role_type=request.role_type,
        template_id=request.template_id,
        design_style=request.design_style,
        provider_used=result["provider_used"],
        fallback_used=result["fallback_used"],
        resume_markdown=result["resume_markdown"],
        generated_summary=result["generated_summary"],
        generated_skills=result["generated_skills"],
        suggestions=result["suggestions"],
        final_warning=result["final_warning"],
    )


@router.post("/preview", response_model=ResumePreviewResponse)
def preview_resume(
    request: ResumePreviewRequest,
):
    result = build_resume_html(
        resume_markdown=request.resume_markdown,
        design_style=request.design_style,
    )

    return ResumePreviewResponse(
        design_style=request.design_style,
        resume_markdown=request.resume_markdown,
        resume_html=result["resume_html"],
        preview_notes=result["preview_notes"],
    )


@router.post("/from-uploaded-resume", response_model=ResumeFromUploadResponse)
def build_from_uploaded_resume(
    request: ResumeFromUploadRequest,
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if not resume.parsed_text:
        raise HTTPException(
            status_code=400,
            detail="Uploaded resume does not have parsed text.",
        )

    result = build_resume_from_uploaded_text(
        parsed_text=resume.parsed_text,
        template_id=request.template_id,
        experience_level=request.experience_level,
        role_type=request.role_type,
        design_style=request.design_style,
    )

    return ResumeFromUploadResponse(
        resume_id=resume.id,
        template_id=request.template_id,
        experience_level=request.experience_level,
        role_type=request.role_type,
        design_style=request.design_style,
        provider_used=result["provider_used"],
        fallback_used=result["fallback_used"],
        resume_markdown=result["resume_markdown"],
        resume_html=result["resume_html"],
        suggestions=result["suggestions"],
    )
