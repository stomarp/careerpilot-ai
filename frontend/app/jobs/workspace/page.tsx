"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Layers3,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Rocket,
  Sparkles,
  Target,
  Wand2,
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
import { Separator } from "@/components/ui/separator";

type WorkspaceTab =
  | "overview"
  | "match"
  | "optimizer"
  | "interview"
  | "roadmap"
  | "pipeline";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

type JobDetail = {
  job_id: number;
  title: string;
  company: string | null;
  description: string;
  created_at?: string;
};

type ResumeStrength = {
  category: string;
  evidence: string;
};

type ResumeGap = {
  category: string;
  severity: string;
  problem: string;
  suggestion: string;
  example_bullet: string;
};

type SuggestedBullet = {
  category: string;
  bullet: string;
  why_it_helps: string;
};

type KeywordDetails = {
  matched: string[];
  missing: string[];
  note: string;
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
  strengths: ResumeStrength[];
  resume_gaps: ResumeGap[];
  priority_actions: string[];
  suggested_bullets: SuggestedBullet[];
  keyword_details: KeywordDetails;
  recommendations: string[];
};

type AIResumeOptimizerResponse = {
  resume_id: number;
  job_id: number;
  industry: string;
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
  missing_keywords_to_add_truthfully: string[];
  project_enhancements: string[];
  certifications_or_learning: string[];
  final_warning: string;
};

type BackendInterviewResponse = {
  target_role: string;
  company_name: string | null;
  role_type: string;
  industry: string;
  experience_level: string;
  provider_used: string;
  fallback_used: boolean;
  question_sets: {
    category: string;
    why_this_category_matters: string;
    questions: {
      question: string;
      difficulty: string;
      source_style: string;
      practice_priority: string;
      what_interviewer_is_testing: string;
      answer_hint: string;
    }[];
  }[];
  company_prep: {
    area: string;
    guidance: string;
  }[];
  preparation_tips: string[];
  focus_areas: string[];
};

type LearningRoadmapResponse = {
  target_role: string;
  role_type: string;
  industry: string;
  experience_level: string;
  timeline_days: number;
  provider_used: string;
  fallback_used: boolean;
  overview: {
    summary: string;
    readiness_level: string;
    target_outcome: string;
  };
  skill_gap_summary: {
    category: string;
    priority: string;
    skills: string[];
    why_it_matters: string;
  }[];
  priority_skills: {
    skill: string;
    priority: string;
    reason: string;
  }[];
  weekly_plan: {
    week: number;
    theme: string;
    goals: string[];
    success_criteria: string[];
  }[];
  roadmap: {
    day: number;
    week: number;
    focus: string;
    tasks: string[];
    deliverable: string;
    estimated_time: string;
  }[];
  mini_projects: {
    title: string;
    difficulty: string;
    description: string;
    why_it_matters: string;
    skills_practiced: string[];
    implementation_steps: string[];
    resume_bullet_templates: string[];
  }[];
  resume_actions: string[];
  interview_prep_actions: string[];
  study_topics: string[];
  progress_checkpoints: {
    checkpoint_day: number;
    questions_to_answer: string[];
    expected_output: string;
  }[];
  final_advice: string[];
};

const workspaceTabs: {
  value: WorkspaceTab;
  label: string;
  description: string;
}[] = [
  {
    value: "overview",
    label: "Overview",
    description: "Role brief, next action, and workspace health",
  },
  {
    value: "match",
    label: "Resume Match",
    description: "ATS score, gaps, keywords, and bullets",
  },
  {
    value: "optimizer",
    label: "AI Optimizer",
    description: "AI resume rewrite guidance and truthful improvements",
  },
  {
    value: "interview",
    label: "Interview Prep",
    description: "Company-aware questions, prep tips, and focus areas",
  },
  {
    value: "roadmap",
    label: "Roadmap",
    description: "Learning plan, mini projects, and study strategy",
  },
  {
    value: "pipeline",
    label: "Pipeline",
    description: "Application strategy, follow-up, and next steps",
  },
];

const skillBank = [
  "python",
  "java",
  "javascript",
  "typescript",
  "fastapi",
  "spring boot",
  "node",
  "react",
  "next.js",
  "postgresql",
  "mysql",
  "sql",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "ci/cd",
  "github actions",
  "jenkins",
  "rest api",
  "graphql",
  "microservices",
  "distributed systems",
  "authentication",
  "authorization",
  "testing",
  "observability",
  "caching",
  "message queues",
  "data structures",
  "algorithms",
  "rag",
  "llm",
  "langchain",
  "vector database",
];

function getBadgeVariant(value: string | number | null | undefined): BadgeVariant {
  if (typeof value === "number") {
    if (value >= 80) return "default";
    if (value >= 65) return "secondary";
    return "destructive";
  }

  const normalized = String(value ?? "").toLowerCase();

  if (
    normalized.includes("high") ||
    normalized.includes("strong") ||
    normalized.includes("apply")
  ) {
    return "default";
  }

  if (
    normalized.includes("medium") ||
    normalized.includes("moderate") ||
    normalized.includes("tailor")
  ) {
    return "secondary";
  }

  if (
    normalized.includes("low") ||
    normalized.includes("weak") ||
    normalized.includes("critical") ||
    normalized.includes("build")
  ) {
    return "destructive";
  }

  return "outline";
}

function normalizeRoleType(title: string, description: string) {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("ai") || text.includes("llm") || text.includes("rag")) {
    return "ai_engineer";
  }

  if (text.includes("backend") || text.includes("api") || text.includes("server")) {
    return "backend_engineer";
  }

  if (text.includes("data analyst") || text.includes("analytics")) {
    return "data_analyst";
  }

  return "software_engineer";
}

function getJobInsights(job: JobDetail | null) {
  const content = `${job?.title ?? ""} ${job?.company ?? ""} ${
    job?.description ?? ""
  }`.toLowerCase();

  const detectedSkills = skillBank.filter((skill) => content.includes(skill));

  const seniority =
    content.includes("principal") || content.includes("staff")
      ? "Staff / Principal"
      : content.includes("senior") || content.includes("lead")
        ? "Senior"
        : content.includes("new grad") || content.includes("entry")
          ? "Entry level"
          : "Mid-level";

  const workType = content.includes("remote")
    ? "Remote"
    : content.includes("hybrid")
      ? "Hybrid"
      : content.includes("onsite") || content.includes("on-site")
        ? "On-site"
        : "Not specified";

  const signals = [
    {
      label: "Backend/API ownership",
      active:
        content.includes("backend") ||
        content.includes("api") ||
        content.includes("service"),
    },
    {
      label: "System design depth",
      active:
        content.includes("scalable") ||
        content.includes("distributed") ||
        content.includes("architecture"),
    },
    {
      label: "Production quality",
      active:
        content.includes("production") ||
        content.includes("reliability") ||
        content.includes("observability"),
    },
    {
      label: "Testing expectations",
      active:
        content.includes("test") ||
        content.includes("quality") ||
        content.includes("ci/cd"),
    },
    {
      label: "Cloud/deployment",
      active:
        content.includes("aws") ||
        content.includes("cloud") ||
        content.includes("docker") ||
        content.includes("kubernetes"),
    },
    {
      label: "AI/LLM relevance",
      active:
        content.includes("ai") ||
        content.includes("llm") ||
        content.includes("rag") ||
        content.includes("machine learning"),
    },
  ].filter((item) => item.active);

  const intelligenceScore = Math.min(
    100,
    Math.round(35 + Math.min(detectedSkills.length, 14) * 3.5 + signals.length * 4)
  );

  return {
    detectedSkills,
    seniority,
    workType,
    signals,
    intelligenceScore,
  };
}

function getDecision(score: number | null, missingCount: number) {
  if (score === null) {
    return {
      label: "Run workspace analysis",
      description:
        "Load a job and resume, then run the full workspace to get a job-specific strategy.",
      variant: "outline" as BadgeVariant,
    };
  }

  if (score >= 82 && missingCount <= 5) {
    return {
      label: "Apply now",
      description:
        "This is a strong match. Apply, then use the interview tab to prepare stories around your strongest evidence.",
      variant: "default" as BadgeVariant,
    };
  }

  if (score >= 68) {
    return {
      label: "Tailor first",
      description:
        "This is close. Improve the top resume gaps and add missing keywords truthfully before applying.",
      variant: "secondary" as BadgeVariant,
    };
  }

  return {
    label: "Build proof first",
    description:
      "This job has important gaps. Use the roadmap and mini projects to create real evidence before applying.",
    variant: "destructive" as BadgeVariant,
  };
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl border bg-muted/30 p-3">{icon}</div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>
    </div>
  );
}

export default function JobWorkspacePage() {
  const [jobId, setJobId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [industry, setIndustry] = useState("technology");
  const [job, setJob] = useState<JobDetail | null>(null);
  const [atsReport, setAtsReport] = useState<ATSScoreResponse | null>(null);
  const [optimizer, setOptimizer] = useState<AIResumeOptimizerResponse | null>(null);
  const [interview, setInterview] = useState<BackendInterviewResponse | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmapResponse | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const latestJobId = localStorage.getItem("careercopilot_latest_job_id") ?? "";
    const latestResumeId =
      localStorage.getItem("careercopilot_latest_resume_id") ??
      localStorage.getItem("careercopilot_resume_id") ??
      "";

    setJobId(latestJobId);
    setResumeId(latestResumeId);
  }, []);

  const jobInsights = useMemo(() => getJobInsights(job), [job]);
  const missingItems = useMemo(
    () =>
      uniqueStrings([
        ...(atsReport?.missing_skills ?? []),
        ...(atsReport?.missing_keywords ?? []),
        ...(optimizer?.missing_keywords_to_add_truthfully ?? []),
      ]).slice(0, 14),
    [atsReport, optimizer]
  );

  const focusAreas = useMemo(
    () =>
      uniqueStrings([
        ...(atsReport?.missing_skills ?? []),
        ...jobInsights.detectedSkills,
        "DSA",
        "System Design",
        "Projects",
        "Interview Prep",
      ]).slice(0, 10),
    [atsReport, jobInsights.detectedSkills]
  );

  const decision = getDecision(
    atsReport?.ats_score ?? null,
    atsReport?.missing_skills.length ?? 0
  );

  const workspaceHealth = [
    {
      label: "Job loaded",
      complete: Boolean(job),
      description: job ? `${job.title} ${job.company ? `at ${job.company}` : ""}` : "Load a job",
    },
    {
      label: "ATS match",
      complete: Boolean(atsReport),
      description: atsReport ? `${atsReport.ats_score}% ${atsReport.match_level}` : "Run analysis",
    },
    {
      label: "AI optimizer",
      complete: Boolean(optimizer),
      description: optimizer
        ? `${optimizer.provider_used}${optimizer.fallback_used ? " fallback" : ""}`
        : "Generate optimizer",
    },
    {
      label: "Interview prep",
      complete: Boolean(interview),
      description: interview
        ? `${interview.question_sets.length} question sets`
        : "Generate interview plan",
    },
    {
      label: "Roadmap",
      complete: Boolean(roadmap),
      description: roadmap ? `${roadmap.weekly_plan.length} weeks` : "Generate roadmap",
    },
  ];

  async function loadJobById() {
    if (!jobId.trim()) {
      setError("Enter a job ID first.");
      return null;
    }

    setLoading("job");
    setError("");

    try {
      const response = await api.get<JobDetail>(`/jobs/${jobId.trim()}`);
      setJob(response.data);
      localStorage.setItem("careercopilot_latest_job_id", String(response.data.job_id));
      return response.data;
    } catch (err) {
      console.error(err);
      setError("Could not load this job. Check the job ID, login, and backend.");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function runAtsMatch(activeJob = job) {
    if (!resumeId.trim()) {
      setError("Enter a resume ID to run ATS match.");
      return null;
    }

    const currentJob = activeJob ?? job;
    if (!currentJob) {
      setError("Load a job before running ATS match.");
      return null;
    }

    setLoading("ats");
    setError("");

    try {
      localStorage.setItem("careercopilot_latest_resume_id", resumeId.trim());

      const response = await api.post<ATSScoreResponse>("/analysis/ats-score", {
        resume_id: Number(resumeId),
        job_id: currentJob.job_id,
        industry,
      });

      setAtsReport(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      setError("ATS analysis failed. Check resume ID, job ID, login, and backend.");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function runAiOptimizer(activeJob = job) {
    const currentJob = activeJob ?? job;

    if (!resumeId.trim() || !currentJob) {
      setError("Load a job and enter resume ID before running AI optimizer.");
      return null;
    }

    setLoading("optimizer");
    setError("");

    try {
      const response = await api.post<AIResumeOptimizerResponse>(
        "/analysis/ai-resume-optimizer",
        {
          resume_id: Number(resumeId),
          job_id: currentJob.job_id,
          industry,
        }
      );

      setOptimizer(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      setError("AI resume optimizer failed, but the workspace can still continue. Check backend logs for /analysis/ai-resume-optimizer.");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function generateInterview(activeJob = job, activeAts = atsReport) {
    const currentJob = activeJob ?? job;

    if (!currentJob) {
      setError("Load a job before generating interview prep.");
      return null;
    }

    setLoading("interview");
    setError("");

    try {
      const response = await api.post<BackendInterviewResponse>(
        "/interview/questions",
        {
          target_role: currentJob.title,
          company_name: currentJob.company,
          role_type: normalizeRoleType(currentJob.title, currentJob.description),
          industry,
          experience_level: "entry_level",
          question_count: 12,
          question_style: "company_and_role_pattern",
          include_company_prep: true,
          include_platform_patterns: true,
          difficulty: "company_ready",
          job_description_text: currentJob.description,
          resume_context: activeAts?.summary ?? "",
          focus_areas: uniqueStrings([
            ...(activeAts?.missing_skills ?? []),
            ...jobInsights.detectedSkills,
          ]).slice(0, 8),
        }
      );

      setInterview(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      setError("AI interview generation failed. You can still use ATS match and roadmap. Check backend logs for /interview/questions.");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function generateRoadmap(
    activeJob = job,
    activeAts = atsReport,
    activeOptimizer = optimizer
  ) {
    const currentJob = activeJob ?? job;

    if (!currentJob) {
      setError("Load a job before generating roadmap.");
      return null;
    }

    setLoading("roadmap");
    setError("");

    const gaps = uniqueStrings([
      ...(activeAts?.missing_skills ?? []),
      ...(activeAts?.missing_keywords ?? []),
      ...(activeOptimizer?.missing_keywords_to_add_truthfully ?? []),
      ...jobInsights.detectedSkills.slice(0, 5),
    ]).slice(0, 14);

    try {
      const response = await api.post<LearningRoadmapResponse>(
        "/learning-roadmap",
        {
          target_role: currentJob.title,
          role_type: normalizeRoleType(currentJob.title, currentJob.description),
          industry,
          experience_level: "entry_level",
          timeline_days: 56,
          weekly_hours: 12,
          focus_areas: uniqueStrings([
            ...gaps,
            "DSA",
            "System Design",
            "Projects",
            "Interview Prep",
          ]).slice(0, 12),
          goal_notes: `Create a job-specific preparation plan for ${currentJob.title}${
            currentJob.company ? ` at ${currentJob.company}` : ""
          }. Use this job description and existing resume analysis to prioritize truthful project proof, resume improvements, and interview readiness.`,
          missing_items: gaps,
        }
      );

      setRoadmap(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
      setError("AI roadmap generation failed. Check backend logs for /learning-roadmap.");
      return null;
    } finally {
      setLoading(null);
    }
  }

  async function runFullWorkspace() {
    setError("");
    setLoading("workspace");

    let activeJob = job;
    let activeAts: ATSScoreResponse | null = atsReport;
    let activeOptimizer: AIResumeOptimizerResponse | null = optimizer;

    try {
      if (!activeJob) {
        activeJob = await loadJobById();
      }

      if (!activeJob) {
        setError("Load a job first, then run the workspace.");
        return;
      }

      if (!resumeId.trim()) {
        setError("Enter a resume ID before running the workspace.");
        return;
      }

      activeAts = await runAtsMatch(activeJob);

      try {
        activeOptimizer = await runAiOptimizer(activeJob);
      } catch (optimizerError) {
        console.error("Optimizer step failed but workspace will continue:", optimizerError);
      }

      try {
        await generateInterview(activeJob, activeAts ?? undefined);
      } catch (interviewError) {
        console.error("Interview step failed but workspace will continue:", interviewError);
      }

      try {
        await generateRoadmap(
          activeJob,
          activeAts ?? undefined,
          activeOptimizer ?? undefined
        );
      } catch (roadmapError) {
        console.error("Roadmap step failed:", roadmapError);
      }

      setActiveTab("overview");
    } finally {
      setLoading(null);
    }
  }

  const isBusy = Boolean(loading);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border bg-gradient-to-br from-background via-background to-muted/40 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                Job Command Center
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight">
                One workspace for each job application
              </h1>
              <p className="mt-2 max-w-3xl text-muted-foreground">
                Load a saved job and connect the whole workflow: ATS match, AI resume
                optimizer, interview prep, roadmap, and application strategy.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/jobs">Save Job</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/analysis">Analysis</Link>
              </Button>
              <Button asChild>
                <Link href="/applications">
                  Application Tracker
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-primary/20">
            <CardHeader>
              <SectionHeader
                icon={<BriefcaseBusiness className="h-5 w-5" />}
                title="Workspace setup"
                description="Use the latest saved job ID and resume ID, or enter them manually."
              />
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Job ID</Label>
                  <Input
                    value={jobId}
                    onChange={(event) => setJobId(event.target.value)}
                    placeholder="Latest job ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Resume ID</Label>
                  <Input
                    value={resumeId}
                    onChange={(event) => setResumeId(event.target.value)}
                    placeholder="Resume ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    value={industry}
                    onChange={(event) => setIndustry(event.target.value)}
                    placeholder="technology"
                  />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={loadJobById}
                  disabled={isBusy}
                >
                  {loading === "job" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileSearch className="mr-2 h-4 w-4" />
                  )}
                  Load job
                </Button>

                <Button
                  onClick={runFullWorkspace}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isBusy ? "Running workspace..." : "Run full AI workspace"}
                </Button>
              </div>

              <Separator />

              <div className="rounded-2xl border bg-muted/20 p-4">
                <p className="font-medium">How to use this workspace</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Enter Job ID and Resume ID, then click <span className="font-medium text-foreground">Run full AI workspace</span>.
                  It will run ATS match, AI resume optimizer, interview prep, and roadmap generation in one flow.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {workspaceHealth.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-3 rounded-2xl border bg-muted/20 p-3"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Badge variant={item.complete ? "default" : "outline"}>
                      {item.complete ? "Ready" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Badge variant={getBadgeVariant(atsReport?.ats_score ?? null)}>
                    {decision.label}
                  </Badge>
                  <CardTitle className="mt-3 text-2xl">
                    {job?.title ?? "No job loaded yet"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {job?.company ?? "Load a saved job to start the command center"}
                  </CardDescription>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">ATS</p>
                    <p className="mt-1 text-2xl font-bold">
                      {atsReport ? `${atsReport.ats_score}%` : "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">Skills</p>
                    <p className="mt-1 text-2xl font-bold">
                      {jobInsights.detectedSkills.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">Gaps</p>
                    <p className="mt-1 text-2xl font-bold">{missingItems.length}</p>
                  </div>

                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs text-muted-foreground">Weeks</p>
                    <p className="mt-1 text-2xl font-bold">
                      {roadmap?.weekly_plan.length ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="rounded-2xl border bg-muted/20 p-5">
                <div className="flex gap-3">
                  <Target className="mt-1 h-5 w-5 shrink-0" />
                  <p className="text-sm leading-7 text-muted-foreground">
                    {decision.description}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Seniority</p>
                  <p className="mt-2 font-semibold">{jobInsights.seniority}</p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Work type</p>
                  <p className="mt-2 font-semibold">{jobInsights.workType}</p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Job intelligence</p>
                  <p className="mt-2 font-semibold">{jobInsights.intelligenceScore}%</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {jobInsights.detectedSkills.slice(0, 12).map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
                {!jobInsights.detectedSkills.length ? (
                  <span className="text-sm text-muted-foreground">
                    Skills appear after loading a saved job.
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              {workspaceTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    activeTab === tab.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-background hover:bg-muted/40"
                  }`}
                >
                  <p className="font-medium">{tab.label}</p>
                  <p
                    className={`mt-1 text-xs leading-5 ${
                      activeTab === tab.value
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {activeTab === "overview" ? (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.9fr]">
            <Card>
              <CardHeader>
                <SectionHeader
                  icon={<ClipboardList className="h-5 w-5" />}
                  title="Job brief"
                  description="Role intelligence extracted from the saved job description."
                />
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="font-medium">Job description preview</p>
                  <p className="mt-2 line-clamp-6 text-sm leading-7 text-muted-foreground">
                    {job?.description ??
                      "Load a job to see the saved description and role-specific analysis."}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {jobInsights.signals.map((signal) => (
                    <div
                      key={signal.label}
                      className="flex items-center gap-3 rounded-2xl border bg-muted/20 p-4"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <p className="text-sm font-medium">{signal.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionHeader
                  icon={<Layers3 className="h-5 w-5" />}
                  title="Workspace action plan"
                  description="What the candidate should do next for this job."
                />
              </CardHeader>

              <CardContent className="space-y-3">
                {[
                  {
                    title: "1. Confirm resume match",
                    body: atsReport
                      ? `ATS score is ${atsReport.ats_score}%. Focus on ${missingItems
                          .slice(0, 3)
                          .join(", ") || "final polish"}.`
                      : "Run ATS match to identify gaps and matching proof.",
                  },
                  {
                    title: "2. Improve resume truthfully",
                    body: optimizer
                      ? optimizer.ai_overall_feedback
                      : "Generate AI optimizer suggestions before applying.",
                  },
                  {
                    title: "3. Prepare interview stories",
                    body: interview
                      ? `Practice ${interview.question_sets.length} question categories for this role.`
                      : "Generate company-aware interview questions.",
                  },
                  {
                    title: "4. Build missing proof",
                    body: roadmap
                      ? roadmap.overview.target_outcome
                      : "Generate a roadmap to convert gaps into projects and proof.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border bg-muted/20 p-4">
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "match" ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => runAtsMatch()} disabled={isBusy || !job}>
                {loading === "ats" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="mr-2 h-4 w-4" />
                )}
                Run ATS match
              </Button>
              <Button variant="outline" asChild>
                <Link href="/analysis">Open Analysis Page</Link>
              </Button>
            </div>

            {atsReport ? (
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-4xl">{atsReport.ats_score}%</CardTitle>
                    <CardDescription>{atsReport.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getBadgeVariant(atsReport.match_level)}>
                      {atsReport.match_level}
                    </Badge>

                    <div className="mt-5 space-y-3">
                      {Object.entries(atsReport.breakdown).map(([key, value]) => (
                        <div key={key}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="capitalize text-muted-foreground">
                              {key.replaceAll("_", " ")}
                            </span>
                            <span className="font-medium">{value}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Matched and missing skills</CardTitle>
                      <CardDescription>
                        The fastest way to decide what to tailor.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 font-medium">Matched</p>
                        <div className="flex flex-wrap gap-2">
                          {atsReport.matching_skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 font-medium">Missing</p>
                        <div className="flex flex-wrap gap-2">
                          {atsReport.missing_skills.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Priority actions</CardTitle>
                      <CardDescription>
                        What to change before applying.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {atsReport.priority_actions.map((action) => (
                        <div
                          key={action}
                          className="rounded-xl border bg-muted/20 p-3 text-sm"
                        >
                          {action}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="font-medium">No ATS match yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter a resume ID and run ATS match for this job.
                  </p>
                </CardContent>
              </Card>
            )}

            {atsReport?.suggested_bullets?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Suggested resume bullets</CardTitle>
                  <CardDescription>
                    Tailoring ideas based on gaps and job requirements.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {atsReport.suggested_bullets.map((bullet) => (
                    <div key={bullet.bullet} className="rounded-2xl border bg-muted/20 p-4">
                      <Badge variant="secondary">{bullet.category}</Badge>
                      <p className="mt-3 text-sm leading-6">{bullet.bullet}</p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {bullet.why_it_helps}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

        {activeTab === "optimizer" ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => runAiOptimizer()} disabled={isBusy || !job}>
                {loading === "optimizer" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate AI optimizer
              </Button>
              <Button variant="outline" asChild>
                <Link href="/reports">Open Reports</Link>
              </Button>
            </div>

            {optimizer ? (
              <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card>
                  <CardHeader>
                    <Badge variant="secondary">
                      {optimizer.provider_used}
                      {optimizer.fallback_used ? " fallback" : " AI response"}
                    </Badge>
                    <CardTitle className="mt-3">AI resume strategy</CardTitle>
                    <CardDescription>
                      Score after optimization analysis: {optimizer.ats_score}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {optimizer.ai_overall_feedback}
                    </p>

                    <div className="mt-5 rounded-2xl border bg-muted/20 p-4">
                      <p className="font-medium">Truthfulness warning</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {optimizer.final_warning}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Section feedback</CardTitle>
                    <CardDescription>
                      Resume areas to improve first.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {optimizer.section_feedback.map((item) => (
                      <div
                        key={`${item.section}-${item.feedback}`}
                        className="rounded-2xl border bg-muted/20 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{item.section}</p>
                          <Badge variant={getBadgeVariant(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {item.feedback}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="font-medium">No AI optimizer output yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Generate resume optimization guidance for this exact job.
                  </p>
                </CardContent>
              </Card>
            )}

            {optimizer?.improved_bullets?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Improved bullets</CardTitle>
                  <CardDescription>
                    Copy-ready ideas to rewrite resume evidence truthfully.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {optimizer.improved_bullets.map((item) => (
                    <div
                      key={`${item.original_or_gap}-${item.improved_bullet}`}
                      className="rounded-2xl border bg-muted/20 p-4"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        Gap: {item.original_or_gap}
                      </p>
                      <p className="mt-3 text-sm leading-6">{item.improved_bullet}</p>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {item.why_better}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

        {activeTab === "interview" ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => generateInterview()} disabled={isBusy || !job}>
                {loading === "interview" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquareText className="mr-2 h-4 w-4" />
                )}
                Generate interview prep
              </Button>
              <Button variant="outline" asChild>
                <Link href="/interview-prep">Open Interview Prep</Link>
              </Button>
            </div>

            {interview ? (
              <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card>
                  <CardHeader>
                    <Badge variant="secondary">
                      {interview.provider_used}
                      {interview.fallback_used ? " fallback" : " AI response"}
                    </Badge>
                    <CardTitle className="mt-3">Company prep</CardTitle>
                    <CardDescription>
                      For {interview.target_role}
                      {interview.company_name ? ` at ${interview.company_name}` : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {interview.company_prep.map((item) => (
                      <div key={item.area} className="rounded-2xl border bg-muted/20 p-4">
                        <p className="font-medium">{item.area}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.guidance}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Preparation tips</CardTitle>
                    <CardDescription>
                      What to practice before submitting or interviewing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {interview.preparation_tips.map((tip, index) => (
                      <div key={tip} className="flex gap-3 rounded-xl border bg-muted/20 p-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <p className="text-sm leading-6 text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="font-medium">Interview prep not generated yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click Generate interview prep or Run full AI workspace to create company-aware practice questions.
                  </p>
                </CardContent>
              </Card>
            )}

            {interview?.question_sets?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Interview question sets</CardTitle>
                  <CardDescription>
                    Role-specific practice questions generated from the job workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {interview.question_sets.map((set) => (
                    <div key={set.category} className="rounded-2xl border bg-muted/20 p-4">
                      <h3 className="font-semibold">{set.category}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {set.why_this_category_matters}
                      </p>
                      <div className="mt-4 space-y-3">
                        {set.questions.slice(0, 3).map((question) => (
                          <div
                            key={question.question}
                            className="rounded-xl border bg-background p-3"
                          >
                            <p className="text-sm font-medium">{question.question}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {question.answer_hint}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

        {activeTab === "roadmap" ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => generateRoadmap()} disabled={isBusy || !job}>
                {loading === "roadmap" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="mr-2 h-4 w-4" />
                )}
                Generate roadmap
              </Button>
              <Button variant="outline" asChild>
                <Link href="/roadmap">Open Roadmap</Link>
              </Button>
            </div>

            {roadmap ? (
              <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card>
                  <CardHeader>
                    <Badge variant="secondary">
                      {roadmap.provider_used}
                      {roadmap.fallback_used ? " fallback" : " AI response"}
                    </Badge>
                    <CardTitle className="mt-3">Roadmap overview</CardTitle>
                    <CardDescription>
                      {roadmap.timeline_days} days for {roadmap.target_role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-7 text-muted-foreground">
                      {roadmap.overview.summary}
                    </p>
                    <div className="rounded-2xl border bg-muted/20 p-4">
                      <p className="font-medium">Target outcome</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {roadmap.overview.target_outcome}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly plan</CardTitle>
                    <CardDescription>
                      Compact version of the job-specific learning plan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {roadmap.weekly_plan.slice(0, 8).map((week) => (
                      <div key={week.week} className="rounded-2xl border bg-muted/20 p-4">
                        <Badge variant="secondary">Week {week.week}</Badge>
                        <p className="mt-3 font-medium">{week.theme}</p>
                        <div className="mt-2 space-y-1">
                          {week.goals.slice(0, 3).map((goal) => (
                            <p key={goal} className="text-sm text-muted-foreground">
                              • {goal}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="font-medium">Roadmap not generated yet.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click Generate roadmap or Run full AI workspace to turn job gaps into a learning plan.
                  </p>
                </CardContent>
              </Card>
            )}

            {roadmap?.mini_projects?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Mini projects to build proof</CardTitle>
                  <CardDescription>
                    Convert missing skills into portfolio evidence.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {roadmap.mini_projects.map((project) => (
                    <div key={project.title} className="rounded-2xl border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{project.title}</h3>
                        <Badge variant="outline">{project.difficulty}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {project.description}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        {project.why_it_matters}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

        {activeTab === "pipeline" ? (
          <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <SectionHeader
                  icon={<Rocket className="h-5 w-5" />}
                  title="Application strategy"
                  description="Use this to decide when to apply and what to do next."
                />
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{decision.label}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {decision.description}
                      </p>
                    </div>
                    <Badge variant={decision.variant}>Decision</Badge>
                  </div>
                </div>

                {[
                  "Update resume bullets using the optimizer tab.",
                  "Practice interview stories using the interview tab.",
                  "Add missing proof from the roadmap tab.",
                  "Move this role into the application tracker with a next follow-up date.",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl border bg-muted/20 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionHeader
                  icon={<MessageSquareText className="h-5 w-5" />}
                  title="Copy-ready recruiter note"
                  description="A draft you can adapt after tailoring the resume."
                />
              </CardHeader>

              <CardContent>
                <div className="rounded-2xl border bg-muted/20 p-5">
                  <p className="text-sm leading-7 text-muted-foreground">
                    Hi, I’m interested in the {job?.title ?? "role"}
                    {job?.company ? ` at ${job.company}` : ""}. My background includes
                    backend development with FastAPI, PostgreSQL, Docker, REST APIs,
                    and AI-powered workflow projects. I recently built CareerCopilot AI,
                    a full-stack job-search platform with resume analysis, job parsing,
                    AI interview preparation, and learning roadmap generation. I’d love
                    to be considered for this opportunity.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/applications">
                      Open Application Tracker
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/reports">Review Reports</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {roadmap?.resume_actions?.length || roadmap?.interview_prep_actions?.length ? (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Final preparation checklist</CardTitle>
                  <CardDescription>
                    Generated actions from roadmap and interview workflow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {[...(roadmap?.resume_actions ?? []), ...(roadmap?.interview_prep_actions ?? [])]
                    .slice(0, 10)
                    .map((item) => (
                      <div key={item} className="rounded-xl border bg-muted/20 p-3 text-sm">
                        {item}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

      </div>
    </AppShell>
  );
}
