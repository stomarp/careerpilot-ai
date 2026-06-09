import re

from app.services.skill_extractor import (
    extract_skills,
    format_skill,
)


SIGNAL_GROUPS = {
    "Python": ["python"],
    "Java": ["java"],
    "JavaScript": ["javascript"],
    "TypeScript": ["typescript"],
    "Node.js": ["node.js", "nodejs", "node"],
    "React": ["react"],
    "Next.js": ["next.js", "nextjs"],
    "FastAPI": ["fastapi"],
    "Spring Boot": ["spring boot", "spring"],
    "Django": ["django"],
    "Flask": ["flask"],
    "REST APIs": ["rest api", "rest apis", "restful api", "api", "apis"],
    "HTTP/JSON": ["http", "json"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MySQL": ["mysql"],
    "SQL": ["sql"],
    "Database Schema Design": ["schema", "database schema", "schemas"],
    "Query Optimization": ["efficient queries", "query optimization", "optimized queries"],
    "Database Indexing": ["indexing", "database indexing", "indexes"],
    "Docker": ["docker", "docker compose", "containerized", "containers"],
    "CI/CD": ["ci/cd", "github actions", "jenkins", "deployment pipeline"],
    "AWS": ["aws"],
    "GCP": ["gcp", "google cloud"],
    "Azure": ["azure"],
    "Cloud Deployment": ["cloud deployment", "cloud-native", "cloud based", "cloud-based"],
    "Unit Testing": ["unit tests", "unit testing"],
    "Integration Testing": ["integration tests", "integration testing"],
    "API Testing": ["api tests", "api testing"],
    "Automated Testing": ["automated tests", "automated testing", "testing"],
    "Redis": ["redis"],
    "Caching": ["caching", "cache"],
    "Pagination": ["pagination"],
    "Performance Optimization": ["performance optimization", "system performance", "improve performance"],
    "Rate Limiting": ["rate limiting", "rate limit"],
    "Message Queues": ["message queues", "queue", "queues"],
    "Background Jobs": ["background jobs", "background job", "background processing"],
    "Retries": ["retries", "retry"],
    "Idempotency": ["idempotency", "idempotent"],
    "Fault Tolerance": ["fault tolerance", "fault tolerant"],
    "Distributed Systems": ["distributed systems", "distributed"],
    "Eventual Consistency": ["eventual consistency"],
    "Service Boundaries": ["service boundaries", "service boundary"],
    "Observability": ["observability"],
    "Structured Logging": ["structured logging", "logging", "logs"],
    "Tracing": ["tracing", "trace"],
    "Metrics": ["metrics"],
    "Monitoring": ["monitoring"],
    "Dashboards": ["dashboards", "dashboard"],
    "Error Monitoring": ["error monitoring"],
    "Authentication": ["authentication", "auth"],
    "Authorization": ["authorization"],
    "Security": ["security", "secure"],
    "JWT": ["jwt"],
    "Data Structures": ["data structures"],
    "Algorithms": ["algorithms"],
    "Object-Oriented Programming": ["object-oriented", "oop"],
    "System Design": ["system design"],
    "Git": ["git"],
    "Code Reviews": ["code reviews", "code review"],
    "Documentation": ["documentation", "document"],
    "Root Cause Analysis": ["root-cause analysis", "root cause analysis", "rca"],
    "LLMs": ["llm", "llms"],
    "AI APIs": ["ai api", "ai apis", "openai", "gemini"],
}


LOW_PRIORITY_MISSING_SIGNALS = {
    "Django",
    "Flask",
    "GCP",
    "Azure",
    "Spring Boot",
}


ALTERNATIVE_SIGNAL_COVERAGE = {
    "Django": ["FastAPI"],
    "Flask": ["FastAPI"],
    "GCP": ["AWS"],
    "Azure": ["AWS"],
    "Spring Boot": ["Java", "FastAPI"],
    "MySQL": ["PostgreSQL", "SQL"],
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def contains_phrase(text: str, phrase: str) -> bool:
    normalized = normalize_text(text)
    phrase = phrase.lower()

    if len(phrase.split()) > 1 or "/" in phrase or "." in phrase:
        return phrase in normalized

    return bool(re.search(rf"\b{re.escape(phrase)}\b", normalized))


def text_has_signal(text: str, signal: str) -> bool:
    phrases = SIGNAL_GROUPS.get(signal, [])

    return any(contains_phrase(text, phrase) for phrase in phrases)


def extract_signals_from_text(text: str) -> set[str]:
    found = set()

    for signal in SIGNAL_GROUPS:
        if text_has_signal(text, signal):
            found.add(signal)

    return found


def filter_missing_signals(
    missing_signals: set[str],
    resume_signals: set[str],
) -> list[str]:
    filtered = []

    for signal in sorted(missing_signals):
        alternatives = ALTERNATIVE_SIGNAL_COVERAGE.get(signal, [])

        if any(alternative in resume_signals for alternative in alternatives):
            continue

        if signal in LOW_PRIORITY_MISSING_SIGNALS:
            continue

        filtered.append(signal)

    return filtered


def calculate_percentage(matched_count: int, total_count: int) -> int:
    if total_count <= 0:
        return 0

    return round((matched_count / total_count) * 100)


def calculate_match_level(score: int) -> str:
    if score >= 85:
        return "Excellent match"
    if score >= 75:
        return "Strong match"
    if score >= 60:
        return "Good foundation"
    return "Needs stronger alignment"


def contains_any_signal(text: str, signals: list[str]) -> bool:
    return any(text_has_signal(text, signal) for signal in signals)


def build_strengths(resume_signals: set[str], job_signals: set[str]) -> list[dict]:
    strengths = []

    if {"REST APIs", "FastAPI", "Backend Services"} & resume_signals or "REST APIs" in resume_signals:
        if "REST APIs" in job_signals:
            strengths.append(
                {
                    "category": "Backend API foundation",
                    "evidence": "Your resume shows API/backend experience that aligns with the job's REST/API expectations.",
                }
            )

    if {"PostgreSQL", "MySQL", "SQL", "Database Schema Design"} & resume_signals:
        if {"PostgreSQL", "MySQL", "SQL", "Database Schema Design"} & job_signals:
            strengths.append(
                {
                    "category": "Database experience",
                    "evidence": "Your resume includes SQL/database experience relevant to backend engineering work.",
                }
            )

    if {"Docker", "CI/CD", "AWS", "Cloud Deployment"} & resume_signals:
        if {"Docker", "CI/CD", "AWS", "Cloud Deployment"} & job_signals:
            strengths.append(
                {
                    "category": "Deployment and engineering workflow",
                    "evidence": "Docker, CI/CD, or deployment workflow experience is visible and relevant to this role.",
                }
            )

    if {"Unit Testing", "Integration Testing", "API Testing", "Automated Testing"} & resume_signals:
        if {"Unit Testing", "Integration Testing", "API Testing", "Automated Testing"} & job_signals:
            strengths.append(
                {
                    "category": "Testing mindset",
                    "evidence": "Your resume shows testing or automated validation, which supports backend reliability.",
                }
            )

    if {"LLMs", "AI APIs"} & resume_signals:
        if {"LLMs", "AI APIs"} & job_signals:
            strengths.append(
                {
                    "category": "AI/project differentiation",
                    "evidence": "Your AI-related project work can help differentiate you if explained with practical backend impact.",
                }
            )

    if not strengths:
        strengths.append(
            {
                "category": "Relevant technical foundation",
                "evidence": "Your resume has some relevant technical overlap, but the strongest proof should be made more explicit.",
            }
        )

    return strengths


def build_resume_gaps(
    resume_text: str,
    job_text: str,
    resume_signals: set[str],
    job_signals: set[str],
) -> list[dict]:
    gaps = []

    performance_job_signals = {
        "Redis",
        "Caching",
        "Pagination",
        "Performance Optimization",
        "Database Indexing",
        "Rate Limiting",
    }
    performance_resume_signals = performance_job_signals & resume_signals

    if performance_job_signals & job_signals and not performance_resume_signals:
        gaps.append(
            {
                "category": "Caching & backend performance",
                "severity": "high",
                "problem": "The job description asks for caching, indexing, pagination, or performance optimization, but your resume does not clearly show backend performance evidence.",
                "suggestion": "Add a real project enhancement such as Redis caching, indexed PostgreSQL queries, pagination, or response-time measurement.",
                "example_bullet": "Implemented Redis caching and indexed PostgreSQL queries for frequently accessed API endpoints, reducing repeated database reads and improving response efficiency.",
            }
        )

    distributed_job_signals = {
        "Distributed Systems",
        "Message Queues",
        "Background Jobs",
        "Retries",
        "Idempotency",
        "Fault Tolerance",
        "Eventual Consistency",
        "Service Boundaries",
    }
    distributed_resume_signals = distributed_job_signals & resume_signals

    if distributed_job_signals & job_signals and not distributed_resume_signals:
        gaps.append(
            {
                "category": "Distributed systems evidence",
                "severity": "high",
                "problem": "The job mentions queues, retries, background jobs, idempotency, rate limiting, or fault tolerance, but your resume mostly shows application/API work without distributed-system patterns.",
                "suggestion": "Add a practical feature that shows background processing, retry handling, queue-based workflows, or service-boundary thinking.",
                "example_bullet": "Designed background processing workflows with retry handling and structured failure logging to improve backend reliability.",
            }
        )

    cloud_job_signals = {"AWS", "GCP", "Azure", "Cloud Deployment"}
    cloud_resume_signals = cloud_job_signals & resume_signals

    if cloud_job_signals & job_signals and not cloud_resume_signals:
        gaps.append(
            {
                "category": "Cloud deployment proof",
                "severity": "medium",
                "problem": "The role values cloud or cloud-native development, but your resume does not clearly show deployment readiness or cloud-based backend work.",
                "suggestion": "Show Docker, environment variables, CI/CD, AWS deployment, health checks, or production-style configuration if you have done it.",
                "example_bullet": "Containerized FastAPI services with Docker and configured environment-based settings for local and cloud-ready deployment workflows.",
            }
        )
    elif cloud_job_signals & job_signals and cloud_resume_signals:
        gaps.append(
            {
                "category": "Cloud deployment proof",
                "severity": "low",
                "problem": "Cloud/Docker terms appear in your resume, but the impact could be clearer.",
                "suggestion": "Make the deployment workflow concrete by naming what you deployed, how it runs, and how reliability is checked.",
                "example_bullet": "Configured Docker-based backend services with health checks and CI/CD workflow support for repeatable deployment.",
            }
        )

    observability_job_signals = {
        "Observability",
        "Structured Logging",
        "Tracing",
        "Metrics",
        "Monitoring",
        "Dashboards",
        "Error Monitoring",
        "Root Cause Analysis",
    }
    observability_resume_signals = observability_job_signals & resume_signals

    if observability_job_signals & job_signals and not observability_resume_signals:
        gaps.append(
            {
                "category": "Observability and reliability",
                "severity": "medium",
                "problem": "The job mentions logs, tracing, metrics, monitoring, or error analysis, but the resume does not clearly highlight observability evidence.",
                "suggestion": "If you built Logsmith or similar tooling, explicitly mention structured logs, trace grouping, failure detection, or incident analysis.",
                "example_bullet": "Built structured log ingestion and trace grouping workflows to help identify failures and analyze backend incidents faster.",
            }
        )

    security_job_signals = {"Security", "Authentication", "Authorization", "JWT"}
    security_resume_signals = security_job_signals & resume_signals

    if security_job_signals & job_signals and not security_resume_signals:
        gaps.append(
            {
                "category": "Security and authentication",
                "severity": "medium",
                "problem": "The job values secure backend practices, but your resume does not clearly show authentication, authorization, or secure API handling.",
                "suggestion": "Highlight JWT auth, protected routes, input validation, or role-based access if you have built those features.",
                "example_bullet": "Implemented JWT-based authentication and protected user-specific API routes to isolate private resume, job, and application data.",
            }
        )

    has_metric = bool(
        re.search(
            r"\b\d+%|\b\d+\+|\b\d+x\b|\b\d+\s*(ms|seconds|minutes|users|requests|records)\b",
            resume_text.lower(),
        )
    )

    if not has_metric:
        gaps.append(
            {
                "category": "Measurable impact",
                "severity": "medium",
                "problem": "Your resume could be stronger if project bullets included measured impact such as latency, query speed, test coverage, records processed, or time saved.",
                "suggestion": "Measure one backend improvement before adding numbers. Do not invent metrics.",
                "example_bullet": "Reduced repeated database reads by [X%] after adding caching for frequently requested API responses.",
            }
        )

    return gaps[:6]


def build_priority_actions(gaps: list[dict]) -> list[str]:
    actions = []

    for gap in gaps[:4]:
        if gap["category"] == "Caching & backend performance":
            actions.append("Add one backend performance project enhancement, such as Redis caching or PostgreSQL indexing.")
        elif gap["category"] == "Distributed systems evidence":
            actions.append("Build or document one distributed-systems pattern: background jobs, retries, queues, or rate limiting.")
        elif gap["category"] == "Cloud deployment proof":
            actions.append("Make deployment proof concrete by showing Docker, CI/CD, health checks, or AWS/cloud workflow details.")
        elif gap["category"] == "Observability and reliability":
            actions.append("Highlight Logsmith-style observability work: structured logging, trace grouping, failure detection, or incident analysis.")
        elif gap["category"] == "Security and authentication":
            actions.append("Mention authentication, protected routes, validation, or secure API design where truthful.")
        elif gap["category"] == "Measurable impact":
            actions.append("Measure one project improvement and convert it into a truthful resume metric.")

    if not actions:
        actions.append("Your resume has good alignment. Improve clarity by making project impact and role-specific evidence more explicit.")

    actions.append("Keep raw keywords natural; do not keyword-stuff or add skills you cannot explain.")

    return actions[:6]


def build_summary(score: int, strengths: list[dict], gaps: list[dict]) -> str:
    strength_names = [strength["category"] for strength in strengths[:2]]
    gap_names = [gap["category"] for gap in gaps[:3]]

    if not gap_names:
        return (
            "Your resume has strong alignment for this role. Focus on sharpening project impact, measurable results, and interview-ready explanations."
        )

    if score >= 80:
        return (
            "Your resume has strong alignment for this role, especially around "
            f"{', '.join(strength_names).lower()}. The main improvements are to make "
            f"{', '.join(gap_names).lower()} more concrete."
        )

    if score >= 60:
        return (
            "Your resume has a good foundation for this role, but the job description expects clearer evidence of "
            f"{', '.join(gap_names).lower()}. Strengthen your project bullets with specific backend proof."
        )

    return (
        "Your resume needs stronger alignment with this job description. Focus first on the highest-priority gaps: "
        f"{', '.join(gap_names).lower()}."
    )


def build_recommendations(gaps: list[dict], score: int) -> list[str]:
    recommendations = []

    if score >= 80:
        recommendations.append("Strong match overall. Focus on sharpening proof, not adding random keywords.")
    elif score >= 60:
        recommendations.append("Good foundation. Tailor project bullets to show the exact backend evidence this role asks for.")
    else:
        recommendations.append("Improve alignment by addressing the top resume gaps before applying.")

    for gap in gaps[:4]:
        recommendations.append(f"{gap['category']}: {gap['suggestion']}")

    recommendations.append("Only add skills, tools, metrics, and claims that are truthful and interview-ready.")

    return recommendations[:8]


def calculate_ats_score(
    resume_text: str,
    job_description_text: str,
    industry: str = "general",
) -> dict:
    if not job_description_text.strip():
        return {
            "ats_score": 0,
            "match_level": "Needs job description",
            "summary": "Job description is empty or could not be parsed.",
            "breakdown": {
                "skills_match": 0,
                "keyword_match": 0,
                "industry_alignment": 0,
                "experience_alignment": 0,
                "formatting": 0,
                "measurable_impact": 0,
            },
            "matching_skills": [],
            "missing_skills": [],
            "matched_keywords": [],
            "missing_keywords": [],
            "strengths": [],
            "resume_gaps": [],
            "priority_actions": [],
            "suggested_bullets": [],
            "keyword_details": {
                "matched": [],
                "missing": [],
                "note": "No job description was provided.",
            },
            "recommendations": ["Job description is empty or could not be parsed."],
        }

    resume_skills = extract_skills(resume_text, industry)
    job_skills = extract_skills(job_description_text, industry)

    resume_signals = extract_signals_from_text(resume_text)
    job_signals = extract_signals_from_text(job_description_text)

    matched_signals = sorted(resume_signals.intersection(job_signals))
    missing_signals = filter_missing_signals(
        missing_signals=job_signals.difference(resume_signals),
        resume_signals=resume_signals,
    )

    matching_skills = sorted(resume_skills.intersection(job_skills))
    raw_missing_skills = sorted(job_skills.difference(resume_skills))

    filtered_missing_skills = []

    for skill in raw_missing_skills:
        formatted = format_skill(skill)

        if formatted in LOW_PRIORITY_MISSING_SIGNALS:
            continue

        alternatives = ALTERNATIVE_SIGNAL_COVERAGE.get(formatted, [])

        if any(alternative in resume_signals for alternative in alternatives):
            continue

        filtered_missing_skills.append(skill)

    skills_score = (
        round((len(matching_skills) / len(job_skills)) * 35)
        if job_skills
        else 10
    )

    keyword_score = (
        round((len(matched_signals) / len(job_signals)) * 25)
        if job_signals
        else 5
    )

    strengths = build_strengths(
        resume_signals=resume_signals,
        job_signals=job_signals,
    )

    gaps = build_resume_gaps(
        resume_text=resume_text,
        job_text=job_description_text,
        resume_signals=resume_signals,
        job_signals=job_signals,
    )

    industry_score = min(15, len(strengths) * 3)

    resume_lower = resume_text.lower()
    experience_terms = [
        "developed",
        "built",
        "implemented",
        "designed",
        "deployed",
        "optimized",
        "managed",
        "led",
        "trained",
        "analyzed",
        "project",
        "created",
        "automated",
    ]
    experience_matches = sum(1 for term in experience_terms if term in resume_lower)
    experience_score = min(15, experience_matches * 2)

    formatting_score = 5

    has_metric = any(char.isdigit() for char in resume_text)
    impact_score = 5 if has_metric else 2

    total_score = min(
        skills_score
        + keyword_score
        + industry_score
        + experience_score
        + formatting_score
        + impact_score,
        100,
    )

    formatted_matching_skills = [format_skill(skill) for skill in matching_skills]
    formatted_missing_skills = [format_skill(skill) for skill in filtered_missing_skills]

    suggested_bullets = [
        {
            "category": gap["category"],
            "bullet": gap["example_bullet"],
            "why_it_helps": gap["problem"],
        }
        for gap in gaps[:4]
    ]

    priority_actions = build_priority_actions(gaps=gaps)
    summary = build_summary(score=total_score, strengths=strengths, gaps=gaps)

    return {
        "ats_score": total_score,
        "match_level": calculate_match_level(total_score),
        "summary": summary,
        "breakdown": {
            "skills_match": skills_score,
            "keyword_match": keyword_score,
            "industry_alignment": industry_score,
            "experience_alignment": experience_score,
            "formatting": formatting_score,
            "measurable_impact": impact_score,
        },
        "matching_skills": formatted_matching_skills,
        "missing_skills": formatted_missing_skills,
        "matched_keywords": matched_signals[:20],
        "missing_keywords": missing_signals[:20],
        "strengths": strengths,
        "resume_gaps": gaps,
        "priority_actions": priority_actions,
        "suggested_bullets": suggested_bullets,
        "keyword_details": {
            "matched": matched_signals[:20],
            "missing": missing_signals[:20],
            "note": "Keyword signals are filtered to show meaningful role requirements, not random words from the job description.",
        },
        "recommendations": build_recommendations(gaps=gaps, score=total_score),
    }


# ---------------------------------------------------------------------
# Product-quality ATS scoring override
# This final version keeps keyword details focused and actionable.
# It intentionally avoids showing long keyword shopping lists.
# ---------------------------------------------------------------------

MATCHED_SIGNAL_PRIORITY = [
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "FastAPI",
    "Node.js",
    "React",
    "Next.js",
    "REST APIs",
    "PostgreSQL",
    "MySQL",
    "SQL",
    "Docker",
    "CI/CD",
    "AWS",
    "Git",
    "Automated Testing",
    "Data Structures",
    "Algorithms",
    "System Design",
    "LLMs",
    "AI APIs",
]

MISSING_SIGNAL_PRIORITY = [
    "Redis",
    "Caching",
    "Database Indexing",
    "Pagination",
    "Performance Optimization",
    "Message Queues",
    "Background Jobs",
    "Retries",
    "Rate Limiting",
    "Idempotency",
    "Distributed Systems",
    "Observability",
    "Structured Logging",
    "Monitoring",
    "Metrics",
    "Tracing",
    "Authentication",
    "Authorization",
    "Security",
    "JWT",
]

DO_NOT_SHOW_MISSING_SIGNALS = {
    "HTTP/JSON",
    "Code Reviews",
    "Documentation",
    "Object-Oriented Programming",
    "Cloud Deployment",
    "AWS",
    "GCP",
    "Azure",
    "Django",
    "Flask",
    "Spring Boot",
    "MySQL",
    "SQL",
    "Java",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Git",
    "Data Structures",
    "Algorithms",
    "System Design",
    "Error Monitoring",
    "Dashboards",
    "Eventual Consistency",
    "Fault Tolerance",
    "Service Boundaries",
    "Root Cause Analysis",
    "Database Schema Design",
    "API Testing",
    "Unit Testing",
    "Integration Testing",
}

DUPLICATE_SIGNAL_GROUPS = [
    ["Redis", "Caching"],
    ["Database Indexing", "Query Optimization", "Performance Optimization"],
    ["Message Queues", "Background Jobs"],
    ["Observability", "Structured Logging", "Monitoring", "Metrics", "Tracing"],
    ["Authentication", "Authorization", "Security", "JWT"],
]


def calculate_match_level(score: int) -> str:
    if score >= 85:
        return "Excellent match"
    if score >= 80:
        return "Strong match"
    if score >= 65:
        return "Good foundation"
    return "Needs stronger alignment"


def pick_ordered_signals(
    signals: set[str],
    priority_order: list[str],
    limit: int,
) -> list[str]:
    ordered = [signal for signal in priority_order if signal in signals]

    remaining = sorted(signal for signal in signals if signal not in ordered)

    return (ordered + remaining)[:limit]


def reduce_duplicate_missing_signals(missing_signals: list[str]) -> list[str]:
    selected = []
    used = set()

    for group in DUPLICATE_SIGNAL_GROUPS:
        group_matches = [signal for signal in missing_signals if signal in group]

        if group_matches:
            selected.append(group_matches[0])
            used.update(group_matches)

    for signal in missing_signals:
        if signal not in used:
            selected.append(signal)

    return selected


def build_keyword_details(
    resume_signals: set[str],
    job_signals: set[str],
    gaps: list[dict],
) -> dict:
    matched_signals = resume_signals.intersection(job_signals)
    missing_signals = job_signals.difference(resume_signals)

    filtered_missing = []

    for signal in missing_signals:
        if signal in DO_NOT_SHOW_MISSING_SIGNALS:
            continue

        alternatives = ALTERNATIVE_SIGNAL_COVERAGE.get(signal, [])

        if any(alternative in resume_signals for alternative in alternatives):
            continue

        filtered_missing.append(signal)

    ordered_matched = pick_ordered_signals(
        signals=matched_signals,
        priority_order=MATCHED_SIGNAL_PRIORITY,
        limit=12,
    )

    ordered_missing = pick_ordered_signals(
        signals=set(filtered_missing),
        priority_order=MISSING_SIGNAL_PRIORITY,
        limit=14,
    )

    ordered_missing = reduce_duplicate_missing_signals(ordered_missing)

    gap_categories = {gap["category"] for gap in gaps}

    final_missing = []

    for signal in ordered_missing:
        if signal in {"Redis", "Caching", "Database Indexing", "Pagination", "Performance Optimization"}:
            if "Caching & backend performance" in gap_categories:
                final_missing.append(signal)
        elif signal in {"Message Queues", "Background Jobs", "Retries", "Rate Limiting", "Idempotency", "Distributed Systems"}:
            if "Distributed systems evidence" in gap_categories:
                final_missing.append(signal)
        elif signal in {"Observability", "Structured Logging", "Monitoring", "Metrics", "Tracing"}:
            if "Observability and reliability" in gap_categories:
                final_missing.append(signal)
        elif signal in {"Authentication", "Authorization", "Security", "JWT"}:
            if "Security and authentication" in gap_categories:
                final_missing.append(signal)
        else:
            final_missing.append(signal)

    return {
        "matched": ordered_matched[:12],
        "missing": final_missing[:8],
        "note": "Keyword signals are prioritized. CareerCopilot only shows important, actionable gaps instead of every word from the job description.",
    }


def build_summary(score: int, strengths: list[dict], gaps: list[dict]) -> str:
    gap_names = [gap["category"] for gap in gaps[:3]]

    if not gap_names:
        return (
            "Your resume is well aligned for this role. The next improvement is to make project impact, measurable results, and interview-ready proof more specific."
        )

    if score >= 85:
        return (
            "Your resume is an excellent match overall. The remaining improvements are mainly polish: make "
            f"{', '.join(gap_names).lower()} more specific and measurable."
        )

    if score >= 80:
        return (
            "Your resume is a strong match for this role. To become more competitive, strengthen evidence of "
            f"{', '.join(gap_names).lower()}."
        )

    if score >= 65:
        return (
            "Your resume has a good foundation for this role, but it needs clearer proof of "
            f"{', '.join(gap_names).lower()}. Focus on concrete backend project evidence rather than adding random keywords."
        )

    return (
        "Your resume needs stronger alignment with this job description. Start by fixing the highest-priority gaps: "
        f"{', '.join(gap_names).lower()}."
    )


def calculate_ats_score(
    resume_text: str,
    job_description_text: str,
    industry: str = "general",
) -> dict:
    if not job_description_text.strip():
        return {
            "ats_score": 0,
            "match_level": "Needs job description",
            "summary": "Job description is empty or could not be parsed.",
            "breakdown": {
                "skills_match": 0,
                "keyword_match": 0,
                "industry_alignment": 0,
                "experience_alignment": 0,
                "formatting": 0,
                "measurable_impact": 0,
            },
            "matching_skills": [],
            "missing_skills": [],
            "matched_keywords": [],
            "missing_keywords": [],
            "strengths": [],
            "resume_gaps": [],
            "priority_actions": [],
            "suggested_bullets": [],
            "keyword_details": {
                "matched": [],
                "missing": [],
                "note": "No job description was provided.",
            },
            "recommendations": ["Job description is empty or could not be parsed."],
        }

    resume_skills = extract_skills(resume_text, industry)
    job_skills = extract_skills(job_description_text, industry)

    resume_signals = extract_signals_from_text(resume_text)
    job_signals = extract_signals_from_text(job_description_text)

    matching_skills = sorted(resume_skills.intersection(job_skills))
    raw_missing_skills = sorted(job_skills.difference(resume_skills))

    filtered_missing_skills = []

    for skill in raw_missing_skills:
        formatted = format_skill(skill)

        if formatted in LOW_PRIORITY_MISSING_SIGNALS:
            continue

        alternatives = ALTERNATIVE_SIGNAL_COVERAGE.get(formatted, [])

        if any(alternative in resume_signals for alternative in alternatives):
            continue

        filtered_missing_skills.append(skill)

    matched_signal_count = len(resume_signals.intersection(job_signals))
    total_job_signal_count = len(job_signals)

    skills_score = (
        round((len(matching_skills) / len(job_skills)) * 35)
        if job_skills
        else 10
    )

    keyword_score = (
        round((matched_signal_count / total_job_signal_count) * 25)
        if total_job_signal_count
        else 5
    )

    strengths = build_strengths(
        resume_signals=resume_signals,
        job_signals=job_signals,
    )

    gaps = build_resume_gaps(
        resume_text=resume_text,
        job_text=job_description_text,
        resume_signals=resume_signals,
        job_signals=job_signals,
    )

    industry_score = min(15, len(strengths) * 3)

    resume_lower = resume_text.lower()
    experience_terms = [
        "developed",
        "built",
        "implemented",
        "designed",
        "deployed",
        "optimized",
        "managed",
        "led",
        "trained",
        "analyzed",
        "project",
        "created",
        "automated",
    ]
    experience_matches = sum(1 for term in experience_terms if term in resume_lower)
    experience_score = min(15, experience_matches * 2)

    formatting_score = 5

    has_metric = any(char.isdigit() for char in resume_text)
    impact_score = 5 if has_metric else 2

    total_score = min(
        skills_score
        + keyword_score
        + industry_score
        + experience_score
        + formatting_score
        + impact_score,
        100,
    )

    keyword_details = build_keyword_details(
        resume_signals=resume_signals,
        job_signals=job_signals,
        gaps=gaps,
    )

    formatted_matching_skills = [format_skill(skill) for skill in matching_skills]
    formatted_missing_skills = [format_skill(skill) for skill in filtered_missing_skills]

    suggested_bullets = [
        {
            "category": gap["category"],
            "bullet": gap["example_bullet"],
            "why_it_helps": gap["problem"],
        }
        for gap in gaps[:4]
    ]

    priority_actions = build_priority_actions(gaps=gaps)
    summary = build_summary(score=total_score, strengths=strengths, gaps=gaps)

    return {
        "ats_score": total_score,
        "match_level": calculate_match_level(total_score),
        "summary": summary,
        "breakdown": {
            "skills_match": skills_score,
            "keyword_match": keyword_score,
            "industry_alignment": industry_score,
            "experience_alignment": experience_score,
            "formatting": formatting_score,
            "measurable_impact": impact_score,
        },
        "matching_skills": formatted_matching_skills,
        "missing_skills": formatted_missing_skills,
        "matched_keywords": keyword_details["matched"],
        "missing_keywords": keyword_details["missing"],
        "strengths": strengths,
        "resume_gaps": gaps,
        "priority_actions": priority_actions,
        "suggested_bullets": suggested_bullets,
        "keyword_details": keyword_details,
        "recommendations": build_recommendations(gaps=gaps, score=total_score),
    }
