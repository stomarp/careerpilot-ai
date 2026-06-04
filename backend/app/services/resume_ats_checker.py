import re

from app.services.skill_extractor import ACTION_VERBS, extract_skills, format_skill


def has_email(text: str) -> bool:
    return bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text))


def has_phone(text: str) -> bool:
    return bool(re.search(r"\+?\d[\d\s().-]{8,}\d", text))


def has_linkedin(text: str) -> bool:
    return "linkedin" in text.lower()


def has_github(text: str) -> bool:
    return "github" in text.lower()


def contains_number_or_metric(text: str) -> bool:
    return bool(re.search(r"\d+%|\d+\+|\d+ ", text))


def calculate_general_resume_ats_score(resume_text: str, industry: str = "general") -> dict:
    text = resume_text.lower()

    strengths = []
    issues = []
    recommendations = []

    contact_score = 0
    section_score = 0
    industry_keyword_score = 0
    action_score = 0
    impact_score = 0
    formatting_score = 15

    contact_count = sum([
        has_email(resume_text),
        has_phone(resume_text),
        has_linkedin(resume_text),
        has_github(resume_text),
    ])

    if contact_count >= 3:
        contact_score = 15
        strengths.append("Resume includes strong contact and profile information.")
    elif contact_count == 2:
        contact_score = 10
        issues.append("Add more professional links such as LinkedIn or GitHub.")
    elif contact_count == 1:
        contact_score = 5
        issues.append("Add email, phone, LinkedIn, and GitHub clearly at the top.")
    else:
        issues.append("Contact information is missing or unclear.")

    expected_sections = {
        "skills": ["skills", "technical skills"],
        "experience": ["experience", "work experience"],
        "projects": ["projects"],
        "education": ["education"],
    }

    section_matches = 0

    for section_keywords in expected_sections.values():
        if any(keyword in text for keyword in section_keywords):
            section_matches += 1

    section_score = int((section_matches / 4) * 20)

    if section_matches == 4:
        strengths.append("Resume includes key sections: skills, experience, projects, and education.")
    else:
        issues.append("Make sure Skills, Experience, Projects, and Education sections are clearly labeled.")

    detected_skills = extract_skills(resume_text, industry)
    skill_count = len(detected_skills)

    if skill_count >= 10:
        industry_keyword_score = 20
        strengths.append(f"Resume includes strong {industry} keywords.")
    elif skill_count >= 6:
        industry_keyword_score = 15
        strengths.append(f"Resume includes relevant {industry} keywords.")
    elif skill_count >= 3:
        industry_keyword_score = 10
        issues.append(f"Add more {industry}-specific keywords.")
    else:
        industry_keyword_score = 5
        issues.append(f"Resume has limited {industry}-specific keyword coverage.")

    action_count = sum(1 for verb in ACTION_VERBS if verb in text)

    if action_count >= 8:
        action_score = 15
        strengths.append("Resume uses strong action verbs.")
    elif action_count >= 4:
        action_score = 10
        issues.append("Use more action verbs like developed, implemented, optimized, and led.")
    elif action_count >= 2:
        action_score = 6
        issues.append("Many bullet points should start with stronger action verbs.")
    else:
        issues.append("Add strong action verbs to project and experience bullets.")

    if contains_number_or_metric(resume_text):
        impact_score = 15
        strengths.append("Resume includes measurable impact or numbers.")
    else:
        issues.append("Add measurable impact using numbers, percentages, scale, or performance improvements.")

    total_score = (
        contact_score
        + section_score
        + industry_keyword_score
        + action_score
        + impact_score
        + formatting_score
    )

    if industry_keyword_score < 15:
        recommendations.append(f"Add more keywords related to {industry} roles.")
    if impact_score < 15:
        recommendations.append("Rewrite bullets to include measurable impact.")
    if action_score < 15:
        recommendations.append("Start more bullets with strong action verbs.")
    recommendations.append("Keep the resume single-column, simple, and ATS-friendly.")

    return {
        "ats_score": min(total_score, 100),
        "breakdown": {
            "contact_info": contact_score,
            "resume_sections": section_score,
            "industry_keywords": industry_keyword_score,
            "action_verbs": action_score,
            "measurable_impact": impact_score,
            "formatting": formatting_score,
        },
        "strengths": strengths,
        "issues": issues,
        "recommendations": recommendations,
        "detected_skills": [format_skill(skill) for skill in sorted(detected_skills)],
    }
