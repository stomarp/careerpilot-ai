from app.schemas.resume_builder import ResumeCreateRequest
from app.services.resume_templates import (
    get_design_guidance,
    get_keywords_for_role,
    get_section_order,
    get_template,
)


def build_contact_line(request: ResumeCreateRequest) -> str:
    contact_items = []

    if request.phone:
        contact_items.append(request.phone)

    contact_items.append(request.email)

    if request.location:
        contact_items.append(request.location)

    if request.linkedin:
        contact_items.append(request.linkedin)

    if request.github:
        contact_items.append(request.github)

    return " | ".join(contact_items)


def build_summary_section(request: ResumeCreateRequest) -> str:
    if not request.summary:
        return ""

    heading = "## Summary"

    if request.experience_level == "senior":
        heading = "## Executive Summary"

    return f"{heading}\n{request.summary}"


def build_skills_section(request: ResumeCreateRequest) -> str:
    if not request.skills:
        return ""

    heading = "## Skills"

    if request.role_type in {"backend_engineer", "ai_engineer", "software_engineer"}:
        heading = "## Technical Skills"

    if request.role_type == "ai_engineer":
        heading = "## AI & Technical Skills"

    return f"{heading}\n{', '.join(request.skills)}"


def build_education_section(request: ResumeCreateRequest) -> str:
    if not request.education:
        return ""

    lines = ["## Education"]

    for item in request.education:
        lines.append(f"**{item.school}**")

        degree_line = item.degree

        if item.location:
            degree_line += f" | {item.location}"

        if item.start_date or item.end_date:
            degree_line += f" | {item.start_date or ''} - {item.end_date or ''}"

        lines.append(degree_line)

        for detail in item.details:
            lines.append(f"- {detail}")

        lines.append("")

    return "\n".join(lines).strip()


def build_experience_section(request: ResumeCreateRequest) -> str:
    if not request.experience:
        return ""

    lines = ["## Experience"]

    if request.experience_level == "senior":
        lines = ["## Professional Experience"]

    for item in request.experience:
        lines.append(f"**{item.title}** | {item.company}")

        detail_line = ""

        if item.location:
            detail_line += item.location

        if item.start_date or item.end_date:
            if detail_line:
                detail_line += " | "
            detail_line += f"{item.start_date or ''} - {item.end_date or ''}"

        if detail_line:
            lines.append(detail_line)

        for bullet in item.bullets:
            lines.append(f"- {bullet}")

        lines.append("")

    return "\n".join(lines).strip()


def build_projects_section(request: ResumeCreateRequest) -> str:
    if not request.projects:
        return ""

    heading = "## Projects"

    if request.role_type in {"software_engineer", "backend_engineer", "ai_engineer"}:
        heading = "## Technical Projects"

    if request.design_style == "technical_project_heavy":
        heading = "## Selected Technical Projects"

    lines = [heading]

    for item in request.projects:
        project_title = f"**{item.name}**"

        if item.tech_stack:
            project_title += f" | {item.tech_stack}"

        lines.append(project_title)

        if item.start_date or item.end_date:
            lines.append(f"{item.start_date or ''} - {item.end_date or ''}")

        for bullet in item.bullets:
            lines.append(f"- {bullet}")

        lines.append("")

    return "\n".join(lines).strip()


def build_leadership_impact_section(request: ResumeCreateRequest) -> str:
    if request.experience_level != "senior":
        return ""

    return (
        "## Leadership Impact\n"
        "- Add 2-3 bullets showing technical leadership, mentoring, architecture ownership, "
        "cross-functional influence, or business impact."
    )


def get_section_content(section: str, request: ResumeCreateRequest) -> str:
    section_builders = {
        "summary": build_summary_section,
        "executive_summary": build_summary_section,
        "skills": build_skills_section,
        "technical_skills": build_skills_section,
        "education": build_education_section,
        "experience": build_experience_section,
        "projects": build_projects_section,
        "leadership_impact": build_leadership_impact_section,
    }

    builder = section_builders.get(section)

    if not builder:
        return ""

    return builder(request)


def generate_resume_suggestions(request: ResumeCreateRequest) -> list[str]:
    suggestions = []

    template = get_template(request.template_id)
    role_keywords = get_keywords_for_role(request.role_type)
    design_guidance = get_design_guidance(request.design_style)

    suggestions.append(
        f"Selected template: {template['name']} - {template['best_for']}."
    )

    if not request.summary:
        suggestions.append(
            "Add a short 2-3 line professional summary tailored to your target role."
        )

    if len(request.skills) < 6:
        suggestions.append(
            "Add more role-specific skills such as languages, frameworks, databases, tools, and cloud platforms."
        )

    if request.experience_level in {"new_grad", "internship"} and not request.projects:
        suggestions.append(
            "For new grad or internship resumes, add at least 2 strong technical or academic projects."
        )

    if request.experience_level in {"experienced", "senior"} and not request.experience:
        suggestions.append(
            "For experienced resumes, add professional experience before projects."
        )

    if request.role_type == "backend_engineer":
        suggestions.append(
            "For backend roles, emphasize REST APIs, databases, cloud, testing, scalability, and reliability."
        )

    if request.role_type == "ai_engineer":
        suggestions.append(
            "For AI Engineer roles, emphasize LLM apps, RAG, embeddings, vector databases, evaluation, and backend integration."
        )

    if request.target_role:
        suggestions.append(
            f"Use keywords related to {request.target_role}: {', '.join(role_keywords[:6])}."
        )

    suggestions.extend(design_guidance)

    return suggestions


def build_resume_markdown(request: ResumeCreateRequest) -> dict:
    section_order = get_section_order(
        template_id=request.template_id,
        experience_level=request.experience_level,
    )

    lines = []

    lines.append(f"# {request.full_name}")
    lines.append(build_contact_line(request))
    lines.append("")

    for section in section_order:
        section_content = get_section_content(section, request)

        if section_content:
            lines.append(section_content)
            lines.append("")

    return {
        "section_order": section_order,
        "resume_markdown": "\n".join(lines).strip(),
    }


def generate_template_suggestions(
    target_role: str,
    industry: str,
    experience_level: str,
    role_type: str,
    design_style: str,
) -> dict:
    keywords = get_keywords_for_role(role_type)
    design_guidance = get_design_guidance(design_style)

    recommended_template = "ats_simple"

    role_lower = target_role.lower()

    if role_type == "ai_engineer" or "ai" in role_lower or "llm" in role_lower:
        recommended_template = "ai_engineer"
    elif role_type == "backend_engineer" or "backend" in role_lower:
        recommended_template = "backend_engineer"
    elif role_type == "software_engineer" or "software" in role_lower or "swe" in role_lower:
        recommended_template = "new_grad_swe" if experience_level in {"new_grad", "internship"} else "ats_simple"
    elif role_type == "data_analyst" or "data" in role_lower:
        recommended_template = "data_analyst"
    elif role_type == "teacher" or "teacher" in role_lower or "education" in role_lower:
        recommended_template = "teacher"
    elif role_type == "hr":
        recommended_template = "hr"
    elif role_type == "marketing":
        recommended_template = "marketing"
    elif role_type == "finance":
        recommended_template = "finance"

    section_order = get_section_order(
        template_id=recommended_template,
        experience_level=experience_level,
    )

    suggestions = [
        f"Use the {recommended_template} template for this target role.",
        "Use keywords from the job description naturally and truthfully.",
        "Add measurable impact where possible.",
    ]

    if experience_level in {"new_grad", "internship"}:
        suggestions.append(
            "For new grad or internship roles, emphasize education, projects, coursework, and technical skills."
        )

    if experience_level == "experienced":
        suggestions.append(
            "For experienced roles, place professional experience above projects."
        )

    if experience_level == "senior":
        suggestions.append(
            "For senior roles, highlight leadership impact, architecture ownership, mentoring, and business outcomes."
        )

    return {
        "recommended_template": recommended_template,
        "experience_level": experience_level,
        "role_type": role_type,
        "design_style": design_style,
        "suggested_sections": section_order,
        "suggested_keywords": keywords,
        "design_guidance": design_guidance,
        "suggestions": suggestions,
    }
