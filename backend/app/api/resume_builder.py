from fastapi import APIRouter

from app.schemas.resume_builder import (
    ResumeCreateRequest,
    ResumeCreateResponse,
    ResumeSuggestionRequest,
    ResumeSuggestionResponse,
    ResumeTemplate,
)
from app.services.resume_builder import (
    build_resume_markdown,
    generate_resume_suggestions,
    generate_template_suggestions,
)
from app.services.resume_templates import get_templates

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
