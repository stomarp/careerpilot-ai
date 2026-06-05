from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis_report import AnalysisReport
from app.models.application import Application
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.schemas.interview import (
    InterviewQuestionRequest,
    InterviewQuestionResponse,
)
from app.services.interview_question_generator import (
    build_context_text,
    generate_interview_questions_with_ai,
)

router = APIRouter(
    prefix="/interview",
    tags=["Interview"],
)


@router.post("/questions", response_model=InterviewQuestionResponse)
def generate_interview_questions(
    request: InterviewQuestionRequest,
    db: Session = Depends(get_db),
):
    application = None
    analysis_report = None
    resume = None
    job_description = None

    if request.application_id:
        application = (
            db.query(Application)
            .filter(Application.id == request.application_id)
            .first()
        )

        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")

        if application.resume_id and not request.resume_id:
            resume = db.query(Resume).filter(Resume.id == application.resume_id).first()

        if application.job_description_id and not request.job_description_id:
            job_description = (
                db.query(JobDescription)
                .filter(JobDescription.id == application.job_description_id)
                .first()
            )

    if request.analysis_report_id:
        analysis_report = (
            db.query(AnalysisReport)
            .filter(AnalysisReport.id == request.analysis_report_id)
            .first()
        )

        if not analysis_report:
            raise HTTPException(status_code=404, detail="Analysis report not found.")

        if analysis_report.resume_id and not resume:
            resume = (
                db.query(Resume)
                .filter(Resume.id == analysis_report.resume_id)
                .first()
            )

        if analysis_report.job_description_id and not job_description:
            job_description = (
                db.query(JobDescription)
                .filter(JobDescription.id == analysis_report.job_description_id)
                .first()
            )

    if request.resume_id:
        resume = db.query(Resume).filter(Resume.id == request.resume_id).first()

        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")

    if request.job_description_id:
        job_description = (
            db.query(JobDescription)
            .filter(JobDescription.id == request.job_description_id)
            .first()
        )

        if not job_description:
            raise HTTPException(status_code=404, detail="Job description not found.")

    context_text = build_context_text(
        application=application,
        analysis_report=analysis_report,
        resume=resume,
        job_description=job_description,
    )

    result = generate_interview_questions_with_ai(
        target_role=request.target_role,
        role_type=request.role_type,
        industry=request.industry,
        experience_level=request.experience_level,
        question_count=request.question_count,
        context_text=context_text,
    )

    return InterviewQuestionResponse(
        target_role=request.target_role,
        role_type=request.role_type,
        industry=request.industry,
        experience_level=request.experience_level,
        provider_used=result["provider_used"],
        fallback_used=result["fallback_used"],
        question_sets=result["question_sets"],
        preparation_tips=result["preparation_tips"],
        focus_areas=result["focus_areas"],
    )
