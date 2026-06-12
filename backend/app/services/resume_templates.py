EXPERIENCE_LEVEL_LAYOUTS = {
    "new_grad": ["summary", "education", "skills", "projects", "experience"],
    "entry_level": ["summary", "skills", "projects", "experience", "education"],
    "experienced": ["summary", "experience", "skills", "projects", "education"],
    "senior": ["executive_summary", "experience", "leadership_impact", "skills", "education"],
    "career_change": ["summary", "skills", "projects", "experience", "education"],
    "internship": ["summary", "education", "skills", "projects", "experience"],
    "general": ["summary", "skills", "experience", "projects", "education"],
}


ROLE_KEYWORDS = {
    "general": [
        "Communication", "Collaboration", "Problem Solving", "Project Management",
        "Documentation", "Customer Service", "Operations", "Process Improvement",
    ],

    # Technology
    "software_engineer": [
        "Data Structures", "Algorithms", "Object-Oriented Programming", "REST APIs",
        "Databases", "Git", "Testing", "System Design", "Agile",
    ],
    "backend_engineer": [
        "REST APIs", "PostgreSQL", "Docker", "AWS", "Caching", "CI/CD",
        "Scalability", "Reliability", "Distributed Systems", "Testing",
    ],
    "ai_engineer": [
        "Python", "LLMs", "RAG", "Embeddings", "Vector Databases", "FastAPI",
        "Prompt Engineering", "Evaluation", "Agents", "AI Workflows",
    ],
    "data_analyst": [
        "SQL", "Excel", "Python", "Tableau", "Power BI", "Dashboards",
        "Data Cleaning", "Reporting", "Business Intelligence", "KPIs",
    ],
    "product_manager": [
        "Roadmaps", "User Research", "Prioritization", "Product Strategy",
        "Stakeholder Management", "Agile", "Analytics", "Go-to-Market",
    ],
    "ux_designer": [
        "User Research", "Wireframing", "Prototyping", "Figma", "Design Systems",
        "Usability Testing", "Interaction Design", "Accessibility",
    ],

    # Business
    "finance": [
        "Financial Modeling", "Budgeting", "Forecasting", "Excel", "Risk Analysis",
        "Reporting", "Compliance", "Variance Analysis", "Accounting",
    ],
    "marketing": [
        "SEO", "Content Strategy", "Campaign Management", "Google Analytics",
        "Email Marketing", "Social Media", "Market Research", "Lead Generation",
    ],
    "sales": [
        "Lead Generation", "CRM", "Pipeline Management", "Client Relationships",
        "Negotiation", "Revenue Growth", "Prospecting", "Account Management",
    ],
    "hr": [
        "Recruiting", "Onboarding", "Employee Relations", "HRIS", "Compliance",
        "Training", "Policy", "Benefits Administration", "Talent Acquisition",
    ],
    "operations": [
        "Process Improvement", "Vendor Management", "Scheduling", "Inventory",
        "Logistics", "Cross-functional Coordination", "Reporting", "SOPs",
    ],
    "admin_assistant": [
        "Calendar Management", "Scheduling", "Office Administration", "Data Entry",
        "Travel Coordination", "Documentation", "Microsoft Office", "Communication",
    ],

    # Healthcare
    "healthcare_admin": [
        "Patient Scheduling", "Medical Records", "HIPAA", "Insurance Verification",
        "Front Desk Operations", "Patient Communication", "Billing", "EHR",
    ],
    "medical_assistant": [
        "Patient Intake", "Vital Signs", "Clinical Support", "Medical Records",
        "HIPAA", "Appointment Scheduling", "Specimen Collection", "EHR",
    ],
    "nursing_support": [
        "Patient Care", "Vital Signs", "Care Plans", "Clinical Documentation",
        "Medication Support", "HIPAA", "Patient Safety", "Communication",
    ],

    # Education
    "teacher": [
        "Lesson Planning", "Classroom Management", "Curriculum Development",
        "Student Assessment", "Parent Communication", "Student Engagement",
        "Differentiated Instruction", "Learning Outcomes",
    ],
    "instructional_designer": [
        "Curriculum Design", "Learning Objectives", "LMS", "Instructional Materials",
        "Assessment Design", "eLearning", "Training Programs", "ADDIE",
    ],

    # Support / Legal
    "customer_support": [
        "Customer Service", "Ticketing Systems", "Troubleshooting", "CRM",
        "Escalation Management", "Communication", "Customer Retention", "SLA",
    ],
    "legal_assistant": [
        "Legal Research", "Case Management", "Document Preparation", "Filing",
        "Client Communication", "Scheduling", "Compliance", "Confidentiality",
    ],
}


DESIGN_STYLES = {
    "ats_simple": [
        "Use a single-column layout.",
        "Avoid images, icons, tables, columns, and text boxes.",
        "Use standard headings for ATS parsing.",
    ],
    "modern_clean": [
        "Use clean spacing and polished headings.",
        "Keep formatting professional and ATS-safe.",
        "Best for modern business, tech, and startup roles.",
    ],
    "professional_classic": [
        "Use traditional resume ordering and formal wording.",
        "Best for corporate, finance, legal, education, and healthcare roles.",
        "Keep tone professional, clear, and concise.",
    ],
    "compact_one_page": [
        "Prioritize strongest sections and short bullets.",
        "Best for new grad, entry-level, and one-page resumes.",
    ],
    "technical_project_heavy": [
        "Place technical projects higher.",
        "Include tech stack for each project.",
        "Emphasize architecture, APIs, databases, deployment, and testing.",
    ],
    "minimalist": [
        "Use simple headings and short bullets.",
        "Avoid visual clutter.",
        "Focus on clarity and recruiter readability.",
    ],
    "executive": [
        "Highlight leadership, strategy, ownership, and measurable business results.",
        "Keep technical details secondary unless role-specific.",
    ],
}


RESUME_TEMPLATES = [
    # Featured / Classic
    {
        "template_id": "ats_simple",
        "name": "Classic Professional",
        "best_for": "General job applications across industries",
        "category": "Featured",
        "description": "A clean ATS-safe chronological format for broad applications.",
        "experience_level": "general",
        "role_type": "general",
        "design_style": "ats_simple",
        "section_order": ["summary", "skills", "experience", "projects", "education"],
    },
    {
        "template_id": "modern_clean",
        "name": "Modern Clean",
        "best_for": "Modern business, tech, product, and startup roles",
        "category": "Featured",
        "description": "A polished ATS-safe hybrid format with clean spacing.",
        "experience_level": "entry_level",
        "role_type": "general",
        "design_style": "modern_clean",
        "section_order": ["summary", "skills", "experience", "projects", "education"],
    },
    {
        "template_id": "minimalist_expert",
        "name": "Minimalist Expert",
        "best_for": "Experienced candidates who want a compact, focused resume",
        "category": "Featured",
        "description": "A compact layout focused on strong bullets and low visual clutter.",
        "experience_level": "experienced",
        "role_type": "general",
        "design_style": "minimalist",
        "section_order": ["summary", "skills", "experience", "projects", "education"],
    },
    {
        "template_id": "career_change",
        "name": "Career Change",
        "best_for": "Candidates switching roles or industries",
        "category": "Featured",
        "description": "Highlights transferable skills, projects, and role-relevant experience.",
        "experience_level": "career_change",
        "role_type": "general",
        "design_style": "modern_clean",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },
    {
        "template_id": "executive",
        "name": "Senior / Executive",
        "best_for": "Senior leaders, managers, directors, and executives",
        "category": "Featured",
        "description": "Highlights leadership, strategy, ownership, and measurable results.",
        "experience_level": "senior",
        "role_type": "general",
        "design_style": "executive",
        "section_order": ["executive_summary", "experience", "leadership_impact", "skills", "education"],
    },

    # Technology
    {
        "template_id": "new_grad_swe",
        "name": "Recent Grad Software Engineer",
        "best_for": "New grad, internship, SDE I, and campus roles",
        "category": "Technology",
        "description": "Education-forward layout with technical skills and projects above experience.",
        "experience_level": "new_grad",
        "role_type": "software_engineer",
        "design_style": "compact_one_page",
        "section_order": ["summary", "education", "skills", "projects", "experience"],
    },
    {
        "template_id": "backend_engineer",
        "name": "Backend Engineer",
        "best_for": "Backend, platform, API, cloud, and systems roles",
        "category": "Technology",
        "description": "Emphasizes APIs, databases, deployment, reliability, and technical projects.",
        "experience_level": "experienced",
        "role_type": "backend_engineer",
        "design_style": "technical_project_heavy",
        "section_order": ["summary", "skills", "experience", "projects", "education"],
    },
    {
        "template_id": "ai_engineer",
        "name": "AI Software Engineer",
        "best_for": "AI Engineer, Applied AI, GenAI, and LLM application roles",
        "category": "Technology",
        "description": "Highlights AI projects, LLM APIs, RAG, embeddings, and backend integration.",
        "experience_level": "entry_level",
        "role_type": "ai_engineer",
        "design_style": "technical_project_heavy",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },
    {
        "template_id": "data_analyst",
        "name": "Data Analyst",
        "best_for": "Data analyst, business analyst, and reporting roles",
        "category": "Technology",
        "description": "Highlights SQL, dashboards, reporting, data cleaning, and business impact.",
        "experience_level": "entry_level",
        "role_type": "data_analyst",
        "design_style": "modern_clean",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },
    {
        "template_id": "product_manager",
        "name": "Product Manager",
        "best_for": "Associate PM, product manager, and product operations roles",
        "category": "Technology",
        "description": "Highlights roadmaps, user research, prioritization, and product outcomes.",
        "experience_level": "experienced",
        "role_type": "product_manager",
        "design_style": "modern_clean",
        "section_order": ["summary", "experience", "skills", "projects", "education"],
    },
    {
        "template_id": "ux_designer",
        "name": "UX Designer",
        "best_for": "UX, product design, research, and design systems roles",
        "category": "Technology",
        "description": "Highlights research, design process, usability testing, and portfolio projects.",
        "experience_level": "entry_level",
        "role_type": "ux_designer",
        "design_style": "modern_clean",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },

    # Business
    {
        "template_id": "finance",
        "name": "Finance Analyst",
        "best_for": "Finance, accounting, analyst, and business roles",
        "category": "Business",
        "description": "Highlights financial modeling, reporting, forecasting, budgeting, and compliance.",
        "experience_level": "entry_level",
        "role_type": "finance",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education", "projects"],
    },
    {
        "template_id": "marketing",
        "name": "Marketing Specialist",
        "best_for": "Marketing, content, SEO, campaign, and growth roles",
        "category": "Business",
        "description": "Highlights campaigns, analytics, SEO, content strategy, and measurable growth.",
        "experience_level": "entry_level",
        "role_type": "marketing",
        "design_style": "modern_clean",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },
    {
        "template_id": "sales",
        "name": "Sales Representative",
        "best_for": "Sales, account management, SDR, and business development roles",
        "category": "Business",
        "description": "Highlights revenue impact, pipeline, CRM, lead generation, and client relationships.",
        "experience_level": "entry_level",
        "role_type": "sales",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education", "projects"],
    },
    {
        "template_id": "hr",
        "name": "HR / Recruiting",
        "best_for": "HR, recruiting, people operations, and onboarding roles",
        "category": "Business",
        "description": "Highlights recruiting, onboarding, employee relations, HRIS, and compliance.",
        "experience_level": "entry_level",
        "role_type": "hr",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education", "projects"],
    },
    {
        "template_id": "operations",
        "name": "Operations Coordinator",
        "best_for": "Operations, logistics, coordinator, and process improvement roles",
        "category": "Business",
        "description": "Highlights process improvement, scheduling, vendor management, and reporting.",
        "experience_level": "entry_level",
        "role_type": "operations",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education", "projects"],
    },
    {
        "template_id": "admin_assistant",
        "name": "Administrative Assistant",
        "best_for": "Admin, office assistant, coordinator, and executive assistant roles",
        "category": "Business",
        "description": "Highlights scheduling, documentation, office administration, and communication.",
        "experience_level": "entry_level",
        "role_type": "admin_assistant",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education"],
    },

    # Healthcare
    {
        "template_id": "healthcare_admin",
        "name": "Healthcare Administration",
        "best_for": "Healthcare admin, front desk, patient coordinator, and clinic roles",
        "category": "Healthcare",
        "description": "Highlights patient scheduling, records, HIPAA, billing, and EHR experience.",
        "experience_level": "entry_level",
        "role_type": "healthcare_admin",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education"],
    },
    {
        "template_id": "medical_assistant",
        "name": "Medical Assistant",
        "best_for": "Medical assistant, clinical assistant, and patient support roles",
        "category": "Healthcare",
        "description": "Highlights patient intake, clinical support, records, and care coordination.",
        "experience_level": "entry_level",
        "role_type": "medical_assistant",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education"],
    },
    {
        "template_id": "nursing_support",
        "name": "Nursing Support",
        "best_for": "CNA, patient care, nursing support, and healthcare support roles",
        "category": "Healthcare",
        "description": "Highlights patient care, safety, documentation, and clinical support.",
        "experience_level": "entry_level",
        "role_type": "nursing_support",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education"],
    },

    # Education
    {
        "template_id": "teacher",
        "name": "Teacher",
        "best_for": "Teaching, classroom, tutoring, and training roles",
        "category": "Education",
        "description": "Highlights classroom management, curriculum, student outcomes, and communication.",
        "experience_level": "experienced",
        "role_type": "teacher",
        "design_style": "professional_classic",
        "section_order": ["summary", "experience", "skills", "education", "projects"],
    },
    {
        "template_id": "instructional_designer",
        "name": "Instructional Designer",
        "best_for": "Instructional design, training, LMS, and learning development roles",
        "category": "Education",
        "description": "Highlights curriculum design, learning objectives, LMS, and training programs.",
        "experience_level": "entry_level",
        "role_type": "instructional_designer",
        "design_style": "modern_clean",
        "section_order": ["summary", "skills", "projects", "experience", "education"],
    },

    # Support / Legal
    {
        "template_id": "customer_support",
        "name": "Customer Support",
        "best_for": "Customer service, support specialist, and client success roles",
        "category": "Support",
        "description": "Highlights troubleshooting, ticketing, CRM, communication, and retention.",
        "experience_level": "entry_level",
        "role_type": "customer_support",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education"],
    },
    {
        "template_id": "legal_assistant",
        "name": "Legal Assistant",
        "best_for": "Legal assistant, paralegal support, and law office roles",
        "category": "Legal",
        "description": "Highlights document preparation, filing, research, confidentiality, and case support.",
        "experience_level": "entry_level",
        "role_type": "legal_assistant",
        "design_style": "professional_classic",
        "section_order": ["summary", "skills", "experience", "education"],
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


def get_section_order(template_id: str, experience_level: str) -> list[str]:
    template = get_template(template_id)

    if template.get("section_order"):
        return template["section_order"]

    return EXPERIENCE_LEVEL_LAYOUTS.get(
        experience_level,
        EXPERIENCE_LEVEL_LAYOUTS["general"],
    )
