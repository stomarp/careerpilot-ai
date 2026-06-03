from pydantic import BaseModel


class JobDescriptionCreate(BaseModel):
    title: str
    company: str | None = None
    description: str


class JobDescriptionResponse(BaseModel):
    job_id: int
    title: str
    company: str | None
    status: str
