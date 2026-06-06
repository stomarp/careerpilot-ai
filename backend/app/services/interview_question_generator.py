import json

from google import genai

from app.core.config import settings


ROLE_INTERVIEW_CATEGORIES = {
    "software_engineer": [
        "Coding & Problem Solving",
        "Software Engineering Fundamentals",
        "System Design",
        "Project Deep Dive",
        "Behavioral",
    ],
    "backend_engineer": [
        "Backend/API Design",
        "Databases",
        "System Design & Scalability",
        "Testing & Reliability",
        "Project Deep Dive",
        "Behavioral",
    ],
    "ai_engineer": [
        "Machine Learning & LLMs",
        "RAG / Embeddings / Vector Search",
        "AI System Design",
        "Evaluation & Safety",
        "Project Deep Dive",
        "Behavioral",
    ],
    "data_analyst": [
        "SQL & Data Analysis",
        "Dashboards & Metrics",
        "Business Case Questions",
        "Data Cleaning",
        "Stakeholder Communication",
        "Behavioral",
    ],
    "teacher": [
        "Classroom Management",
        "Lesson Planning",
        "Student Assessment",
        "Parent Communication",
        "Scenario-Based Teaching Questions",
        "Behavioral",
    ],
    "hr": [
        "Recruiting & Screening",
        "Employee Relations",
        "Compliance & Policy",
        "Conflict Resolution",
        "Onboarding",
        "Behavioral",
    ],
    "marketing": [
        "Campaign Strategy",
        "SEO & Content",
        "Analytics & Metrics",
        "Brand Positioning",
        "Case Study Questions",
        "Behavioral",
    ],
    "finance": [
        "Financial Analysis",
        "Budgeting & Forecasting",
        "Risk & Controls",
        "Reporting",
        "Case Study Questions",
        "Behavioral",
    ],
    "general": [
        "Role Knowledge",
        "Scenario Questions",
        "Problem Solving",
        "Communication",
        "Behavioral",
    ],
}


COMPANY_DOMAIN_PATTERNS = {
    "visa": {
        "domain": "payments, transaction reliability, risk, security, scale, and global financial infrastructure",
        "prep": [
            {
                "area": "Company/domain focus",
                "guidance": "Expect questions that connect backend engineering to reliability, transaction processing, security, APIs, and scalable payment systems.",
            },
            {
                "area": "New grad signal",
                "guidance": "Show strong fundamentals, clear communication, project ownership, testing discipline, and ability to learn quickly.",
            },
        ],
    },
    "amazon": {
        "domain": "customer obsession, scalable services, ownership, operational excellence, and distributed systems",
        "prep": [
            {
                "area": "Company/domain focus",
                "guidance": "Expect questions around scalable services, ownership, tradeoffs, operational thinking, and customer impact.",
            },
            {
                "area": "Behavioral focus",
                "guidance": "Prepare STAR stories aligned with ownership, learning, conflict handling, and delivering results.",
            },
        ],
    },
    "google": {
        "domain": "large-scale systems, algorithms, data-driven engineering, reliability, and clean design",
        "prep": [
            {
                "area": "Company/domain focus",
                "guidance": "Expect strong problem solving, clean technical explanations, system tradeoffs, and scalable design thinking.",
            },
            {
                "area": "Interview focus",
                "guidance": "Practice algorithms, data structures, clear reasoning, and structured system design explanations.",
            },
        ],
    },
    "meta": {
        "domain": "product engineering, experimentation, scale, social systems, metrics, and impact",
        "prep": [
            {
                "area": "Company/domain focus",
                "guidance": "Expect product-aware engineering questions involving scale, metrics, experimentation, and user impact.",
            },
            {
                "area": "Execution focus",
                "guidance": "Show ability to move fast while discussing correctness, reliability, and measurable impact.",
            },
        ],
    },
    "microsoft": {
        "domain": "cloud platforms, enterprise software, collaboration, reliability, and customer impact",
        "prep": [
            {
                "area": "Company/domain focus",
                "guidance": "Expect questions around collaboration, cloud services, software quality, and customer-focused engineering.",
            },
            {
                "area": "Behavioral focus",
                "guidance": "Prepare examples around teamwork, growth mindset, problem solving, and technical ownership.",
            },
        ],
    },
}


EXPERIENCE_LEVEL_GUIDANCE = {
    "internship": "Keep questions foundational and project/coursework-focused. Emphasize learning ability, communication, and basic role skills.",
    "new_grad": "Use foundational to medium difficulty questions. Emphasize fundamentals, projects, internships/volunteer work, problem solving, and growth potential.",
    "entry_level": "Use foundational to medium difficulty questions. Emphasize practical execution, role basics, and clear examples.",
    "experienced": "Use medium to hard questions. Emphasize ownership, impact, tradeoffs, production experience, and cross-functional collaboration.",
    "senior": "Use hard questions. Emphasize leadership, architecture, strategy, mentoring, tradeoffs, and business impact.",
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
            f"AI interview question response was not valid JSON: {cleaned[:500]}"
        ) from exc


def get_categories_for_role(role_type: str) -> list[str]:
    return ROLE_INTERVIEW_CATEGORIES.get(
        role_type,
        ROLE_INTERVIEW_CATEGORIES["general"],
    )


def get_company_pattern(company_name: str | None) -> dict:
    if not company_name:
        return {
            "domain": "the target company's role, industry, product context, and team expectations",
            "prep": [],
        }

    key = company_name.strip().lower()

    return COMPANY_DOMAIN_PATTERNS.get(
        key,
        {
            "domain": f"{company_name}'s business domain, role expectations, product context, and company values",
            "prep": [
                {
                    "area": "Company research",
                    "guidance": f"Research {company_name}'s products, customers, mission, recent updates, and how this role contributes to the company.",
                },
                {
                    "area": "Role alignment",
                    "guidance": f"Prepare examples that connect your experience to {company_name}'s target role and business problems.",
                },
            ],
        },
    )


def get_testing_focus(category: str, target_role: str) -> str:
    focus_by_category = {
        "Backend/API Design": "API design, request/response modeling, validation, authentication, error handling, and backend architecture.",
        "Databases": "Data modeling, SQL knowledge, indexes, relationships, query performance, and database tradeoffs.",
        "System Design & Scalability": "Ability to reason about scale, reliability, bottlenecks, caching, queues, services, and tradeoffs.",
        "Testing & Reliability": "Testing strategy, debugging approach, CI/CD awareness, monitoring, and production-readiness.",
        "Project Deep Dive": "Depth of ownership, architecture understanding, technical decisions, tradeoffs, and ability to explain your work clearly.",
        "Behavioral": "Communication, collaboration, ownership, problem solving, adaptability, and self-awareness.",
        "Coding & Problem Solving": "Problem-solving approach, data structures, algorithms, complexity analysis, and clarity of thought.",
        "Software Engineering Fundamentals": "Core engineering principles, maintainability, OOP, clean code, debugging, and collaboration.",
        "Machine Learning & LLMs": "Understanding of ML/LLM concepts, model behavior, prompt design, data flow, and practical AI implementation.",
        "RAG / Embeddings / Vector Search": "Knowledge of retrieval pipelines, embeddings, vector databases, chunking, ranking, and answer grounding.",
        "AI System Design": "Ability to design reliable AI-powered systems with APIs, storage, evaluation, and user workflows.",
        "Evaluation & Safety": "Understanding of AI quality checks, hallucination risks, testing, safety, and responsible AI behavior.",
        "SQL & Data Analysis": "SQL querying, data interpretation, metrics, joins, aggregation, and analytical reasoning.",
        "Dashboards & Metrics": "Ability to define KPIs, build dashboards, communicate insights, and track business performance.",
        "Business Case Questions": "Structured thinking, business judgment, assumptions, analysis, and recommendation quality.",
        "Data Cleaning": "Handling missing data, duplicates, inconsistent formats, outliers, and data quality issues.",
        "Stakeholder Communication": "Ability to explain findings, clarify requirements, and communicate with non-technical stakeholders.",
        "Classroom Management": "Ability to manage student behavior, create routines, maintain engagement, and handle classroom challenges.",
        "Lesson Planning": "Instructional planning, learning objectives, differentiation, pacing, and assessment alignment.",
        "Student Assessment": "Ability to measure learning, use feedback, adapt instruction, and support student growth.",
        "Parent Communication": "Professional communication, empathy, clarity, and handling sensitive conversations.",
        "Scenario-Based Teaching Questions": "Judgment in realistic classroom situations and student-centered decision making.",
        "Recruiting & Screening": "Candidate evaluation, sourcing, interviewing, pipeline management, and hiring process knowledge.",
        "Employee Relations": "Conflict handling, documentation, professionalism, and employee support.",
        "Compliance & Policy": "Understanding of workplace policies, compliance, confidentiality, and fair process.",
        "Conflict Resolution": "Ability to handle difficult conversations, mediate issues, and reach constructive outcomes.",
        "Onboarding": "New hire support, process design, training coordination, and employee experience.",
        "Campaign Strategy": "Marketing planning, audience targeting, messaging, channels, budget, and campaign goals.",
        "SEO & Content": "Search intent, content strategy, keyword planning, optimization, and performance tracking.",
        "Analytics & Metrics": "Ability to interpret campaign data, define KPIs, and improve performance.",
        "Brand Positioning": "Understanding of audience, differentiation, messaging, and brand consistency.",
        "Case Study Questions": "Structured analysis, assumptions, tradeoffs, and recommendation quality.",
        "Financial Analysis": "Financial reasoning, data interpretation, modeling, assumptions, and business impact.",
        "Budgeting & Forecasting": "Planning, variance analysis, assumptions, forecasting methods, and financial discipline.",
        "Risk & Controls": "Risk identification, controls, compliance, audit readiness, and decision quality.",
        "Reporting": "Accuracy, clarity, stakeholder communication, and financial/business reporting quality.",
    }

    return focus_by_category.get(
        category,
        f"Your readiness for {category} in a {target_role} role.",
    )


def get_answer_hint(category: str, target_role: str) -> str:
    hints_by_category = {
        "Backend/API Design": "Mention endpoints, request/response schema, validation, authentication, error handling, database interaction, and scalability.",
        "Databases": "Discuss schema design, relationships, indexes, query patterns, performance tradeoffs, and data consistency.",
        "System Design & Scalability": "Start with requirements, estimate scale, define components, discuss database/cache/queue choices, and explain tradeoffs.",
        "Testing & Reliability": "Explain unit/integration/API tests, CI/CD, logging, monitoring, rollback strategy, and debugging steps.",
        "Project Deep Dive": "Use a real project from your resume. Explain the problem, architecture, tech stack, your contribution, challenge, and result.",
        "Behavioral": "Use STAR: Situation, Task, Action, Result. Keep the story specific and end with what you learned.",
        "Coding & Problem Solving": "Clarify requirements, explain brute force first if useful, improve the approach, analyze time/space complexity, and test edge cases.",
        "Software Engineering Fundamentals": "Use simple definitions, give a practical example, and connect the concept to code quality or teamwork.",
        "Machine Learning & LLMs": "Explain the problem, data/input, model or API choice, evaluation approach, limitations, and improvement ideas.",
        "RAG / Embeddings / Vector Search": "Discuss document ingestion, chunking, embeddings, vector search, retrieval quality, prompt construction, and evaluation.",
        "AI System Design": "Cover user flow, API layer, model/provider choice, storage, guardrails, evaluation, fallback behavior, and cost/latency tradeoffs.",
        "Evaluation & Safety": "Mention test sets, human review, hallucination checks, bias/safety risks, logging, and iterative improvement.",
        "SQL & Data Analysis": "Explain the business question, tables needed, joins/filters/aggregations, validation checks, and how you would communicate insights.",
        "Dashboards & Metrics": "Define the audience, KPIs, data source, visualization choices, refresh cadence, and decision the dashboard supports.",
        "Business Case Questions": "Structure the answer: clarify goal, state assumptions, analyze options, quantify where possible, and make a recommendation.",
        "Data Cleaning": "Mention missing values, duplicates, type conversion, outliers, validation rules, and documentation of cleaning decisions.",
        "Stakeholder Communication": "Show how you clarify needs, translate technical details, share tradeoffs, and confirm alignment.",
        "Classroom Management": "Describe routines, expectations, positive reinforcement, escalation steps, and how you keep learning on track.",
        "Lesson Planning": "Mention learning objectives, activities, differentiation, assessment, timing, and how you adjust based on student needs.",
        "Student Assessment": "Discuss formative/summative assessment, feedback, data-driven instruction, and support for struggling students.",
        "Parent Communication": "Use a calm, specific, student-centered response with facts, empathy, next steps, and follow-up.",
        "Scenario-Based Teaching Questions": "Explain what you would do first, how you would protect learning time, support the student, and communicate if needed.",
        "Recruiting & Screening": "Explain sourcing, screening criteria, structured interviews, candidate experience, and documentation.",
        "Employee Relations": "Mention confidentiality, listening, policy, documentation, fairness, and escalation when needed.",
        "Compliance & Policy": "Reference policy awareness, consistency, documentation, confidentiality, and risk reduction.",
        "Conflict Resolution": "Use a neutral approach: listen, identify facts, clarify expectations, document, and agree on next steps.",
        "Onboarding": "Discuss pre-boarding, first-week plan, training, manager alignment, check-ins, and measuring onboarding success.",
        "Campaign Strategy": "Clarify audience, objective, message, channel mix, budget, timeline, KPIs, and testing plan.",
        "SEO & Content": "Discuss search intent, keyword research, content structure, internal links, measurement, and iteration.",
        "Analytics & Metrics": "Mention KPIs, baselines, segmentation, conversion funnel, experiment results, and actionable recommendations.",
        "Brand Positioning": "Explain audience, pain points, differentiation, messaging, examples, and consistency across channels.",
        "Case Study Questions": "Ask clarifying questions, organize the problem, analyze options, state assumptions, and give a clear recommendation.",
        "Financial Analysis": "Explain assumptions, data sources, calculations, sensitivity analysis, risks, and business recommendation.",
        "Budgeting & Forecasting": "Discuss historical data, assumptions, drivers, variance tracking, and how you would update the forecast.",
        "Risk & Controls": "Identify risks, assess likelihood/impact, propose controls, document decisions, and monitor outcomes.",
        "Reporting": "Focus on accuracy, clarity, audience needs, reconciliations, and explaining key changes or insights.",
    }

    return hints_by_category.get(
        category,
        "Use a structured answer. Explain the situation, your action, tools/process used, and the result.",
    )


def get_category_reason(category: str, role_type: str, company_name: str | None) -> str:
    company_part = f" for {company_name}" if company_name else ""

    return (
        f"This category is commonly important for {role_type.replace('_', ' ')} "
        f"interviews{company_part} and helps prepare role-specific examples."
    )


def build_context_text(
    application,
    analysis_report,
    resume,
    job_description,
) -> str:
    context_parts = []

    if application:
        context_parts.append(
            f"""
Application:
Company: {application.company_name}
Role: {application.role_title}
Status: {application.status}
Notes: {application.notes}
Next Action: {application.next_action}
ATS Score: {application.ats_score}
"""
        )

    if analysis_report:
        context_parts.append(
            f"""
Saved Analysis Report:
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

    if resume and resume.parsed_text:
        context_parts.append(
            f"""
Resume Context:
{resume.parsed_text[:6000]}
"""
        )

    if job_description and job_description.description:
        context_parts.append(
            f"""
Job Description Context:
Title: {job_description.title}
Company: {job_description.company}
Description:
{job_description.description[:6000]}
"""
        )

    return "\n\n".join(context_parts).strip()


def build_rule_based_questions(
    target_role: str,
    company_name: str | None,
    role_type: str,
    industry: str,
    experience_level: str,
    question_count: int,
    question_style: str,
    include_company_prep: bool,
    include_platform_patterns: bool,
    context_text: str,
    failure_reason: str,
) -> dict:
    categories = get_categories_for_role(role_type)
    company_pattern = get_company_pattern(company_name)

    question_sets = []

    base_questions_by_category = {
        "Backend/API Design": [
            "How would you design a REST API for a high-traffic application?",
            "How do you handle validation, errors, and authentication in backend APIs?",
        ],
        "Databases": [
            "How would you design tables for tracking users, applications, and reports?",
            "How do indexes improve database query performance?",
        ],
        "System Design & Scalability": [
            "How would you scale a backend service when traffic increases?",
            "What tradeoffs would you consider when choosing between monolith and microservices?",
        ],
        "Testing & Reliability": [
            "How do you test backend APIs before deployment?",
            "How would you debug a production issue reported by users?",
        ],
        "Project Deep Dive": [
            "Walk me through one project you built and explain the architecture.",
            "What was the hardest technical decision in your project and how did you handle it?",
        ],
        "Behavioral": [
            "Tell me about a time you solved a difficult problem.",
            "Tell me about a time you worked with others to complete a project.",
        ],
        "Coding & Problem Solving": [
            "How would you find duplicate values in a list efficiently?",
            "Explain how you would approach a problem you have never seen before.",
        ],
        "Software Engineering Fundamentals": [
            "Explain object-oriented programming in simple terms.",
            "How do you write maintainable code?",
        ],
        "Role Knowledge": [
            f"What skills are most important for a {target_role}?",
            f"Why are you interested in this {target_role} role?",
        ],
        "Scenario Questions": [
            "Describe how you would handle a difficult work situation.",
            "How would you prioritize multiple urgent tasks?",
        ],
        "Problem Solving": [
            "Tell me about a time you solved a complex problem.",
            "How do you make decisions when information is incomplete?",
        ],
        "Communication": [
            "How do you explain technical or complex ideas to non-technical people?",
            "How do you handle feedback?",
        ],
    }

    for category in categories:
        raw_questions = base_questions_by_category.get(
            category,
            [
                f"What experience do you have related to {category.lower()}?",
                f"Describe a scenario where you used {category.lower()} skills.",
            ],
        )

        questions = []

        for question in raw_questions:
            if company_name and include_company_prep:
                question = (
                    f"{question} How would you connect your answer to "
                    f"{company_name}'s domain: {company_pattern['domain']}?"
                )

            questions.append(
                {
                    "question": question,
                    "difficulty": "medium",
                    "source_style": (
                        "company_role_pattern"
                        if include_company_prep
                        else "role_pattern"
                    ),
                    "practice_priority": "high" if category in categories[:3] else "medium",
                    "what_interviewer_is_testing": get_testing_focus(
                        category=category,
                        target_role=target_role,
                    ),
                    "answer_hint": get_answer_hint(
                        category=category,
                        target_role=target_role,
                    ),
                }
            )

        question_sets.append(
            {
                "category": category,
                "why_this_category_matters": get_category_reason(
                    category=category,
                    role_type=role_type,
                    company_name=company_name,
                ),
                "questions": questions,
            }
        )

    company_prep = company_pattern["prep"] if include_company_prep else []

    return {
        "provider_used": "rule_based_fallback",
        "fallback_used": True,
        "question_sets": question_sets,
        "company_prep": company_prep,
        "preparation_tips": [
            f"AI provider was unavailable, so fallback questions were generated. Reason: {failure_reason}",
            EXPERIENCE_LEVEL_GUIDANCE.get(
                experience_level,
                EXPERIENCE_LEVEL_GUIDANCE["entry_level"],
            ),
            "Prepare examples from your resume, projects, work experience, or coursework.",
            "Use STAR for behavioral answers: Situation, Task, Action, Result.",
            "Review missing skills and keywords from the saved analysis report.",
            "For each answer, connect your response to the target role and company context.",
        ],
        "focus_areas": categories,
    }


def generate_interview_questions_with_ai(
    target_role: str,
    company_name: str | None,
    role_type: str,
    industry: str,
    experience_level: str,
    question_count: int,
    question_style: str,
    include_company_prep: bool,
    include_platform_patterns: bool,
    context_text: str,
) -> dict:
    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing.")

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        categories = get_categories_for_role(role_type)
        company_pattern = get_company_pattern(company_name)
        experience_guidance = EXPERIENCE_LEVEL_GUIDANCE.get(
            experience_level,
            EXPERIENCE_LEVEL_GUIDANCE["entry_level"],
        )

        prompt = f"""
You are an expert interview coach and career platform assistant.

Generate company-aware, role-specific interview preparation questions.

Important rules:
- Support all professions, not only technology.
- Use the role_type, industry, company_name, and experience_level to choose relevant question categories.
- Use resume, job description, application, and analysis report context if provided.
- Generate original questions. Do NOT copy exact questions from other websites or platforms.
- You may use common interview patterns such as DSA-style, system-design-style, behavioral STAR-style, case-style, domain-style, and project-deep-dive-style questions.
- If missing skills are provided, include questions that help the user prepare for those areas.
- If company_name is provided, connect some questions to that company's domain, product context, business model, or likely role expectations.
- Do NOT invent false experience.
- Do NOT claim the user has done something unless it appears in context.
- Keep questions realistic for the user's experience level.
- Make answer hints specific and useful, not generic.
- Add source_style for each question, such as company_domain_pattern, role_pattern, project_deep_dive, behavioral_star, dsa_style, system_design_style, case_style, domain_scenario.
- Add practice_priority for each question: high, medium, or low.
- Return ONLY valid JSON.
- Do not include markdown fences.

Target role:
{target_role}

Company name:
{company_name}

Company/domain guidance:
{company_pattern}

Role type:
{role_type}

Industry:
{industry}

Experience level:
{experience_level}

Experience-level guidance:
{experience_guidance}

Question count:
{question_count}

Question style:
{question_style}

Include company prep:
{include_company_prep}

Include platform/interview pattern styles:
{include_platform_patterns}

Recommended categories:
{categories}

Context:
{context_text[:12000]}

Return JSON with this exact structure:
{{
  "question_sets": [
    {{
      "category": "string",
      "why_this_category_matters": "string",
      "questions": [
        {{
          "question": "string",
          "difficulty": "easy | medium | hard",
          "source_style": "company_domain_pattern | role_pattern | project_deep_dive | behavioral_star | dsa_style | system_design_style | case_style | domain_scenario",
          "practice_priority": "high | medium | low",
          "what_interviewer_is_testing": "string",
          "answer_hint": "string"
        }}
      ]
    }}
  ],
  "company_prep": [
    {{
      "area": "string",
      "guidance": "string"
    }}
  ],
  "preparation_tips": ["string"],
  "focus_areas": ["string"]
}}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        ai_result = safe_json_loads(response.text)

        return {
            "provider_used": "gemini",
            "fallback_used": False,
            "question_sets": ai_result.get("question_sets", []),
            "company_prep": ai_result.get("company_prep", []),
            "preparation_tips": ai_result.get("preparation_tips", []),
            "focus_areas": ai_result.get("focus_areas", categories),
        }

    except Exception as exc:
        return build_rule_based_questions(
            target_role=target_role,
            company_name=company_name,
            role_type=role_type,
            industry=industry,
            experience_level=experience_level,
            question_count=question_count,
            question_style=question_style,
            include_company_prep=include_company_prep,
            include_platform_patterns=include_platform_patterns,
            context_text=context_text,
            failure_reason=str(exc),
        )
