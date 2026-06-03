from datetime import datetime

from pydantic import BaseModel


class ResumeUploadResponse(BaseModel):
    resume_id: int
    filename: str
    status: str
    parsed_text_preview: str


class ResumeResponse(BaseModel):
    resume_id: int
    filename: str
    parsed_text: str | None
    created_at: datetime
