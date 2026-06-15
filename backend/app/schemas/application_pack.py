from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ApplicationPackCreate(BaseModel):
    job_id: int | None = None
    resume_id: int | None = None
    title: str = Field(..., min_length=1, max_length=255)
    company: str | None = None
    role_title: str = Field(..., min_length=1, max_length=255)
    pack_type: str = "full_pack"
    ats_score: int | None = None
    decision: str | None = None
    summary: str | None = None
    content_markdown: str = Field(..., min_length=1)
    artifacts: dict[str, Any] | None = None


class ApplicationPackUpdate(BaseModel):
    title: str | None = None
    company: str | None = None
    role_title: str | None = None
    pack_type: str | None = None
    ats_score: int | None = None
    decision: str | None = None
    summary: str | None = None
    content_markdown: str | None = None
    artifacts: dict[str, Any] | None = None


class ApplicationPackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int | None
    resume_id: int | None
    title: str
    company: str | None
    role_title: str
    pack_type: str
    ats_score: int | None
    decision: str | None
    summary: str | None
    content_markdown: str
    artifacts: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime
