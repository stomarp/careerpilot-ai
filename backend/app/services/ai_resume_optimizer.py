import json

from google import genai

from app.core.config import settings
from app.services.ats_scoring import calculate_ats_score


client = genai.Client(api_key=settings.GEMINI_API_KEY)


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
        raise ValueError(f"Gemini response was not valid JSON: {cleaned[:500]}") from exc


def optimize_resume_with_ai(
    resume_text: str,
    job_description_text: str,
    industry: str,
) -> dict:
    ats_result = calculate_ats_score(
        resume_text=resume_text,
        job_description_text=job_description_text,
        industry=industry,
    )

    prompt = f"""
You are an expert resume optimizer similar to Teal, Jobscan, and Rezi.

Analyze the resume against the job description and generate detailed, truthful resume improvement feedback.

Important rules:
- Do not use the word “critical” unless there is a security, legal, or factual issue.
- For date issues, use soft language: “Verify date accuracy” or “Mark as Expected/In Progress if applicable.”
- Do not use “microservices” unless the resume clearly says microservices.
- Prefer “backend services” instead of “microservices” when architecture is unclear.
- For every bullet with a placeholder metric, also provide a no-metric version.
- Avoid words like “misrepresent” or “red flag”; use professional coaching language.
- Do NOT suggest fake experience.
- Do NOT invent dates, graduation years, job dates, project dates, company names, titles, metrics, percentages, latency numbers, user counts, throughput numbers, or time savings.
- Preserve the candidate's original dates exactly. If dates look future-dated or unclear, say "Verify date accuracy" instead of changing the dates.
- If a metric would help, use placeholders like [X%], [N users], or [Y ms] only as optional examples, not as final facts.
- If the resume does not prove a skill, suggest it as a project enhancement first.
- Do NOT present planned future work as completed work.
- Do NOT say "misrepresentation", "immediate disqualification", or use harsh language. Be professional and helpful.
- Do NOT use vague standalone skills like "code", "frameworks", "designers", "developing", "features", "inquisitive", or "well-rounded" as resume keywords.
- Give section-level feedback for Summary, Skills, Experience, Projects, Education, and Certifications.
- Rewrite bullets in an ATS-friendly, recruiter-friendly way.
- Focus on truthful alignment, measurable impact, backend systems, APIs, scalability, testing, cloud, and collaboration.
- Return ONLY valid JSON.
- Do not include markdown.

Industry:
{industry}

ATS result:
{json.dumps(ats_result, indent=2)}

Resume:
{resume_text[:8000]}

Job Description:
{job_description_text[:6000]}

When writing improved versions:
- If the original resume does not prove a claim, phrase it as a suggestion or project enhancement, not as completed experience.
- Keep existing dates unchanged unless the resume explicitly says "Expected".
- If dates may be incorrect, add a note in feedback only: "Verify date accuracy."
- Do not move Education content into Experience.
- Do not invent metrics. Use "improved reliability", "reduced manual effort", or "after measuring" unless exact numbers are already present in the resume.
- For certifications, say "Consider" unless the certification is already listed.
Return JSON with this exact structure:
{{
  "ai_overall_feedback": "string",
  "section_feedback": [
    {{
      "section": "Summary",
      "score": 0,
      "feedback": "string",
      "improved_version": "string"
    }},
    {{
      "section": "Skills",
      "score": 0,
      "feedback": "string",
      "improved_version": "string"
    }},
    {{
      "section": "Experience",
      "score": 0,
      "feedback": "string",
      "improved_version": "string"
    }},
    {{
      "section": "Projects",
      "score": 0,
      "feedback": "string",
      "improved_version": "string"
    }},
    {{
      "section": "Education",
      "score": 0,
      "feedback": "string",
      "improved_version": "string"
    }},
    {{
      "section": "Certifications",
      "score": 0,
      "feedback": "string",
      "improved_version": "string"
    }}
  ],
  "improved_bullets": [
    {{
      "current_or_target_section": "string",
      "improved_bullet": "string",
      "why_it_helps": "string",
      "truthfulness_note": "string"
    }}
  ],
  "missing_keywords_to_add_truthfully": ["string"],
  "project_enhancements": [
    {{
      "project": "string",
      "enhancement_to_build": "string",
      "resume_bullet_after_building": "string",
      "difficulty": "Easy | Medium | Hard"
    }}
  ],
  "certifications_or_learning": ["string"],
  "final_warning": "string"
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    ai_result = safe_json_loads(response.text)

    return {
        "ats_score": ats_result["ats_score"],
        "ai_overall_feedback": ai_result.get("ai_overall_feedback", ""),
        "section_feedback": ai_result.get("section_feedback", []),
        "improved_bullets": ai_result.get("improved_bullets", []),
        "missing_keywords_to_add_truthfully": ai_result.get(
            "missing_keywords_to_add_truthfully",
            [],
        ),
        "project_enhancements": ai_result.get("project_enhancements", []),
        "certifications_or_learning": ai_result.get(
            "certifications_or_learning",
            [],
        ),
        "final_warning": ai_result.get(
            "final_warning",
            "Only add truthful skills and experience.",
        ),
    }
