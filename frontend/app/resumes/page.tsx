"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";

import { api, API_BASE_URL } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type UploadedResumeResponse = {
  resume_id: number;
  filename: string;
  status: string;
  parsed_text_preview: string;
};

type ResumeTemplate = {
  template_id: string;
  name: string;
  best_for: string;
  category: string;
  description: string;
  experience_level: string;
  role_type: string;
  design_style: string;
  section_order: string[];
};

type ResumeCreateResponse = {
  template_id: string;
  experience_level: string;
  role_type: string;
  design_style: string;
  section_order: string[];
  resume_markdown: string;
  suggestions: string[];
};

type ResumeFromUploadResponse = {
  resume_id: number;
  template_id: string;
  experience_level: string;
  role_type: string;
  design_style: string;
  provider_used: string;
  fallback_used: boolean;
  resume_markdown: string;
  resume_html: string;
  suggestions: string[];
};

type ResumeOpenResponse = {
  design_style: string;
  resume_markdown: string;
  resume_html: string;
  preview_notes: string[];
};

type ResumeExportResponse = {
  filename: string;
  file_path: string;
  message: string;
};

type TemplateCard = {
  id: string;
  name: string;
  label: string;
  description: string;
  bestFor: string;
  category?: string;
  format?: string;
  templateId: string;
  experienceLevel: string;
  roleType: string;
  designStyle: string;
};

const DEFAULT_FILENAME = "swati-tailored-resume";

const curatedTemplates: TemplateCard[] = [
  {
    id: "ats-simple",
    name: "ATS Simple",
    label: "Most compatible",
    description:
      "A clean single-column format designed for Workday, Greenhouse, Lever, and company career portals.",
    bestFor: "Software Engineer, Backend, New Grad",
    templateId: "ats_simple",
    experienceLevel: "new_grad",
    roleType: "software_engineer",
    designStyle: "ats_simple",
  },
  {
    id: "recent-grad",
    name: "Recent Grad",
    label: "Entry-level",
    description:
      "Education-forward structure for new grads, internships, campus roles, and early-career applications.",
    bestFor: "New Grad, Internship, SDE I",
    templateId: "ats_simple",
    experienceLevel: "new_grad",
    roleType: "software_engineer",
    designStyle: "ats_simple",
  },
  {
    id: "backend-engineer",
    name: "Backend Engineer",
    label: "Tech role",
    description:
      "Project-heavy layout for APIs, databases, Docker, CI/CD, AWS, and backend systems experience.",
    bestFor: "Backend, Platform, SDE",
    templateId: "ats_simple",
    experienceLevel: "new_grad",
    roleType: "backend_engineer",
    designStyle: "ats_simple",
  },
  {
    id: "ai-engineer",
    name: "AI Software Engineer",
    label: "AI + backend",
    description:
      "Best for candidates showing LLM APIs, RAG, prompt engineering, FastAPI, and AI-powered projects.",
    bestFor: "AI Engineer, Applied AI, AI Software Engineer",
    templateId: "ats_simple",
    experienceLevel: "new_grad",
    roleType: "ai_software_engineer",
    designStyle: "ats_simple",
  },
  {
    id: "modern-clean",
    name: "Modern Clean",
    label: "Polished",
    description:
      "A professional minimalist format for product-minded software engineers and full-stack roles.",
    bestFor: "Full-stack, Product Engineering, Startups",
    templateId: "ats_simple",
    experienceLevel: "mid_level",
    roleType: "software_engineer",
    designStyle: "ats_simple",
  },
  {
    id: "minimalist-expert",
    name: "Minimalist Expert",
    label: "Focused",
    description:
      "Compact format for highlighting strong projects, impact bullets, and technical depth without clutter.",
    bestFor: "Backend, Cloud, Systems",
    templateId: "ats_simple",
    experienceLevel: "mid_level",
    roleType: "backend_engineer",
    designStyle: "ats_simple",
  },
];

const resumeFormats = [
  {
    title: "Chronological",
    description:
      "Best when your experience timeline is strong and you want recruiters to quickly see your growth.",
  },
  {
    title: "Hybrid",
    description:
      "Best for tech candidates because it balances skills, projects, and experience in one ATS-friendly layout.",
  },
  {
    title: "Functional",
    description:
      "Useful for career changers, but use carefully because recruiters often prefer clear work history.",
  },
];

const careerLevels = [
  {
    title: "Recent Grad",
    icon: GraduationCap,
    description:
      "Education and projects appear higher so early-career proof is easier to scan.",
  },
  {
    title: "Mid-Career",
    icon: BriefcaseBusiness,
    description:
      "Experience, ownership, measurable results, and role-specific skills become the focus.",
  },
  {
    title: "Tech Specialist",
    icon: Layers,
    description:
      "Projects, APIs, databases, cloud, AI, and system-design signals are emphasized.",
  },
];

function splitList(value: string) {
  return value
    .split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitBullets(value: string) {
  return value
    .split("\n")
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);
}


function getTemplateFormat(template: ResumeTemplate) {
  const category = template.category ?? "General";

  if (category === "Technology") return "Tech resume";
  if (category === "Business") return "Business resume";
  if (category === "Healthcare") return "Healthcare resume";
  if (category === "Education") return "Education resume";
  if (category === "Support") return "Support resume";
  if (category === "Legal") return "Legal resume";

  return "Professional resume";
}

function mapBackendTemplateToCard(template: ResumeTemplate): TemplateCard {
  const category = template.category ?? "General";

  return {
    id: template.template_id,
    templateId: template.template_id,
    name: template.name,
    label: category,
    category,
    description: template.description,
    bestFor: template.description,
    format: getTemplateFormat(template),
    experienceLevel: template.experience_level,
    roleType: template.role_type,
    designStyle: template.design_style,
  };
}

function buildSampleResumeMarkdownForTemplate(template: TemplateCard) {
  const name = "Avery Johnson";
  const contact = "Seattle, WA | avery.johnson@email.com | LinkedIn | Portfolio";

  const samples: Record<string, string> = {
    ai_engineer: `# ${name}
${contact}

## Summary
AI Software Engineer building LLM-powered products, backend APIs, and production-ready automation workflows.

## AI & Backend Skills
Python, FastAPI, PostgreSQL, Docker, AWS, OpenAI API, RAG, Embeddings, Vector Databases

## AI Projects
**Career Intelligence Platform** | FastAPI, PostgreSQL, LLM APIs
- Built resume analysis, job-fit scoring, and AI interview preparation workflows.
- Designed backend services for document parsing, prompt orchestration, and structured AI responses.

## Experience
**Software Engineer** | BrightPath Labs
- Developed REST APIs and database-backed services used by customer-facing applications.
- Improved system reliability through logging, error handling, and automated testing.

## Education
**University of Washington**
M.S. Computer Science`,

    backend_engineer: `# ${name}
${contact}

## Summary
Backend Engineer experienced in APIs, databases, cloud deployment, and scalable service design.

## Backend & Technical Skills
Python, Java, FastAPI, Spring Boot, PostgreSQL, Redis, Docker, AWS, CI/CD

## Experience
**Backend Engineer** | Northstar Systems
- Built REST APIs for authentication, user workflows, and reporting features.
- Optimized SQL queries and improved API response times for high-traffic endpoints.

## Backend Projects
**Log Monitoring API** | FastAPI, PostgreSQL, Docker
- Created log ingestion and incident tracking APIs with searchable trace data.

## Education
**State University**
B.S. Computer Science`,

    new_grad_swe: `# ${name}
${contact}

## Summary
Recent Computer Science graduate with hands-on experience building full-stack applications, APIs, and data-driven projects.

## Education
**State University**
B.S. Computer Science
- Coursework: Data Structures, Algorithms, Databases, Operating Systems

## Technical Skills
Python, Java, JavaScript, TypeScript, React, FastAPI, PostgreSQL, Git

## Projects
**Campus Events App** | React, FastAPI, PostgreSQL
- Built a full-stack application for event discovery, registration, and admin management.
- Implemented REST APIs, database models, and responsive frontend pages.

## Experience
**Software Engineering Intern** | CloudDesk
- Fixed frontend bugs and added API integrations for internal dashboard features.`,

    product_manager: `# ${name}
${contact}

## Summary
Product Manager with experience turning user problems into roadmaps, experiments, and measurable product improvements.

## Product Skills
Roadmapping, User Research, Analytics, Prioritization, A/B Testing, Agile, SQL

## Experience
**Associate Product Manager** | LaunchWorks
- Led discovery for onboarding improvements that increased activation by 18%.
- Partnered with engineering and design to ship customer-requested workflow updates.

## Product Case Studies
**AI Resume Assistant**
- Defined user flows, success metrics, and MVP scope for an AI-powered resume optimization tool.

## Education
**State University**
B.A. Business & Technology`,

    executive: `# ${name}
${contact}

## Executive Summary
Technology leader with experience scaling teams, improving operational execution, and delivering measurable business outcomes.

## Leadership Impact
- Led cross-functional initiatives across engineering, product, and operations.
- Improved delivery predictability through process redesign, metrics, and team alignment.

## Professional Experience
**Director of Engineering** | Horizon Digital
- Managed a 14-person engineering team delivering customer-facing platform features.
- Reduced release risk by introducing quality gates, ownership models, and roadmap planning rituals.

## Skills
Engineering Leadership, Product Strategy, Team Building, Stakeholder Management, Cloud Platforms

## Education
**State University**
MBA`,

    teacher: `# ${name}
${contact}

## Teaching Summary
Dedicated educator with experience designing engaging lessons, supporting diverse learners, and improving student outcomes.

## Teaching Experience
**Computer Science Teacher** | Green Valley School
- Planned and delivered programming lessons for beginner and intermediate students.
- Created project-based assignments that improved student participation and confidence.

## Education Skills
Lesson Planning, Classroom Management, Curriculum Design, Student Assessment, Parent Communication

## Education & Certifications
**State University**
B.Ed. Education`,

    finance: `# ${name}
${contact}

## Summary
Finance professional experienced in reporting, budgeting, forecasting, and data-driven business analysis.

## Finance & Analysis Skills
Excel, SQL, Forecasting, Budgeting, Variance Analysis, Financial Reporting, Compliance

## Experience
**Financial Analyst** | Summit Group
- Built monthly reporting dashboards for leadership decision-making.
- Analyzed budget variances and identified cost-saving opportunities.

## Education
**State University**
B.S. Finance`,

    legal_assistant: `# ${name}
${contact}

## Legal Summary
Detail-oriented legal assistant experienced in document preparation, case organization, scheduling, and client communication.

## Legal Support Skills
Legal Documentation, Case Management, Scheduling, Client Intake, Research, Compliance

## Legal Support Experience
**Legal Assistant** | Carter & Moss LLP
- Prepared legal documents, maintained case files, and coordinated attorney calendars.
- Supported client intake and communication while maintaining confidentiality.

## Education
**State University**
Paralegal Certificate`,
  };

  return (
    samples[template.templateId] ??
    `# ${name}
${contact}

## Summary
Professional candidate with experience delivering high-quality work, collaborating across teams, and solving business problems.

## Skills
Communication, Project Coordination, Data Analysis, Customer Service, Documentation, Process Improvement

## Experience
**Professional Associate** | Example Company
- Supported daily operations and improved team workflows through organized execution.
- Collaborated with stakeholders to complete projects on time and improve outcomes.

## Projects
**Process Improvement Initiative**
- Helped streamline documentation and reporting for a recurring business workflow.

## Education
**State University**
Bachelor's Degree`
  );
}

function TemplateThumbnail({ templateId }: { templateId: string }) {
  const templates: Record<
    string,
    {
      name: string;
      role: string;
      contact: string;
      layout: "classic" | "modern" | "mono" | "tech" | "twoColumn" | "executive";
      accent: string;
      sections: { title: string; lines: string[] }[];
    }
  > = {
    ats_simple: {
      name: "Keith O'Donnell",
      role: "Operations Associate",
      contact: "City, State • email@example.com",
      layout: "classic",
      accent: "#111827",
      sections: [
        { title: "Top Skills", lines: ["Customer operations", "Process improvement", "Team coordination"] },
        { title: "Work Experience", lines: ["Company A, Location", "Improved daily workflows and reporting quality.", "Supported cross-functional team operations."] },
        { title: "Education", lines: ["Degree, Graduation Year", "College Name, Location"] },
      ],
    },
    modern_clean: {
      name: "Maddison Abbott",
      role: "Product Designer",
      contact: "City, State • email@example.com",
      layout: "modern",
      accent: "#1d4ed8",
      sections: [
        { title: "Summary", lines: ["Product designer creating clean user journeys and accessible interfaces."] },
        { title: "Skills and Accomplishments", lines: ["User research", "Wireframes", "Design systems", "Usability testing"] },
        { title: "Work Experience", lines: ["Designed onboarding improvements for SaaS users.", "Partnered with product and engineering teams."] },
        { title: "Education", lines: ["B.A. Design, New York University"] },
      ],
    },
    minimalist_expert: {
      name: "Yuri Petrov",
      role: "Business Analyst",
      contact: "City, State • email@example.com",
      layout: "mono",
      accent: "#000000",
      sections: [
        { title: "Summary", lines: ["Business analyst focused on reporting, documentation, and stakeholder alignment."] },
        { title: "Professional Experience", lines: ["Analyzed operational data and created weekly dashboards.", "Documented requirements for internal tools."] },
        { title: "Education", lines: ["B.S. Business Analytics"] },
      ],
    },
    executive: {
      name: "Senior Executive",
      role: "Technology Leader",
      contact: "City, State • email@example.com",
      layout: "executive",
      accent: "#292524",
      sections: [
        { title: "Executive Summary", lines: ["Technology leader with experience scaling teams and delivering business outcomes."] },
        { title: "Leadership Impact", lines: ["Led cross-functional planning across product and engineering.", "Improved delivery predictability and operational execution."] },
        { title: "Professional Experience", lines: ["Director of Engineering, Horizon Digital"] },
      ],
    },
    ai_engineer: {
      name: "Avery Johnson",
      role: "AI Software Engineer",
      contact: "Seattle, WA • email@example.com",
      layout: "tech",
      accent: "#4c1d95",
      sections: [
        { title: "AI & Backend Skills", lines: ["Python", "FastAPI", "PostgreSQL", "LLM APIs", "RAG", "Embeddings"] },
        { title: "AI Projects", lines: ["Built resume analysis and job-fit scoring workflows.", "Designed APIs for document parsing and AI responses."] },
        { title: "Experience", lines: ["Software Engineer, BrightPath Labs"] },
      ],
    },
    backend_engineer: {
      name: "Daniel Brooks",
      role: "Backend Engineer",
      contact: "Seattle, WA • email@example.com",
      layout: "tech",
      accent: "#18181b",
      sections: [
        { title: "Backend Skills", lines: ["Java", "Python", "APIs", "PostgreSQL", "Docker", "AWS"] },
        { title: "Experience", lines: ["Built REST APIs for authentication and reporting.", "Optimized SQL queries and service performance."] },
        { title: "Backend Projects", lines: ["Log monitoring API with searchable trace data."] },
      ],
    },
    new_grad_swe: {
      name: "Jennifer Jobscan",
      role: "Software Engineer",
      contact: "Seattle, WA • email@example.com",
      layout: "modern",
      accent: "#075985",
      sections: [
        { title: "Education", lines: ["B.S. Computer Science", "Data Structures, Algorithms, Databases"] },
        { title: "Technical Skills", lines: ["Python", "Java", "React", "FastAPI", "PostgreSQL"] },
        { title: "Projects", lines: ["Built full-stack campus events app with REST APIs."] },
      ],
    },
    product_manager: {
      name: "Jennifer Jobscan",
      role: "Product Manager",
      contact: "City, State • email@example.com",
      layout: "twoColumn",
      accent: "#047857",
      sections: [
        { title: "Summary", lines: ["Product manager turning user problems into shipped product improvements."] },
        { title: "Work Experience", lines: ["Led onboarding improvements that increased activation.", "Partnered with design and engineering."] },
        { title: "Projects", lines: ["Defined MVP scope for AI resume assistant."] },
      ],
    },
    ux_designer: {
      name: "Jennifer Jobscan",
      role: "Product Designer",
      contact: "City, State • email@example.com",
      layout: "twoColumn",
      accent: "#86198f",
      sections: [
        { title: "Portfolio", lines: ["Mobile app redesign", "Research study", "Design system"] },
        { title: "Experience", lines: ["Created wireframes, prototypes, and usability test plans."] },
        { title: "Education", lines: ["B.A. Interaction Design"] },
      ],
    },
    finance: {
      name: "Rachel Morgan",
      role: "Financial Analyst",
      contact: "City, State • email@example.com",
      layout: "classic",
      accent: "#14532d",
      sections: [
        { title: "Summary", lines: ["Finance professional experienced in budgeting and reporting."] },
        { title: "Finance Skills", lines: ["Excel", "Forecasting", "SQL", "Variance analysis"] },
        { title: "Experience", lines: ["Built monthly dashboards for leadership decisions."] },
      ],
    },
    marketing: {
      name: "Olivia Carter",
      role: "Marketing Specialist",
      contact: "City, State • email@example.com",
      layout: "modern",
      accent: "#881337",
      sections: [
        { title: "Marketing Profile", lines: ["Growth-focused marketer with campaign and analytics experience."] },
        { title: "Campaigns", lines: ["Launched email campaign increasing qualified leads.", "Tracked SEO and content performance."] },
        { title: "Experience", lines: ["Marketing Specialist, Northstar Media"] },
      ],
    },
    teacher: {
      name: "Sarah Anderson",
      role: "Teacher",
      contact: "City, State • email@example.com",
      layout: "modern",
      accent: "#713f12",
      sections: [
        { title: "Teaching Summary", lines: ["Educator designing engaging lessons for diverse learners."] },
        { title: "Teaching Experience", lines: ["Created project-based assignments.", "Improved student participation and confidence."] },
        { title: "Education", lines: ["B.Ed. Education"] },
      ],
    },
    legal_assistant: {
      name: "Claire Bennett",
      role: "Legal Assistant",
      contact: "City, State • email@example.com",
      layout: "classic",
      accent: "#111827",
      sections: [
        { title: "Legal Summary", lines: ["Detail-oriented legal assistant supporting case documentation and scheduling."] },
        { title: "Legal Support Experience", lines: ["Prepared legal documents and maintained case files.", "Coordinated attorney calendars and client intake."] },
        { title: "Education", lines: ["Paralegal Certificate"] },
      ],
    },
  };

  const template = templates[templateId] ?? templates.ats_simple;

  const Section = ({ title, lines }: { title: string; lines: string[] }) => (
    <section className="mt-4">
      <h3
        className="border-b pb-1 text-[8px] font-bold uppercase tracking-[0.18em]"
        style={{ color: template.accent, borderColor: template.accent }}
      >
        {title}
      </h3>
      <div className="mt-2 space-y-1.5">
        {lines.map((line) => (
          <p key={line} className="text-[7px] leading-snug text-neutral-800">
            {line}
          </p>
        ))}
      </div>
    </section>
  );

  if (template.layout === "twoColumn") {
    return (
      <div className="mx-auto aspect-[0.72] w-full max-w-[340px] overflow-hidden rounded bg-white text-black shadow-xl ring-1 ring-black/10">
        <header className="px-7 py-5 text-white" style={{ backgroundColor: template.accent }}>
          <h2 className="text-[12px] font-bold leading-none">{template.name}</h2>
          <p className="mt-1 text-[7px] opacity-90">{template.role}</p>
          <p className="mt-1 text-[6px] opacity-80">{template.contact}</p>
        </header>

        <div className="grid grid-cols-[34%_66%]">
          <aside className="min-h-[390px] bg-neutral-100 px-4 py-5">
            <h3 className="text-[7px] font-bold uppercase tracking-[0.16em]">Skills</h3>
            <p className="mt-2 text-[6.5px] leading-snug text-neutral-700">
              Strategy<br />Analytics<br />Research<br />Roadmaps<br />Agile
            </p>
            <h3 className="mt-5 text-[7px] font-bold uppercase tracking-[0.16em]">Education</h3>
            <p className="mt-2 text-[6.5px] leading-snug text-neutral-700">State University<br />B.A. Business</p>
          </aside>

          <main className="px-5 py-5">
            {template.sections.map((section) => (
              <Section key={section.title} title={section.title} lines={section.lines} />
            ))}
          </main>
        </div>
      </div>
    );
  }

  if (template.layout === "executive") {
    return (
      <div className="mx-auto aspect-[0.72] w-full max-w-[340px] overflow-hidden rounded bg-white text-black shadow-xl ring-1 ring-black/10">
        <header className="px-7 py-6 text-white" style={{ backgroundColor: template.accent }}>
          <h2 className="text-[13px] font-bold">{template.name}</h2>
          <p className="mt-1 text-[7px] opacity-90">{template.role}</p>
          <p className="mt-1 text-[6px] opacity-75">{template.contact}</p>
        </header>
        <main className="px-7 py-5">
          {template.sections.map((section) => (
            <Section key={section.title} title={section.title} lines={section.lines} />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto aspect-[0.72] w-full max-w-[340px] overflow-hidden rounded bg-white px-7 py-6 text-black shadow-xl ring-1 ring-black/10">
      <header className={template.layout === "classic" || template.layout === "mono" ? "text-center" : "text-left"}>
        <h2 className="text-[12px] font-bold leading-none">{template.name}</h2>
        <p className="mt-1 text-[7px] text-neutral-600">{template.role}</p>
        <p className="mt-1 text-[6px] text-neutral-500">{template.contact}</p>
      </header>

      <div className="mt-4 h-[3px] w-full rounded-full" style={{ backgroundColor: template.accent }} />

      <main className={template.layout === "tech" ? "mt-2 rounded-lg bg-neutral-50 p-3" : ""}>
        {template.sections.map((section) => (
          <Section key={section.title} title={section.title} lines={section.lines} />
        ))}
      </main>
    </div>
  );
}

function getJobTailoringReport(resumeMarkdown: string, jobDescription: string) {
  const resumeContent = resumeMarkdown.toLowerCase();
  const jobContent = jobDescription.toLowerCase();

  const stopWords = new Set([
    "about",
    "above",
    "after",
    "again",
    "also",
    "and",
    "are",
    "because",
    "been",
    "being",
    "candidate",
    "company",
    "could",
    "from",
    "have",
    "into",
    "more",
    "must",
    "our",
    "role",
    "should",
    "than",
    "that",
    "the",
    "their",
    "this",
    "through",
    "using",
    "will",
    "with",
    "work",
    "you",
    "your",
  ]);

  const words = jobContent
    .replace(/[^a-z0-9+#. ]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !stopWords.has(word));

  const frequency = words.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});

  const rankedKeywords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 24);

  const matchedKeywords = rankedKeywords.filter((keyword) =>
    resumeContent.includes(keyword)
  );

  const missingKeywords = rankedKeywords.filter(
    (keyword) => !resumeContent.includes(keyword)
  );

  const score =
    rankedKeywords.length === 0
      ? null
      : Math.round((matchedKeywords.length / rankedKeywords.length) * 100);

  return {
    score,
    rankedKeywords,
    matchedKeywords,
    missingKeywords,
  };
}

function getResumeQualityReport(resumeMarkdown: string) {
  const raw = resumeMarkdown.trim();
  const content = raw.toLowerCase();
  const wordCount = raw.split(/\s+/).filter(Boolean).length;
  const bulletCount = (raw.match(/(^|\n)\s*[-•*]/g) ?? []).length;

  const hasContact =
    content.includes("@") || content.includes("linkedin") || content.includes("github");
  const hasSummary = content.includes("summary");
  const hasSkills = content.includes("skills") || content.includes("technologies");
  const hasExperience = content.includes("experience") || content.includes("work");
  const hasProjects = content.includes("project");
  const hasEducation = content.includes("education");
  const hasNumbers = /\d|%|\$/.test(raw);
  const hasActionVerbs = [
    "built",
    "developed",
    "designed",
    "implemented",
    "improved",
    "created",
    "optimized",
    "led",
    "launched",
    "automated",
  ].some((verb) => content.includes(verb));

  const checks = [
    {
      label: "Contact details",
      passed: hasContact,
      tip: "Add email, LinkedIn, GitHub, or portfolio link.",
    },
    {
      label: "Professional summary",
      passed: hasSummary,
      tip: "Add a 2–3 line summary targeted to the role.",
    },
    {
      label: "Skills section",
      passed: hasSkills,
      tip: "Add a keyword-rich skills section near the top.",
    },
    {
      label: "Experience or projects",
      passed: hasExperience || hasProjects,
      tip: "Add experience or project work with clear outcomes.",
    },
    {
      label: "Education",
      passed: hasEducation,
      tip: "Add degree, school, and relevant coursework if useful.",
    },
    {
      label: "Bullet structure",
      passed: bulletCount >= 4,
      tip: "Use bullets instead of long paragraphs.",
    },
    {
      label: "Measurable impact",
      passed: hasNumbers,
      tip: "Add numbers, scale, users, performance, or percentage impact.",
    },
    {
      label: "Action verbs",
      passed: hasActionVerbs,
      tip: "Start bullets with built, designed, improved, automated, or optimized.",
    },
    {
      label: "Good length",
      passed: wordCount >= 120 && wordCount <= 850,
      tip: "Keep the resume detailed but not too long.",
    },
  ];

  const passedCount = checks.filter((check) => check.passed).length;
  const score = Math.min(
    100,
    Math.round(45 + passedCount * 5.5 + Math.min(bulletCount, 8) * 1.5)
  );

  const quickWins = checks.filter((check) => !check.passed).slice(0, 3);

  return {
    score,
    label:
      score >= 85
        ? "Strong draft"
        : score >= 70
          ? "Good start"
          : "Needs improvement",
    checks,
    quickWins,
  };
}

function getTemplateProductLabel(templateId: string) {
  const labels: Record<
    string,
    {
      safety: string;
      layout: string;
      bestUse: string;
    }
  > = {
    ats_simple: {
      safety: "Maximum ATS-safe",
      layout: "One-column",
      bestUse: "Online applications",
    },
    modern_clean: {
      safety: "ATS-safe",
      layout: "Modern one-column",
      bestUse: "Recruiter readability",
    },
    minimalist_expert: {
      safety: "ATS-safe",
      layout: "Minimalist",
      bestUse: "Clean professional",
    },
    career_change: {
      safety: "ATS-safe",
      layout: "Skills-forward",
      bestUse: "Career change",
    },
    executive: {
      safety: "Recruiter-friendly",
      layout: "Executive",
      bestUse: "Leadership roles",
    },
    new_grad_swe: {
      safety: "ATS-safe",
      layout: "Education-first",
      bestUse: "New grads",
    },
    backend_engineer: {
      safety: "ATS-safe",
      layout: "Technical compact",
      bestUse: "Backend roles",
    },
    ai_engineer: {
      safety: "ATS-safe",
      layout: "Technical compact",
      bestUse: "AI roles",
    },
    data_analyst: {
      safety: "ATS-safe",
      layout: "Data-focused",
      bestUse: "Analytics roles",
    },
    product_manager: {
      safety: "Visual PDF",
      layout: "Two-column",
      bestUse: "Product roles",
    },
    ux_designer: {
      safety: "Visual PDF",
      layout: "Two-column",
      bestUse: "Portfolio roles",
    },
    marketing: {
      safety: "Recruiter-friendly",
      layout: "Modern",
      bestUse: "Marketing roles",
    },
    finance: {
      safety: "ATS-safe",
      layout: "Professional",
      bestUse: "Finance roles",
    },
    legal_assistant: {
      safety: "Maximum ATS-safe",
      layout: "One-column",
      bestUse: "Legal support",
    },
  };

  return (
    labels[templateId] ?? {
      safety: "ATS-safe",
      layout: "Professional",
      bestUse: "General roles",
    }
  );
}

function getRecommendedTemplateIds(role: string, level: string) {
  const normalizedRole = role.toLowerCase();
  const normalizedLevel = level.toLowerCase();

  if (normalizedRole.includes("ai")) {
    return normalizedLevel.includes("entry")
      ? ["ai_engineer", "new_grad_swe", "ats_simple"]
      : ["ai_engineer", "backend_engineer", "modern_clean"];
  }

  if (normalizedRole.includes("backend") || normalizedRole.includes("software")) {
    return normalizedLevel.includes("entry")
      ? ["new_grad_swe", "backend_engineer", "ats_simple"]
      : ["backend_engineer", "modern_clean", "ats_simple"];
  }

  if (normalizedRole.includes("product")) {
    return ["product_manager", "modern_clean", "executive"];
  }

  if (normalizedRole.includes("design")) {
    return ["ux_designer", "modern_clean", "minimalist_expert"];
  }

  if (normalizedRole.includes("data")) {
    return ["data_analyst", "ats_simple", "modern_clean"];
  }

  if (normalizedRole.includes("finance")) {
    return ["finance", "ats_simple", "minimalist_expert"];
  }

  if (normalizedRole.includes("teacher") || normalizedRole.includes("education")) {
    return ["teacher", "modern_clean", "ats_simple"];
  }

  if (normalizedRole.includes("legal")) {
    return ["legal_assistant", "ats_simple", "minimalist_expert"];
  }

  if (normalizedLevel.includes("executive") || normalizedLevel.includes("senior")) {
    return ["executive", "modern_clean", "minimalist_expert"];
  }

  return ["ats_simple", "modern_clean", "minimalist_expert"];
}

function getTemplateScorecard(templateId: string) {
  const scorecards: Record<
    string,
    {
      atsScore: number;
      readabilityScore: number;
      bestFor: string;
      notIdealFor: string;
      reasons: string[];
    }
  > = {
    ats_simple: {
      atsScore: 98,
      readabilityScore: 90,
      bestFor: "Online applications and ATS-heavy companies",
      notIdealFor: "Design-heavy portfolio resumes",
      reasons: [
        "Single-column structure is easy for parsers to read.",
        "Simple headings reduce formatting risk.",
        "Best choice when applying through job portals.",
      ],
    },
    modern_clean: {
      atsScore: 92,
      readabilityScore: 96,
      bestFor: "Recruiter-facing resumes with a clean modern look",
      notIdealFor: "Very conservative legal or government roles",
      reasons: [
        "Balanced spacing improves recruiter scanning.",
        "Modern accent makes sections easier to navigate.",
        "Still keeps a safe resume structure.",
      ],
    },
    minimalist_expert: {
      atsScore: 94,
      readabilityScore: 92,
      bestFor: "Professional roles that need a polished minimal resume",
      notIdealFor: "Roles where visual branding is important",
      reasons: [
        "Minimal layout keeps attention on content.",
        "Works well for experienced professionals.",
        "Low formatting risk for most applications.",
      ],
    },
    executive: {
      atsScore: 84,
      readabilityScore: 98,
      bestFor: "Leadership, senior, and executive roles",
      notIdealFor: "Strict ATS-only new grad applications",
      reasons: [
        "Strong header creates executive presence.",
        "Good for leadership impact and business outcomes.",
        "Best used when a human recruiter will review it.",
      ],
    },
    ai_engineer: {
      atsScore: 93,
      readabilityScore: 94,
      bestFor: "AI Engineer, Applied AI, and LLM application roles",
      notIdealFor: "Non-technical administrative roles",
      reasons: [
        "Highlights AI/backend skills near the top.",
        "Project-heavy structure fits AI portfolio resumes.",
        "Good for showing APIs, RAG, LLMs, and deployment work.",
      ],
    },
    backend_engineer: {
      atsScore: 95,
      readabilityScore: 92,
      bestFor: "Backend, platform, and API engineering roles",
      notIdealFor: "Design or marketing roles",
      reasons: [
        "Compact technical skills section supports keyword matching.",
        "Project and experience sections are easy to scan.",
        "Strong fit for Java, Python, APIs, databases, and cloud.",
      ],
    },
    new_grad_swe: {
      atsScore: 96,
      readabilityScore: 91,
      bestFor: "New grad and entry-level software engineering roles",
      notIdealFor: "Senior leadership roles",
      reasons: [
        "Education-first structure works for new graduates.",
        "Projects are emphasized when work experience is limited.",
        "Safe layout for internships and new grad portals.",
      ],
    },
    product_manager: {
      atsScore: 82,
      readabilityScore: 97,
      bestFor: "Product manager roles and recruiter-facing PDFs",
      notIdealFor: "Very strict ATS systems",
      reasons: [
        "Two-column layout gives a polished product resume feel.",
        "Good for strategy, roadmap, metrics, and stakeholder impact.",
        "Best when sending directly to recruiters or hiring managers.",
      ],
    },
    ux_designer: {
      atsScore: 80,
      readabilityScore: 97,
      bestFor: "UX, product design, and portfolio-based roles",
      notIdealFor: "Strict ATS-only job portals",
      reasons: [
        "Visual layout supports design storytelling.",
        "Sidebar works well for tools, portfolio, and methods.",
        "Best paired with a portfolio link.",
      ],
    },
    finance: {
      atsScore: 94,
      readabilityScore: 93,
      bestFor: "Finance, analyst, and operations roles",
      notIdealFor: "Highly visual creative roles",
      reasons: [
        "Professional layout fits business and finance expectations.",
        "Good for metrics, reporting, forecasting, and analysis.",
        "Safe structure for corporate applications.",
      ],
    },
    teacher: {
      atsScore: 90,
      readabilityScore: 94,
      bestFor: "Teaching, education, and training roles",
      notIdealFor: "Technical engineering resumes",
      reasons: [
        "Readable sections support classroom and curriculum experience.",
        "Good for education, certifications, and student outcomes.",
        "Warm modern layout feels approachable.",
      ],
    },
    legal_assistant: {
      atsScore: 97,
      readabilityScore: 90,
      bestFor: "Legal assistant, admin, and compliance support roles",
      notIdealFor: "Creative portfolio applications",
      reasons: [
        "Conservative one-column layout fits legal expectations.",
        "Very low formatting risk.",
        "Good for documentation, scheduling, and case support keywords.",
      ],
    },
  };

  return (
    scorecards[templateId] ?? {
      atsScore: 92,
      readabilityScore: 92,
      bestFor: "Professional applications",
      notIdealFor: "Highly specialized creative resumes",
      reasons: [
        "Clean structure supports recruiter scanning.",
        "Safe section hierarchy works for most roles.",
        "Good general-purpose resume format.",
      ],
    }
  );
}

function TemplateCardView({
  template,
  isSelected,
  onUse,
  onPreview,
  onOpen,
  previewHtml,
  isLoadingPreview = false,
}: {
  template: TemplateCard;
  isSelected: boolean;
  onUse: () => void;
  onPreview?: () => void;
  onOpen?: () => void;
  previewHtml?: string;
  isLoadingPreview?: boolean;
}) {
  const handleOpen = onPreview ?? onOpen ?? onUse;
  const productLabel = getTemplateProductLabel(template.templateId);

  return (
    <div className="group flex flex-col items-center">
      <div
        className={[
          "relative flex min-h-[560px] w-full items-center justify-center rounded-xl bg-white p-10 shadow-sm ring-1 ring-slate-200 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl",
          isSelected ? "ring-2 ring-primary shadow-lg" : "",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={handleOpen}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-md border bg-white text-sm shadow-sm transition hover:bg-muted"
          aria-label={`Open ${template.name} preview`}
        >
          ↗
        </button>

        {isSelected ? (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Selected
          </div>
        ) : null}

        {previewHtml ? (
          <div className="h-[475px] w-[340px] overflow-hidden rounded bg-white shadow-xl ring-1 ring-black/10">
            <iframe
              title={`${template.name} template preview`}
              srcDoc={previewHtml}
              className="pointer-events-none h-[1100px] w-[850px] origin-top-left border-0"
              style={{ transform: "scale(0.4)" }}
            />
          </div>
        ) : isLoadingPreview ? (
          <div className="flex h-[475px] w-[340px] items-center justify-center rounded bg-muted/30 text-sm text-muted-foreground ring-1 ring-black/10">
            Loading template preview...
          </div>
        ) : (
          <TemplateThumbnail templateId={template.templateId} />
        )}
      </div>

      <Button
        type="button"
        onClick={onUse}
        size="lg"
        className="mt-6 min-w-[220px] rounded-lg px-8 font-semibold shadow-lg"
      >
        Use This Template
      </Button>

      <div className="mt-4 text-center">
        <p className="text-base font-semibold">{template.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {template.format ?? template.category ?? "Professional resume"}
        </p>

        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">{productLabel.safety}</Badge>
          <Badge variant="outline">{productLabel.layout}</Badge>
          <Badge variant="outline">{productLabel.bestUse}</Badge>
        </div>
      </div>
    </div>
  );
}

export default function ResumesPage() {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState("Featured");
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateQualityFilter, setTemplateQualityFilter] = useState("All");
  const [templateSort, setTemplateSort] = useState("Recommended");
  const [tailorJobDescription, setTailorJobDescription] = useState("");
  const [recommendationRole, setRecommendationRole] = useState("AI Engineer");
  const [recommendationLevel, setRecommendationLevel] = useState("Entry level");
  const [selectedTemplateId, setSelectedTemplateId] = useState("ats_simple");
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState("new_grad");
  const [roleType, setRoleType] = useState("software_engineer");
  const [designStyle, setDesignStyle] = useState("ats_simple");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("11pt");
  const [accentColor, setAccentColor] = useState("#111827");
  const [density, setDensity] = useState("normal");

  const [workspaceTab, setWorkspaceTab] = useState("build-new");
  const [showResumeStudio, setShowResumeStudio] = useState(false);
  const [isBuildFormOpen, setIsBuildFormOpen] = useState(false);

  const [fullName, setFullName] = useState("Fnu Swati");
  const [email, setEmail] = useState("stomar0812@gmail.com");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Bellevue, WA");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/swati-tomar0812");
  const [github, setGithub] = useState("github.com/stomarp");
  const [targetRole, setTargetRole] = useState("Backend Software Engineer");
  const [summary, setSummary] = useState(
    "Backend-focused Software Engineer with experience building REST APIs, PostgreSQL-backed services, Dockerized applications, and AI-powered workflows."
  );
  const [skillsText, setSkillsText] = useState(
    "Python, Java, SQL, TypeScript, JavaScript, FastAPI, REST APIs, PostgreSQL, Docker, AWS, GitHub Actions, React, Next.js"
  );
  const [educationSchool, setEducationSchool] = useState("Columbus State University");
  const [educationDegree, setEducationDegree] = useState(
    "Master of Science in Applied Computer Science"
  );
  const [educationDetails, setEducationDetails] = useState(
    "Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering"
  );
  const [experienceTitle, setExperienceTitle] = useState("");
  const [experienceCompany, setExperienceCompany] = useState("");
  const [experienceBullets, setExperienceBullets] = useState("");
  const [projectName, setProjectName] = useState("CareerCopilot AI");
  const [projectTechStack, setProjectTechStack] = useState(
    "Python, FastAPI, PostgreSQL, Docker, OpenAI API"
  );
  const [projectBullets, setProjectBullets] = useState(
    "Built an AI-powered career platform that analyzes resumes against job descriptions and identifies qualification gaps.\nDeveloped FastAPI services and document-processing pipelines for resume parsing and career guidance workflows."
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] =
    useState<UploadedResumeResponse | null>(null);
  const [resumeId, setResumeId] = useState("");

  const [resumeMarkdown, setResumeMarkdown] = useState("");
  const [resumeHtml, setResumeHtml] = useState("");
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState("");
  const [templatePreviewNotes, setTemplatePreviewNotes] = useState<string[]>([]);
  const [isLoadingTemplatePreview, setIsLoadingTemplatePreview] = useState(false);
  const [templatePreviewHtmlById, setTemplatePreviewHtmlById] = useState<Record<string, string>>({});
  const [isLoadingTemplateGalleryPreview, setIsLoadingTemplateGalleryPreview] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [previewNotes, setOpenNotes] = useState<string[]>([]);
  const [exportFilename, setExportFilename] = useState(DEFAULT_FILENAME);
  const [downloadFilename, setDownloadFilename] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedTemplate = useMemo(() => {
    return templates.find((template) => template.template_id === selectedTemplateId);
  }, [templates, selectedTemplateId]);

  const marketplaceTemplates = useMemo(() => {
    const backendTemplates = templates.map(mapBackendTemplateToCard);
    return backendTemplates.length > 0 ? backendTemplates : curatedTemplates;
  }, [templates]);

  const templateCategories = useMemo(() => {
    const preferredOrder = [
      "Featured",
      "Technology",
      "Business",
      "Healthcare",
      "Education",
      "Support",
      "Legal",
    ];

    const categories = Array.from(
      new Set(
        marketplaceTemplates.map((template) => template.category ?? "General")
      )
    );

    const orderedCategories = [
      ...preferredOrder.filter((category) => categories.includes(category)),
      ...categories.filter((category) => !preferredOrder.includes(category)).sort(),
    ];

    return [...orderedCategories, "All"];
  }, [marketplaceTemplates]);

  const visibleTemplates = useMemo(() => {
    let filtered =
      activeTemplateCategory === "All"
        ? marketplaceTemplates
        : marketplaceTemplates.filter(
            (template) => template.category === activeTemplateCategory
          );

    if (templateQualityFilter !== "All") {
      filtered = filtered.filter((template) => {
        const label = getTemplateProductLabel(template.templateId);
        return label.safety === templateQualityFilter;
      });
    }

    const query = templateSearch.trim().toLowerCase();

    if (query) {
      filtered = filtered.filter((template) => {
        const label = getTemplateProductLabel(template.templateId);

        return [
          template.name,
          template.category,
          template.format,
          template.description,
          template.bestFor,
          label.safety,
          label.layout,
          label.bestUse,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    }

    const scoreTemplate = (template: TemplateCard) => {
      const label = getTemplateProductLabel(template.templateId);

      if (templateSort === "ATS safest") {
        if (label.safety === "Maximum ATS-safe") return 4;
        if (label.safety === "ATS-safe") return 3;
        if (label.safety === "Recruiter-friendly") return 2;
        return 1;
      }

      if (templateSort === "Visual first") {
        if (label.safety === "Visual PDF") return 4;
        if (label.safety === "Recruiter-friendly") return 3;
        return 1;
      }

      if (templateSort === "Tech roles") {
        if (
          ["ai_engineer", "backend_engineer", "new_grad_swe", "data_analyst"].includes(
            template.templateId
          )
        ) {
          return 4;
        }

        return 1;
      }

      if (templateSort === "Executive/professional") {
        if (["executive", "finance", "legal_assistant"].includes(template.templateId)) {
          return 4;
        }

        if (label.safety === "Recruiter-friendly") return 3;
        return 1;
      }

      return template.category === "Featured" ? 3 : 2;
    };

    return [...filtered].sort((a, b) => scoreTemplate(b) - scoreTemplate(a));
  }, [
    activeTemplateCategory,
    marketplaceTemplates,
    templateQualityFilter,
    templateSearch,
    templateSort,
  ]);

  const recommendedTemplateChoices = useMemo(() => {
    const recommendedIds = getRecommendedTemplateIds(
      recommendationRole,
      recommendationLevel
    );

    return recommendedIds
      .map((templateId) =>
        marketplaceTemplates.find((template) => template.templateId === templateId)
      )
      .filter(Boolean) as TemplateCard[];
  }, [marketplaceTemplates, recommendationLevel, recommendationRole]);

  const selectedMarketplaceTemplate = useMemo(() => {
    return (
      marketplaceTemplates.find(
        (template) => template.templateId === selectedTemplateId
      ) ??
      marketplaceTemplates[0] ??
      curatedTemplates[0]
    );
  }, [marketplaceTemplates, selectedTemplateId]);

  const previewTemplate = useMemo(() => {
    if (!previewTemplateId) return null;

    return (
      marketplaceTemplates.find(
        (template) => template.templateId === previewTemplateId
      ) ?? null
    );
  }, [marketplaceTemplates, previewTemplateId]);

  useEffect(() => {
    let cancelled = false;

    async function loadTemplateGalleryPreviews() {
      const templatesToLoad = visibleTemplates.filter(
        (template) => !templatePreviewHtmlById[template.templateId]
      );

      if (templatesToLoad.length === 0) return;

      setIsLoadingTemplateGalleryPreview(true);

      const results = await Promise.all(
        templatesToLoad.map(async (template) => {
          try {
            const response = await api.post<ResumeOpenResponse>(
              "/resume-builder/preview",
              {
                resume_markdown: buildSampleResumeMarkdownForTemplate(template),
                design_style: template.designStyle,
                template_id: template.templateId,
                font_family: fontFamily,
                font_size: fontSize,
                accent_color: accentColor,
                density,
              }
            );

            return [template.templateId, response.data.resume_html] as const;
          } catch {
            return [template.templateId, ""] as const;
          }
        })
      );

      if (!cancelled) {
        setTemplatePreviewHtmlById((previous) => {
          const next = { ...previous };

          for (const [templateId, html] of results) {
            if (html) next[templateId] = html;
          }

          return next;
        });

        setIsLoadingTemplateGalleryPreview(false);
      }
    }

    loadTemplateGalleryPreviews();

    return () => {
      cancelled = true;
    };
  }, [visibleTemplates, templatePreviewHtmlById]);



  useEffect(() => {
    const latestResumeId = localStorage.getItem("careercopilot_latest_resume_id");

    if (latestResumeId) {
      setResumeId(latestResumeId);
    }

    async function loadTemplates() {
      try {
        const response = await api.get<ResumeTemplate[]>("/resume-builder/templates");
        setTemplates(response.data);

        if (response.data.length > 0) {
          setSelectedTemplateId(response.data[0].template_id);
          setExperienceLevel(response.data[0].experience_level);
          setRoleType(response.data[0].role_type);
          setDesignStyle(response.data[0].design_style);
        }
      } catch {
        setError("Could not load resume templates.");
      }
    }

    loadTemplates();
  }, []);

  function scrollToWorkspace(tab: string) {
    setShowResumeStudio(true);
    setWorkspaceTab(tab);
    setIsBuildFormOpen(false);

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const workspace = document.getElementById("resume-workspace");
        workspace?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    });
  }

  function handleUseTemplate(template: TemplateCard) {
    setSelectedTemplateId(template.templateId);
    setExperienceLevel(template.experienceLevel);
    setRoleType(template.roleType);
    setDesignStyle(template.designStyle);

    setShowResumeStudio(true);
    setWorkspaceTab("build-new");
    setIsBuildFormOpen(false);

    setResumeMarkdown("");
    setResumeHtml("");
    setSuggestions([]);
    setOpenNotes([]);
    setDownloadFilename("");

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const workspace = document.getElementById("resume-workspace");
        workspace?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setSuccessMessage("");
      setError("");
    }
  }

  async function handleCreateNewResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim() || !email.trim()) {
      setError("Full name and email are required to build a new resume.");
      return;
    }

    setIsCreating(true);
    setError("");
    setSuccessMessage("");

    const education = educationSchool.trim()
      ? [
          {
            school: educationSchool,
            degree: educationDegree || "Degree",
            location: null,
            start_date: null,
            end_date: null,
            details: splitBullets(educationDetails),
          },
        ]
      : [];

    const experience = experienceTitle.trim()
      ? [
          {
            title: experienceTitle,
            company: experienceCompany || "Company",
            location: null,
            start_date: null,
            end_date: null,
            bullets: splitBullets(experienceBullets),
          },
        ]
      : [];

    const projects = projectName.trim()
      ? [
          {
            name: projectName,
            tech_stack: projectTechStack,
            start_date: null,
            end_date: null,
            bullets: splitBullets(projectBullets),
          },
        ]
      : [];

    try {
      const response = await api.post<ResumeCreateResponse>("/resume-builder/create", {
        template_id: selectedTemplateId,
          font_family: fontFamily,
          font_size: fontSize,
          accent_color: accentColor,
          density,
        experience_level: experienceLevel,
        role_type: roleType,
        design_style: designStyle,
        full_name: fullName,
        email,
        phone: phone || null,
        location: location || null,
        linkedin: linkedin || null,
        github: github || null,
        target_role: targetRole || null,
        summary: summary || null,
        skills: splitList(skillsText),
        education,
        experience,
        projects,
      });

      setResumeMarkdown(response.data.resume_markdown);
      setSuggestions(response.data.suggestions);
      setDownloadFilename("");

      const previewResponse = await api.post<ResumeOpenResponse>(
        "/resume-builder/preview",
        {
          resume_markdown: response.data.resume_markdown,
          design_style: designStyle,
          template_id: selectedTemplateId,
          font_family: fontFamily,
          font_size: fontSize,
          accent_color: accentColor,
          density,
        }
      );

      setResumeHtml(previewResponse.data.resume_html);
      setOpenNotes(previewResponse.data.preview_notes);
      setSuccessMessage("New resume draft created and preview generated.");
    } catch {
      setError("Could not create a new resume. Check the required fields and try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUploadResume(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose a resume file first.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post<UploadedResumeResponse>(
        "/resumes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedResume(response.data);
      setResumeId(String(response.data.resume_id));
      localStorage.setItem(
        "careercopilot_latest_resume_id",
        String(response.data.resume_id)
      );
      setSuccessMessage(`Uploaded resume ${response.data.resume_id}.`);
    } catch {
      setError("Resume upload failed. Please check the file and try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleBuildFromUploadedResume() {
    if (!resumeId) {
      setError("Please upload a resume or enter a resume ID first.");
      return;
    }

    setIsBuilding(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.post<ResumeFromUploadResponse>(
        "/resume-builder/from-uploaded-resume",
        {
          resume_id: Number(resumeId),
          template_id: selectedTemplateId,
          font_family: fontFamily,
          font_size: fontSize,
          accent_color: accentColor,
          density,
          experience_level: experienceLevel,
          role_type: roleType,
          design_style: designStyle,
        }
      );

      setResumeMarkdown(response.data.resume_markdown);
      setResumeHtml(response.data.resume_html);
      setSuggestions(response.data.suggestions);
      setOpenNotes([]);
      setDownloadFilename("");
      setSuccessMessage("Existing resume boosted and preview generated.");
    } catch {
      setError(
        "Could not build from uploaded resume. Check that this resume ID belongs to your account and has parsed text."
      );
    } finally {
      setIsBuilding(false);
    }
  }

  async function handleOpenResume() {
    if (!resumeMarkdown.trim()) {
      setError("Generate or paste resume markdown before previewing.");
      return;
    }

    setIsOpening(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.post<ResumeOpenResponse>(
        "/resume-builder/preview",
        {
          resume_markdown: resumeMarkdown,
          design_style: designStyle,
        }
      );

      setResumeHtml(response.data.resume_html);
      setOpenNotes(response.data.preview_notes);
      setSuccessMessage("Open updated.");
    } catch {
      setError("Could not generate resume preview.");
    } finally {
      setIsOpening(false);
    }
  }

  async function handleExport(format: "markdown" | "html" | "docx" | "pdf") {
    if (!resumeMarkdown.trim() && format !== "pdf") {
      setError("Generate or paste resume markdown before exporting.");
      return;
    }

    if (format === "pdf" && !resumeHtml.trim()) {
      setError("Generate preview before exporting PDF.");
      return;
    }

    setIsExporting(true);
    setError("");
    setSuccessMessage("");

    const safeFilename = exportFilename.trim() || DEFAULT_FILENAME;

    try {
      let response;

      if (format === "pdf") {
        response = await api.post<ResumeExportResponse>("/resume-builder/export/pdf", {
          filename: safeFilename,
          resume_html: resumeHtml,
        });
      } else {
        response = await api.post<ResumeExportResponse>(
          `/resume-builder/export/${format}`,
          {
            filename: safeFilename,
            resume_markdown: format === "html" ? resumeHtml : resumeMarkdown,
          }
        );
      }

      setDownloadFilename(response.data.filename);
      setSuccessMessage(response.data.message);
    } catch {
      setError(`Could not export ${format.toUpperCase()} resume.`);
    } finally {
      setIsExporting(false);
    }
  }

  const downloadUrl = downloadFilename
    ? `${API_BASE_URL}/resume-builder/export/download/${downloadFilename}`
    : "";

  const hasDraft = resumeMarkdown.trim().length > 0 || resumeHtml.trim().length > 0;

  const resumeQualityReport = useMemo(
    () => getResumeQualityReport(resumeMarkdown),
    [resumeMarkdown]
  );

  const jobTailoringReport = useMemo(
    () => getJobTailoringReport(resumeMarkdown, tailorJobDescription),
    [resumeMarkdown, tailorJobDescription]
  );

  useEffect(() => {
    if (!resumeMarkdown.trim()) return;

    const liveStylePreviewTimer = window.setTimeout(async () => {
      try {
        const response = await api.post<ResumeOpenResponse>(
          "/resume-builder/preview",
          {
            resume_markdown: resumeMarkdown,
            design_style: designStyle,
            template_id: selectedTemplateId,
            font_family: fontFamily,
            font_size: fontSize,
            accent_color: accentColor,
            density,
          }
        );

        setResumeHtml(response.data.resume_html);
        setOpenNotes(response.data.preview_notes);
      } catch {
        // Keep existing preview if live style refresh fails.
      }
    }, 450);

    return () => window.clearTimeout(liveStylePreviewTimer);
  }, [
    resumeMarkdown,
    designStyle,
    selectedTemplateId,
    fontFamily,
    fontSize,
    accentColor,
    density,
  ]);

  return (
    <AppShell>
      <section className="mb-10 overflow-hidden rounded-3xl border bg-gradient-to-br from-background via-muted/30 to-background p-8 md:p-12">
        <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <Badge variant="secondary" className="mb-4">
              Resume Templates
            </Badge>

            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-5xl">
              Free Professional Resume Templates
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              Choose sleek, minimalist templates designed for ATS parsing, recruiter readability, and fast customization inside CareerCopilot.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => scrollToWorkspace("build-new")}>
                Build Resume Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToWorkspace("boost-existing")}
              >
                Boost Existing Resume
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "ATS-friendly templates",
                "Profession-based formats",
                "PDF and DOCX export",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-background/80 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Live resume preview
              </CardTitle>
              <CardDescription>
                See how your selected template will look before exporting.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="rounded-2xl border bg-white p-6 text-black shadow-sm">
                <div className="text-center">
                  <div className="text-xl font-bold tracking-wide">FNU SWATI</div>
                  <div className="mt-1 text-xs">
                    Bellevue, WA | stomar0812@gmail.com | LinkedIn | GitHub
                  </div>
                </div>

                <div className="mt-5 border-t pt-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em]">
                    Summary
                  </div>
                  <p className="mt-2 text-xs leading-5">
                    Backend-focused Software Engineer with experience building
                    REST APIs, PostgreSQL-backed services, Dockerized
                    applications, and AI-powered workflows.
                  </p>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em]">
                    Projects
                  </div>
                  <div className="mt-2 text-xs leading-5">
                    <p className="font-semibold">
                      CareerCopilot AI | FastAPI, PostgreSQL, Docker
                    </p>
                    <p>
                      • Built ATS analysis, fit assistant, and resume optimization
                      workflows.
                    </p>
                    <p>• Developed protected APIs and user-specific career data flows.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="template-gallery" className="mb-12">
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">
              Free Professional Resume Templates
            </Badge>
            <h2 className="cc-gradient-title text-3xl font-black tracking-tight sm:text-4xl">
              Start building your resume with these free templates
            </h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Browse ATS-friendly templates by profession, career level, and resume format.
              Start with a focused template, then customize it inside Resume Studio.
            </p>
          </div>

          
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {templateCategories.map((category) => (
            <Button
              key={category}
              type="button"
              variant={activeTemplateCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTemplateCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {activeTemplateCategory} templates
          </span>
          <span>
            {visibleTemplates.length} option{visibleTemplates.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mb-8 rounded-3xl border bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge variant="secondary">Template recommender</Badge>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Find my best template
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Choose your target role and level. CareerCopilot will surface the safest and most relevant resume formats.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
              <div className="space-y-2">
                <Label>Target role</Label>
                <select
                  value={recommendationRole}
                  onChange={(event) => setRecommendationRole(event.target.value)}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Backend Software Engineer">Backend Software Engineer</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="UX Designer">UX Designer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Finance Analyst">Finance Analyst</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Legal Assistant">Legal Assistant</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Career level</Label>
                <select
                  value={recommendationLevel}
                  onChange={(event) => setRecommendationLevel(event.target.value)}
                  className="h-11 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="Entry level">Entry level</option>
                  <option value="Mid level">Mid level</option>
                  <option value="Senior level">Senior level</option>
                  <option value="Executive">Executive</option>
                  <option value="Career change">Career change</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {recommendedTemplateChoices.map((template) => {
              const productLabel = getTemplateProductLabel(template.templateId);

              return (
                <div
                  key={template.templateId}
                  className="rounded-2xl border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{template.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {productLabel.bestUse}
                      </p>
                    </div>
                    <Badge variant="outline">{productLabel.safety}</Badge>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {template.bestFor}
                  </p>

                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplateId(template.templateId)}
                    >
                      Preview
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-8 rounded-3xl border bg-background p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_180px]">
            <Input
              value={templateSearch}
              onChange={(event) => setTemplateSearch(event.target.value)}
              placeholder="Search templates by role, style, or format"
              className="h-11"
            />

            <select
              value={templateQualityFilter}
              onChange={(event) => setTemplateQualityFilter(event.target.value)}
              className="h-11 rounded-md border bg-background px-3 text-sm"
            >
              <option value="All">All template types</option>
              <option value="Maximum ATS-safe">Maximum ATS-safe</option>
              <option value="ATS-safe">ATS-safe</option>
              <option value="Recruiter-friendly">Recruiter-friendly</option>
              <option value="Visual PDF">Visual PDF</option>
            </select>

            <select
              value={templateSort}
              onChange={(event) => setTemplateSort(event.target.value)}
              className="h-11 rounded-md border bg-background px-3 text-sm"
            >
              <option value="Recommended">Recommended</option>
              <option value="ATS safest">ATS safest</option>
              <option value="Visual first">Visual first</option>
              <option value="Tech roles">Tech roles</option>
              <option value="Executive/professional">Executive/professional</option>
            </select>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTemplateSearch("");
                setTemplateQualityFilter("All");
                setTemplateSort("Recommended");
                setActiveTemplateCategory("Featured");
              }}
            >
              Reset filters
            </Button>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Showing {visibleTemplates.length} template{visibleTemplates.length === 1 ? "" : "s"}.
          </p>
        </div>

        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
          {visibleTemplates.map((template) => {
            const isSelected =
              selectedTemplateId === template.templateId &&
              roleType === template.roleType &&
              experienceLevel === template.experienceLevel;

            return (
              <TemplateCardView
                key={template.templateId}
                template={template}
                isSelected={isSelected}
                onUse={() => handleUseTemplate(template)}
              onPreview={() => setPreviewTemplateId(template.templateId)}
                  />
            );
          })}
        </div>

        {visibleTemplates.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-muted/20 p-10 text-center">
            <p className="text-lg font-semibold">No templates match your filters.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing the search or choosing a different template type.
            </p>
          </div>
        ) : null}
      </section>

      {showResumeStudio ? (
      <section id="resume-workspace" className="scroll-mt-6">
        <div className="mb-5 rounded-3xl border bg-background p-5 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Resume Studio</Badge>
                <Badge variant="outline">
                  {selectedTemplate?.name ?? "Choose a template"}
                </Badge>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Build your resume.
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Choose a template, create a new draft, or improve an existing resume.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const gallery = document.getElementById("template-gallery");
                gallery?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Change template
            </Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[440px_1fr] xl:items-start">
            <div className="space-y-4 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto xl:pr-2">
              <Tabs value={workspaceTab} onValueChange={setWorkspaceTab}>
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-muted/50 p-1">
                  <TabsTrigger value="build-new" className="rounded-xl py-2.5">
                    New resume
                  </TabsTrigger>
                  <TabsTrigger value="boost-existing" className="rounded-xl py-2.5">
                    Improve existing
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="build-new" className="mt-6">
                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <CardTitle>New resume</CardTitle>
                      <CardDescription>
                        Generate a first draft from the selected template.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <form onSubmit={handleCreateNewResume} className="space-y-5">
                        <div className="rounded-2xl border bg-muted/30 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">Selected template</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {selectedTemplate?.name ?? "Choose a template"}
                              </p>
                            </div>
                            <Badge variant="secondary">Customizable</Badge>
                          </div>

                          <div className="mt-5">
                            <p className="text-sm font-medium">Customize style</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Font</Label>
                                <select
                                  value={fontFamily}
                                  onChange={(event) => setFontFamily(event.target.value)}
                                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                  <option value="Arial">Arial</option>
                                  <option value="Calibri">Calibri</option>
                                  <option value="Helvetica">Helvetica</option>
                                  <option value="Georgia">Georgia</option>
                                  <option value="Times New Roman">Times New Roman</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label>Font size</Label>
                                <select
                                  value={fontSize}
                                  onChange={(event) => setFontSize(event.target.value)}
                                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                  <option value="10pt">10pt</option>
                                  <option value="10.5pt">10.5pt</option>
                                  <option value="11pt">11pt</option>
                                  <option value="11.5pt">11.5pt</option>
                                  <option value="12pt">12pt</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label>Spacing</Label>
                                <select
                                  value={density}
                                  onChange={(event) => setDensity(event.target.value)}
                                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                  <option value="compact">Compact</option>
                                  <option value="normal">Normal</option>
                                  <option value="spacious">Spacious</option>
                                </select>
                              </div>

                              <div className="space-y-2">
                                <Label>Accent</Label>
                                <select
                                  value={accentColor}
                                  onChange={(event) => setAccentColor(event.target.value)}
                                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                  <option value="#111827">Classic black</option>
                                  <option value="#1d4ed8">Modern blue</option>
                                  <option value="#047857">Emerald</option>
                                  <option value="#4c1d95">AI purple</option>
                                  <option value="#7c2d12">Executive brown</option>
                                  <option value="#881337">Marketing rose</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" required />
                          <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
                          <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone optional" />
                          <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
                          <Input value={linkedin} onChange={(event) => setLinkedin(event.target.value)} placeholder="LinkedIn" />
                          <Input value={github} onChange={(event) => setGithub(event.target.value)} placeholder="GitHub / Portfolio" />
                        </div>

                        <Input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Target role" />

                        <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={4} placeholder="Professional summary" />

                        <Textarea value={skillsText} onChange={(event) => setSkillsText(event.target.value)} rows={4} placeholder="Skills" />

                        <div className="rounded-2xl border p-4">
                          <p className="font-medium">Education</p>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Input value={educationSchool} onChange={(event) => setEducationSchool(event.target.value)} placeholder="School" />
                            <Input value={educationDegree} onChange={(event) => setEducationDegree(event.target.value)} placeholder="Degree" />
                          </div>
                          <Textarea className="mt-4" value={educationDetails} onChange={(event) => setEducationDetails(event.target.value)} rows={3} placeholder="Education details" />
                        </div>

                        <div className="rounded-2xl border p-4">
                          <p className="font-medium">Experience</p>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Input value={experienceTitle} onChange={(event) => setExperienceTitle(event.target.value)} placeholder="Title optional" />
                            <Input value={experienceCompany} onChange={(event) => setExperienceCompany(event.target.value)} placeholder="Company optional" />
                          </div>
                          <Textarea className="mt-4" value={experienceBullets} onChange={(event) => setExperienceBullets(event.target.value)} rows={4} placeholder="One bullet per line" />
                        </div>

                        <div className="rounded-2xl border p-4">
                          <p className="font-medium">Featured project</p>
                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Project name" />
                            <Input value={projectTechStack} onChange={(event) => setProjectTechStack(event.target.value)} placeholder="Tech stack" />
                          </div>
                          <Textarea className="mt-4" value={projectBullets} onChange={(event) => setProjectBullets(event.target.value)} rows={5} />
                        </div>

                        <Button type="submit" className="w-full" disabled={isCreating}>
                          {isCreating ? "Creating resume..." : "Create resume draft"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="boost-existing" className="mt-6">
                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <CardTitle>Improve existing resume</CardTitle>
                      <CardDescription>
                        Upload an existing resume and improve it with CareerCopilot.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <form onSubmit={handleUploadResume} className="space-y-4">
                        <div className="rounded-2xl border border-dashed p-5">
                          <Label htmlFor="resume-upload">Resume file</Label>
                          <Input
                            id="resume-upload"
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={(event) =>
                              setSelectedFile(event.target.files?.[0] ?? null)
                            }
                            className="mt-3"
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={isUploading}>
                          {isUploading ? "Uploading..." : "Upload resume"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-5">
              {hasDraft ? (
                <>
                  <ResumeEditorOpen
                    resumeMarkdown={resumeMarkdown}
                    setResumeMarkdown={setResumeMarkdown}
                    resumeHtml={resumeHtml}
                    suggestions={suggestions}
                    previewNotes={previewNotes}
                    handleOpenResume={handleOpenResume}
                    isOpening={isOpening}
                  />

                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <CardTitle>Export resume</CardTitle>
                      <CardDescription>
                        Download your resume after previewing the final version.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <Input
                        value={exportFilename}
                        onChange={(event) => setExportFilename(event.target.value)}
                        placeholder="Filename"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Button type="button" variant="outline" disabled={isExporting} onClick={() => handleExport("markdown")}>Markdown</Button>
                        <Button type="button" variant="outline" disabled={isExporting} onClick={() => handleExport("html")}>HTML</Button>
                        <Button type="button" variant="outline" disabled={isExporting} onClick={() => handleExport("docx")}>DOCX</Button>
                        <Button type="button" variant="outline" disabled={isExporting} onClick={() => handleExport("pdf")}>PDF</Button>
                      </div>

                      {downloadUrl ? (
                          <Button asChild className="w-full">
                            <a href={downloadUrl} target="_blank" rel="noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Download {downloadFilename}
                            </a>
                          </Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <CardTitle>Resume result</CardTitle>
                      <CardDescription>
                        Preview, editor, suggestions, and export options appear after a draft is created.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
                        <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="font-medium">No resume draft yet</p>

                  {hasDraft ? (
                    <div className="mt-5 rounded-2xl border bg-background p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge variant="secondary">Job match</Badge>
                          <h3 className="mt-2 text-lg font-semibold">
                            Tailor this resume to a job
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Paste a job description to find missing keywords and improve match quality.
                          </p>
                        </div>

                        {jobTailoringReport.score !== null ? (
                          <div className="text-right">
                            <p className="text-3xl font-semibold">
                              {jobTailoringReport.score}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              match score
                            </p>
                          </div>
                        ) : null}
                      </div>

                      <textarea
                        value={tailorJobDescription}
                        onChange={(event) => setTailorJobDescription(event.target.value)}
                        placeholder="Paste the job description here..."
                        className="mt-4 min-h-32 w-full rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />

                      {tailorJobDescription.trim() ? (
                        <div className="mt-4 space-y-4">
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{
                                width: `${jobTailoringReport.score ?? 0}%`,
                              }}
                            />
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-xl border bg-muted/20 p-3">
                              <p className="text-sm font-medium">
                                Missing keywords
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {jobTailoringReport.missingKeywords.slice(0, 12).map(
                                  (keyword) => (
                                    <Badge key={keyword} variant="outline">
                                      {keyword}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="rounded-xl border bg-muted/20 p-3">
                              <p className="text-sm font-medium">
                                Matched keywords
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {jobTailoringReport.matchedKeywords.slice(0, 12).map(
                                  (keyword) => (
                                    <Badge key={keyword} variant="secondary">
                                      {keyword}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          {jobTailoringReport.missingKeywords.length > 0 ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const keywordsToAdd = jobTailoringReport.missingKeywords
                                  .slice(0, 8)
                                  .join(", ");

                                setResumeMarkdown((current) =>
                                  `${current.trim()}

## Targeted Keywords
${keywordsToAdd}`
                                );
                              }}
                            >
                              Add top missing keywords to draft
                            </Button>
                          ) : (
                            <p className="rounded-xl border bg-muted/20 p-3 text-sm text-muted-foreground">
                              Strong keyword coverage. Next step: make sure the bullets show measurable impact.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {hasDraft ? (
                    <div className="mt-5 rounded-2xl border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Badge variant="secondary">Resume health score</Badge>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Quick ATS and recruiter-readability checks for this draft.
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-3xl font-semibold">
                            {resumeQualityReport.score}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {resumeQualityReport.label}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 rounded-full bg-background">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${resumeQualityReport.score}%` }}
                        />
                      </div>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {resumeQualityReport.checks.slice(0, 6).map((check) => (
                          <div
                            key={check.label}
                            className="flex items-start gap-2 rounded-xl border bg-background p-3"
                          >
                            <span className="mt-0.5 text-sm">
                              {check.passed ? "✓" : "!"}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{check.label}</p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {check.passed ? "Looks good." : check.tip}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {resumeQualityReport.quickWins.length > 0 ? (
                        <div className="mt-4 rounded-xl border bg-background p-3">
                          <p className="text-sm font-medium">Next best fixes</p>
                          <ul className="mt-2 space-y-1 text-sm leading-6 text-muted-foreground">
                            {resumeQualityReport.quickWins.map((fix) => (
                              <li key={fix.label}>• {fix.tip}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="mt-4 rounded-xl border bg-background p-3 text-sm text-muted-foreground">
                          Strong draft. Next step: tailor keywords to a specific job description.
                        </p>
                      )}
                    </div>
                  ) : null}
                        <p className="mt-2 text-sm text-muted-foreground">
                          Build a new resume or improve an existing one to continue.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        ) : null}

        
        {/* Template preview modal */}
        {previewTemplate ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-background shadow-2xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <p className="text-sm text-muted-foreground">Template preview</p>
                  <h3 className="text-xl font-semibold">{previewTemplate.name}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => {
                      handleUseTemplate(previewTemplate);
                      setPreviewTemplateId(null);
                    }}
                  >
                    Use This Template
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewTemplateId(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>

              <div className="grid max-h-[calc(92vh-82px)] gap-6 overflow-auto p-6 lg:grid-cols-[1fr_320px]">
                <div className="flex justify-center rounded-2xl bg-muted/30 p-8">
                  {templatePreviewHtmlById[previewTemplate.templateId] ? (
                    <div className="h-[780px] w-[610px] overflow-hidden rounded bg-white shadow-2xl ring-1 ring-black/10">
                      <iframe
                        title={`${previewTemplate.name} full preview`}
                        srcDoc={templatePreviewHtmlById[previewTemplate.templateId]}
                        className="pointer-events-none h-[1100px] w-[850px] origin-top-left border-0"
                        style={{ transform: "scale(0.72)" }}
                      />
                    </div>
                  ) : (
                    <TemplateThumbnail templateId={previewTemplate.templateId} />
                  )}
                </div>

                <div className="space-y-4">
                  <Badge variant="secondary">
                    {previewTemplate.category ?? "Professional"}
                  </Badge>

                  <div>
                    <h4 className="text-lg font-semibold">{previewTemplate.name}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {previewTemplate.description}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm font-medium">Best for</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {previewTemplate.bestFor}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm font-medium">Format</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {previewTemplate.format ?? "Professional resume"}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm font-medium">Template scorecard</p>

                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">ATS safety</span>
                          <span className="font-semibold">
                            {getTemplateScorecard(previewTemplate.templateId).atsScore}/100
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width: `${getTemplateScorecard(previewTemplate.templateId).atsScore}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Recruiter readability</span>
                          <span className="font-semibold">
                            {getTemplateScorecard(previewTemplate.templateId).readabilityScore}/100
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width: `${getTemplateScorecard(previewTemplate.templateId).readabilityScore}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm font-medium">Best for</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {getTemplateScorecard(previewTemplate.templateId).bestFor}
                    </p>

                    <p className="mt-4 text-sm font-medium">Not ideal for</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {getTemplateScorecard(previewTemplate.templateId).notIdealFor}
                    </p>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm font-medium">Why this template works</p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                      {getTemplateScorecard(previewTemplate.templateId).reasons.map(
                        (reason) => (
                          <li key={reason}>• {reason}</li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="rounded-2xl border p-4">
                    <p className="text-sm font-medium">How to use</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Preview the design first, then choose this template to open Resume Studio with it pre-loaded.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}


        </AppShell>
  );
}

function TemplateSettings({
  templates,
  selectedTemplate,
  selectedTemplateId,
  setSelectedTemplateId,
  experienceLevel,
  setExperienceLevel,
  roleType,
  setRoleType,
  designStyle,
  setDesignStyle,
}: {
  templates: ResumeTemplate[];
  selectedTemplate: ResumeTemplate | undefined;
  selectedTemplateId: string;
  setSelectedTemplateId: (value: string) => void;
  experienceLevel: string;
  setExperienceLevel: (value: string) => void;
  roleType: string;
  setRoleType: (value: string) => void;
  designStyle: string;
  setDesignStyle: (value: string) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="template-id">Template</Label>
        <select
          id="template-id"
          value={selectedTemplateId}
          onChange={(event) => setSelectedTemplateId(event.target.value)}
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {templates.map((template) => (
            <option key={template.template_id} value={template.template_id}>
              {template.name}
            </option>
          ))}
        </select>

        {selectedTemplate ? (
          <p className="text-xs leading-5 text-muted-foreground">
            {selectedTemplate.description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="experience-level">Experience level</Label>
          <Input
            id="experience-level"
            value={experienceLevel}
            onChange={(event) => setExperienceLevel(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role-type">Role type</Label>
          <Input
            id="role-type"
            value={roleType}
            onChange={(event) => setRoleType(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="design-style">Design style</Label>
        <Input
          id="design-style"
          value={designStyle}
          onChange={(event) => setDesignStyle(event.target.value)}
        />
      </div>
    </>
  );
}

function ResumeEditorOpen({
  resumeMarkdown,
  setResumeMarkdown,
  resumeHtml,
  suggestions,
  previewNotes,
  handleOpenResume,
  isOpening,
}: {
  resumeMarkdown: string;
  setResumeMarkdown: (value: string) => void;
  resumeHtml: string;
  suggestions: string[];
  previewNotes: string[];
  handleOpenResume: () => void;
  isOpening: boolean;
}) {
    const [suggestionsTailorJobDescription, setSuggestionsTailorJobDescription] =
    useState("");

  const suggestionsHasDraft =
    resumeMarkdown.trim().length > 0 || resumeHtml.trim().length > 0;

  const suggestionsResumeQualityReport =
    getResumeQualityReport(resumeMarkdown);

  const suggestionsJobTailoringReport = getJobTailoringReport(
    resumeMarkdown,
    suggestionsTailorJobDescription
  );

return (
    <div className="cc-product-page space-y-6">
      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="preview" className="rounded-xl">
            Open
          </TabsTrigger>
          <TabsTrigger value="editor" className="rounded-xl">
            Editor
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="rounded-xl">
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card className="cc-product-card-static">
            <CardHeader>
              <CardTitle>Resume preview</CardTitle>
              <CardDescription>
                Review the final layout before exporting.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {resumeHtml ? (
                <div className="overflow-hidden rounded-2xl border bg-white">
                  <div className="h-[720px] overflow-auto rounded-xl border bg-muted/20 p-4">
                      <div className="mx-auto w-fit origin-top scale-[0.72]">
                        <iframe
                          title="Resume preview"
                          srcDoc={resumeHtml}
                          className="h-[1100px] w-[850px] border-0 bg-white shadow-xl"
                        />
                      </div>
                    </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
                  <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">Open not generated yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Create a resume draft, then generate the preview.
                  </p>
                </div>
              )}

              {previewNotes.length > 0 ? (
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-sm font-medium">Open notes</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {previewNotes.map((note) => (
                      <li key={note}>• {note}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor">
          <Card className="cc-product-card-static">
            <CardHeader>
              <CardTitle>Editor</CardTitle>
              <CardDescription>
                Make final text edits before preview or export.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Textarea
                value={resumeMarkdown}
                onChange={(event) => setResumeMarkdown(event.target.value)}
                placeholder="Your generated resume draft will appear here."
                className="min-h-[680px] font-mono text-sm"
              />

              <Button
                type="button"
                onClick={handleOpenResume}
                disabled={isOpening}
              >
                {isOpening ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Update preview
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
                  {/* Resume Intelligence Panel */}
                  {suggestionsHasDraft ? (
                    <div className="space-y-5">
                      <div className="rounded-2xl border bg-background p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge variant="secondary">Resume intelligence</Badge>
                            <h3 className="mt-3 text-xl font-semibold">
                              Resume health score
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              ATS and recruiter-readability checks for this draft.
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-4xl font-semibold">
                              {suggestionsResumeQualityReport.score}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {suggestionsResumeQualityReport.label}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{ width: `${suggestionsResumeQualityReport.score}%` }}
                          />
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          {suggestionsResumeQualityReport.checks.map((check) => (
                            <div
                              key={check.label}
                              className="rounded-xl border bg-muted/20 p-3"
                            >
                              <p className="text-sm font-medium">
                                {check.passed ? "✓ " : "! "}
                                {check.label}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {check.passed ? "Looks good." : check.tip}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-background p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge variant="secondary">Job match</Badge>
                            <h3 className="mt-3 text-xl font-semibold">
                              Tailor this resume to a job
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              Paste a job description to see matched and missing keywords.
                            </p>
                          </div>

                          {suggestionsJobTailoringReport.score !== null ? (
                            <div className="text-right">
                              <p className="text-4xl font-semibold">
                                {suggestionsJobTailoringReport.score}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                match score
                              </p>
                            </div>
                          ) : null}
                        </div>

                        <textarea
                          value={suggestionsTailorJobDescription}
                          onChange={(event) =>
                            setSuggestionsTailorJobDescription(event.target.value)
                          }
                          placeholder="Paste the job description here..."
                          className="mt-4 min-h-36 w-full rounded-xl border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />

                        {suggestionsTailorJobDescription.trim() ? (
                          <div className="mt-5 space-y-4">
                            <div className="h-2 rounded-full bg-muted">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{
                                  width: `${suggestionsJobTailoringReport.score ?? 0}%`,
                                }}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="text-sm font-medium">
                                  Missing keywords
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {suggestionsJobTailoringReport.missingKeywords
                                    .slice(0, 14)
                                    .map((keyword) => (
                                      <Badge key={keyword} variant="outline">
                                        {keyword}
                                      </Badge>
                                    ))}
                                </div>
                              </div>

                              <div className="rounded-xl border bg-muted/20 p-4">
                                <p className="text-sm font-medium">
                                  Matched keywords
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {suggestionsJobTailoringReport.matchedKeywords
                                    .slice(0, 14)
                                    .map((keyword) => (
                                      <Badge key={keyword} variant="secondary">
                                        {keyword}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            </div>

                            {suggestionsJobTailoringReport.missingKeywords.length > 0 ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  const keywordsToAdd =
                                    suggestionsJobTailoringReport.missingKeywords
                                      .slice(0, 8)
                                      .join(", ");

                                  setResumeMarkdown(
                                    `${resumeMarkdown.trim()}

## Targeted Keywords
${keywordsToAdd}`
                                  );
                                }}
                              >
                                Add top missing keywords to draft
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
                      <p className="text-lg font-semibold">
                        Create a resume draft first.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Resume health score and job matching will appear here.
                      </p>
                    </div>
                  )}


          <Card className="cc-product-card-static">
            <CardHeader>
              <CardTitle>Suggestions</CardTitle>
              <CardDescription>
                Review improvements before exporting your resume.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {suggestions.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="rounded-2xl border bg-muted/20 p-4 leading-6"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
                  <p className="font-medium">No suggestions yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Generate or improve a resume to see recommendations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
