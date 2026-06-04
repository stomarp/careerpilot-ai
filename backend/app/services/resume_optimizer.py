from app.services.ats_scoring import calculate_ats_score


PROJECT_KEYWORDS = {
    "logsmith": "Logsmith",
    "feedback tracker": "Feedback Tracker",
    "nasa explorer": "NASA Explorer",
    "docuguard": "DocuGuard",
    "career": "CareerCopilot AI",
}


HIGH_VALUE_GAPS = [
    "caching",
    "distributed systems",
    "large-scale systems",
    "rest api",
    "automated testing",
    "data processing",
    "storage",
    "public cloud",
    "reliable",
    "maintainable code",
    "collaboration",
    "communication",
    "a/b testing",
]


IGNORE_KEYWORDS = {
    "code",
    "join",
    "field",
    "include",
    "involves",
    "inquisitive",
    "degree",
    "bachelor",
    "master",
    "engineers",
    "developer",
    "developing",
    "features",
    "teams",
    "designers",
    "designing",
    "requirements",
    "responsibilities",
    "candidate",
    "role",
    "work",
}


def detect_projects(resume_text: str) -> list[str]:
    text = resume_text.lower()
    detected_projects = []

    for keyword, project_name in PROJECT_KEYWORDS.items():
        if keyword in text:
            detected_projects.append(project_name)

    if not detected_projects:
        detected_projects.append("Most Relevant Project")

    return detected_projects


def select_priority_gaps(
    missing_skills: list[str],
    missing_keywords: list[str],
) -> list[str]:
    normalized_missing_skills = [skill.lower() for skill in missing_skills]

    normalized_missing_keywords = [
        keyword.lower()
        for keyword in missing_keywords
        if keyword.lower() not in IGNORE_KEYWORDS
    ]

    priority_gaps = []

    for gap in HIGH_VALUE_GAPS:
        if gap in normalized_missing_skills or gap in normalized_missing_keywords:
            priority_gaps.append(gap)

    for keyword in normalized_missing_keywords:
        if keyword not in priority_gaps and len(priority_gaps) < 5:
            if keyword not in IGNORE_KEYWORDS and len(keyword) > 3:
                priority_gaps.append(keyword)

    return priority_gaps[:5]


def create_section_suggestions(
    priority_gaps: list[str],
    industry: str,
) -> list[dict]:
    missing_text = ", ".join(gap.title() for gap in priority_gaps[:4])

    if not missing_text:
        missing_text = "role-specific backend keywords"

    return [
        {
            "section": "Summary",
            "priority": "High",
            "issue": "The summary can be more targeted to this job description.",
            "suggestion": "Add one concise line that highlights backend systems, APIs, scalability, and reliability.",
            "example": (
                "Backend-focused Software Engineer with experience building REST APIs, "
                "PostgreSQL-backed services, Dockerized applications, and scalable backend workflows."
            ),
            "truthfulness_note": "Only include systems and tools you can explain in an interview.",
        },
        {
            "section": "Skills",
            "priority": "High",
            "issue": f"The job description emphasizes {missing_text}, but these are not clearly visible enough.",
            "suggestion": "Group skills by category so ATS and recruiters can quickly identify role alignment.",
            "example": (
                "Backend & Systems: REST APIs, FastAPI, PostgreSQL, Docker, AWS, "
                "CI/CD, caching concepts, distributed systems fundamentals"
            ),
            "truthfulness_note": "Do not add a tool or concept unless you have used it or studied it enough to discuss clearly.",
        },
        {
            "section": "Experience",
            "priority": "Medium",
            "issue": "Experience bullets can show more ownership, scale, reliability, and measurable impact.",
            "suggestion": "Rewrite 1–2 experience bullets with stronger action verbs and impact.",
            "example": (
                "Developed and refactored backend modules using Python and Java, improving maintainability, "
                "release reliability, and application stability across development workflows."
            ),
            "truthfulness_note": "Use exact numbers only when they are truthful. Otherwise use honest impact language.",
        },
        {
            "section": "Projects",
            "priority": "High",
            "issue": "Projects are strong, but should better emphasize scalable backend systems, testing, caching, and reliability.",
            "suggestion": "Enhance one flagship project with Redis caching, pagination, indexed queries, background processing, or automated tests.",
            "example": (
                "Optimized Logsmith for high-volume usage by adding pagination, indexed PostgreSQL queries, "
                "and load testing for core API workflows."
            ),
            "truthfulness_note": "Build the enhancement first before adding the bullet to your resume.",
        },
        {
            "section": "Education",
            "priority": "Low",
            "issue": "Education is present, but relevant coursework can help for new-grad/backend roles.",
            "suggestion": "Add relevant coursework if space allows.",
            "example": (
                "Relevant Coursework: Data Structures, Algorithms, Database Systems, "
                "Software Engineering, Distributed Systems"
            ),
            "truthfulness_note": "Only include coursework you completed or can discuss.",
        },
        {
            "section": "Certifications",
            "priority": "Optional",
            "issue": "The role mentions large-scale backend systems and public cloud, but no cloud certification is listed.",
            "suggestion": "Consider a beginner-friendly cloud certification if you want to strengthen backend/cloud alignment.",
            "example": "Certification to consider: AWS Cloud Practitioner or AWS Developer Associate",
            "truthfulness_note": "Only list certifications after completion.",
        },
    ]


def create_bullet_for_gap(gap: str, project: str) -> str:
    templates = {
        "caching": (
            f"Improved {project} backend performance by designing caching-ready API workflows "
            f"for frequently accessed data and reducing repeated database reads."
        ),
        "distributed systems": (
            f"Designed scalable backend workflows in {project} with modular API services, "
            f"database-backed processing, and separation of responsibilities for high-volume usage scenarios."
        ),
        "large-scale systems": (
            f"Built scalable backend components in {project} using FastAPI, PostgreSQL, and Docker, "
            f"with API patterns designed to support high-volume application traffic."
        ),
        "rest api": (
            f"Designed and implemented REST API endpoints in {project} to support structured data ingestion, "
            f"retrieval, and backend workflow automation."
        ),
        "automated testing": (
            f"Improved {project} reliability by adding automated tests for backend API endpoints "
            f"and core service logic."
        ),
        "data processing": (
            f"Implemented structured data processing workflows in {project} to transform, store, "
            f"and retrieve application data efficiently."
        ),
        "storage": (
            f"Designed PostgreSQL-backed storage models in {project} to support reliable data persistence, "
            f"querying, and backend workflow management."
        ),
        "public cloud": (
            f"Prepared {project} for cloud deployment by containerizing backend services with Docker "
            f"and designing environment-based configuration."
        ),
        "reliable": (
            f"Improved backend reliability in {project} through structured error handling, validation, "
            f"and maintainable service-layer design."
        ),
        "maintainable code": (
            f"Refactored {project} backend logic into modular services, schemas, and API layers "
            f"to improve maintainability and developer experience."
        ),
        "collaboration": (
            "Collaborated with cross-functional team members to clarify requirements, communicate tradeoffs, "
            "and support delivery alignment."
        ),
        "communication": (
            "Communicated technical decisions, implementation tradeoffs, and project progress clearly "
            "to technical and non-technical stakeholders."
        ),
        "a/b testing": (
            f"Added an experiment-tracking workflow in {project} to compare feature variations "
            f"and support data-informed product decisions."
        ),
    }

    return templates.get(
        gap,
        f"Enhanced {project} by applying {gap} concepts to improve backend reliability, scalability, and role alignment.",
    )


def create_project_enhancement(gap: str, project: str) -> dict:
    enhancements = {
        "caching": {
            "enhancement": f"Add Redis caching to {project} for frequently requested endpoints such as trace search or dashboard data.",
            "bullet": f"Implemented Redis caching in {project} for frequently accessed API responses, reducing repeated database reads and improving response efficiency.",
        },
        "distributed systems": {
            "enhancement": f"Add asynchronous background processing to {project} using Celery, Redis Queue, or Kafka.",
            "bullet": f"Designed asynchronous background processing in {project} to separate request handling from long-running workloads and improve scalability.",
        },
        "large-scale systems": {
            "enhancement": f"Add pagination, indexed queries, and load testing to {project}.",
            "bullet": f"Optimized {project} for high-volume usage by adding pagination, indexed PostgreSQL queries, and load testing for core API workflows.",
        },
        "automated testing": {
            "enhancement": f"Add pytest unit and integration tests for {project}'s backend endpoints.",
            "bullet": f"Added automated unit and integration tests for {project} backend APIs, improving reliability and maintainability.",
        },
        "data processing": {
            "enhancement": f"Add a processing pipeline to {project} that groups, filters, and summarizes stored records.",
            "bullet": f"Implemented backend data processing workflows in {project} to transform and summarize structured data for analysis.",
        },
        "storage": {
            "enhancement": f"Improve {project}'s PostgreSQL schema with indexes, constraints, and optimized queries.",
            "bullet": f"Optimized PostgreSQL schema and queries in {project}, improving data retrieval patterns for backend workflows.",
        },
        "a/b testing": {
            "enhancement": f"Add a simple experiment tracking module to {project}.",
            "bullet": f"Built an experiment tracking workflow in {project} to compare feature variations and support data-driven product decisions.",
        },
    }

    selected = enhancements.get(
        gap,
        {
            "enhancement": f"Build a small feature in {project} that demonstrates {gap} in a practical way.",
            "bullet": f"Added {gap}-focused functionality to {project} to improve role alignment and practical backend engineering depth.",
        },
    )

    return {
        "project": project,
        "enhancement": selected["enhancement"],
        "resume_bullet_after_building": selected["bullet"],
    }


def optimize_resume_for_job(
    resume_text: str,
    job_description_text: str,
    industry: str,
) -> dict:
    ats_result = calculate_ats_score(
        resume_text=resume_text,
        job_description_text=job_description_text,
        industry=industry,
    )

    missing_skills = ats_result["missing_skills"]
    missing_keywords = ats_result["missing_keywords"]
    ats_score = ats_result["ats_score"]

    projects = detect_projects(resume_text)
    primary_project = projects[0]

    priority_gaps = select_priority_gaps(
        missing_skills=missing_skills,
        missing_keywords=missing_keywords,
    )

    section_suggestions = create_section_suggestions(
        priority_gaps=priority_gaps,
        industry=industry,
    )

    suggested_bullets = []

    for gap in priority_gaps[:5]:
        suggested_bullets.append(
            {
                "section": "Projects" if gap not in {"collaboration", "communication"} else "Experience",
                "skill": gap.title(),
                "bullet": create_bullet_for_gap(gap, primary_project),
                "why": (
                    f"The job description values {gap}. This suggestion improves alignment "
                    f"only if it reflects your real experience."
                ),
            }
        )

    project_enhancements = [
        create_project_enhancement(gap, primary_project)
        for gap in priority_gaps[:5]
        if gap not in {"collaboration", "communication"}
    ]

    skills_to_learn = [gap.title() for gap in priority_gaps]

    if ats_score >= 80:
        overall_strategy = (
            "Your resume has strong alignment with this role. Focus on sharper wording, clearer metrics, "
            "and better highlighting backend scale, reliability, and collaboration."
        )
    elif ats_score >= 60:
        overall_strategy = (
            "Your resume has moderate alignment with this role. It already shows backend experience, "
            "but should better highlight scalable systems, caching, testing, reliability, and teamwork."
        )
    else:
        overall_strategy = (
            "Your resume needs stronger alignment before applying. Improve section keywords, strengthen project bullets, "
            "and build small enhancements that demonstrate missing role requirements."
        )

    return {
        "overall_strategy": overall_strategy,
        "section_suggestions": section_suggestions,
        "suggested_bullets": suggested_bullets,
        "project_enhancements": project_enhancements,
        "skills_to_learn": skills_to_learn[:10],
        "truthfulness_warning": (
            "Only add suggested bullets if you have actually built, practiced, or can truthfully explain the work. "
            "If you have not done it yet, complete the suggested project enhancement first and then add it to your resume."
        ),
    }
