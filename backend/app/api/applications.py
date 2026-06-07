from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth_dependencies import get_current_user
from app.core.database import get_db
from app.models.application import Application
from app.models.job_description import JobDescription
from app.models.resume import Resume
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationDashboardStats,
    ApplicationResponse,
    ApplicationStatusOption,
    ApplicationUpdate,
    VALID_EMPLOYMENT_TYPES,
    VALID_PRIORITIES,
    VALID_STATUSES,
    VALID_WORK_TYPES,
)

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


def validate_application_payload(payload: ApplicationCreate | ApplicationUpdate) -> None:
    if payload.status and payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status: {payload.status}")

    if payload.priority and payload.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=400, detail=f"Invalid priority: {payload.priority}")

    if payload.work_type and payload.work_type not in VALID_WORK_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid work_type: {payload.work_type}")

    if payload.employment_type and payload.employment_type not in VALID_EMPLOYMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid employment_type: {payload.employment_type}",
        )


def validate_resume_and_job_refs(
    db: Session,
    current_user: User,
    resume_id: int | None,
    job_description_id: int | None,
) -> None:
    if resume_id:
        resume = (
            db.query(Resume)
            .filter(
                Resume.id == resume_id,
                Resume.user_id == current_user.id,
            )
            .first()
        )
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found.")

    if job_description_id:
        job_description = (
            db.query(JobDescription)
            .filter(
                JobDescription.id == job_description_id,
                JobDescription.user_id == current_user.id,
            )
            .first()
        )
        if not job_description:
            raise HTTPException(status_code=404, detail="Job description not found.")


@router.get("/status-options", response_model=list[ApplicationStatusOption])
def get_application_status_options():
    return [
        {"value": "saved", "label": "Saved"},
        {"value": "applied", "label": "Applied"},
        {"value": "oa_received", "label": "OA Received"},
        {"value": "oa_completed", "label": "OA Completed"},
        {"value": "phone_screen", "label": "Phone Screen"},
        {"value": "interviewing", "label": "Interviewing"},
        {"value": "final_round", "label": "Final Round"},
        {"value": "offer", "label": "Offer"},
        {"value": "rejected", "label": "Rejected"},
        {"value": "withdrawn", "label": "Withdrawn"},
        {"value": "ghosted", "label": "Ghosted"},
    ]


@router.post("", response_model=ApplicationResponse)
def create_application(
    request: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_application_payload(request)

    validate_resume_and_job_refs(
        db=db,
        current_user=current_user,
        resume_id=request.resume_id,
        job_description_id=request.job_description_id,
    )

    application = Application(
        user_id=current_user.id,
        company_name=request.company_name,
        role_title=request.role_title,
        job_url=request.job_url,
        job_location=request.job_location,
        status=request.status,
        priority=request.priority,
        source=request.source,
        work_type=request.work_type,
        employment_type=request.employment_type,
        salary_min=request.salary_min,
        salary_max=request.salary_max,
        salary_currency=request.salary_currency,
        resume_id=request.resume_id,
        job_description_id=request.job_description_id,
        ats_score=request.ats_score,
        match_score=request.match_score,
        recruiter_name=request.recruiter_name,
        recruiter_email=request.recruiter_email,
        contact_person=request.contact_person,
        saved_date=request.saved_date,
        applied_date=request.applied_date,
        oa_date=request.oa_date,
        interview_date=request.interview_date,
        follow_up_date=request.follow_up_date,
        decision_date=request.decision_date,
        notes=request.notes,
        next_action=request.next_action,
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application


@router.get("", response_model=list[ApplicationResponse])
def list_applications(
    status: str | None = None,
    priority: str | None = None,
    company: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Application).filter(Application.user_id == current_user.id)

    if status:
        query = query.filter(Application.status == status)

    if priority:
        query = query.filter(Application.priority == priority)

    if company:
        query = query.filter(Application.company_name.ilike(f"%{company}%"))

    if search:
        query = query.filter(
            Application.company_name.ilike(f"%{search}%")
            | Application.role_title.ilike(f"%{search}%")
            | Application.notes.ilike(f"%{search}%")
        )

    return query.order_by(Application.created_at.desc()).all()


@router.get("/dashboard", response_model=ApplicationDashboardStats)
def get_application_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    applications = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .all()
    )

    total = len(applications)

    def count_status(statuses: set[str]) -> int:
        return len([app for app in applications if app.status in statuses])

    followups = len(
        [
            app
            for app in applications
            if app.follow_up_date and app.follow_up_date >= date.today()
        ]
    )

    avg_score = (
        db.query(func.avg(Application.ats_score))
        .filter(Application.user_id == current_user.id)
        .scalar()
    )

    return ApplicationDashboardStats(
        total_applications=total,
        saved=count_status({"saved"}),
        applied=count_status({"applied", "oa_received", "oa_completed"}),
        interviewing=count_status({"phone_screen", "interviewing", "final_round"}),
        offers=count_status({"offer"}),
        rejected=count_status({"rejected"}),
        upcoming_followups=followups,
        average_ats_score=round(float(avg_score), 2) if avg_score is not None else None,
    )


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    return application


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    request: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    validate_application_payload(request)

    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    update_data = request.model_dump(exclude_unset=True)

    validate_resume_and_job_refs(
        db=db,
        current_user=current_user,
        resume_id=update_data.get("resume_id"),
        job_description_id=update_data.get("job_description_id"),
    )

    for field, value in update_data.items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)

    return application


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = (
        db.query(Application)
        .filter(
            Application.id == application_id,
            Application.user_id == current_user.id,
        )
        .first()
    )

    if not application:
        raise HTTPException(status_code=404, detail="Application not found.")

    db.delete(application)
    db.commit()

    return {
        "message": "Application deleted successfully.",
        "application_id": application_id,
    }
