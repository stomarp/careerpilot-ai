import json

from google import genai
from app.services.text_cleaner import clean_list, clean_text
from app.core.config import settings
from app.schemas.resume_builder import AIFullResumeGenerateRequest
from app.services.resume_builder import build_resume_markdown
from app.services.resume_templates import (
    get_design_guidance,
    get_keywords_for_role,
    get_section_order,
)


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


def build_rule_based_full_resume(
    request: AIFullResumeGenerateRequest,
    failure_reason: str,
) -> dict:
    from app.schemas.resume_builder import ResumeCreateRequest

    fallback_request = ResumeCreateRequest(
        template_id=request.template_id,
        experience_level=request.experience_level,
        role_type=request.role_type,
        design_style=request.design_style,
        full_name=request.profile.full_name,
        email=request.profile.email,
        phone=request.profile.phone,
        location=request.profile.location,
        linkedin=request.profile.linkedin,
        github=request.profile.github,
        target_role=request.target_role,
        summary=request.summary_notes
        or f"{request.target_role}-focused candidate with hands-on experience building practical projects and applying role-relevant technical skills.",
        skills=request.skills,
        education=request.education,
        experience=request.experience,
        projects=request.projects,
    )

    built_resume = build_resume_markdown(fallback_request)

    return {
        "provider_used": "rule_based_fallback",
        "fallback_used": True,
        "resume_markdown": built_resume["resume_markdown"],
        "generated_summary": fallback_request.summary or "",
        "generated_skills": request.skills,
        "suggestions": [
            f"AI provider was unavailable, so rule-based resume generation was used. Reason: {failure_reason}",
            "Add measurable impact where truthful.",
            "Use role-specific keywords naturally.",
            "Review dates and ensure all experience is accurate.",
        ],
        "final_warning": "Only include truthful, verifiable experience and skills.",
    }
def validate_ai_resume_did_not_change_dates(
    request: AIFullResumeGenerateRequest,
    resume_markdown: str,
) -> list[str]:
    warnings = []

    expected_dates = []

    for item in request.education:
        if item.start_date:
            expected_dates.append(item.start_date)
        if item.end_date:
            expected_dates.append(item.end_date)

    for item in request.experience:
        if item.start_date:
            expected_dates.append(item.start_date)
        if item.end_date:
            expected_dates.append(item.end_date)

    for item in request.projects:
        if item.start_date:
            expected_dates.append(item.start_date)
        if item.end_date:
            expected_dates.append(item.end_date)

    for date in expected_dates:
        if date and date not in resume_markdown:
            warnings.append(
                f"Date validation warning: expected date '{date}' was not found in generated resume."
            )

    return warnings

def generate_full_resume_with_ai(
    request: AIFullResumeGenerateRequest,
) -> dict:
    try:
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is missing.")

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        role_keywords = get_keywords_for_role(request.role_type)
        section_order = get_section_order(
            template_id=request.template_id,
            experience_level=request.experience_level,
        )
        design_guidance = get_design_guidance(request.design_style)

        prompt = f"""
You are an expert resume writer and ATS resume builder.

Generate a complete ATS-friendly resume in Markdown from structured user input.

Important rules:
- Do NOT invent fake experience, companies, degrees, certifications, dates, metrics, percentages, tools, or technologies.
- NEVER change any provided dates.
- Preserve all dates exactly as provided in the input.
- If a date looks future-dated, unclear, or possibly incorrect, keep the original date unchanged and add a suggestion saying: "Verify date accuracy."
- Do NOT adjust dates for chronological consistency.
- Do NOT convert future dates into past dates.
- Do NOT present planned work as completed.
- Do NOT add tools that were not provided unless clearly marked as suggestions.
- Do NOT add Distributed Systems, CI/CD, Jenkins, AWS services, or other keywords unless they are present in the input or clearly suggested as optional.
- If a metric would help but is not provided, use a no-metric version. Do not add fake percentages, fake user counts, fake latency numbers, or fake throughput.
- Keep the resume truthful, concise, and recruiter-friendly.
- Use strong action verbs.
- Follow the requested section order.
- Use the selected role type, experience level, and design style.
- Return ONLY valid JSON.
- Do not include markdown fences.

Target role:
{request.target_role}

Experience level:
{request.experience_level}

Role type:
{request.role_type}

Template ID:
{request.template_id}

Design style:
{request.design_style}

Section order:
{section_order}

Role keywords:
{role_keywords}

Design guidance:
{design_guidance}

Profile:
{request.profile.model_dump()}

Summary notes:
{request.summary_notes}

Skills:
{request.skills}

Education:
{[item.model_dump() for item in request.education]}

Experience:
{[item.model_dump() for item in request.experience]}

Projects:
{[item.model_dump() for item in request.projects]}

Date handling examples:
- If input says "Mar 2026 - Present", output must also say "Mar 2026 - Present".
- If input says "Jan 2026 - Mar 2026", output must also say "Jan 2026 - Mar 2026".
- Do not rewrite those dates as 2024, 2025, or any other year.
- If the date may be questionable, add a suggestion: "Verify whether project dates should be marked as Planned, In Progress, or Completed."

Skill handling examples:
- If the input does not mention Redis, Kubernetes, Kafka, RabbitMQ, microservices, or distributed systems, do not add them to the final resume as completed skills.
- You may suggest them separately in the suggestions list as optional learning or project enhancements.

When writing resume_markdown:
- Preserve all provided dates exactly.
- Preserve provided schools, companies, project names, and titles exactly.
- Improve wording, but do not change facts.
- Keep optional suggestions separate from the resume body.

Return JSON with this exact structure:
{{
  "resume_markdown": "string",
  "generated_summary": "string",
  "generated_skills": ["string"],
  "suggestions": ["string"],
  "final_warning": "string"
}}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        ai_result = safe_json_loads(response.text)
        date_warnings = validate_ai_resume_did_not_change_dates(
            request=request,
            resume_markdown=ai_result.get("resume_markdown", ""),
        )

        return {
            "provider_used": "gemini",
            "fallback_used": False,
            "resume_markdown": clean_text(ai_result.get("resume_markdown", "")),
            "generated_summary": clean_text(ai_result.get("generated_summary", "")),
            "generated_skills": clean_list(ai_result.get("generated_skills", [])),
            "suggestions": clean_list(ai_result.get("suggestions", []) + date_warnings),
            "final_warning": clean_text(
                ai_result.get(
                    "final_warning",
                    "Only include truthful, verifiable experience and skills.",
                )    
            ),
        }

    except Exception as exc:
        return build_rule_based_full_resume(
            request=request,
            failure_reason=str(exc),
        )
