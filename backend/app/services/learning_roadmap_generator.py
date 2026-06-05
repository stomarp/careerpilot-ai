import json
import re

from google import genai

from app.core.config import settings


ROLE_DEFAULT_SKILLS = {
    "backend_engineer": [
        "RESTful API Design",
        "Backend Performance",
        "Caching",
        "Database Indexing",
        "Distributed Systems",
        "System Design",
        "Testing",
        "Collaboration",
    ],
    "software_engineer": [
        "Data Structures",
        "Algorithms",
        "OOP",
        "Testing",
        "System Design",
        "Clean Code",
        "Collaboration",
    ],
    "ai_engineer": [
        "LLMs",
        "RAG",
        "Embeddings",
        "Vector Databases",
        "Evaluation",
        "Prompt Engineering",
        "AI System Design",
    ],
    "data_analyst": [
        "SQL",
        "Dashboards",
        "Business Metrics",
        "Data Cleaning",
        "Excel",
        "Data Storytelling",
    ],
    "teacher": [
        "Classroom Management",
        "Lesson Planning",
        "Student Assessment",
        "Differentiated Instruction",
        "Parent Communication",
    ],
    "hr": [
        "Recruiting",
        "Onboarding",
        "Employee Relations",
        "Compliance",
        "HR Documentation",
    ],
    "marketing": [
        "SEO",
        "Campaign Strategy",
        "Google Analytics",
        "A/B Testing",
        "Content Strategy",
    ],
    "finance": [
        "Financial Modeling",
        "Budgeting",
        "Forecasting",
        "Risk Analysis",
        "Reporting",
    ],
    "general": [
        "Communication",
        "Problem Solving",
        "Project Management",
        "Documentation",
        "Stakeholder Management",
    ],
}


ROLE_GAP_GROUPS = {
    "backend_engineer": [
        {
            "category": "API & Backend Fundamentals",
            "keywords": [
                "RESTful API Design",
                "RESTful",
                "Backend Frameworks",
                "Spring Boot",
                "FastAPI",
                "Frameworks",
            ],
        },
        {
            "category": "Backend Performance",
            "keywords": [
                "Caching",
                "Database Indexing",
                "Backend Performance",
                "Redis",
                "Performance",
                "Latency",
            ],
        },
        {
            "category": "Scalable System Design",
            "keywords": [
                "Distributed Systems",
                "Scalable System Design",
                "System Design",
                "Message Queues",
                "Scalability",
                "Large-scale",
            ],
        },
        {
            "category": "Testing & Reliability",
            "keywords": [
                "Testing",
                "Reliability Engineering",
                "Maintainable Code",
                "CI/CD",
            ],
        },
        {
            "category": "Collaboration & Interview Readiness",
            "keywords": [
                "Collaboration",
                "Communication",
                "Behavioral Prep",
            ],
        },
    ],
    "software_engineer": [
        {
            "category": "Computer Science Fundamentals",
            "keywords": ["Data Structures", "Algorithms", "OOP"],
        },
        {
            "category": "Engineering Quality",
            "keywords": ["Testing", "Clean Code", "Maintainable Code"],
        },
        {
            "category": "System Design Readiness",
            "keywords": ["System Design", "Scalability"],
        },
        {
            "category": "Collaboration & Interview Readiness",
            "keywords": ["Collaboration", "Communication", "Behavioral Prep"],
        },
    ],
    "ai_engineer": [
        {
            "category": "AI/LLM Fundamentals",
            "keywords": ["LLMs", "Prompt Engineering", "Evaluation"],
        },
        {
            "category": "Retrieval & Knowledge Systems",
            "keywords": ["RAG", "Embeddings", "Vector Databases"],
        },
        {
            "category": "AI Product Engineering",
            "keywords": ["AI System Design", "FastAPI", "APIs"],
        },
    ],
    "data_analyst": [
        {
            "category": "Data Analysis Fundamentals",
            "keywords": ["SQL", "Excel", "Data Cleaning"],
        },
        {
            "category": "Business Intelligence",
            "keywords": ["Dashboards", "Business Metrics", "Reporting"],
        },
        {
            "category": "Stakeholder Communication",
            "keywords": ["Data Storytelling", "Communication"],
        },
    ],
    "teacher": [
        {
            "category": "Classroom Practice",
            "keywords": ["Classroom Management", "Differentiated Instruction"],
        },
        {
            "category": "Instructional Planning",
            "keywords": ["Lesson Planning", "Curriculum Development"],
        },
        {
            "category": "Assessment & Student Support",
            "keywords": ["Student Assessment", "Feedback"],
        },
        {
            "category": "Family Communication",
            "keywords": ["Parent Communication", "Communication"],
        },
    ],
    "hr": [
        {
            "category": "Talent & Recruiting",
            "keywords": ["Recruiting", "Screening", "Onboarding"],
        },
        {
            "category": "People Operations",
            "keywords": ["Employee Relations", "HR Documentation"],
        },
        {
            "category": "Compliance & Policy",
            "keywords": ["Compliance", "Policy"],
        },
    ],
    "marketing": [
        {
            "category": "Campaign Strategy",
            "keywords": ["Campaign Strategy", "Content Strategy"],
        },
        {
            "category": "Performance Marketing",
            "keywords": ["SEO", "Google Analytics", "A/B Testing"],
        },
        {
            "category": "Brand & Messaging",
            "keywords": ["Brand Positioning", "Social Media"],
        },
    ],
    "finance": [
        {
            "category": "Financial Analysis",
            "keywords": ["Financial Modeling", "Excel", "Reporting"],
        },
        {
            "category": "Planning & Forecasting",
            "keywords": ["Budgeting", "Forecasting"],
        },
        {
            "category": "Risk & Controls",
            "keywords": ["Risk Analysis", "Compliance"],
        },
    ],
    "general": [
        {
            "category": "Role Fundamentals",
            "keywords": ["Communication", "Problem Solving"],
        },
        {
            "category": "Execution Skills",
            "keywords": ["Project Management", "Documentation"],
        },
    ],
}


ROLE_DAILY_THEMES = {
    "backend_engineer": [
        "Backend API Readiness",
        "Database Performance Foundations",
        "Caching for Backend Performance",
        "Scalable System Design Basics",
        "Testing & Reliability",
        "Portfolio Documentation",
        "Interview Practice & Review",
    ],
    "software_engineer": [
        "Programming Fundamentals",
        "Data Structures Practice",
        "Algorithms Practice",
        "Clean Code & OOP",
        "Testing Basics",
        "Project Documentation",
        "Interview Practice & Review",
    ],
    "ai_engineer": [
        "LLM Fundamentals",
        "Prompting & Evaluation",
        "RAG Foundations",
        "Embeddings & Vector Search",
        "AI System Design",
        "Portfolio Documentation",
        "Interview Practice & Review",
    ],
    "data_analyst": [
        "SQL Practice",
        "Data Cleaning",
        "Dashboard Thinking",
        "Business Metrics",
        "Stakeholder Communication",
        "Portfolio Case Study",
        "Interview Practice & Review",
    ],
    "teacher": [
        "Classroom Management Foundations",
        "Lesson Planning",
        "Student Assessment",
        "Differentiated Instruction",
        "Parent Communication",
        "Teaching Portfolio Evidence",
        "Interview Practice & Review",
    ],
    "hr": [
        "Recruiting Foundations",
        "Onboarding Practice",
        "Employee Relations Scenarios",
        "Compliance & Policy",
        "Documentation Practice",
        "People Operations Case Study",
        "Interview Practice & Review",
    ],
    "marketing": [
        "Campaign Strategy",
        "Audience & Positioning",
        "SEO & Content",
        "Analytics & Metrics",
        "A/B Testing Basics",
        "Portfolio Case Study",
        "Interview Practice & Review",
    ],
    "finance": [
        "Financial Analysis",
        "Excel & Modeling",
        "Budgeting & Forecasting",
        "Risk & Controls",
        "Reporting",
        "Portfolio Case Study",
        "Interview Practice & Review",
    ],
    "general": [
        "Role Fundamentals",
        "Core Skills Practice",
        "Scenario Practice",
        "Communication Practice",
        "Portfolio Evidence",
        "Resume Alignment",
        "Interview Practice & Review",
    ],
}


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
            f"AI learning roadmap response was not valid JSON: {cleaned[:500]}"
        ) from exc


def sanitize_metric_claims(text: str) -> str:
    if not text:
        return text

    cleaned = text
    cleaned = re.sub(r"\b\d+%\b", "[X%]", cleaned)
    cleaned = re.sub(r"\b\d+\s?ms\b", "[Y ms]", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\b\d+x\b", "[Xx]", cleaned, flags=re.IGNORECASE)

    return cleaned


def sanitize_ai_result(ai_result: dict) -> dict:
    for project in ai_result.get("mini_projects", []):
        bullets = project.get("resume_bullet_templates", [])

        if isinstance(bullets, list):
            project["resume_bullet_templates"] = [
                sanitize_metric_claims(bullet) for bullet in bullets
            ]

        if "resume_bullet" in project:
            project["resume_bullet"] = sanitize_metric_claims(project["resume_bullet"])

    ai_result["resume_actions"] = [
        sanitize_metric_claims(action)
        for action in ai_result.get("resume_actions", [])
    ]

    return ai_result


def get_missing_items_from_report(analysis_report) -> list[str]:
    missing_items = []

    if not analysis_report:
        return missing_items

    if analysis_report.missing_skills:
        missing_items.extend(analysis_report.missing_skills)

    if analysis_report.missing_keywords:
        missing_items.extend(analysis_report.missing_keywords[:10])

    seen = set()
    unique_items = []

    for item in missing_items:
        normalized = str(item).strip()
        key = normalized.lower()

        if normalized and key not in seen:
            unique_items.append(normalized)
            seen.add(key)

    return unique_items


def normalize_missing_items(role_type: str, missing_items: list[str]) -> list[str]:
    normalized_map = {
        "distributed": "Distributed Systems",
        "large-scale": "Scalable System Design",
        "restful": "RESTful API Design",
        "frameworks": "Backend Frameworks",
        "framework": "Backend Frameworks",
        "collaboration": "Collaboration",
        "a/b": "A/B Testing",
        "a/b testing": "A/B Testing",
        "tests": "Testing",
        "reliable": "Reliability Engineering",
        "maintainable": "Maintainable Code",
        "caching": "Caching",
        "spring boot": "Spring Boot",
    }

    weak_items = {
        "code",
        "requirements",
        "years",
        "proficiency",
        "online",
        "stacks",
        "developer",
        "processes",
        "features",
        "responsibilities",
    }

    cleaned_items = []

    for item in missing_items:
        raw = str(item).strip()
        key = raw.lower()

        if not raw or key in weak_items:
            continue

        cleaned = normalized_map.get(key, raw)

        if cleaned not in cleaned_items:
            cleaned_items.append(cleaned)

    role_defaults = ROLE_DEFAULT_SKILLS.get(role_type, ROLE_DEFAULT_SKILLS["general"])

    for skill in role_defaults:
        if skill not in cleaned_items and len(cleaned_items) < 8:
            cleaned_items.append(skill)

    return cleaned_items[:8]


def build_context_text(application, analysis_report) -> str:
    context_parts = []

    if application:
        context_parts.append(
            f"""
Application Context:
Company: {application.company_name}
Role: {application.role_title}
Status: {application.status}
ATS Score: {application.ats_score}
Notes: {application.notes}
Next Action: {application.next_action}
"""
        )

    if analysis_report:
        context_parts.append(
            f"""
Analysis Report Context:
Title: {analysis_report.title}
Report Type: {analysis_report.report_type}
ATS Score: {analysis_report.ats_score}
Summary: {analysis_report.summary}
Missing Skills: {analysis_report.missing_skills}
Missing Keywords: {analysis_report.missing_keywords}
Recommendations: {analysis_report.recommendations}
Raw Report: {analysis_report.raw_report_json}
"""
        )

    return "\n\n".join(context_parts).strip()


def group_skill_gaps(role_type: str, missing_items: list[str]) -> list[dict]:
    groups = ROLE_GAP_GROUPS.get(role_type, ROLE_GAP_GROUPS["general"])
    missing_lower = [item.lower() for item in missing_items]

    result = []

    for group in groups:
        matched_skills = []

        for keyword in group["keywords"]:
            keyword_lower = keyword.lower()

            if (
                keyword_lower in missing_lower
                or any(keyword_lower in item for item in missing_lower)
                or keyword in ROLE_DEFAULT_SKILLS.get(role_type, [])
            ):
                matched_skills.append(keyword)

        if matched_skills:
            result.append(
                {
                    "category": group["category"],
                    "priority": "high" if len(result) < 2 else "medium",
                    "skills": list(dict.fromkeys(matched_skills)),
                    "why_it_matters": (
                        f"This area is important for {role_type.replace('_', ' ')} "
                        "roles and helps connect skill gaps with resume proof, "
                        "portfolio work, and interview readiness."
                    ),
                }
            )

    if not result:
        default_skills = ROLE_DEFAULT_SKILLS.get(role_type, ROLE_DEFAULT_SKILLS["general"])
        result.append(
            {
                "category": "Role Readiness",
                "priority": "high",
                "skills": default_skills[:5],
                "why_it_matters": (
                    "These are core skills for the target role and should be "
                    "strengthened through practice and portfolio evidence."
                ),
            }
        )

    return result


def build_rule_based_roadmap(
    target_role: str,
    role_type: str,
    industry: str,
    experience_level: str,
    timeline_days: int,
    missing_items: list[str],
    failure_reason: str,
) -> dict:
    default_skills = ROLE_DEFAULT_SKILLS.get(role_type, ROLE_DEFAULT_SKILLS["general"])
    focus_skills = missing_items[:6] if missing_items else default_skills[:6]
    daily_themes = ROLE_DAILY_THEMES.get(role_type, ROLE_DAILY_THEMES["general"])
    skill_gap_summary = group_skill_gaps(role_type, focus_skills)

    priority_skills = [
        {
            "skill": skill,
            "priority": "high" if index < 3 else "medium",
            "reason": (
                f"{skill} is relevant for {target_role} and should be strengthened "
                "with hands-on practice, interview notes, and truthful resume evidence."
            ),
        }
        for index, skill in enumerate(focus_skills)
    ]

    weekly_plan = [
        {
            "week": 1,
            "theme": "Foundation & Gap Understanding",
            "goals": [
                "Understand the highest-priority skill gaps.",
                "Review role expectations and job description keywords.",
                "Create short notes for interview explanations.",
            ],
            "success_criteria": [
                "Can explain each priority skill in simple terms.",
                "Can identify where each skill fits into the target role.",
            ],
        },
        {
            "week": 2,
            "theme": "Hands-on Practice",
            "goals": [
                "Practice priority skills through small exercises.",
                "Build or update one project component.",
                "Document what was learned.",
            ],
            "success_criteria": [
                "Completed at least one hands-on exercise.",
                "Can explain the practical tradeoffs of the skill.",
            ],
        },
        {
            "week": 3,
            "theme": "Portfolio Evidence",
            "goals": [
                "Turn practice into portfolio evidence.",
                "Write resume-ready bullet templates with placeholders.",
                "Prepare project explanation for interviews.",
            ],
            "success_criteria": [
                "Project README or notes updated.",
                "Resume bullets drafted truthfully.",
            ],
        },
        {
            "week": 4,
            "theme": "Interview Readiness",
            "goals": [
                "Practice interview questions related to missing skills.",
                "Polish resume and LinkedIn language.",
                "Do a mock interview or self-recorded walkthrough.",
            ],
            "success_criteria": [
                "Can answer role-specific questions confidently.",
                "Has a clear action plan for remaining weak areas.",
            ],
        },
    ]

    roadmap = []

    for day in range(1, timeline_days + 1):
        week = min(((day - 1) // 7) + 1, 4)
        skill = focus_skills[(day - 1) % len(focus_skills)]
        theme = daily_themes[(day - 1) % len(daily_themes)]

        if week == 1:
            focus = f"{theme}: {skill}"
            tasks = [
                f"Study the core concept of {skill}.",
                f"Write 5 interview notes explaining {skill} in your own words.",
                "Connect the topic to the target job description and saved ATS report.",
            ]
            deliverable = f"One-page notes on {skill} with interview-ready explanations."
        elif week == 2:
            focus = f"{theme}: hands-on practice"
            tasks = [
                f"Complete one hands-on exercise related to {skill}.",
                "Document what worked, what was confusing, and what tradeoffs appeared.",
                "Write one interview-style explanation of the exercise.",
            ]
            deliverable = f"Small practical exercise showing {skill}."
        elif week == 3:
            focus = f"{theme}: portfolio proof"
            tasks = [
                f"Add or improve a project feature related to {skill}.",
                "Update README or project notes with design decisions and tradeoffs.",
                "Draft a truthful resume bullet with placeholders for measured impact.",
            ]
            deliverable = f"Project update and resume bullet draft for {skill}."
        else:
            focus = f"{theme}: interview readiness"
            tasks = [
                f"Practice 2 interview questions about {skill}.",
                "Explain one project using problem, architecture, tradeoff, and impact.",
                "Review weak points and update interview notes.",
            ]
            deliverable = f"Interview answer notes for {skill}."

        roadmap.append(
            {
                "day": day,
                "week": week,
                "focus": focus,
                "tasks": tasks,
                "deliverable": deliverable,
                "estimated_time": "60-90 minutes",
            }
        )

    mini_projects = [
        {
            "title": f"{target_role} Portfolio Upgrade",
            "difficulty": "medium",
            "description": (
                f"Enhance an existing project or build a focused project that demonstrates "
                f"{', '.join(focus_skills[:3])}."
            ),
            "why_it_matters": (
                "This converts learning into visible proof for resumes, interviews, "
                "and portfolio reviews."
            ),
            "skills_practiced": focus_skills[:3],
            "implementation_steps": [
                "Define a small real-world use case.",
                "Implement one focused feature.",
                "Add tests or validation where relevant.",
                "Document design decisions and tradeoffs.",
                "Measure performance or outcome if possible.",
            ],
            "resume_bullet_templates": [
                f"Built a {target_role.lower()} portfolio project demonstrating {', '.join(focus_skills[:3])}.",
                "Improved [system/process/outcome] by [X%] after implementing [specific improvement].",
            ],
        }
    ]

    return {
        "provider_used": "rule_based_fallback",
        "fallback_used": True,
        "overview": {
            "summary": f"This roadmap focuses on closing the most important gaps for a {target_role} role.",
            "readiness_level": "developing",
            "target_outcome": (
                "Build practical evidence, improve resume alignment, and prepare for interviews."
            ),
        },
        "skill_gap_summary": skill_gap_summary,
        "priority_skills": priority_skills,
        "weekly_plan": weekly_plan,
        "roadmap": roadmap,
        "mini_projects": mini_projects,
        "resume_actions": [
            "Add only truthful skills and project claims.",
            "Use placeholders for metrics until you measure real results.",
            "Update project bullets to show problem, action, technology, and result.",
            "Only add missing keywords after you can explain or demonstrate them.",
        ],
        "interview_prep_actions": [
            "Prepare project explanations using problem, architecture, tradeoff, and impact.",
            "Practice questions from the highest-priority skill gaps.",
            "Use STAR for behavioral answers.",
            "Create one answer story that connects learning progress to the target role.",
        ],
        "study_topics": focus_skills,
        "progress_checkpoints": [
            {
                "checkpoint_day": 7,
                "questions_to_answer": [
                    "Can I explain the top 3 skill gaps clearly?",
                    "Do I know how these skills apply to the target role?",
                ],
                "expected_output": "Clear notes and a prioritized learning plan.",
            },
            {
                "checkpoint_day": 14,
                "questions_to_answer": [
                    "Have I completed hands-on practice?",
                    "Can I explain tradeoffs and common mistakes?",
                ],
                "expected_output": "Practical exercise or project component.",
            },
            {
                "checkpoint_day": 30,
                "questions_to_answer": [
                    "Can I show this skill on my resume or GitHub?",
                    "Can I answer interview questions about it?",
                ],
                "expected_output": "Resume update, project proof, and interview notes.",
            },
        ],
        "final_advice": [
            f"AI provider was unavailable, so fallback roadmap was generated. Reason: {failure_reason}",
            "Focus on portfolio evidence, not just reading.",
            "Do not add exact metrics until you measure them.",
        ],
    }


def generate_learning_roadmap_with_ai(
    target_role: str,
    role_type: str,
    industry: str,
    experience_level: str,
    timeline_days: int,
    missing_items: list[str],
    context_text: str,
) -> dict:
    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing.")

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        default_skills = ROLE_DEFAULT_SKILLS.get(role_type, ROLE_DEFAULT_SKILLS["general"])
        gap_groups = group_skill_gaps(role_type, missing_items)

        prompt = f"""
You are an expert career coach and product-level learning roadmap planner.

Generate a polished career-platform style learning roadmap.

Important rules:
- Support all professions, not only technology.
- Do not make the roadmap feel like raw keyword output.
- Group related missing skills into professional categories.
- For backend roles, use categories like API & Backend Fundamentals, Backend Performance, Scalable System Design, Testing & Reliability, Portfolio Proof, Interview Readiness.
- For non-tech roles, create equivalent professional categories.
- Do NOT invent exact metrics, percentages, salaries, company facts, or outcomes.
- If resume bullets need metrics, use placeholders like [X%], [Y ms], [number of users], or say "measure and add result".
- Do NOT tell the user to add a skill to the resume unless they build, practice, or can explain it truthfully.
- Make the roadmap practical, portfolio-oriented, and interview-oriented.
- Include weekly plan, daily roadmap, mini projects, resume actions, interview actions, and progress checkpoints.
- Keep tasks realistic for the timeline.
- Return ONLY valid JSON.
- Do not include markdown fences.

Target role:
{target_role}

Role type:
{role_type}

Industry:
{industry}

Experience level:
{experience_level}

Timeline days:
{timeline_days}

Missing skills / keywords:
{missing_items}

Default role skills:
{default_skills}

Suggested skill gap groups:
{gap_groups}

Context:
{context_text[:10000]}

Return JSON with this exact structure:
{{
  "overview": {{
    "summary": "string",
    "readiness_level": "beginner | developing | interview_ready | advanced",
    "target_outcome": "string"
  }},
  "skill_gap_summary": [
    {{
      "category": "string",
      "priority": "high | medium | low",
      "skills": ["string"],
      "why_it_matters": "string"
    }}
  ],
  "priority_skills": [
    {{
      "skill": "string",
      "priority": "high | medium | low",
      "reason": "string"
    }}
  ],
  "weekly_plan": [
    {{
      "week": 1,
      "theme": "string",
      "goals": ["string"],
      "success_criteria": ["string"]
    }}
  ],
  "roadmap": [
    {{
      "day": 1,
      "week": 1,
      "focus": "string",
      "tasks": ["string"],
      "deliverable": "string",
      "estimated_time": "string"
    }}
  ],
  "mini_projects": [
    {{
      "title": "string",
      "difficulty": "easy | medium | hard",
      "description": "string",
      "why_it_matters": "string",
      "skills_practiced": ["string"],
      "implementation_steps": ["string"],
      "resume_bullet_templates": ["string"]
    }}
  ],
  "resume_actions": ["string"],
  "interview_prep_actions": ["string"],
  "study_topics": ["string"],
  "progress_checkpoints": [
    {{
      "checkpoint_day": 7,
      "questions_to_answer": ["string"],
      "expected_output": "string"
    }}
  ],
  "final_advice": ["string"]
}}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        ai_result = sanitize_ai_result(safe_json_loads(response.text))

        return {
            "provider_used": "gemini",
            "fallback_used": False,
            "overview": ai_result.get("overview", {}),
            "skill_gap_summary": ai_result.get("skill_gap_summary", []),
            "priority_skills": ai_result.get("priority_skills", []),
            "weekly_plan": ai_result.get("weekly_plan", []),
            "roadmap": ai_result.get("roadmap", []),
            "mini_projects": ai_result.get("mini_projects", []),
            "resume_actions": ai_result.get("resume_actions", []),
            "interview_prep_actions": ai_result.get("interview_prep_actions", []),
            "study_topics": ai_result.get("study_topics", []),
            "progress_checkpoints": ai_result.get("progress_checkpoints", []),
            "final_advice": ai_result.get("final_advice", []),
        }

    except Exception as exc:
        return build_rule_based_roadmap(
            target_role=target_role,
            role_type=role_type,
            industry=industry,
            experience_level=experience_level,
            timeline_days=timeline_days,
            missing_items=missing_items,
            failure_reason=str(exc),
        )
