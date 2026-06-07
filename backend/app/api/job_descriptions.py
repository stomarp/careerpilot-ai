from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.auth_dependencies import get_current_user
from app.core.database import get_db
from app.models.job_description import JobDescription
from app.models.user import User
from app.schemas.job_description import (
    JobDescriptionCreate,
    JobDescriptionDetailResponse,
    JobDescriptionResponse,
)
from app.services.job_description_parser import extract_job_description_text

router = APIRouter(
    prefix="/jobs",
    tags=["Job Descriptions"],
)

UPLOAD_DIR = Path("uploads/job_descriptions")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("", response_model=JobDescriptionResponse)
def create_job_description(
    job_data: JobDescriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not job_data.description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description cannot be empty.",
        )

    job_description = JobDescription(
        user_id=current_user.id,
        title=job_data.title,
        company=job_data.company,
        description=job_data.description,
    )

    db.add(job_description)
    db.commit()
    db.refresh(job_description)

    return JobDescriptionResponse(
        job_id=job_description.id,
        title=job_description.title,
        company=job_description.company,
        status="created",
    )


@router.post("/upload", response_model=JobDescriptionResponse)
async def upload_job_description(
    file: UploadFile = File(...),
    title: str = "Uploaded Job Description",
    company: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed_extensions = {".pdf", ".docx", ".txt"}
    original_filename = file.filename or "job_description"
    extension = Path(original_filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, and TXT job descriptions are supported.",
        )

    stored_filename = f"{uuid4()}{extension}"
    file_path = UPLOAD_DIR / stored_filename

    file_content = await file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    try:
        if extension == ".txt":
            parsed_text = file_path.read_text(encoding="utf-8")
        else:
            parsed_text = extract_job_description_text(str(file_path))
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not parse job description: {str(exc)}",
        ) from exc

    job_description = JobDescription(
        user_id=current_user.id,
        title=title,
        company=company,
        description=parsed_text,
    )

    db.add(job_description)
    db.commit()
    db.refresh(job_description)

    return JobDescriptionResponse(
        job_id=job_description.id,
        title=job_description.title,
        company=job_description.company,
        status="uploaded",
    )


@router.get("/{job_id}", response_model=JobDescriptionDetailResponse)
def get_job_description(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job_description = (
        db.query(JobDescription)
        .filter(
            JobDescription.id == job_id,
            JobDescription.user_id == current_user.id,
        )
        .first()
    )

    if not job_description:
        raise HTTPException(
            status_code=404,
            detail="Job description not found.",
        )

    return JobDescriptionDetailResponse(
        job_id=job_description.id,
        title=job_description.title,
        company=job_description.company,
        description=job_description.description,
        created_at=job_description.created_at,
    )
