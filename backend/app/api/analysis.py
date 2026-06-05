from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.advanced_ats import AdvancedATSRequest, AdvancedATSResponse
from app.services.advanced_ats_analyzer import analyze_advanced_ats

from app.core.database import get_db
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.schemas.analysis import (
    AIResumeOptimizerResponse,
    ATSScoreRequest,
    ATSScoreResponse,
    ResumeATSRequest,
    ResumeATSResponse,
    ResumeOptimizerRequest,
    ResumeOptimizerResponse,
)
from app.services.ai_resume_optimizer import optimize_resume_with_ai
from app.services.ats_scoring import calculate_ats_score
from app.services.resume_ats_checker import calculate_general_resume_ats_score
from app.services.resume_optimizer import optimize_resume_for_job

router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)


@router.post("/ats-score", response_model=ATSScoreResponse)
def generate_ats_score(
    request: ATSScoreRequest,
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    job_description = (
        db.query(JobDescription)
        .filter(JobDescription.id == request.job_id)
        .first()
    )

    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found.")

    result = calculate_ats_score(
        resume_text=resume.parsed_text or "",
        job_description_text=job_description.description or "",
        industry=request.industry,
    )

    return ATSScoreResponse(
        resume_id=resume.id,
        job_id=job_description.id,
        industry=request.industry,
        ats_score=result["ats_score"],
        breakdown=result["breakdown"],
        matching_skills=result["matching_skills"],
        missing_skills=result["missing_skills"],
        matched_keywords=result["matched_keywords"],
        missing_keywords=result["missing_keywords"],
        recommendations=result["recommendations"],
    )


@router.post("/resume-score", response_model=ResumeATSResponse)
def generate_resume_ats_score(
    request: ResumeATSRequest,
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    result = calculate_general_resume_ats_score(
        resume_text=resume.parsed_text or "",
        industry=request.industry,
    )

    return ResumeATSResponse(
        resume_id=resume.id,
        industry=request.industry,
        ats_score=result["ats_score"],
        breakdown=result["breakdown"],
        strengths=result["strengths"],
        issues=result["issues"],
        recommendations=result["recommendations"],
    )


@router.post("/resume-optimizer", response_model=ResumeOptimizerResponse)
def generate_resume_optimizer(
    request: ResumeOptimizerRequest,
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    job_description = (
        db.query(JobDescription)
        .filter(JobDescription.id == request.job_id)
        .first()
    )

    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found.")

    result = optimize_resume_for_job(
        resume_text=resume.parsed_text or "",
        job_description_text=job_description.description or "",
        industry=request.industry,
    )

    return ResumeOptimizerResponse(
        resume_id=resume.id,
        job_id=job_description.id,
        industry=request.industry,
        overall_strategy=result["overall_strategy"],
        section_suggestions=result["section_suggestions"],
        suggested_bullets=result["suggested_bullets"],
        project_enhancements=result["project_enhancements"],
        skills_to_learn=result["skills_to_learn"],
        truthfulness_warning=result["truthfulness_warning"],
    )


@router.post("/ai-resume-optimizer", response_model=AIResumeOptimizerResponse)
def generate_ai_resume_optimizer(
    request: ResumeOptimizerRequest,
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    job_description = (
        db.query(JobDescription)
        .filter(JobDescription.id == request.job_id)
        .first()
    )

    if not job_description:
        raise HTTPException(status_code=404, detail="Job description not found.")

    result = optimize_resume_with_ai(
        resume_text=resume.parsed_text or "",
        job_description_text=job_description.description or "",
        industry=request.industry,
    )

    return AIResumeOptimizerResponse(
        resume_id=resume.id,
        job_id=job_description.id,
        industry=request.industry,
        ats_score=result["ats_score"],
        provider_used=result["provider_used"],
        fallback_used=result["fallback_used"],
        ai_overall_feedback=result["ai_overall_feedback"],
        section_feedback=result["section_feedback"],
        improved_bullets=result["improved_bullets"],
        missing_keywords_to_add_truthfully=result[
            "missing_keywords_to_add_truthfully"
        ],
        project_enhancements=result["project_enhancements"],
        certifications_or_learning=result["certifications_or_learning"],
        final_warning=result["final_warning"],
    )

@router.post("/advanced-ats-score", response_model=AdvancedATSResponse)
def generate_advanced_ats_score(
    request: AdvancedATSRequest,
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job description not found.")

    if not resume.parsed_text:
        raise HTTPException(
            status_code=400,
            detail="Resume does not have parsed text.",
        )

    if not job.description:
        raise HTTPException(
            status_code=400,
            detail="Job description does not have parsed text.",
        )

    result = analyze_advanced_ats(
        resume_text=resume.parsed_text,
        job_text=job.description,
        industry=request.industry,
        role_type=request.role_type,
    )

    return AdvancedATSResponse(
        resume_id=request.resume_id,
        job_id=request.job_id,
        industry=request.industry,
        role_type=request.role_type,
        overall_score=result["overall_score"],
        score_breakdown=result["score_breakdown"],
        keyword_analysis=result["keyword_analysis"],
        skills_analysis=result["skills_analysis"],
        formatting_checks=result["formatting_checks"],
        section_feedback=result["section_feedback"],
        recommendations=result["recommendations"],
    )