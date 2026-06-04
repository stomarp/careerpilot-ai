import json

from google import genai

from app.core.config import settings
from app.schemas.resume_builder import (
    EducationItem,
    ExperienceItem,
    ProjectItem,
    ResumeCreateRequest,
)
from app.services.resume_builder import (
    build_resume_markdown,
    generate_resume_suggestions,
)
from app.services.resume_html_preview import build_resume_html


MONTH_KEYWORDS = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "sept",
    "oct",
    "nov",
    "dec",
]


def clean_json_response(raw_text: str) -> str:
    cleaned = raw_text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned.replace("```json", "", 1).strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```", "", 1).strip()

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    return cleaned


def safe_json_loads(raw_text: str) -> dict:
    cleaned = clean_json_response(raw_text)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"AI section extraction response was not valid JSON: {cleaned[:500]}"
        ) from exc


def has_date(text: str) -> bool:
    lower_text = text.lower()
    return any(month in lower_text for month in MONTH_KEYWORDS) or any(
        char.isdigit() for char in text
    )


def split_skills(skills_text: str | list[str]) -> list[str]:
    if isinstance(skills_text, list):
        return [skill.strip() for skill in skills_text if skill.strip()]

    if not skills_text:
        return []

    normalized = skills_text.replace("\n", ",")
    return [skill.strip() for skill in normalized.split(",") if skill.strip()]


def extract_resume_sections_with_ai(parsed_text: str) -> dict:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is missing.")

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    prompt = f"""
You are a resume parsing assistant.

Convert the parsed resume text into structured resume sections.

Important rules:
- Do NOT invent experience, dates, companies, schools, projects, skills, or metrics.
- Preserve dates exactly as written.
- Preserve company names, school names, project names, and titles exactly as written.
- Clean formatting but do not change facts.
- If a section is missing, return an empty list or empty string.
- Return ONLY valid JSON.
- Do not include markdown fences.

Parsed resume text:
{parsed_text[:10000]}

Return JSON with this exact structure:
{{
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string",
  "github": "string",
  "summary": "string",
  "skills": ["string"],
  "education": [
    {{
      "school": "string",
      "degree": "string",
      "location": "string",
      "start_date": "string",
      "end_date": "string",
      "details": ["string"]
    }}
  ],
  "experience": [
    {{
      "title": "string",
      "company": "string",
      "location": "string",
      "start_date": "string",
      "end_date": "string",
      "bullets": ["string"]
    }}
  ],
  "projects": [
    {{
      "name": "string",
      "tech_stack": "string",
      "start_date": "string",
      "end_date": "string",
      "bullets": ["string"]
    }}
  ]
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return safe_json_loads(response.text)


def find_section_bounds(lines: list[str], headings: list[str]) -> dict:
    heading_indexes = {}

    for index, line in enumerate(lines):
        normalized = line.strip().lower()

        for heading in headings:
            if normalized == heading.lower():
                heading_indexes[heading.lower()] = index

    return heading_indexes


def get_section_lines(
    lines: list[str],
    section_name: str,
    heading_indexes: dict,
    ordered_headings: list[str],
) -> list[str]:
    section_key = section_name.lower()

    if section_key not in heading_indexes:
        return []

    start_index = heading_indexes[section_key] + 1
    end_index = len(lines)

    for heading in ordered_headings:
        heading_key = heading.lower()

        if (
            heading_key in heading_indexes
            and heading_indexes[heading_key] > heading_indexes[section_key]
        ):
            end_index = min(end_index, heading_indexes[heading_key])

    return lines[start_index:end_index]


def extract_contact_info(lines: list[str]) -> dict:
    full_name = lines[0] if lines else "Uploaded Resume"

    email = ""
    phone = ""
    linkedin = ""
    github = ""

    for line in lines[:8]:
        parts = [part.strip() for part in line.split("|")]

        for part in parts:
            part_lower = part.lower()

            if "@" in part:
                email = part
            elif "linkedin" in part_lower:
                linkedin = part
            elif "github" in part_lower:
                github = part
            elif any(char.isdigit() for char in part):
                phone = part

    return {
        "full_name": full_name,
        "email": email or "email@example.com",
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
    }


def parse_skills_section(skill_lines: list[str]) -> list[str]:
    skills = []

    for line in skill_lines:
        if ":" in line:
            _, value = line.split(":", 1)
            parts = value.split(",")
        else:
            parts = line.split(",")

        for part in parts:
            cleaned = part.strip()
            if cleaned:
                skills.append(cleaned)

    return skills


def split_date_range(date_line: str) -> tuple[str, str]:
    if "–" in date_line:
        start_date, end_date = date_line.split("–", 1)
        return start_date.strip(), end_date.strip()

    if "-" in date_line:
        start_date, end_date = date_line.split("-", 1)
        return start_date.strip(), end_date.strip()

    return date_line.strip(), ""


def parse_education_section(education_lines: list[str]) -> list[dict]:
    if not education_lines:
        return []

    education_items = []
    current_item = None

    for line in education_lines:
        lower_line = line.lower()

        is_school = (
            "university" in lower_line
            or "college" in lower_line
            or "institute" in lower_line
        )

        is_degree = (
            "bachelor" in lower_line
            or "master" in lower_line
            or "degree" in lower_line
            or "technology" in lower_line
            or "science" in lower_line
        )

        if is_school:
            if current_item:
                education_items.append(current_item)

            current_item = {
                "school": line,
                "degree": "",
                "location": "",
                "start_date": "",
                "end_date": "",
                "details": [],
            }

        elif current_item and is_degree:
            current_item["degree"] = line

        elif current_item and has_date(line):
            start_date, end_date = split_date_range(line)
            current_item["start_date"] = start_date
            current_item["end_date"] = end_date

        elif current_item and not current_item.get("location"):
            current_item["location"] = line

        elif current_item:
            current_item["details"].append(line)

    if current_item:
        education_items.append(current_item)

    return education_items


def parse_experience_section(experience_lines: list[str]) -> list[dict]:
    if not experience_lines:
        return []

    experience_items = []
    current_item = None

    for line in experience_lines:
        lower_line = line.lower()
        is_bullet = line.startswith("•") or line.startswith("-")

        is_title = any(
            title in lower_line
            for title in [
                "engineer",
                "coordinator",
                "developer",
                "assistant",
                "teacher",
                "analyst",
                "manager",
                "intern",
            ]
        )

        if is_bullet and current_item:
            current_item["bullets"].append(line.replace("•", "").replace("-", "").strip())

        elif is_title:
            if current_item:
                experience_items.append(current_item)

            current_item = {
                "title": line,
                "company": "",
                "location": "",
                "start_date": "",
                "end_date": "",
                "bullets": [],
            }

        elif current_item and has_date(line):
            start_date, end_date = split_date_range(line)
            current_item["start_date"] = start_date
            current_item["end_date"] = end_date

        elif current_item and not current_item["company"]:
            current_item["company"] = line

        elif current_item and not current_item["location"]:
            current_item["location"] = line

    if current_item:
        experience_items.append(current_item)

    return experience_items


def parse_projects_section(project_lines: list[str]) -> list[dict]:
    if not project_lines:
        return []

    projects = []
    current_project = None

    for line in project_lines:
        lower_line = line.lower()
        is_bullet = line.startswith("•") or line.startswith("-")

        looks_like_project_title = (
            "|" in line
            or "platform" in lower_line
            or "api" in lower_line
            or "tracker" in lower_line
            or "explorer" in lower_line
        )

        if is_bullet and current_project:
            current_project["bullets"].append(
                line.replace("•", "").replace("-", "").strip()
            )

        elif current_project and has_date(line):
            start_date, end_date = split_date_range(line)
            current_project["start_date"] = start_date
            current_project["end_date"] = end_date

        elif looks_like_project_title:
            if current_project:
                projects.append(current_project)

            if "|" in line:
                name, tech_stack = line.split("|", 1)
            else:
                name = line
                tech_stack = ""

            current_project = {
                "name": name.strip(),
                "tech_stack": tech_stack.strip(),
                "start_date": "",
                "end_date": "",
                "bullets": [],
            }

    if current_project:
        projects.append(current_project)

    return projects


def build_rule_based_sections(parsed_text: str) -> dict:
    lines = [line.strip() for line in parsed_text.splitlines() if line.strip()]

    contact = extract_contact_info(lines)

    ordered_headings = [
        "Summary",
        "Education",
        "Experience",
        "Projects",
        "Technical Skills",
        "Skills",
    ]

    heading_indexes = find_section_bounds(lines, ordered_headings)

    summary_lines = get_section_lines(
        lines,
        "Summary",
        heading_indexes,
        ordered_headings,
    )

    education_lines = get_section_lines(
        lines,
        "Education",
        heading_indexes,
        ordered_headings,
    )

    experience_lines = get_section_lines(
        lines,
        "Experience",
        heading_indexes,
        ordered_headings,
    )

    project_lines = get_section_lines(
        lines,
        "Projects",
        heading_indexes,
        ordered_headings,
    )

    skills_lines = get_section_lines(
        lines,
        "Technical Skills",
        heading_indexes,
        ordered_headings,
    )

    if not skills_lines:
        skills_lines = get_section_lines(
            lines,
            "Skills",
            heading_indexes,
            ordered_headings,
        )

    summary = " ".join(summary_lines).strip()
    skills = parse_skills_section(skills_lines)
    education = parse_education_section(education_lines)
    experience = parse_experience_section(experience_lines)
    projects = parse_projects_section(project_lines)

    return {
        "full_name": contact["full_name"],
        "email": contact["email"],
        "phone": contact["phone"],
        "location": "",
        "linkedin": contact["linkedin"],
        "github": contact["github"],
        "summary": summary or "Parsed resume summary from uploaded resume.",
        "skills": skills,
        "education": education,
        "experience": experience,
        "projects": projects,
    }


def create_resume_request_from_sections(
    sections: dict,
    template_id: str,
    experience_level: str,
    role_type: str,
    design_style: str,
) -> ResumeCreateRequest:
    education = [
        EducationItem(
            school=item.get("school", ""),
            degree=item.get("degree", ""),
            location=item.get("location") or None,
            start_date=item.get("start_date") or None,
            end_date=item.get("end_date") or None,
            details=item.get("details", []),
        )
        for item in sections.get("education", [])
        if item.get("school") or item.get("degree")
    ]

    experience = [
        ExperienceItem(
            title=item.get("title", ""),
            company=item.get("company", ""),
            location=item.get("location") or None,
            start_date=item.get("start_date") or None,
            end_date=item.get("end_date") or None,
            bullets=item.get("bullets", []),
        )
        for item in sections.get("experience", [])
        if item.get("title") or item.get("company")
    ]

    projects = [
        ProjectItem(
            name=item.get("name", ""),
            tech_stack=item.get("tech_stack") or None,
            start_date=item.get("start_date") or None,
            end_date=item.get("end_date") or None,
            bullets=item.get("bullets", []),
        )
        for item in sections.get("projects", [])
        if item.get("name")
    ]

    skills = split_skills(sections.get("skills", []))

    return ResumeCreateRequest(
        template_id=template_id,
        experience_level=experience_level,
        role_type=role_type,
        design_style=design_style,
        full_name=sections.get("full_name") or "Uploaded Resume",
        email=sections.get("email") or "email@example.com",
        phone=sections.get("phone") or None,
        location=sections.get("location") or None,
        linkedin=sections.get("linkedin") or None,
        github=sections.get("github") or None,
        target_role=None,
        summary=sections.get("summary") or None,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
    )


def build_resume_from_uploaded_text(
    parsed_text: str,
    template_id: str,
    experience_level: str,
    role_type: str,
    design_style: str,
) -> dict:
    provider_used = "gemini"
    fallback_used = False

    try:
        sections = extract_resume_sections_with_ai(parsed_text)
        extraction_message = "AI section extraction completed successfully."
    except Exception as exc:
        provider_used = "rule_based_fallback"
        fallback_used = True
        sections = build_rule_based_sections(parsed_text)
        extraction_message = (
            "AI section extraction failed, so rule-based fallback was used. "
            f"Reason: {str(exc)}"
        )

    resume_request = create_resume_request_from_sections(
        sections=sections,
        template_id=template_id,
        experience_level=experience_level,
        role_type=role_type,
        design_style=design_style,
    )

    markdown_result = build_resume_markdown(resume_request)

    html_result = build_resume_html(
        resume_markdown=markdown_result["resume_markdown"],
        design_style=design_style,
    )

    suggestions = generate_resume_suggestions(resume_request)
    suggestions.append(extraction_message)

    return {
        "provider_used": provider_used,
        "fallback_used": fallback_used,
        "resume_markdown": markdown_result["resume_markdown"],
        "resume_html": html_result["resume_html"],
        "suggestions": suggestions,
    }
