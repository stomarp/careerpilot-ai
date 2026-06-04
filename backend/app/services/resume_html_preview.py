import html


STYLE_CONFIGS = {
    "ats_simple": {
        "font": "Arial, sans-serif",
        "max_width": "800px",
        "heading_border": "1px solid #222",
        "section_spacing": "18px",
        "notes": [
            "ATS Simple uses a clean single-column layout.",
            "Best for online applications and ATS parsing.",
        ],
    },
    "modern_clean": {
        "font": "Inter, Arial, sans-serif",
        "max_width": "820px",
        "heading_border": "2px solid #555",
        "section_spacing": "20px",
        "notes": [
            "Modern Clean uses polished spacing and clean headings.",
            "Best for tech, business, and portfolio-linked resumes.",
        ],
    },
    "professional_classic": {
        "font": "Georgia, 'Times New Roman', serif",
        "max_width": "800px",
        "heading_border": "1px solid #444",
        "section_spacing": "18px",
        "notes": [
            "Professional Classic uses formal typography and conservative spacing.",
            "Best for corporate, finance, education, and traditional roles.",
        ],
    },
    "compact_one_page": {
        "font": "Arial, sans-serif",
        "max_width": "760px",
        "heading_border": "1px solid #333",
        "section_spacing": "12px",
        "notes": [
            "Compact One Page reduces spacing to fit more content.",
            "Best for new grad, internship, and entry-level resumes.",
        ],
    },
    "technical_project_heavy": {
        "font": "Arial, sans-serif",
        "max_width": "840px",
        "heading_border": "2px solid #222",
        "section_spacing": "20px",
        "notes": [
            "Technical Project Heavy emphasizes technical projects and implementation details.",
            "Best for software, backend, AI, ML, and data roles.",
        ],
    },
    "minimalist": {
        "font": "Helvetica, Arial, sans-serif",
        "max_width": "780px",
        "heading_border": "1px solid #ddd",
        "section_spacing": "16px",
        "notes": [
            "Minimalist uses simple headings and clean readability.",
            "Best when you want a very clear, low-distraction resume.",
        ],
    },
}


def get_style_config(design_style: str) -> dict:
    return STYLE_CONFIGS.get(design_style, STYLE_CONFIGS["ats_simple"])


def convert_inline_markdown(text: str) -> str:
    escaped = html.escape(text)

    # simple bold support: **text**
    parts = escaped.split("**")
    if len(parts) > 1:
        rebuilt = []
        for index, part in enumerate(parts):
            if index % 2 == 1:
                rebuilt.append(f"<strong>{part}</strong>")
            else:
                rebuilt.append(part)
        escaped = "".join(rebuilt)

    return escaped


def markdown_to_html_body(markdown_text: str) -> str:
    lines = markdown_text.splitlines()
    html_lines = []
    in_list = False

    for line in lines:
        stripped = line.strip()

        if not stripped:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            continue

        if stripped.startswith("# "):
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            html_lines.append(f"<h1>{convert_inline_markdown(stripped[2:])}</h1>")

        elif stripped.startswith("## "):
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            html_lines.append(f"<h2>{convert_inline_markdown(stripped[3:])}</h2>")

        elif stripped.startswith("### "):
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            html_lines.append(f"<h3>{convert_inline_markdown(stripped[4:])}</h3>")

        elif stripped.startswith("- ") or stripped.startswith("* "):
            if not in_list:
                html_lines.append("<ul>")
                in_list = True
            html_lines.append(f"<li>{convert_inline_markdown(stripped[2:])}</li>")

        else:
            if in_list:
                html_lines.append("</ul>")
                in_list = False
            html_lines.append(f"<p>{convert_inline_markdown(stripped)}</p>")

    if in_list:
        html_lines.append("</ul>")

    return "\n".join(html_lines)


def build_resume_html(
    resume_markdown: str,
    design_style: str,
) -> dict:
    style = get_style_config(design_style)
    body = markdown_to_html_body(resume_markdown)

    resume_html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Resume Preview</title>
  <style>
    body {{
      margin: 0;
      padding: 32px;
      background: #f4f4f4;
      color: #111;
      font-family: {style["font"]};
    }}

    .resume-page {{
      max-width: {style["max_width"]};
      margin: 0 auto;
      background: #ffffff;
      padding: 42px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      line-height: 1.45;
    }}

    h1 {{
      font-size: 28px;
      margin: 0 0 8px 0;
      text-align: center;
      letter-spacing: 0.2px;
    }}

    h2 {{
      font-size: 16px;
      margin-top: {style["section_spacing"]};
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: {style["heading_border"]};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}

    h3 {{
      font-size: 14px;
      margin-top: 12px;
      margin-bottom: 4px;
    }}

    p {{
      margin: 4px 0;
      font-size: 13px;
    }}

    ul {{
      margin: 6px 0 10px 20px;
      padding: 0;
    }}

    li {{
      margin-bottom: 5px;
      font-size: 13px;
    }}

    strong {{
      font-weight: 700;
    }}

    @media print {{
      body {{
        background: white;
        padding: 0;
      }}

      .resume-page {{
        box-shadow: none;
        padding: 24px;
      }}
    }}
  </style>
</head>
<body>
  <main class="resume-page">
    {body}
  </main>
</body>
</html>
""".strip()

    return {
        "resume_html": resume_html,
        "preview_notes": style["notes"],
    }
