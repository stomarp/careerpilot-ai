EXPERIENCE_LEVEL_LAYOUTS = {
    "new_grad": [
        "summary",
        "education",
        "skills",
        "projects",
        "experience",
    ],
    "entry_level": [
        "summary",
        "skills",
        "projects",
        "experience",
        "education",
    ],
    "experienced": [
        "summary",
        "experience",
        "skills",
        "projects",
        "education",
    ],
    "senior": [
        "executive_summary",
        "experience",
        "leadership_impact",
        "skills",
        "projects",
        "education",
    ],
    "career_change": [
        "summary",
        "skills",
        "projects",
        "experience",
        "education",
    ],
    "internship": [
        "summary",
        "education",
        "skills",
        "projects",
        "experience",
    ],
}


ROLE_KEYWORDS = {
    "software_engineer": [
        "Data Structures",
        "Algorithms",
        "Object-Oriented Programming",
        "REST APIs",
        "Databases",
        "Git",
        "Testing",
        "System Design",
    ],
    "backend_engineer": [
        "REST APIs",
        "PostgreSQL",
        "Docker",
        "AWS",
        "Caching",
        "Distributed Systems",
        "Testing",
        "Scalability",
        "CI/CD",
    ],
    "ai_engineer": [
        "Python",
        "LLMs",
        "RAG",
        "Embeddings",
        "Vector Databases",
        "Evaluation",
        "FastAPI",
        "Prompt Engineering",
        "Agents",
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
        "Student Engagement",
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
        "Content Strategy",
        "Campaign Management",
        "Google Analytics",
        "Email Marketing",
        "Social Media",
        "Market Research",
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


DESIGN_STYLES = {
    "ats_simple": [
        "Use a single-column layout.",
        "Avoid images, icons, tables, and text boxes.",
        "Use standard section headings.",
        "Keep formatting simple for ATS parsing.",
    ],
    "modern_clean": [
        "Use clean spacing and concise sections.",
        "Keep headings modern but readable.",
        "Use simple separators instead of complex graphics.",
        "Best for online applications and portfolio-linked resumes.",
    ],
    "professional_classic": [
        "Use traditional resume ordering and formal wording.",
        "Best for corporate, finance, education, and government-style roles.",
        "Keep tone professional and concise.",
    ],
    "compact_one_page": [
        "Prioritize only the strongest experience and projects.",
        "Use shorter bullets and remove low-impact details.",
        "Best for new grad and entry-level applications.",
    ],
    "technical_project_heavy": [
        "Place technical projects higher.",
        "Include tech stack for each project.",
        "Emphasize architecture, APIs, databases, deployment, and testing.",
    ],
    "minimalist": [
        "Use simple headings and short bullets.",
        "Avoid dense paragraphs.",
        "Focus on clarity and readability.",
    ],
}


RESUME_TEMPLATES = [
    {
        "template_id": "ats_simple",
        "name": "ATS Simple",
        "best_for": "General job applications",
        "description": "A clean single-column resume format optimized for ATS parsing.",
        "experience_level": "general",
        "role_type": "general",
        "design_style": "ats_simple",
        "section_order": ["summary", "skills", "experience", "projects", "education"],
    },
    {
        "template_id": "new_grad_swe",
        "name": "New Grad Software Engineer",
        "best_for": "Entry-level software engineering roles",
        "description": "Highlights education, technical skills, projects, and early experience.",
        "experience_level": "new_grad",
        "role_type": "software_engineer",
        "design_style": "compact_one_page",
        "section_order": EXPERIENCE_LEVEL_LAYOUTS["new_grad"],
    },
    {
        "template_id": "backend_engineer",
        "name": "Backend Engineer",
        "best_for": "Backend/API/platform engineering roles",
        "description": "Emphasizes APIs, databases, cloud, testing, distributed systems, and scalability.",
        "experience_level": "experienced",
        "role_type": "backend_engineer",
        "design_style": "technical_project_heavy",
        "section_order": ["summary", "skills", "experience", "projects", "education"],
    },
    {
        "template_id": "ai_engineer",
        "name": "AI Engineer",
        "best_for": "AI Engineer, GenAI Engineer, and LLM application roles",
        "description": "Highlights AI projects, RAG, embeddings, LLM APIs, Python, backend systems, and evaluation.",
        "experience_level": "entry_level",
        "role_type": "ai_engineer",
        "design_style": "technical_project_heavy",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },
    {
        "template_id": "experienced_professional",
        "name": "Experienced Professional",
        "best_for": "Candidates with strong professional work history",
        "description": "Places professional experience first and emphasizes business impact.",
        "experience_level": "experienced",
        "role_type": "general",
        "design_style": "professional_classic",
        "section_order": EXPERIENCE_LEVEL_LAYOUTS["experienced"],
    },
    {
        "template_id": "senior_engineer",
        "name": "Senior Engineer",
        "best_for": "Senior engineers and technical leads",
        "description": "Highlights leadership, technical ownership, system design, and business impact.",
        "experience_level": "senior",
        "role_type": "software_engineer",
        "design_style": "professional_classic",
        "section_order": EXPERIENCE_LEVEL_LAYOUTS["senior"],
    },
    {
        "template_id": "career_change",
        "name": "Career Change",
        "best_for": "Candidates switching industries or roles",
        "description": "Highlights transferable skills, projects, and role-relevant learning.",
        "experience_level": "career_change",
        "role_type": "general",
        "design_style": "modern_clean",
        "section_order": EXPERIENCE_LEVEL_LAYOUTS["career_change"],
    },
    {
        "template_id": "internship",
        "name": "Internship",
        "best_for": "Students applying for internships",
        "description": "Emphasizes education, coursework, projects, and technical skills.",
        "experience_level": "internship",
        "role_type": "general",
        "design_style": "compact_one_page",
        "section_order": EXPERIENCE_LEVEL_LAYOUTS["internship"],
    },
    {
        "template_id": "data_analyst",
        "name": "Data Analyst",
        "best_for": "Data analyst and business analyst roles",
        "description": "Highlights SQL, dashboards, reporting, data cleaning, and business impact.",
        "experience_level": "entry_level",
        "role_type": "data_analyst",
        "design_style": "modern_clean",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },
    {
        "template_id": "teacher",
        "name": "Education / Teaching",
        "best_for": "Teaching, training, and education roles",
        "description": "Highlights classroom management, curriculum, student outcomes, and communication.",
        "experience_level": "experienced",
        "role_type": "teacher",
        "design_style": "professional_classic",
        "section_order": ["summary", "experience", "skills", "education", "projects"],
    },
    {
        "template_id": "hr",
        "name": "HR / Recruiting",
        "best_for": "Human resources, recruiting, and people operations roles",
        "description": "Highlights recruiting, onboarding, employee relations, HRIS, and compliance.",
        "experience_level": "entry_level",
        "role_type": "hr",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education", "projects"],
    },
    {
        "template_id": "marketing",
        "name": "Marketing",
        "best_for": "Marketing, content, SEO, and campaign roles",
        "description": "Highlights campaigns, analytics, content strategy, SEO, and measurable growth.",
        "experience_level": "entry_level",
        "role_type": "marketing",
        "design_style": "modern_clean",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },
    {
        "template_id": "finance",
        "name": "Finance",
        "best_for": "Finance, accounting, analyst, and business roles",
        "description": "Highlights financial modeling, reporting, budgeting, forecasting, and compliance.",
        "experience_level": "entry_level",
        "role_type": "finance",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education", "projects"],
    },
]


def get_templates() -> list[dict]:
    return RESUME_TEMPLATES


def get_template(template_id: str) -> dict:
    for template in RESUME_TEMPLATES:
        if template["template_id"] == template_id:
            return template

    return RESUME_TEMPLATES[0]


def get_keywords_for_role(role_type: str) -> list[str]:
    return ROLE_KEYWORDS.get(role_type, ROLE_KEYWORDS["general"])


def get_design_guidance(design_style: str) -> list[str]:
    return DESIGN_STYLES.get(design_style, DESIGN_STYLES["ats_simple"])


def get_section_order(
    template_id: str,
    experience_level: str,
) -> list[str]:
    template = get_template(template_id)

    if template.get("section_order"):
        return template["section_order"]

    return EXPERIENCE_LEVEL_LAYOUTS.get(
        experience_level,
        EXPERIENCE_LEVEL_LAYOUTS["new_grad"],
    )
