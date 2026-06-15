"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clipboard,
  Copy,
  Download,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
} from "lucide-react";

import { api } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";

type ExportType =
  | "pack"
  | "analysis"
  | "optimizer"
  | "interview"
  | "roadmap"
  | "recruiter";

type JobDetail = {
  job_id: number;
  title: string;
  company: string | null;
  description: string;
};

type ATSScoreResponse = {
  resume_id: number;
  job_id: number;
  industry: string;
  ats_score: number;
  match_level: string;
  summary: string;
  breakdown: Record<string, number>;
  matching_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  priority_actions: string[];
  recommendations: string[];
};

type AIResumeOptimizerResponse = {
  ats_score: number;
  provider_used: string;
  fallback_used: boolean;
  ai_overall_feedback: string;
  section_feedback: {
    section: string;
    feedback: string;
    priority: string;
  }[];
  improved_bullets: {
    original_or_gap: string;
    improved_bullet: string;
    why_better: string;
  }[];
  final_warning: string;
};

type BackendInterviewResponse = {
  target_role: string;
  company_name: string | null;
  provider_used: string;
  fallback_used: boolean;
  question_sets: {
    category: string;
    why_this_category_matters: string;
    questions: {
      question: string;
      answer_hint: string;
      what_interviewer_is_testing: string;
    }[];
  }[];
  company_prep: {
    area: string;
    guidance: string;
  }[];
  preparation_tips: string[];
};

type LearningRoadmapResponse = {
  target_role: string;
  timeline_days: number;
  provider_used: string;
  fallback_used: boolean;
  overview: {
    summary: string;
    readiness_level: string;
    target_outcome: string;
  };
  weekly_plan: {
    week: number;
    theme: string;
    goals: string[];
    success_criteria: string[];
  }[];
  mini_projects: {
    title: string;
    difficulty: string;
    description: string;
    why_it_matters: string;
  }[];
  resume_actions: string[];
  interview_prep_actions: string[];
  final_advice: string[];
};

type AnalysisReport = {
  ats_score: number | null;
  summary: string | null;
  matching_skills: string[] | null;
  missing_skills: string[] | null;
  recommendations: string[] | null;
};

type ExportSection = {
  title: string;
  body?: string;
  items?: string[];
};

const exportTypes: {
  value: ExportType;
  label: string;
  description: string;
}[] = [
  {
    value: "pack",
    label: "Full Pack",
    description: "Everything a candidate needs before applying.",
  },
  {
    value: "analysis",
    label: "Analysis",
    description: "ATS score, match summary, skills, and gaps.",
  },
  {
    value: "optimizer",
    label: "Resume Optimizer",
    description: "AI resume feedback and improved bullets.",
  },
  {
    value: "interview",
    label: "Interview Prep",
    description: "Company prep, questions, and preparation tips.",
  },
  {
    value: "roadmap",
    label: "Roadmap",
    description: "Weekly plan, mini projects, and learning goals.",
  },
  {
    value: "recruiter",
    label: "Recruiter Note",
    description: "Copy-ready outreach message.",
  },
];

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitComma(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToMarkdown(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- Not available";
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function readStoredJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function createRecruiterNote(role: string, company: string) {
  return `Hi, I’m interested in the ${role}${company ? ` role at ${company}` : " role"}. My background includes backend development with FastAPI, PostgreSQL, Docker, REST APIs, CI/CD, and AI-powered workflow projects. I recently built CareerCopilot AI, a full-stack job-search platform with resume analysis, job parsing, AI interview preparation, learning roadmap generation, and application workflow tracking. I’d love to be considered for this opportunity.`;
}

export default function ExportCenterPage() {
  const [exportType, setExportType] = useState<ExportType>("pack");

  const [jobId, setJobId] = useState("");
  const [jobTitle, setJobTitle] = useState("Backend Engineer");
  const [company, setCompany] = useState("Visa");
  const [atsScore, setAtsScore] = useState("85");
  const [decision, setDecision] = useState("Apply now");

  const [analysisSummary, setAnalysisSummary] = useState(
    "This role is a strong match. The resume already shows backend API, PostgreSQL, Docker, CI/CD, and AI-powered workflow project experience. The main improvement is to make backend impact more measurable and job-specific."
  );
  const [matchedSkills, setMatchedSkills] = useState(
    "FastAPI, PostgreSQL, Docker, REST APIs, CI/CD, Testing"
  );
  const [missingSkills, setMissingSkills] = useState(
    "Caching, Distributed Systems, Cloud Deployment"
  );

  const [resumeOptimizer, setResumeOptimizer] = useState(
    "Add one backend performance proof point.\nQuantify API, testing, or workflow impact.\nMention deployment details truthfully.\nTailor project bullets to the target job."
  );
  const [interviewPrep, setInterviewPrep] = useState(
    "Prepare one backend API design story.\nPrepare one database/schema design story.\nPrepare one testing/debugging story.\nPractice explaining CareerCopilot AI in 90 seconds."
  );
  const [roadmapPlan, setRoadmapPlan] = useState(
    "Week 1: REST API foundations and clean backend design.\nWeek 2: Database indexing, schema design, and query optimization.\nWeek 3: Testing, CI/CD, and deployment proof.\nWeek 4: System design stories and interview readiness."
  );
  const [recruiterNote, setRecruiterNote] = useState(
    createRecruiterNote("Backend Engineer", "Visa")
  );

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const latestJobId = localStorage.getItem("careercopilot_latest_job_id") ?? "";
    setJobId(latestJobId);

    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as ExportType | null;

    if (
      type &&
      ["pack", "analysis", "optimizer", "interview", "roadmap", "recruiter"].includes(type)
    ) {
      setExportType(type);
    }

    loadStoredWorkspaceOutputs();
  }, []);

  function loadStoredWorkspaceOutputs() {
    const storedJob = readStoredJson<JobDetail>("careercopilot_export_job");
    const storedAts = readStoredJson<ATSScoreResponse>("careercopilot_export_ats");
    const storedOptimizer = readStoredJson<AIResumeOptimizerResponse>(
      "careercopilot_export_optimizer"
    );
    const storedInterview = readStoredJson<BackendInterviewResponse>(
      "careercopilot_export_interview"
    );
    const storedRoadmap = readStoredJson<LearningRoadmapResponse>(
      "careercopilot_export_roadmap"
    );

    if (storedJob) {
      setJobId(String(storedJob.job_id));
      setJobTitle(storedJob.title);
      setCompany(storedJob.company ?? "");
      setRecruiterNote(createRecruiterNote(storedJob.title, storedJob.company ?? ""));
    }

    if (storedAts) {
      setAtsScore(String(storedAts.ats_score));
      setDecision(
        storedAts.ats_score >= 85
          ? "Apply now"
          : storedAts.ats_score >= 70
            ? "Tailor first, then apply"
            : "Build proof first"
      );
      setAnalysisSummary(storedAts.summary);
      setMatchedSkills(storedAts.matching_skills.join(", "));
      setMissingSkills(storedAts.missing_skills.join(", "));
      setResumeOptimizer(
        [...storedAts.priority_actions, ...storedAts.recommendations].join("\n")
      );
    }

    if (storedOptimizer) {
      const optimizerLines = [
        storedOptimizer.ai_overall_feedback,
        "",
        "Section feedback:",
        ...storedOptimizer.section_feedback.map(
          (item) => `${item.section}: ${item.feedback}`
        ),
        "",
        "Improved bullets:",
        ...storedOptimizer.improved_bullets.map((item) => item.improved_bullet),
        "",
        `Warning: ${storedOptimizer.final_warning}`,
      ].filter(Boolean);

      setResumeOptimizer(optimizerLines.join("\n"));
    }

    if (storedInterview) {
      const interviewLines = [
        "Company prep:",
        ...storedInterview.company_prep.map(
          (item) => `${item.area}: ${item.guidance}`
        ),
        "",
        "Preparation tips:",
        ...storedInterview.preparation_tips,
        "",
        "Practice questions:",
        ...storedInterview.question_sets.flatMap((set) => [
          `${set.category}:`,
          ...set.questions.slice(0, 3).map((question) => `- ${question.question}`),
        ]),
      ].filter(Boolean);

      setInterviewPrep(interviewLines.join("\n"));
    }

    if (storedRoadmap) {
      const roadmapLines = [
        storedRoadmap.overview.summary,
        "",
        "Weekly plan:",
        ...storedRoadmap.weekly_plan.map(
          (week) => `Week ${week.week}: ${week.theme} — ${week.goals.join("; ")}`
        ),
        "",
        "Mini projects:",
        ...storedRoadmap.mini_projects.map(
          (project) => `${project.title}: ${project.description}`
        ),
        "",
        "Resume actions:",
        ...storedRoadmap.resume_actions,
        "",
        "Interview prep actions:",
        ...storedRoadmap.interview_prep_actions,
      ].filter(Boolean);

      setRoadmapPlan(roadmapLines.join("\n"));
    }
  }

  async function loadLatestContext() {
    setIsLoading(true);
    setStatus("");

    try {
      const latestJobId =
        jobId || localStorage.getItem("careercopilot_latest_job_id") || "";

      if (latestJobId) {
        const jobResponse = await api.get<JobDetail>(`/jobs/${latestJobId}`);
        const job = jobResponse.data;

        setJobId(String(job.job_id));
        setJobTitle(job.title);
        setCompany(job.company ?? "");
        setRecruiterNote(createRecruiterNote(job.title, job.company ?? ""));
        localStorage.setItem("careercopilot_export_job", JSON.stringify(job));
      }

      try {
        const reportsResponse = await api.get<AnalysisReport[]>("/analysis-reports");
        const latestReport = reportsResponse.data[0];

        if (latestReport) {
          setAtsScore(String(latestReport.ats_score ?? ""));
          setAnalysisSummary(latestReport.summary ?? analysisSummary);
          setMatchedSkills((latestReport.matching_skills ?? []).join(", "));
          setMissingSkills((latestReport.missing_skills ?? []).join(", "));
          setResumeOptimizer((latestReport.recommendations ?? []).join("\n"));

          const score = latestReport.ats_score ?? 0;
          setDecision(
            score >= 85
              ? "Apply now"
              : score >= 70
                ? "Tailor first, then apply"
                : "Build proof first"
          );
        }
      } catch {
        // Reports are optional for this page.
      }

      loadStoredWorkspaceOutputs();
      setStatus("Latest job, report, and workspace outputs loaded.");
    } catch (err) {
      console.error(err);
      setStatus("Could not load latest context. You can still edit the export manually.");
    } finally {
      setIsLoading(false);
    }
  }

  const sections = useMemo<ExportSection[]>(() => {
    const analysisSections: ExportSection[] = [
      {
        title: "Analysis Summary",
        body: analysisSummary,
      },
      {
        title: "Matched Skills",
        items: splitComma(matchedSkills),
      },
      {
        title: "Missing Skills / Gaps",
        items: splitComma(missingSkills),
      },
    ];

    const optimizerSections: ExportSection[] = [
      {
        title: "Resume Optimizer",
        items: splitLines(resumeOptimizer),
      },
    ];

    const interviewSections: ExportSection[] = [
      {
        title: "Interview Prep",
        items: splitLines(interviewPrep),
      },
    ];

    const roadmapSections: ExportSection[] = [
      {
        title: "Learning Roadmap",
        items: splitLines(roadmapPlan),
      },
    ];

    const recruiterSections: ExportSection[] = [
      {
        title: "Recruiter Note",
        body: recruiterNote,
      },
    ];

    if (exportType === "analysis") return analysisSections;
    if (exportType === "optimizer") return optimizerSections;
    if (exportType === "interview") return interviewSections;
    if (exportType === "roadmap") return roadmapSections;
    if (exportType === "recruiter") return recruiterSections;

    return [
      ...analysisSections,
      ...optimizerSections,
      ...interviewSections,
      ...roadmapSections,
      ...recruiterSections,
    ];
  }, [
    analysisSummary,
    exportType,
    interviewPrep,
    matchedSkills,
    missingSkills,
    recruiterNote,
    resumeOptimizer,
    roadmapPlan,
  ]);

  const exportTitle = useMemo(() => {
    const label = exportTypes.find((item) => item.value === exportType)?.label ?? "Export";
    return `${label}: ${jobTitle}${company ? ` at ${company}` : ""}`;
  }, [company, exportType, jobTitle]);

  const exportMarkdown = useMemo(() => {
    const sectionMarkdown = sections
      .map((section) => {
        const content = section.body ?? listToMarkdown(section.items ?? []);
        return `## ${section.title}\n\n${content}`;
      })
      .join("\n\n");

    return `# ${exportTitle}

Generated: ${getTodayLabel()}

**Role:** ${jobTitle}  
**Company:** ${company || "Not specified"}  
**ATS Score:** ${atsScore || "Not scored"}%  
**Decision:** ${decision}

${sectionMarkdown}

---

Generated with CareerCopilot AI.`;
  }, [atsScore, company, decision, exportTitle, jobTitle, sections]);

  async function saveApplicationPack() {
    setIsLoading(true);
    setStatus("");

    try {
      await api.post("/application-packs", {
        job_id: jobId ? Number(jobId) : null,
        resume_id: localStorage.getItem("careercopilot_latest_resume_id")
          ? Number(localStorage.getItem("careercopilot_latest_resume_id"))
          : null,
        title: exportTitle,
        company,
        role_title: jobTitle,
        pack_type: exportType,
        ats_score: atsScore ? Number(atsScore) : null,
        decision,
        summary: analysisSummary,
        content_markdown: exportMarkdown,
        artifacts: {
          export_type: exportType,
          matched_skills: splitComma(matchedSkills),
          missing_skills: splitComma(missingSkills),
          resume_optimizer: splitLines(resumeOptimizer),
          interview_prep: splitLines(interviewPrep),
          roadmap_plan: splitLines(roadmapPlan),
          recruiter_note: recruiterNote,
        },
      });

      setStatus("Application pack saved to your library.");
    } catch (err) {
      console.error(err);
      setStatus("Could not save application pack. Make sure backend is running and you are logged in.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyExport() {
    await navigator.clipboard.writeText(exportMarkdown);
    setStatus(`${exportTitle} copied to clipboard.`);
  }

  function downloadExport() {
    const blob = new Blob([exportMarkdown], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const fileName = exportTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    link.href = url;
    link.download = `${fileName || "careercopilot-export"}.md`;
    link.click();

    URL.revokeObjectURL(url);
    setStatus(`${exportTitle} downloaded.`);
  }

  function printExport() {
    window.print();
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border bg-gradient-to-br from-background via-background to-muted/40 p-6 print:border-none">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                Export Center
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">
                Export career workflow outputs
              </h1>
              <p className="mt-2 max-w-3xl text-muted-foreground">
                Export the full application pack or individual outputs like analysis,
                resume optimizer, interview prep, roadmap, and recruiter note.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              <Button variant="outline" asChild>
                <Link href="/jobs/workspace">Job Workspace</Link>
              </Button>
              <Button asChild>
                <Link href="/applications">
                  Applications
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {status ? (
          <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground print:hidden">
            {status}
          </div>
        ) : null}

        <Card className="print:hidden">
          <CardContent className="p-3">
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              {exportTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setExportType(type.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    exportType === type.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-background hover:bg-muted/40"
                  }`}
                >
                  <p className="font-medium">{type.label}</p>
                  <p
                    className={`mt-1 text-xs leading-5 ${
                      exportType === type.value
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid items-start gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="border-primary/20 print:hidden">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border bg-muted/30 p-3">
                  <Clipboard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Source setup</CardTitle>
                  <CardDescription>
                    Load generated outputs or edit the package manually.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Job ID</Label>
                  <Input value={jobId} onChange={(event) => setJobId(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={company} onChange={(event) => setCompany(event.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ATS Score</Label>
                  <Input value={atsScore} onChange={(event) => setAtsScore(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Decision</Label>
                  <Input value={decision} onChange={(event) => setDecision(event.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Analysis summary</Label>
                <Textarea
                  rows={5}
                  value={analysisSummary}
                  onChange={(event) => setAnalysisSummary(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Matched skills</Label>
                <Input
                  value={matchedSkills}
                  onChange={(event) => setMatchedSkills(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Missing skills</Label>
                <Input
                  value={missingSkills}
                  onChange={(event) => setMissingSkills(event.target.value)}
                />
              </div>

              <Button onClick={loadLatestContext} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Load generated outputs
              </Button>
            </CardContent>
          </Card>

          <Card className="print:border-none print:shadow-none">
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge variant="secondary">
                    {exportTypes.find((item) => item.value === exportType)?.label}
                  </Badge>
                  <CardTitle className="mt-3 text-2xl">{exportTitle}</CardTitle>
                  <CardDescription className="mt-1">
                    ATS {atsScore || "—"}% • {decision}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2 print:hidden">
                  <Button variant="outline" onClick={copyExport}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={downloadExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={printExport}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / PDF
                  </Button>
                  <Button onClick={saveApplicationPack} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Save Pack
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/application-packs">Saved Packs</Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {sections.map((section) => (
                <div key={section.title} className="rounded-2xl border bg-muted/20 p-5">
                  <p className="font-medium">{section.title}</p>

                  {section.body ? (
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                      {section.body}
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {(section.items ?? []).map((item) => (
                        <div key={item} className="rounded-xl border bg-background p-3 text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="grid gap-4 lg:grid-cols-2 print:hidden">
                <EditableBlock
                  title="Resume Optimizer"
                  value={resumeOptimizer}
                  onChange={setResumeOptimizer}
                />
                <EditableBlock
                  title="Interview Prep"
                  value={interviewPrep}
                  onChange={setInterviewPrep}
                />
                <EditableBlock
                  title="Roadmap"
                  value={roadmapPlan}
                  onChange={setRoadmapPlan}
                />
                <EditableBlock
                  title="Recruiter Note"
                  value={recruiterNote}
                  onChange={setRecruiterNote}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function EditableBlock({
  title,
  value,
  onChange,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          rows={8}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </CardContent>
    </Card>
  );
}
