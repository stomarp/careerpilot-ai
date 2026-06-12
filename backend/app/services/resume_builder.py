from app.schemas.resume_builder import ResumeCreateRequest
from app.services.resume_templates import (
    get_design_guidance,
    get_keywords_for_role,
    get_section_order,
    get_template,
)


TECH_ROLES = {
    "software_engineer",
    "backend_engineer",
    "ai_engineer",
    "data_analyst",
    "product_manager",
    "ux_designer",
}

HEALTHCARE_ROLES = {
    "healthcare_admin",
    "medical_assistant",
    "nursing_support",
}

BUSINESS_ROLES = {
    "finance",
    "marketing",
    "sales",
    "hr",
    "operations",
    "admin_assistant",
}

EDUCATION_ROLES = {
    "teacher",
    "instructional_designer",
}


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

    if request.role_type == "teacher":
        heading = "## Teaching Summary"

    if request.role_type in HEALTHCARE_ROLES:
        heading = "## Professional Summary"

    return f"{heading}\n{request.summary}"


def get_skills_heading(role_type: str) -> str:
    if role_type == "backend_engineer":
        return "## Backend & Technical Skills"

    if role_type == "ai_engineer":
        return "## AI & Backend Skills"

    if role_type == "data_analyst":
        return "## Data & Analytics Skills"

    if role_type == "product_manager":
        return "## Product Skills"

    if role_type == "ux_designer":
        return "## Design & Research Skills"

    if role_type == "finance":
        return "## Finance & Analysis Skills"

    if role_type == "marketing":
        return "## Marketing Skills"

    if role_type == "sales":
        return "## Sales Skills"

    if role_type == "hr":
        return "## HR & Recruiting Skills"

    if role_type == "operations":
        return "## Operations Skills"

    if role_type in HEALTHCARE_ROLES:
        return "## Healthcare Skills"

    if role_type in EDUCATION_ROLES:
        return "## Education Skills"

    if role_type == "customer_support":
        return "## Customer Support Skills"

    if role_type == "legal_assistant":
        return "## Legal Support Skills"

    if role_type in TECH_ROLES:
        return "## Technical Skills"

    return "## Skills"


def build_skills_section(request: ResumeCreateRequest) -> str:
    if not request.skills:
        return ""

    heading = get_skills_heading(request.role_type)
    return f"{heading}\n{', '.join(request.skills)}"


def build_education_section(request: ResumeCreateRequest) -> str:
    if not request.education:
        return ""

    heading = "## Education"

    if request.role_type in {"teacher", "instructional_designer"}:
        heading = "## Education & Certifications"

    lines = [heading]

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


def get_experience_heading(request: ResumeCreateRequest) -> str:
    if request.experience_level == "senior":
        return "## Professional Experience"

    if request.role_type == "teacher":
        return "## Teaching Experience"

    if request.role_type in HEALTHCARE_ROLES:
        return "## Healthcare Experience"

    if request.role_type == "customer_support":
        return "## Customer Support Experience"

    if request.role_type == "legal_assistant":
        return "## Legal Support Experience"

    return "## Experience"


def build_experience_section(request: ResumeCreateRequest) -> str:
    if not request.experience:
        return ""

    lines = [get_experience_heading(request)]

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


def get_projects_heading(request: ResumeCreateRequest) -> str:
    if request.role_type == "backend_engineer":
        return "## Backend Projects"

    if request.role_type == "ai_engineer":
        return "## AI Projects"

    if request.role_type == "data_analyst":
        return "## Analytics Projects"

    if request.role_type == "product_manager":
        return "## Product Case Studies"

    if request.role_type == "ux_designer":
        return "## Portfolio Projects"

    if request.role_type in TECH_ROLES:
        return "## Technical Projects"

    if request.role_type in {"marketing", "sales", "operations", "finance"}:
        return "## Selected Projects"

    if request.role_type in EDUCATION_ROLES:
        return "## Teaching Projects"

    return "## Projects"


def build_projects_section(request: ResumeCreateRequest) -> str:
    if not request.projects:
        return ""

    lines = [get_projects_heading(request)]

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
        "- Add 2-3 bullets showing leadership, ownership, team impact, "
        "cross-functional influence, measurable outcomes, or business results."
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
        suggestions.append("Add a short 2-3 line professional summary tailored to your target role.")

    if len(request.skills) < 6:
        suggestions.append("Add more role-specific skills that match the job description.")

    if request.experience_level in {"new_grad", "internship"} and not request.projects:
        suggestions.append("For new grad or internship resumes, add at least 2 strong projects, coursework items, or academic accomplishments.")

    if request.experience_level in {"experienced", "senior"} and not request.experience:
        suggestions.append("For experienced resumes, add professional experience before projects.")

    if request.role_type == "backend_engineer":
        suggestions.append("For backend roles, emphasize APIs, databases, cloud, testing, scalability, and reliability.")

    if request.role_type == "ai_engineer":
        suggestions.append("For AI roles, emphasize LLM apps, RAG, embeddings, evaluation, and backend integration.")

    if request.role_type == "teacher":
        suggestions.append("For teaching roles, emphasize classroom management, curriculum, student outcomes, and parent communication.")

    if request.role_type in HEALTHCARE_ROLES:
        suggestions.append("For healthcare roles, emphasize patient care, compliance, scheduling, documentation, and EHR systems.")

    if request.role_type == "finance":
        suggestions.append("For finance roles, emphasize reporting, Excel, forecasting, budgeting, compliance, and measurable financial impact.")

    if request.role_type == "marketing":
        suggestions.append("For marketing roles, include campaigns, analytics, SEO, content strategy, and measurable growth.")

    if request.target_role:
        suggestions.append(
            f"Use keywords related to {request.target_role}: {', '.join(role_keywords[:8])}."
        )

    suggestions.extend(design_guidance)

    return suggestions


def build_resume_markdown(request: ResumeCreateRequest) -> dict:
    template = get_template(request.template_id)

    if template.get("role_type"):
        request.role_type = template["role_type"]

    if template.get("experience_level") and template["experience_level"] != "general":
        request.experience_level = template["experience_level"]

    if template.get("design_style"):
        request.design_style = template["design_style"]

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
        recommended_template = "new_grad_swe" if experience_level in {"new_grad", "internship"} else "modern_clean"
    elif role_type == "data_analyst" or "data" in role_lower:
        recommended_template = "data_analyst"
    elif role_type == "teacher" or "teacher" in role_lower or "education" in role_lower:
        recommended_template = "teacher"
    elif role_type == "healthcare_admin" or "healthcare" in role_lower or "patient" in role_lower:
        recommended_template = "healthcare_admin"
    elif role_type == "medical_assistant" or "medical assistant" in role_lower:
        recommended_template = "medical_assistant"
    elif role_type == "finance" or "finance" in role_lower or "accounting" in role_lower:
        recommended_template = "finance"
    elif role_type == "marketing" or "marketing" in role_lower or "seo" in role_lower:
        recommended_template = "marketing"
    elif role_type == "sales" or "sales" in role_lower:
        recommended_template = "sales"
    elif role_type == "hr" or "recruit" in role_lower or "human resources" in role_lower:
        recommended_template = "hr"
    elif role_type == "customer_support" or "support" in role_lower or "customer" in role_lower:
        recommended_template = "customer_support"
    elif role_type == "legal_assistant" or "legal" in role_lower or "paralegal" in role_lower:
        recommended_template = "legal_assistant"

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
        suggestions.append("For new grad or internship roles, emphasize education, projects, coursework, and skills.")

    if experience_level == "experienced":
        suggestions.append("For experienced roles, place professional experience above projects.")

    if experience_level == "senior":
        suggestions.append("For senior roles, highlight leadership impact, ownership, mentoring, and business outcomes.")

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
