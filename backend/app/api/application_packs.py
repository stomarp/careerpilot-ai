from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth_dependencies import get_current_user
from app.core.database import get_db
from app.models.application_pack import ApplicationPack
from app.models.user import User
from app.schemas.application_pack import (
    ApplicationPackCreate,
    ApplicationPackResponse,
    ApplicationPackUpdate,
)

router = APIRouter(
    prefix="/application-packs",
    tags=["Application Packs"],
)


@router.post("", response_model=ApplicationPackResponse)
def create_application_pack(
    pack_data: ApplicationPackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pack = ApplicationPack(
        user_id=current_user.id,
        job_id=pack_data.job_id,
        resume_id=pack_data.resume_id,
        title=pack_data.title,
        company=pack_data.company,
        role_title=pack_data.role_title,
        pack_type=pack_data.pack_type,
        ats_score=pack_data.ats_score,
        decision=pack_data.decision,
        summary=pack_data.summary,
        content_markdown=pack_data.content_markdown,
        artifacts=pack_data.artifacts or {},
    )

    db.add(pack)
    db.commit()
    db.refresh(pack)

    return pack


@router.get("", response_model=list[ApplicationPackResponse])
def list_application_packs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ApplicationPack)
        .filter(ApplicationPack.user_id == current_user.id)
        .order_by(ApplicationPack.created_at.desc())
        .all()
    )


@router.get("/{pack_id}", response_model=ApplicationPackResponse)
def get_application_pack(
    pack_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pack = (
        db.query(ApplicationPack)
        .filter(
            ApplicationPack.id == pack_id,
            ApplicationPack.user_id == current_user.id,
        )
        .first()
    )

    if not pack:
        raise HTTPException(status_code=404, detail="Application pack not found.")

    return pack


@router.patch("/{pack_id}", response_model=ApplicationPackResponse)
def update_application_pack(
    pack_id: int,
    pack_data: ApplicationPackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pack = (
        db.query(ApplicationPack)
        .filter(
            ApplicationPack.id == pack_id,
            ApplicationPack.user_id == current_user.id,
        )
        .first()
    )

    if not pack:
        raise HTTPException(status_code=404, detail="Application pack not found.")

    for field, value in pack_data.model_dump(exclude_unset=True).items():
        setattr(pack, field, value)

    db.commit()
    db.refresh(pack)

    return pack


@router.delete("/{pack_id}")
def delete_application_pack(
    pack_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pack = (
        db.query(ApplicationPack)
        .filter(
            ApplicationPack.id == pack_id,
            ApplicationPack.user_id == current_user.id,
        )
        .first()
    )

    if not pack:
        raise HTTPException(status_code=404, detail="Application pack not found.")

    db.delete(pack)
    db.commit()

    return {"status": "deleted", "pack_id": pack_id}
