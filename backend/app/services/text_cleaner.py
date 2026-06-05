import re


def clean_text(text: str) -> str:
    """
    Cleans small formatting issues from AI/parser output without changing facts.
    """
    if not text:
        return text

    cleaned = text.strip()

    # Fix duplicated punctuation like "..", ",,", ";;"
    cleaned = re.sub(r"\.{2,}", ".", cleaned)
    cleaned = re.sub(r",{2,}", ",", cleaned)
    cleaned = re.sub(r";{2,}", ";", cleaned)
    cleaned = re.sub(r":{2,}", ":", cleaned)

    # Fix space before punctuation
    cleaned = re.sub(r"\s+([.,;:])", r"\1", cleaned)

    # Normalize multiple spaces
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned)

    # Normalize excessive blank lines
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    return cleaned.strip()


def clean_list(items: list[str]) -> list[str]:
    return [clean_text(item) for item in items if clean_text(item)]


def clean_resume_sections(sections: dict) -> dict:
    """
    Cleans extracted resume section data while preserving original facts/dates.
    """
    cleaned_sections = sections.copy()

    for key in [
        "full_name",
        "email",
        "phone",
        "location",
        "linkedin",
        "github",
        "summary",
    ]:
        if key in cleaned_sections and isinstance(cleaned_sections[key], str):
            cleaned_sections[key] = clean_text(cleaned_sections[key])

    if "skills" in cleaned_sections:
        cleaned_sections["skills"] = clean_list(cleaned_sections.get("skills", []))

    for section_name in ["education", "experience", "projects"]:
        cleaned_items = []

        for item in cleaned_sections.get(section_name, []):
            cleaned_item = {}

            for key, value in item.items():
                if isinstance(value, str):
                    cleaned_item[key] = clean_text(value)
                elif isinstance(value, list):
                    cleaned_item[key] = clean_list(value)
                else:
                    cleaned_item[key] = value

            cleaned_items.append(cleaned_item)

        cleaned_sections[section_name] = cleaned_items

    return cleaned_sections
