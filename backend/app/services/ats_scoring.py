from app.services.skill_extractor import (
    extract_keywords,
    extract_skills,
    format_skill,
)


def generate_job_match_recommendations(
    missing_skills: list[str],
    missing_keywords: list[str],
    ats_score: int,
    industry: str,
) -> list[str]:
    recommendations = []

    if missing_skills:
        top_missing = ", ".join(missing_skills[:5])
        recommendations.append(
            f"Add or highlight relevant {industry} experience for these missing skills: {top_missing}."
        )

    if missing_keywords:
        top_keywords = ", ".join(missing_keywords[:5])
        recommendations.append(
            f"Consider naturally adding important job keywords if truthful: {top_keywords}."
        )

    if ats_score < 60:
        recommendations.append("This resume needs stronger alignment with the job description.")
    elif ats_score < 80:
        recommendations.append("This resume has moderate alignment. Tailor project and experience bullets to the role.")
    else:
        recommendations.append("This resume has strong alignment with the job description.")

    recommendations.append("Do not add skills you do not actually have.")

    return recommendations


def calculate_ats_score(
    resume_text: str,
    job_description_text: str,
    industry: str = "general",
) -> dict:
    resume_skills = extract_skills(resume_text, industry)
    job_skills = extract_skills(job_description_text, industry)

    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description_text)

    if not job_description_text.strip():
        return {
            "ats_score": 0,
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
            "recommendations": ["Job description is empty or could not be parsed."],
        }

    matching_skills = sorted(resume_skills.intersection(job_skills))
    missing_skills = sorted(job_skills.difference(resume_skills))

    matched_keywords = sorted(resume_keywords.intersection(job_keywords))
    missing_keywords = sorted(job_keywords.difference(resume_keywords))

    skills_score = round((len(matching_skills) / len(job_skills)) * 35) if job_skills else 10

    important_job_keywords = {keyword for keyword in job_keywords if len(keyword) > 3}

    keyword_score = (
        round((len(resume_keywords.intersection(important_job_keywords)) / len(important_job_keywords)) * 25)
        if important_job_keywords
        else 5
    )

    industry_score = 15 if len(matching_skills) >= 5 else min(15, len(matching_skills) * 3)

    resume_lower = resume_text.lower()
    experience_terms = [
        "experience",
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
    formatted_missing_skills = [format_skill(skill) for skill in missing_skills]

    return {
        "ats_score": total_score,
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
        "matched_keywords": matched_keywords[:20],
        "missing_keywords": missing_keywords[:20],
        "recommendations": generate_job_match_recommendations(
            missing_skills=formatted_missing_skills,
            missing_keywords=missing_keywords[:20],
            ats_score=total_score,
            industry=industry,
        ),
    }
