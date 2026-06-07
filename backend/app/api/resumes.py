from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.auth_dependencies import get_current_user
from app.core.database import get_db
from app.models.resume import Resume
from app.models.user import User
from app.schemas.resume import ResumeResponse, ResumeUploadResponse
from app.services.resume_parser import extract_resume_text

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)

UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed_extensions = {".pdf", ".docx"}
    original_filename = file.filename or "resume"
    extension = Path(original_filename).suffix.lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX resumes are supported.",
        )

    stored_filename = f"{uuid4()}{extension}"
    file_path = UPLOAD_DIR / stored_filename

    file_content = await file.read()

    with open(file_path, "wb") as buffer:
        buffer.write(file_content)

    try:
        parsed_text = extract_resume_text(str(file_path))
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not parse resume: {str(exc)}",
        ) from exc

    resume = Resume(
        user_id=current_user.id,
        filename=original_filename,
        parsed_text=parsed_text,
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeUploadResponse(
        resume_id=resume.id,
        filename=resume.filename,
        status="uploaded",
        parsed_text_preview=parsed_text[:500],
    )


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found.",
        )

    return ResumeResponse(
        resume_id=resume.id,
        filename=resume.filename,
        parsed_text=resume.parsed_text,
        created_at=resume.created_at,
    )
