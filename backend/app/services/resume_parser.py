from pathlib import Path

import fitz
from docx import Document


def extract_text_from_pdf(file_path: str) -> str:
    text = ""

    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()

    return text.strip()


def extract_text_from_docx(file_path: str) -> str:
    document = Document(file_path)

    paragraphs = [
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    return "\n".join(paragraphs).strip()


def extract_resume_text(file_path: str) -> str:
    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)

    if extension == ".docx":
        return extract_text_from_docx(file_path)

    raise ValueError("Unsupported file type. Only PDF and DOCX files are supported.")
