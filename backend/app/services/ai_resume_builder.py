import json

from google import genai

from app.core.config import settings
from app.services.text_cleaner import clean_list, clean_text


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
            f"Gemini response was not valid JSON: {cleaned[:500]}"
        ) from exc


def build_rule_based_resume_enhancement(
    target_role: str,
    experience_level: str,
    role_type: str,
    rough_summary: str | None,
    rough_skills: list[str],
    rough_experience: list[str],
    rough_projects: list[str],
    failure_reason: str,
) -> dict:
    enhanced_summary = rough_summary or (
        f"{target_role}-focused candidate with hands-on experience building technical projects, "
        "solving problems, and applying role-relevant tools in practical workflows."
    )

    enhanced_skills = rough_skills

    enhanced_bullets = []

    for bullet in rough_experience:
        improved = (
            f"Contributed to {target_role.lower()} responsibilities by {bullet.strip()}."
        )

        enhanced_bullets.append(
            {
                "section": "Experience",
                "original": bullet,
                "improved": improved,
                "why_it_is_better": "Makes the bullet more role-aligned and action-oriented.",
            }
        )

    for bullet in rough_projects:
        improved = (
            f"Built a role-relevant project that {bullet.strip()}, demonstrating practical "
            f"{target_role} skills."
        )

        enhanced_bullets.append(
            {
                "section": "Projects",
                "original": bullet,
                "improved": improved,
                "why_it_is_better": "Connects the project to the target role and emphasizes practical impact.",
            }
        )

    section_suggestions = [
        {
            "section": "Summary",
            "content": "Keep your summary short, role-specific, and keyword-rich.",
        },
        {
            "section": "Skills",
            "content": "Group skills by category such as Languages, Backend, Databases, Cloud, Tools, and Core CS.",
        },
        {
            "section": "Projects",
            "content": "For each project, include the tech stack, problem solved, implementation details, and impact.",
        },
    ]

    return {
        "provider_used": "rule_based_fallback",
        "fallback_used": True,
        "enhanced_summary": enhanced_summary,
        "enhanced_skills": enhanced_skills,
        "enhanced_bullets": enhanced_bullets,
        "section_suggestions": section_suggestions,
        "final_notes": [
            f"AI provider was unavailable, so rule-based enhancement was used. Reason: {failure_reason}",
            "Only include skills and claims you can truthfully explain in an interview.",
        ],
    }


def enhance_resume_with_ai(
    target_role: str,
    experience_level: str,
    role_type: str,
    rough_summary: str | None,
    rough_skills: list[str],
    rough_experience: list[str],
    rough_projects: list[str],
) -> dict:
    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing.")

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        prompt = f"""
You are an expert resume writer and career coach.

Create polished, truthful resume content from rough user input.

Important rules:
- Do NOT invent fake experience.
- Do NOT invent companies, degrees, certifications, dates, metrics, or tools.
- If a metric would help, use placeholders like [X%] only as optional examples.
- Keep bullets ATS-friendly and recruiter-friendly.
- Use strong action verbs.
- Make the content align with the target role.
- If the user gives weak or rough wording, rewrite it professionally.
- Return ONLY valid JSON.
- Do not include markdown.

Target role:
{target_role}

Experience level:
{experience_level}

Role type:
{role_type}

Rough summary:
{rough_summary}

Rough skills:
{rough_skills}

Rough experience bullets:
{rough_experience}

Rough project bullets:
{rough_projects}

Return JSON with this exact structure:
{{
  "enhanced_summary": "string",
  "enhanced_skills": ["string"],
  "enhanced_bullets": [
    {{
      "section": "Experience or Projects",
      "original": "string",
      "improved": "string",
      "why_it_is_better": "string"
    }}
  ],
  "section_suggestions": [
    {{
      "section": "string",
      "content": "string"
    }}
  ],
  "final_notes": ["string"]
}}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        ai_result = safe_json_loads(response.text)

        return {
            "enhanced_summary": clean_text(ai_result.get("enhanced_summary", "")),
            "enhanced_skills": clean_list(ai_result.get("enhanced_skills", [])),
            "enhanced_bullets": ai_result.get("enhanced_bullets", []),
            "section_suggestions": ai_result.get("section_suggestions", []),
            "final_notes": clean_list(
                ai_result.get(
                    "final_notes",
                    ["Only include truthful and verifiable experience."],
                )
            ),
        }

    except Exception as exc:
        return build_rule_based_resume_enhancement(
            target_role=target_role,
            experience_level=experience_level,
            role_type=role_type,
            rough_summary=rough_summary,
            rough_skills=rough_skills,
            rough_experience=rough_experience,
            rough_projects=rough_projects,
            failure_reason=str(exc),
        )
