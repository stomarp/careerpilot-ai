from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.analysis_report import AnalysisReport
from app.models.application import Application
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.user import User
from app.schemas.analysis_report import (
    AnalysisReportCreate,
    AnalysisReportDashboardStats,
    AnalysisReportResponse,
    AnalysisReportTypeOption,
)

router = APIRouter(
    prefix="/analysis-reports",
    tags=["Analysis Reports"],
)


VALID_REPORT_TYPES = {
    "ats_score",
    "resume_score",
    "resume_optimizer",
    "ai_resume_optimizer",
}


def get_demo_user_id(db: Session) -> int:
    user = db.query(User).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="No user exists. Please create a demo user first.",
        )

    return user.id


def validate_references(
    db: Session,
    application_id: int | None,
    resume_id: int | None,
    job_description_id: int | None,
) -> None:
    if application_id:
        application = (
            db.query(Application)
            .filter(Application.id == application_id)
            .first()
        )
        if not application:
            raise HTTPException(status_code=404, detail="Application not found.")

    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")

    if job_description_id:
        job_description = (
            db.query(JobDescription)
            .filter(JobDescription.id == job_description_id)
            .first()
        )
        if not job_description:
            raise HTTPException(status_code=404, detail="Job description not found.")


@router.get("/type-options", response_model=list[AnalysisReportTypeOption])
def get_analysis_report_type_options():
    return [
        {"value": "ats_score", "label": "ATS Score"},
        {"value": "resume_score", "label": "General Resume Score"},
        {"value": "resume_optimizer", "label": "Rule-Based Resume Optimizer"},
        {"value": "ai_resume_optimizer", "label": "AI Resume Optimizer"},
    ]


@router.post("", response_model=AnalysisReportResponse)
def create_analysis_report(
    request: AnalysisReportCreate,
    db: Session = Depends(get_db),
):
    if request.report_type not in VALID_REPORT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid report_type: {request.report_type}",
        )

    user_id = get_demo_user_id(db)

    validate_references(
        db=db,
        application_id=request.application_id,
        resume_id=request.resume_id,
        job_description_id=request.job_description_id,
    )

    report = AnalysisReport(
        user_id=user_id,
        application_id=request.application_id,
        resume_id=request.resume_id,
        job_description_id=request.job_description_id,
        report_type=request.report_type,
        industry=request.industry,
        ats_score=request.ats_score,
        provider_used=request.provider_used,
        fallback_used=request.fallback_used,
        title=request.title,
        summary=request.summary,
        matching_skills=request.matching_skills,
        missing_skills=request.missing_skills,
        matched_keywords=request.matched_keywords,
        missing_keywords=request.missing_keywords,
        recommendations=request.recommendations,
        section_feedback=request.section_feedback,
        improved_bullets=request.improved_bullets,
        project_enhancements=request.project_enhancements,
        certifications_or_learning=request.certifications_or_learning,
        raw_report_json=request.raw_report_json,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


@router.get("", response_model=list[AnalysisReportResponse])
def list_analysis_reports(
    application_id: int | None = None,
    resume_id: int | None = None,
    job_description_id: int | None = None,
    report_type: str | None = None,
    min_score: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(AnalysisReport)

    if application_id:
        query = query.filter(AnalysisReport.application_id == application_id)

    if resume_id:
        query = query.filter(AnalysisReport.resume_id == resume_id)

    if job_description_id:
        query = query.filter(AnalysisReport.job_description_id == job_description_id)

    if report_type:
        query = query.filter(AnalysisReport.report_type == report_type)

    if min_score is not None:
        query = query.filter(AnalysisReport.ats_score >= min_score)

    return query.order_by(AnalysisReport.created_at.desc()).all()


@router.get("/dashboard", response_model=AnalysisReportDashboardStats)
def get_analysis_report_dashboard(
    db: Session = Depends(get_db),
):
    total_reports = db.query(AnalysisReport).count()

    ats_reports = (
        db.query(AnalysisReport)
        .filter(AnalysisReport.report_type.in_(["ats_score", "resume_score"]))
        .count()
    )

    ai_optimizer_reports = (
        db.query(AnalysisReport)
        .filter(AnalysisReport.report_type == "ai_resume_optimizer")
        .count()
    )

    avg_score = db.query(func.avg(AnalysisReport.ats_score)).scalar()
    highest_score = db.query(func.max(AnalysisReport.ats_score)).scalar()
    lowest_score = db.query(func.min(AnalysisReport.ats_score)).scalar()

    return AnalysisReportDashboardStats(
        total_reports=total_reports,
        ats_reports=ats_reports,
        ai_optimizer_reports=ai_optimizer_reports,
        average_ats_score=round(float(avg_score), 2) if avg_score is not None else None,
        highest_ats_score=highest_score,
        lowest_ats_score=lowest_score,
    )


@router.get("/application/{application_id}", response_model=list[AnalysisReportResponse])
def get_reports_for_application(
    application_id: int,
    db: Session = Depends(get_db),
):
    application = (
        db.query(Application)
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    return (
        db.query(AnalysisReport)
        .filter(AnalysisReport.application_id == application_id)
        .order_by(AnalysisReport.created_at.desc())
        .all()
    )


@router.get("/{report_id}", response_model=AnalysisReportResponse)
def get_analysis_report(
    report_id: int,
    db: Session = Depends(get_db),
):
    report = (
        db.query(AnalysisReport)
        .filter(AnalysisReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found.")

    return report


@router.delete("/{report_id}")
def delete_analysis_report(
    report_id: int,
    db: Session = Depends(get_db),
):
    report = (
        db.query(AnalysisReport)
        .filter(AnalysisReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found.")

    db.delete(report)
    db.commit()

    return {
        "message": "Analysis report deleted successfully.",
        "report_id": report_id,
    }
