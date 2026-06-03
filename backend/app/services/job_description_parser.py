from app.services.resume_parser import extract_resume_text


def extract_job_description_text(file_path: str) -> str:
    return extract_resume_text(file_path)
