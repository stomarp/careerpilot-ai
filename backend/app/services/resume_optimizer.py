from app.services.ats_scoring import calculate_ats_score


PROJECT_KEYWORDS = {
    "careercopilot": "CareerCopilot AI",
    "career copilot": "CareerCopilot AI",
    "logsmith": "Logsmith",
    "docuguard": "DocuGuard-HR",
    "feedback tracker": "Feedback Tracker",
    "nasa explorer": "NASA Explorer",
}


SKILL_TO_GAP = {
    "redis": "caching",
    "caching": "caching",
    "database indexing": "database_indexing",
    "query optimization": "database_indexing",
    "pagination": "pagination",
    "performance optimization": "performance",
    "message queues": "background_jobs",
    "background jobs": "background_jobs",
    "retries": "retries",
    "rate limiting": "rate_limiting",
    "idempotency": "distributed_systems",
    "distributed systems": "distributed_systems",
    "authentication": "authentication",
    "authorization": "authentication",
    "security": "authentication",
    "jwt": "authentication",
    "observability": "observability",
    "structured logging": "observability",
    "monitoring": "observability",
    "metrics": "observability",
    "tracing": "observability",
    "automated testing": "testing",
    "unit testing": "testing",
    "integration testing": "testing",
    "api testing": "testing",
    "cloud deployment": "deployment",
    "aws": "deployment",
    "docker": "deployment",
    "ci/cd": "deployment",
}


GAP_LABELS = {
    "caching": "Redis / Caching",
    "database_indexing": "Database Indexing",
    "pagination": "Pagination",
    "performance": "Backend Performance",
    "background_jobs": "Background Jobs / Queues",
    "retries": "Retries",
    "rate_limiting": "Rate Limiting",
    "distributed_systems": "Distributed Systems",
    "authentication": "Authentication & Security",
    "observability": "Observability",
    "testing": "Automated Testing",
    "deployment": "Cloud / Deployment",
}


def detect_projects(resume_text: str) -> list[str]:
    text = resume_text.lower()
    detected_projects = []

    for keyword, project_name in PROJECT_KEYWORDS.items():
        if keyword in text and project_name not in detected_projects:
            detected_projects.append(project_name)

    if not detected_projects:
        detected_projects.append("CareerCopilot AI")

    return detected_projects


def choose_project_for_gap(gap: str, projects: list[str]) -> str:
    if gap in {"caching", "database_indexing", "pagination", "performance", "authentication"}:
        if "CareerCopilot AI" in projects:
            return "CareerCopilot AI"

    if gap in {"background_jobs", "retries", "rate_limiting", "distributed_systems", "observability"}:
        if "Logsmith" in projects:
            return "Logsmith"

    if gap == "testing":
        if "CareerCopilot AI" in projects:
            return "CareerCopilot AI"

    if gap == "deployment":
        if "CareerCopilot AI" in projects:
            return "CareerCopilot AI"

    return projects[0]


def select_priority_gaps(
    missing_skills: list[str],
    missing_keywords: list[str],
) -> list[str]:
    raw_items = [*missing_skills, *missing_keywords]
    normalized_items = [item.lower().strip() for item in raw_items]

    priority_order = [
        "caching",
        "database_indexing",
        "pagination",
        "performance",
        "background_jobs",
        "retries",
        "rate_limiting",
        "distributed_systems",
        "authentication",
        "observability",
        "testing",
        "deployment",
    ]

    detected = []

    for item in normalized_items:
        mapped_gap = SKILL_TO_GAP.get(item)

        if mapped_gap and mapped_gap not in detected:
            detected.append(mapped_gap)

    ordered = [gap for gap in priority_order if gap in detected]

    return ordered[:5]


def create_section_suggestions(priority_gaps: list[str]) -> list[dict]:
    missing_text = ", ".join(GAP_LABELS[gap] for gap in priority_gaps[:4])

    if not missing_text:
        missing_text = "role-specific backend proof"

    return [
        {
            "section": "Summary",
            "priority": "High",
            "issue": "The summary can be more targeted to this job description.",
            "suggestion": "Add one concise line that positions you as a backend-focused engineer with API, database, deployment, and reliability experience.",
            "example": (
                "Backend-focused Software Engineer with experience building REST APIs, "
                "PostgreSQL-backed services, Dockerized applications, and AI-powered developer workflows."
            ),
            "truthfulness_note": "Only include tools and systems you can explain in an interview.",
        },
        {
            "section": "Skills",
            "priority": "High",
            "issue": f"The role emphasizes {missing_text}. These should be visible only if you have actually built or studied them.",
            "suggestion": "Group skills by category so ATS and recruiters can quickly identify backend, database, cloud, testing, and AI alignment.",
            "example": (
                "Backend & APIs: FastAPI, REST APIs, SQLAlchemy, Pydantic | "
                "Databases: PostgreSQL, MySQL | DevOps: Docker, CI/CD, GitHub Actions, AWS | "
                "AI: LLM APIs, prompt engineering, RAG fundamentals"
            ),
            "truthfulness_note": "Do not add a tool or concept unless you have used it or can discuss it clearly.",
        },
        {
            "section": "Projects",
            "priority": "High",
            "issue": "Your projects are the strongest place to close this job match gap.",
            "suggestion": "Enhance one flagship project with a real backend improvement, then add the resume bullet only after building it.",
            "example": (
                "Improved CareerCopilot AI backend reliability by adding protected user-specific routes, "
                "JWT authentication, and production-style API validation."
            ),
            "truthfulness_note": "Build or verify the enhancement before adding it to your resume.",
        },
        {
            "section": "Experience",
            "priority": "Medium",
            "issue": "Experience bullets can show more ownership, reliability, and measurable impact.",
            "suggestion": "Rewrite 1–2 bullets with stronger action verbs and concrete impact.",
            "example": (
                "Developed and refactored backend modules using Python and Java, improving maintainability, "
                "release reliability, and application stability across development workflows."
            ),
            "truthfulness_note": "Use exact numbers only when they are truthful. Otherwise use honest impact language.",
        },
        {
            "section": "Education",
            "priority": "Low",
            "issue": "Education is present, but relevant coursework can help for new-grad/backend roles.",
            "suggestion": "Add relevant coursework if space allows and if it supports the target role.",
            "example": (
                "Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering, Cloud Computing"
            ),
            "truthfulness_note": "Only include coursework you completed or can discuss.",
        },
    ]


def create_bullet_for_gap(gap: str, project: str) -> str:
    templates = {
        "caching": (
            f"Implemented Redis caching in {project} for frequently accessed API responses, "
            "reducing repeated database reads and improving backend response efficiency."
        ),
        "database_indexing": (
            f"Optimized PostgreSQL queries in {project} by adding indexes for high-traffic lookup patterns "
            "and improving data retrieval efficiency."
        ),
        "pagination": (
            f"Added pagination and filtering to {project} API endpoints to support larger datasets "
            "and improve response consistency."
        ),
        "performance": (
            f"Measured and improved {project} backend performance by optimizing repeated API workflows "
            "and reducing unnecessary database operations."
        ),
        "background_jobs": (
            f"Designed background processing in {project} to handle long-running work outside the request cycle "
            "and improve backend reliability."
        ),
        "retries": (
            f"Added retry handling and structured failure logging in {project} to make backend workflows more resilient."
        ),
        "rate_limiting": (
            f"Implemented rate limiting for {project} API endpoints to protect backend services from excessive requests."
        ),
        "distributed_systems": (
            f"Designed reliability-focused backend workflows in {project} using service boundaries, retries, "
            "and background processing patterns."
        ),
        "authentication": (
            f"Implemented JWT-based authentication and protected user-specific API routes in {project} "
            "to secure private user data."
        ),
        "observability": (
            f"Built structured logging and trace-style debugging workflows in {project} to improve incident analysis "
            "and backend visibility."
        ),
        "testing": (
            f"Added unit and integration tests for {project} backend APIs to improve reliability and prevent regressions."
        ),
        "deployment": (
            f"Containerized {project} backend services with Docker and configured environment-based settings "
            "for repeatable deployment workflows."
        ),
    }

    return templates.get(
        gap,
        f"Improved {project} backend reliability with a targeted project enhancement aligned to the role.",
    )


def create_project_enhancement(gap: str, project: str) -> dict:
    enhancements = {
        "caching": {
            "enhancement": (
                f"Add Redis caching to {project} for repeated analysis results, dashboard stats, "
                "or frequently requested API responses."
            ),
            "bullet": (
                f"Implemented Redis caching in {project} for frequently accessed API responses, "
                "reducing repeated database reads and improving backend response efficiency."
            ),
        },
        "database_indexing": {
            "enhancement": (
                f"Add PostgreSQL indexes in {project} for common lookup fields such as user_id, status, "
                "job_id, resume_id, created_at, or company_name."
            ),
            "bullet": (
                f"Optimized PostgreSQL queries in {project} by adding indexes for common lookup patterns "
                "and improving backend data retrieval efficiency."
            ),
        },
        "pagination": {
            "enhancement": (
                f"Add pagination and filtering to {project} list endpoints so large datasets do not return all records at once."
            ),
            "bullet": (
                f"Added pagination and filtering to {project} API endpoints to support larger datasets "
                "and improve response consistency."
            ),
        },
        "performance": {
            "enhancement": (
                f"Measure one slow {project} endpoint, optimize the query or service logic, and document the before/after result."
            ),
            "bullet": (
                f"Measured and improved {project} backend performance by optimizing repeated API workflows "
                "and reducing unnecessary database operations."
            ),
        },
        "background_jobs": {
            "enhancement": (
                f"Add a background job flow to {project}, such as log incident summarization, delayed alert processing, "
                "or scheduled cleanup tasks."
            ),
            "bullet": (
                f"Designed background processing in {project} to handle long-running work outside the request cycle "
                "and improve backend reliability."
            ),
        },
        "retries": {
            "enhancement": (
                f"Add retry handling for external AI/API calls in {project}, with structured errors and safe fallback behavior."
            ),
            "bullet": (
                f"Added retry handling and structured failure logging in {project} to make backend workflows more resilient."
            ),
        },
        "rate_limiting": {
            "enhancement": (
                f"Add rate limiting to expensive {project} endpoints such as ATS analysis, AI optimization, or log ingestion."
            ),
            "bullet": (
                f"Implemented rate limiting for {project} API endpoints to protect backend services from excessive requests."
            ),
        },
        "distributed_systems": {
            "enhancement": (
                f"Add a queue-backed workflow or background processing pipeline to {project} to separate request handling "
                "from long-running backend work."
            ),
            "bullet": (
                f"Designed reliability-focused backend workflows in {project} using service boundaries, retries, "
                "and background processing patterns."
            ),
        },
        "authentication": {
            "enhancement": (
                f"Document or strengthen {project} authentication by showing JWT login, protected routes, and user-specific data access."
            ),
            "bullet": (
                f"Implemented JWT-based authentication and protected user-specific API routes in {project} "
                "to secure private user data."
            ),
        },
        "observability": {
            "enhancement": (
                f"Add structured logging, trace IDs, dashboard metrics, or incident explanation workflows to {project}."
            ),
            "bullet": (
                f"Built structured logging and trace-style debugging workflows in {project} to improve incident analysis "
                "and backend visibility."
            ),
        },
        "testing": {
            "enhancement": (
                f"Add unit and integration tests for {project} service logic, protected endpoints, and important API workflows."
            ),
            "bullet": (
                f"Added unit and integration tests for {project} backend APIs to improve reliability and prevent regressions."
            ),
        },
        "deployment": {
            "enhancement": (
                f"Document {project} deployment readiness with Docker Compose, environment variables, health checks, and CI/CD."
            ),
            "bullet": (
                f"Containerized {project} backend services with Docker and configured environment-based settings "
                "for repeatable deployment workflows."
            ),
        },
    }

    selected = enhancements.get(
        gap,
        {
            "enhancement": f"Add one practical backend improvement to {project} that directly supports this job description.",
            "bullet": f"Improved {project} backend reliability with a targeted project enhancement aligned to the role.",
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

    priority_gaps = select_priority_gaps(
        missing_skills=missing_skills,
        missing_keywords=missing_keywords,
    )

    if not priority_gaps:
        priority_gaps = ["performance", "testing", "deployment"]

    section_suggestions = create_section_suggestions(
        priority_gaps=priority_gaps,
    )

    suggested_bullets = []

    for gap in priority_gaps[:5]:
        project = choose_project_for_gap(gap=gap, projects=projects)

        suggested_bullets.append(
            {
                "section": "Projects",
                "skill": GAP_LABELS.get(gap, gap.title()),
                "bullet": create_bullet_for_gap(gap=gap, project=project),
                "why": (
                    f"This targets the role's {GAP_LABELS.get(gap, gap)} expectation. "
                    "Use it only after the work is real and interview-ready."
                ),
            }
        )

    project_enhancements = [
        create_project_enhancement(
            gap=gap,
            project=choose_project_for_gap(gap=gap, projects=projects),
        )
        for gap in priority_gaps[:5]
    ]

    skills_to_learn = [GAP_LABELS.get(gap, gap.title()) for gap in priority_gaps]

    if ats_score >= 80:
        overall_strategy = (
            "Your resume is already competitive for this role. Focus on sharpening project proof, "
            "adding measurable impact, and making backend reliability work easier for recruiters to see."
        )
    elif ats_score >= 65:
        overall_strategy = (
            "Your resume has a good foundation for this role. It already shows backend, database, Docker/CI/CD, "
            "and project experience, but should make performance, reliability, deployment, and system-design proof more concrete."
        )
    else:
        overall_strategy = (
            "Your resume needs stronger alignment before applying. Build or document one practical backend improvement, "
            "then update your summary, skills, and project bullets around that proof."
        )

    return {
        "overall_strategy": overall_strategy,
        "section_suggestions": section_suggestions,
        "suggested_bullets": suggested_bullets,
        "project_enhancements": project_enhancements,
        "skills_to_learn": skills_to_learn[:10],
        "truthfulness_warning": (
            "Only add suggested bullets after the work is real, practiced, or clearly explainable. "
            "Do not list tools, metrics, or architecture claims that you cannot defend in an interview."
        ),
    }
