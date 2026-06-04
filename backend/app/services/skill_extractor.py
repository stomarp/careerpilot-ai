import re

from app.services.skill_banks import get_skill_bank


ACTION_VERBS = [
    "built",
    "developed",
    "implemented",
    "designed",
    "created",
    "optimized",
    "improved",
    "reduced",
    "increased",
    "automated",
    "deployed",
    "integrated",
    "collaborated",
    "managed",
    "led",
    "delivered",
    "configured",
    "tested",
    "debugged",
    "refactored",
    "analyzed",
    "coordinated",
    "trained",
    "supported",
    "planned",
    "executed",
]


def normalize_text(text: str) -> str:
    return text.lower()


def extract_skills(text: str, industry: str = "general") -> set[str]:
    normalized_text = normalize_text(text)
    skill_bank = get_skill_bank(industry)
    found_skills = set()

    for skill in skill_bank:
        pattern = r"(?<!\w)" + re.escape(skill.lower()) + r"(?!\w)"

        if re.search(pattern, normalized_text):
            found_skills.add(skill.lower())

    return found_skills


def extract_keywords(text: str) -> set[str]:
    normalized_text = normalize_text(text)

    words = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#./-]{2,}\b", normalized_text)

    stop_words = {
        "and",
        "the",
        "for",
        "with",
        "you",
        "our",
        "are",
        "this",
        "that",
        "will",
        "from",
        "have",
        "has",
        "your",
        "their",
        "team",
        "role",
        "work",
        "using",
        "ability",
        "experience",
        "requirements",
        "responsibilities",
        "candidate",
        "preferred",
        "required",
        "skills",
        "must",
        "plus",
    }

    return {
        word
        for word in words
        if word not in stop_words and len(word) > 2
    }


def format_skill(skill: str) -> str:
    special_cases = {
        "aws": "AWS",
        "gcp": "GCP",
        "ci/cd": "CI/CD",
        "oop": "OOP",
        "rag": "RAG",
        "llm": "LLM",
        "nlp": "NLP",
        "sql": "SQL",
        "html": "HTML",
        "css": "CSS",
        "rest api": "REST API",
        "node.js": "Node.js",
        "next.js": "Next.js",
        "c++": "C++",
        "api": "API",
        "hris": "HRIS",
        "hipaa": "HIPAA",
        "seo": "SEO",
        "crm": "CRM",
        "kpi": "KPI",
        "mlops": "MLOps",
    }

    return special_cases.get(skill.lower(), skill.title())
