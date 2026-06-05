import re
from collections import Counter


ROLE_SKILLS = {
    "software_engineer": [
        "Python",
        "Java",
        "JavaScript",
        "TypeScript",
        "REST APIs",
        "Databases",
        "SQL",
        "Git",
        "Testing",
        "Data Structures",
        "Algorithms",
        "System Design",
    ],
    "backend_engineer": [
        "Python",
        "Java",
        "FastAPI",
        "Spring Boot",
        "REST APIs",
        "PostgreSQL",
        "SQL",
        "Docker",
        "AWS",
        "Caching",
        "Distributed Systems",
        "Testing",
        "CI/CD",
    ],
    "ai_engineer": [
        "Python",
        "Machine Learning",
        "LLMs",
        "RAG",
        "Embeddings",
        "Vector Databases",
        "Prompt Engineering",
        "Evaluation",
        "FastAPI",
        "APIs",
    ],
    "data_analyst": [
        "SQL",
        "Excel",
        "Python",
        "Tableau",
        "Power BI",
        "Dashboards",
        "Data Cleaning",
        "Reporting",
        "Business Intelligence",
    ],
    "teacher": [
        "Lesson Planning",
        "Classroom Management",
        "Curriculum Development",
        "Student Assessment",
        "Parent Communication",
        "Differentiated Instruction",
    ],
    "hr": [
        "Recruiting",
        "Onboarding",
        "Employee Relations",
        "HRIS",
        "Compliance",
        "Training",
        "Policy",
    ],
    "marketing": [
        "SEO",
        "Google Analytics",
        "Content Strategy",
        "Campaign Management",
        "Email Marketing",
        "A/B Testing",
        "Social Media",
    ],
    "finance": [
        "Financial Modeling",
        "Budgeting",
        "Forecasting",
        "Excel",
        "Risk Analysis",
        "Reporting",
        "Compliance",
    ],
    "general": [
        "Communication",
        "Collaboration",
        "Problem Solving",
        "Project Management",
        "Documentation",
    ],
}


SECTION_NAMES = {
    "summary": ["summary", "professional summary", "profile"],
    "skills": ["skills", "technical skills", "core skills"],
    "experience": ["experience", "work experience", "professional experience"],
    "projects": ["projects", "technical projects", "selected projects"],
    "education": ["education"],
}


STOPWORDS = {
    "and", "or", "the", "a", "an", "to", "of", "in", "on", "for", "with",
    "by", "as", "is", "are", "be", "this", "that", "from", "using", "use",
    "will", "can", "you", "we", "our", "your", "their", "job", "role",
    "candidate", "team", "work", "experience", "skills", "ability", "strong",
    "including", "such", "into", "across", "within", "about", "new","engineer", "engineers", "include", "includes", "looking", "join",
    "team", "teams", "teams.", "company", "pinterest", "manager", "managers",
    "designer", "designers", "scientist", "scientists", "well-rounded",
    "inquisitive", "partnering", "developing", "features", "monetization","involves","pinner-facing","features",
    "features.","responsibilities","designing","operating","running","implementing""developer",
    "processes","product","products",
}


def normalize_text(text: str) -> str:
    return text.lower()


def tokenize(text: str) -> list[str]:
    raw_tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.\-/]{2,}", text.lower())

    cleaned_tokens = []

    for token in raw_tokens:
        cleaned = token.strip(".,;:()[]{}")

        if cleaned and cleaned not in STOPWORDS:
            cleaned_tokens.append(cleaned)

    return cleaned_tokens

def extract_keywords(text: str, limit: int = 40) -> list[str]:
    tokens = tokenize(text)
    counts = Counter(tokens)

    keywords = []

    for word, _count in counts.most_common(limit * 2):
        if len(word) >= 3 and word not in keywords:
            keywords.append(word)

        if len(keywords) >= limit:
            break

    return keywords


def contains_phrase(text: str, phrase: str) -> bool:
    return phrase.lower() in text.lower()


def calculate_percentage(matched_count: int, total_count: int) -> int:
    if total_count == 0:
        return 0

    return round((matched_count / total_count) * 100)


def analyze_keywords(resume_text: str, job_text: str) -> dict:
    job_keywords = extract_keywords(job_text, limit=35)
    resume_lower = normalize_text(resume_text)

    matched = []
    missing = []

    for keyword in job_keywords:
        if keyword in resume_lower:
            matched.append(keyword)
        else:
            missing.append(keyword)

    high_priority_missing = missing[:8]
    keyword_score = calculate_percentage(len(matched), len(job_keywords))

    return {
        "matched_keywords": matched,
        "missing_keywords": missing[:20],
        "high_priority_missing_keywords": high_priority_missing,
        "keyword_match_percentage": keyword_score,
    }


def analyze_skills(resume_text: str, job_text: str, role_type: str) -> dict:
    role_skills = ROLE_SKILLS.get(role_type, ROLE_SKILLS["general"])
    combined_job_text = job_text.lower()
    resume_lower = resume_text.lower()

    relevant_skills = [
        skill for skill in role_skills
        if skill.lower() in combined_job_text or role_type != "general"
    ]

    if not relevant_skills:
        relevant_skills = ROLE_SKILLS["general"]

    matched = []
    missing = []

    for skill in relevant_skills:
        if skill.lower() in resume_lower:
            matched.append(skill)
        else:
            missing.append(skill)

    transferable = []

    for skill in ROLE_SKILLS["general"]:
        if skill.lower() in resume_lower:
            transferable.append(skill)

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "transferable_skills": transferable,
    }


def has_section(text: str, section_aliases: list[str]) -> bool:
    lowered = text.lower()

    for alias in section_aliases:
        pattern = rf"(^|\n)\s*{re.escape(alias)}\s*($|\n|:)"
        if re.search(pattern, lowered):
            return True

    return False


def analyze_sections(resume_text: str) -> tuple[int, list[dict]]:
    feedback = []
    passed = 0

    for section, aliases in SECTION_NAMES.items():
        found = has_section(resume_text, aliases)

        if found:
            passed += 1
            feedback.append(
                {
                    "section": section.title(),
                    "status": "pass",
                    "feedback": f"{section.title()} section is present.",
                }
            )
        else:
            feedback.append(
                {
                    "section": section.title(),
                    "status": "warning",
                    "feedback": f"{section.title()} section was not clearly detected.",
                }
            )

    section_score = calculate_percentage(passed, len(SECTION_NAMES))

    return section_score, feedback


def analyze_formatting(resume_text: str) -> tuple[int, list[dict]]:
    checks = []

    def add_check(name: str, passed: bool, pass_msg: str, warn_msg: str) -> None:
        checks.append(
            {
                "name": name,
                "status": "pass" if passed else "warning",
                "feedback": pass_msg if passed else warn_msg,
            }
        )

    has_email = "@" in resume_text
    has_phone = bool(re.search(r"(\+?\d[\d\s().-]{7,}\d)", resume_text))
    bullet_count = len(re.findall(r"(^|\n)\s*[-•*]\s+", resume_text))
    long_lines = [line for line in resume_text.splitlines() if len(line) > 180]
    duplicate_punctuation = bool(re.search(r"[.]{2,}|[,]{2,}", resume_text))

    add_check(
        "Contact information",
        has_email or has_phone,
        "Resume includes contact information.",
        "Add clear contact information such as email and phone.",
    )

    add_check(
        "Bullet points",
        bullet_count >= 4,
        "Resume uses bullet points for readability.",
        "Use bullet points to make experience and project details easier to scan.",
    )

    add_check(
        "Readable line length",
        len(long_lines) <= 3,
        "Resume line lengths are generally readable.",
        "Some lines are very long; split dense paragraphs into shorter bullets.",
    )

    add_check(
        "Clean punctuation",
        not duplicate_punctuation,
        "No obvious duplicate punctuation detected.",
        "Fix repeated punctuation such as '..' or ',,'.",
    )

    add_check(
        "ATS-friendly structure",
        True,
        "Resume appears to use text-based content suitable for ATS parsing.",
        "Avoid images, tables, icons, and text boxes in final resume files.",
    )

    passed = len([check for check in checks if check["status"] == "pass"])
    formatting_score = calculate_percentage(passed, len(checks))

    return formatting_score, checks


def analyze_impact(resume_text: str) -> tuple[int, list[str]]:
    metric_patterns = [
        r"\b\d+%",
        r"\b\d+\+",
        r"\b\d+x\b",
        r"\b\d+\s*(users|customers|requests|records|hours|minutes|seconds|ms)\b",
    ]

    metric_count = 0

    for pattern in metric_patterns:
        metric_count += len(re.findall(pattern, resume_text.lower()))

    strong_verbs = [
        "built", "developed", "designed", "implemented", "optimized",
        "improved", "reduced", "increased", "launched", "automated",
        "created", "managed", "led", "analyzed", "delivered",
    ]

    verb_count = sum(1 for verb in strong_verbs if verb in resume_text.lower())

    score = min(100, (metric_count * 18) + (verb_count * 5))

    recommendations = []

    if metric_count == 0:
        recommendations.append(
            "Add measurable impact where truthful, such as time saved, accuracy improved, users supported, or performance gains."
        )

    if verb_count < 5:
        recommendations.append(
            "Use stronger action verbs such as built, implemented, optimized, analyzed, led, or delivered."
        )

    return score, recommendations


def build_recommendations(
    keyword_analysis: dict,
    skills_analysis: dict,
    formatting_checks: list[dict],
    section_feedback: list[dict],
    impact_recommendations: list[str],
) -> list[str]:
    recommendations = []

    if keyword_analysis["high_priority_missing_keywords"]:
        recommendations.append(
            "Add truthful high-priority job keywords where relevant: "
            + ", ".join(keyword_analysis["high_priority_missing_keywords"][:6])
            + "."
        )

    if skills_analysis["missing_skills"]:
        recommendations.append(
            "Address missing role skills through resume updates, project enhancements, or learning: "
            + ", ".join(skills_analysis["missing_skills"][:6])
            + "."
        )

    for check in formatting_checks:
        if check["status"] == "warning":
            recommendations.append(check["feedback"])

    for section in section_feedback:
        if section["status"] == "warning":
            recommendations.append(section["feedback"])

    recommendations.extend(impact_recommendations)

    recommendations.append(
        "Only add skills, keywords, metrics, and claims that are truthful and interview-ready."
    )

    return recommendations[:10]


def analyze_advanced_ats(
    resume_text: str,
    job_text: str,
    industry: str,
    role_type: str,
) -> dict:
    keyword_analysis = analyze_keywords(resume_text, job_text)
    skills_analysis = analyze_skills(resume_text, job_text, role_type)
    formatting_score, formatting_checks = analyze_formatting(resume_text)
    section_score, section_feedback = analyze_sections(resume_text)
    impact_score, impact_recommendations = analyze_impact(resume_text)

    skills_score = calculate_percentage(
        len(skills_analysis["matched_skills"]),
        len(skills_analysis["matched_skills"]) + len(skills_analysis["missing_skills"]),
    )

    keyword_score = keyword_analysis["keyword_match_percentage"]

    overall_score = round(
        (keyword_score * 0.30)
        + (skills_score * 0.25)
        + (formatting_score * 0.20)
        + (section_score * 0.15)
        + (impact_score * 0.10)
    )

    recommendations = build_recommendations(
        keyword_analysis=keyword_analysis,
        skills_analysis=skills_analysis,
        formatting_checks=formatting_checks,
        section_feedback=section_feedback,
        impact_recommendations=impact_recommendations,
    )

    return {
        "overall_score": overall_score,
        "score_breakdown": {
            "keyword_score": keyword_score,
            "skills_score": skills_score,
            "formatting_score": formatting_score,
            "section_score": section_score,
            "impact_score": impact_score,
        },
        "keyword_analysis": keyword_analysis,
        "skills_analysis": skills_analysis,
        "formatting_checks": formatting_checks,
        "section_feedback": section_feedback,
        "recommendations": recommendations,
    }
