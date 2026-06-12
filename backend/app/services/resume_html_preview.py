from __future__ import annotations

import html
import re
from dataclasses import dataclass


@dataclass(frozen=True)
class TemplateFamily:
    family_id: str
    display_name: str
    ats_level: str
    layout: str
    notes: list[str]
    accent: str = "#111827"


TEMPLATE_FAMILY_BY_TEMPLATE_ID: dict[str, str] = {
    # Featured / general
    "ats_simple": "precision_ats",
    "modern_clean": "modern_clean",
    "minimalist_expert": "monochrome",
    "career_change": "gold_standard",
    "executive": "authority",

    # Technology
    "new_grad_swe": "new_grad",
    "backend_engineer": "technical_compact",
    "ai_engineer": "technical_compact",
    "data_analyst": "technical_compact",
    "product_manager": "clear_two_column",
    "ux_designer": "clear_two_column",

    # Business
    "finance": "gold_standard",
    "marketing": "modern_clean",
    "sales": "modern_clean",
    "hr": "gold_standard",
    "operations": "gold_standard",
    "admin_assistant": "precision_ats",

    # Healthcare
    "healthcare_admin": "gold_standard",
    "medical_assistant": "gold_standard",
    "nursing_support": "gold_standard",

    # Education
    "teacher": "modern_clean",
    "instructional_designer": "clear_two_column",

    # Support / Legal
    "customer_support": "precision_ats",
    "legal_assistant": "precision_ats",
}


TEMPLATE_FAMILIES: dict[str, TemplateFamily] = {
    "precision_ats": TemplateFamily(
        family_id="precision_ats",
        display_name="Precision ATS",
        ats_level="Maximum ATS-safe",
        layout="Single-column",
        accent="#111827",
        notes=[
            "Single-column ATS-safe layout inspired by Jobscan/Rezi style formatting.",
            "Uses simple headings, standard font sizing, and clean section dividers.",
            "Best for online applications and parser-friendly resumes.",
        ],
    ),
    "gold_standard": TemplateFamily(
        family_id="gold_standard",
        display_name="Gold Standard",
        ats_level="ATS-safe",
        layout="Single-column professional",
        accent="#7c2d12",
        notes=[
            "Conservative professional layout for finance, legal, healthcare, and administration.",
            "Keeps formatting clean while adding stronger recruiter readability.",
            "Good for PDF and DOCX exports.",
        ],
    ),
    "monochrome": TemplateFamily(
        family_id="monochrome",
        display_name="Monochrome",
        ats_level="ATS-safe",
        layout="Single-column bold",
        accent="#000000",
        notes=[
            "Premium black-and-white style with bold section headers.",
            "Clean enough for ATS while feeling more polished than a plain resume.",
            "Good for general professional applications.",
        ],
    ),
    "modern_clean": TemplateFamily(
        family_id="modern_clean",
        display_name="Modern Clean",
        ats_level="Recruiter-friendly",
        layout="Modern one-column",
        accent="#1d4ed8",
        notes=[
            "Modern one-column layout with subtle accent styling.",
            "Designed for recruiter readability and clean PDF presentation.",
            "Still avoids tables and complex graphics.",
        ],
    ),
    "technical_compact": TemplateFamily(
        family_id="technical_compact",
        display_name="Technical Compact",
        ats_level="ATS-safe",
        layout="Skills/projects focused",
        accent="#4c1d95",
        notes=[
            "Tech/startup-ready layout with skills and projects emphasized.",
            "Best for SWE, AI, backend, and data roles.",
            "Compact spacing helps fit strong technical content on one page.",
        ],
    ),
    "new_grad": TemplateFamily(
        family_id="new_grad",
        display_name="New Grad",
        ats_level="ATS-safe",
        layout="Education/projects first",
        accent="#075985",
        notes=[
            "Education and projects-first layout for students and new graduates.",
            "Highlights coursework, technical skills, projects, and early experience.",
            "Good for internships, entry-level software, and AI roles.",
        ],
    ),
    "authority": TemplateFamily(
        family_id="authority",
        display_name="Authority",
        ats_level="Recruiter-friendly",
        layout="Executive single-column",
        accent="#292524",
        notes=[
            "Executive-style layout with strong header and leadership emphasis.",
            "Best for senior candidates, managers, and leadership profiles.",
            "Uses polished spacing while staying structurally simple.",
        ],
    ),
    "clear_two_column": TemplateFamily(
        family_id="clear_two_column",
        display_name="Clear Two Column",
        ats_level="Visual PDF",
        layout="Two-column hybrid",
        accent="#047857",
        notes=[
            "Resume.io-style visual layout with a sidebar for skills/contact.",
            "Best for recruiter-facing PDFs, product, design, marketing, and portfolio roles.",
            "For maximum ATS safety, use Precision ATS instead.",
        ],
    ),
}


def normalize_density(density: str) -> str:
    if density in {"compact", "normal", "spacious"}:
        return density
    return "normal"


def safe_font(font_family: str) -> str:
    allowed = {
        "Arial": "Arial, Helvetica, sans-serif",
        "Calibri": "Calibri, Arial, sans-serif",
        "Helvetica": "Helvetica, Arial, sans-serif",
        "Georgia": "Georgia, serif",
        "Times New Roman": "'Times New Roman', Times, serif",
    }
    return allowed.get(font_family, "Arial, Helvetica, sans-serif")


def safe_font_size(font_size: str) -> str:
    allowed = {"10pt", "10.5pt", "11pt", "11.5pt", "12pt"}
    return font_size if font_size in allowed else "11pt"


def safe_color(color: str, fallback: str) -> str:
    if re.fullmatch(r"#[0-9a-fA-F]{6}", color or ""):
        return color
    return fallback


def family_for_template(template_id: str, design_style: str = "ats_simple") -> TemplateFamily:
    family_id = TEMPLATE_FAMILY_BY_TEMPLATE_ID.get(template_id)

    if not family_id:
        family_id = {
            "ats_simple": "precision_ats",
            "professional_classic": "gold_standard",
            "modern_clean": "modern_clean",
            "compact_one_page": "technical_compact",
            "technical_project_heavy": "technical_compact",
            "executive": "authority",
        }.get(design_style, "precision_ats")

    return TEMPLATE_FAMILIES[family_id]


def parse_markdown_resume(markdown: str) -> dict:
    lines = [line.rstrip() for line in markdown.strip().splitlines()]
    title = "Resume"
    contact = ""
    sections: list[dict] = []

    current_section: dict | None = None
    body_before_sections: list[str] = []

    for raw_line in lines:
        line = raw_line.strip()

        if not line:
            if current_section is not None:
                current_section["lines"].append("")
            elif body_before_sections:
                body_before_sections.append("")
            continue

        if line.startswith("# "):
            title = line[2:].strip()
            continue

        if line.startswith("## "):
            if current_section is not None:
                sections.append(current_section)
            current_section = {"heading": line[3:].strip(), "lines": []}
            continue

        if current_section is None:
            if not contact:
                contact = line
            else:
                body_before_sections.append(line)
        else:
            current_section["lines"].append(line)

    if current_section is not None:
        sections.append(current_section)

    if body_before_sections:
        sections.insert(0, {"heading": "Summary", "lines": body_before_sections})

    return {
        "title": title,
        "contact": contact,
        "sections": sections,
    }


def inline_markdown_to_html(text: str) -> str:
    escaped = html.escape(text)

    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"\*(.+?)\*", r"<em>\1</em>", escaped)

    return escaped


def render_lines(lines: list[str]) -> str:
    html_parts: list[str] = []
    open_list = False

    for line in lines:
        stripped = line.strip()

        if not stripped:
            if open_list:
                html_parts.append("</ul>")
                open_list = False
            continue

        if stripped.startswith("- "):
            if not open_list:
                html_parts.append("<ul>")
                open_list = True
            html_parts.append(f"<li>{inline_markdown_to_html(stripped[2:].strip())}</li>")
            continue

        if open_list:
            html_parts.append("</ul>")
            open_list = False

        html_parts.append(f"<p>{inline_markdown_to_html(stripped)}</p>")

    if open_list:
        html_parts.append("</ul>")

    return "\n".join(html_parts)


def render_sections(sections: list[dict], family_id: str) -> str:
    section_html: list[str] = []

    for section in sections:
        heading = html.escape(section["heading"])
        content = render_lines(section["lines"])

        section_html.append(
            f'''
            <section class="resume-section resume-section-{family_id}">
              <h2>{heading}</h2>
              <div class="section-body">
                {content}
              </div>
            </section>
            '''
        )

    return "\n".join(section_html)


def render_sidebar(parsed: dict) -> str:
    sidebar_sections = []
    main_sections = []

    for section in parsed["sections"]:
        heading = section["heading"].lower()
        if "skill" in heading or "education" in heading or "certification" in heading:
            sidebar_sections.append(section)
        else:
            main_sections.append(section)

    if not sidebar_sections:
        sidebar_sections = parsed["sections"][:1]
        main_sections = parsed["sections"][1:]

    return f'''
    <aside class="resume-sidebar">
      <div class="sidebar-contact">{html.escape(parsed["contact"])}</div>
      {render_sections(sidebar_sections, "sidebar")}
    </aside>
    <main class="resume-main">
      {render_sections(main_sections, "two-column")}
    </main>
    '''


def build_css(
    family: TemplateFamily,
    font_family: str,
    font_size: str,
    accent_color: str,
    density: str,
) -> str:
    density = normalize_density(density)
    base_font = safe_font(font_family)
    base_size = safe_font_size(font_size)
    accent = safe_color(accent_color, family.accent)

    spacing = {
        "compact": {
            "page_padding": "34px",
            "section_margin": "15px",
            "line_height": "1.38",
            "h1": "28px",
            "h2": "12px",
        },
        "normal": {
            "page_padding": "44px",
            "section_margin": "20px",
            "line_height": "1.48",
            "h1": "32px",
            "h2": "13px",
        },
        "spacious": {
            "page_padding": "54px",
            "section_margin": "26px",
            "line_height": "1.58",
            "h1": "36px",
            "h2": "14px",
        },
    }[density]

    common = f'''
    :root {{
      --accent: {accent};
      --text: #111827;
      --muted: #4b5563;
      --line: #d1d5db;
      --soft: #f3f4f6;
      --page-padding: {spacing["page_padding"]};
      --section-margin: {spacing["section_margin"]};
      --line-height: {spacing["line_height"]};
      --h1-size: {spacing["h1"]};
      --h2-size: {spacing["h2"]};
    }}

    * {{
      box-sizing: border-box;
    }}

    body {{
      margin: 0;
      background: #f3f4f6;
      color: var(--text);
      font-family: {base_font};
      font-size: {base_size};
    }}

    .resume-page {{
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      background: #ffffff;
      color: var(--text);
      box-shadow: 0 18px 60px rgba(15, 23, 42, 0.14);
    }}

    .resume-inner {{
      padding: var(--page-padding);
    }}

    h1 {{
      margin: 0;
      font-size: var(--h1-size);
      line-height: 1.05;
      letter-spacing: -0.03em;
    }}

    .contact {{
      margin-top: 8px;
      color: var(--muted);
      font-size: 10pt;
      line-height: 1.35;
    }}

    .resume-section {{
      margin-top: var(--section-margin);
    }}

    .resume-section h2 {{
      margin: 0 0 8px;
      font-size: var(--h2-size);
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }}

    .section-body p {{
      margin: 5px 0;
      line-height: var(--line-height);
    }}

    .section-body ul {{
      margin: 6px 0 0 18px;
      padding: 0;
    }}

    .section-body li {{
      margin: 4px 0;
      line-height: var(--line-height);
    }}

    strong {{
      font-weight: 700;
    }}

    @media print {{
      body {{
        background: white;
      }}

      .resume-page {{
        box-shadow: none;
        margin: 0;
        width: 100%;
      }}
    }}
    '''

    family_css = {
        "precision_ats": '''
        .header {
          text-align: center;
          border-bottom: 1px solid var(--line);
          padding-bottom: 14px;
        }

        .resume-section h2 {
          border-bottom: 1px solid var(--line);
          padding-bottom: 5px;
          color: #111827;
        }
        ''',
        "gold_standard": '''
        .header {
          text-align: left;
          border-bottom: 2px solid var(--accent);
          padding-bottom: 14px;
        }

        .header h1 {
          color: var(--accent);
        }

        .resume-section h2 {
          color: var(--accent);
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 6px;
        }
        ''',
        "monochrome": '''
        .header {
          text-align: left;
          padding-bottom: 16px;
        }

        .header h1 {
          border-bottom: 4px solid #111827;
          display: inline-block;
          padding-bottom: 6px;
        }

        .resume-section h2 {
          background: #111827;
          color: white;
          padding: 6px 9px;
          letter-spacing: 0.16em;
        }
        ''',
        "modern_clean": '''
        .header {
          border-left: 7px solid var(--accent);
          padding-left: 18px;
          padding-bottom: 8px;
        }

        .header h1 {
          color: #0f172a;
        }

        .resume-section h2 {
          color: var(--accent);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .resume-section h2::after {
          content: "";
          height: 1px;
          background: #dbeafe;
          flex: 1;
        }
        ''',
        "technical_compact": '''
        .header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: end;
          border-bottom: 3px solid var(--accent);
          padding-bottom: 12px;
        }

        .contact {
          text-align: right;
          max-width: 260px;
        }

        .resume-section h2 {
          color: var(--accent);
          border-bottom: 1px solid #ddd6fe;
          padding-bottom: 5px;
        }

        .resume-section:first-of-type + .resume-section,
        .resume-section:nth-of-type(2) {
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          padding: 10px 12px;
          border-radius: 10px;
        }
        ''',
        "new_grad": '''
        .header {
          text-align: center;
          padding-bottom: 12px;
          border-bottom: 3px double var(--accent);
        }

        .header h1 {
          color: var(--accent);
        }

        .resume-section h2 {
          color: var(--accent);
          border-bottom: 1px solid #bae6fd;
          padding-bottom: 5px;
        }

        .resume-section:nth-of-type(2),
        .resume-section:nth-of-type(3) {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          padding: 10px 12px;
          border-radius: 10px;
        }
        ''',
        "authority": '''
        .header {
          background: #292524;
          color: white;
          padding: 24px;
          margin: calc(var(--page-padding) * -1) calc(var(--page-padding) * -1) 24px;
        }

        .header .contact {
          color: #e7e5e4;
        }

        .resume-section h2 {
          color: #292524;
          border-bottom: 2px solid #292524;
          padding-bottom: 6px;
        }

        .resume-section:first-of-type {
          font-size: 12pt;
        }
        ''',
        "clear_two_column": '''
        .resume-inner {
          padding: 0;
        }

        .header {
          padding: 34px 40px 22px;
          background: var(--accent);
          color: white;
        }

        .header .contact {
          color: #ecfdf5;
        }

        .two-column-layout {
          display: grid;
          grid-template-columns: 32% 68%;
          min-height: calc(11in - 130px);
        }

        .resume-sidebar {
          background: #ecfdf5;
          padding: 28px 22px;
        }

        .resume-main {
          padding: 28px 36px;
        }

        .resume-sidebar .resume-section h2 {
          color: var(--accent);
          border-bottom: 1px solid #a7f3d0;
          padding-bottom: 5px;
        }

        .resume-main .resume-section h2 {
          color: var(--accent);
          border-bottom: 1px solid #a7f3d0;
          padding-bottom: 5px;
        }

        .sidebar-contact {
          color: #065f46;
          font-size: 9.5pt;
          line-height: 1.45;
          margin-bottom: 18px;
        }
        ''',
    }[family.family_id]

    return common + family_css


def render_resume_html(
    parsed: dict,
    family: TemplateFamily,
    font_family: str,
    font_size: str,
    accent_color: str,
    density: str,
) -> str:
    css = build_css(family, font_family, font_size, accent_color, density)

    title = html.escape(parsed["title"])
    contact = html.escape(parsed["contact"])

    if family.family_id == "clear_two_column":
        body = f'''
        <div class="resume-page template-{family.family_id}">
          <div class="resume-inner">
            <header class="header">
              <h1>{title}</h1>
              <div class="contact">{contact}</div>
            </header>
            <div class="two-column-layout">
              {render_sidebar(parsed)}
            </div>
          </div>
        </div>
        '''
    else:
        body = f'''
        <div class="resume-page template-{family.family_id}">
          <div class="resume-inner">
            <header class="header">
              <h1>{title}</h1>
              <div class="contact">{contact}</div>
            </header>
            {render_sections(parsed["sections"], family.family_id)}
          </div>
        </div>
        '''

    return f'''
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{css}</style>
      </head>
      <body>{body}</body>
    </html>
    '''


def build_resume_html(
    resume_markdown: str,
    design_style: str = "ats_simple",
    template_id: str = "ats_simple",
    font_family: str = "Arial",
    font_size: str = "11pt",
    accent_color: str = "#111827",
    density: str = "normal",
) -> dict:
    family = family_for_template(template_id=template_id, design_style=design_style)
    parsed = parse_markdown_resume(resume_markdown)

    resume_html = render_resume_html(
        parsed=parsed,
        family=family,
        font_family=font_family,
        font_size=font_size,
        accent_color=accent_color,
        density=density,
    )

    return {
        "design_style": design_style,
        "template_id": template_id,
        "template_family": family.family_id,
        "resume_markdown": resume_markdown,
        "resume_html": resume_html,
        "preview_notes": [
            f"Template family: {family.display_name}.",
            f"Layout: {family.layout}.",
            f"ATS level: {family.ats_level}.",
            *family.notes,
        ],
    }
