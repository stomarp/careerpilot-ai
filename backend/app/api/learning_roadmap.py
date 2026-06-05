from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis_report import AnalysisReport
from app.models.application import Application
from app.schemas.learning_roadmap import (
    LearningRoadmapRequest,
    LearningRoadmapResponse,
)
from app.services.learning_roadmap_generator import (
    build_context_text,
    generate_learning_roadmap_with_ai,
    get_missing_items_from_report,
    normalize_missing_items,
)

router = APIRouter(
    prefix="/learning-roadmap",
    tags=["Learning Roadmap"],
)


@router.post("", response_model=LearningRoadmapResponse)
def generate_learning_roadmap(
    request: LearningRoadmapRequest,
    db: Session = Depends(get_db),
):
    application = None
    analysis_report = None

    if request.application_id:
        application = (
            db.query(Application)
            .filter(Application.id == request.application_id)
            .first()
        )

        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")

    if request.analysis_report_id:
        analysis_report = (
            db.query(AnalysisReport)
            .filter(AnalysisReport.id == request.analysis_report_id)
            .first()
        )

        if not analysis_report:
            raise HTTPException(status_code=404, detail="Analysis report not found.")

    missing_items = normalize_missing_items(
        role_type=request.role_type,
        missing_items=get_missing_items_from_report(analysis_report),
    )

    context_text = build_context_text(
        application=application,
        analysis_report=analysis_report,
    )

    result = generate_learning_roadmap_with_ai(
        target_role=request.target_role,
        role_type=request.role_type,
        industry=request.industry,
        experience_level=request.experience_level,
        timeline_days=request.timeline_days,
        missing_items=missing_items,
        context_text=context_text,
    )

    return LearningRoadmapResponse(
        target_role=request.target_role,
        role_type=request.role_type,
        industry=request.industry,
        experience_level=request.experience_level,
        timeline_days=request.timeline_days,
        provider_used=result["provider_used"],
        fallback_used=result["fallback_used"],
        overview=result["overview"],
        skill_gap_summary=result["skill_gap_summary"],
        priority_skills=result["priority_skills"],
        weekly_plan=result["weekly_plan"],
        roadmap=result["roadmap"],
        mini_projects=result["mini_projects"],
        resume_actions=result["resume_actions"],
        interview_prep_actions=result["interview_prep_actions"],
        study_topics=result["study_topics"],
        progress_checkpoints=result["progress_checkpoints"],
        final_advice=result["final_advice"],
    )
