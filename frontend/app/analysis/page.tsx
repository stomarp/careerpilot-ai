"use client";

import Link from "next/link";

function CareerWorkflowBar({ activeStep }: { activeStep: "jobs" | "analysis" | "applications" }) {
  const steps = [
    {
      id: "jobs",
      title: "1. Save job",
      description: "Paste a job description and extract role requirements.",
      href: "/jobs",
    },
    {
      id: "analysis",
      title: "2. Analyze fit",
      description: "Compare resume against the job and find missing proof.",
      href: "/analysis",
    },
    {
      id: "applications",
      title: "3. Track pipeline",
      description: "Save status, follow-ups, notes, and next actions.",
      href: "/applications",
    },
  ];

  return (
    <div className="mb-8 cc-workflow-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            CareerCopilot workflow
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Turn a job post into a tracked application
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            Save the job, analyze your resume fit, then move it into your application tracker.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((step) => {
          const isActive = step.id === activeStep;

          return (
            <a
              key={step.id}
              href={step.href}
              className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "bg-background"
              }`}
            >
              <p className="text-sm font-semibold">{step.title}</p>
              <p
                className={`mt-1 text-xs leading-5 ${
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {step.description}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}


import {
  FormEvent,
  useEffect,
  useState } from "react";import {  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Lightbulb,
  Loader2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Wrench,
  Download
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

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

function getSeverityVariant(severity: string): BadgeVariant {
  const normalizedSeverity = severity.toLowerCase();

  if (normalizedSeverity === "high") {
    return "destructive";
  }

  if (normalizedSeverity === "medium") {
    return "secondary";
  }

  return "outline";
}

function getApplyDecision(score: number, highPriorityGapCount: number) {
  if (score >= 85 && highPriorityGapCount === 0) {
    return {
      label: "Apply now",
      description:
        "Your resume is already strongly aligned. Apply now, then prepare interview stories around your strongest backend projects.",
      variant: "default" as BadgeVariant,
    };
  }

  if (score >= 70) {
    return {
      label: "Tailor first, then apply",
      description:
        "You are close enough for this role, but tailoring your backend project bullets around the main gaps will make the application stronger.",
      variant: "secondary" as BadgeVariant,
    };
  }

  return {
    label: "Build first, then apply",
    description:
      "This role has several important gaps. Build or document one strong project improvement before applying.",
      variant: "destructive" as BadgeVariant,
    };
}

function getInterviewRisks(gaps: ResumeGap[]) {
  const risks: string[] = [];

  for (const gap of gaps) {
    if (gap.category === "Caching & backend performance") {
      risks.push(
        "Be ready to explain how you would improve API performance using caching, indexing, pagination, or query optimization."
      );
    }

    if (gap.category === "Distributed systems evidence") {
      risks.push(
        "Be ready for questions about queues, retries, background jobs, idempotency, rate limiting, and fault tolerance."
      );
    }

    if (gap.category === "Cloud deployment proof") {
      risks.push(
        "Be ready to explain how your backend runs outside local development: Docker, environment variables, CI/CD, health checks, or cloud deployment."
      );
    }

    if (gap.category === "Security and authentication") {
      risks.push(
        "Be ready to explain authentication, authorization, protected routes, and how user-specific data is isolated."
      );
    }

    if (gap.category === "Measurable impact") {
      risks.push(
        "Be ready to quantify one project improvement, such as response time, records processed, test coverage, or reduced manual work."
      );
    }
  }

  return risks.slice(0, 5);
}

function getBuildToFixPlan(gaps: ResumeGap[]) {
  const plan: { title: string; action: string; outcome: string }[] = [];

  for (const gap of gaps) {
    if (gap.category === "Caching & backend performance") {
      plan.push({
        title: "Add backend performance proof",
        action:
          "Add Redis caching, PostgreSQL indexing, pagination, or response-time measurement to CareerCopilot or Logsmith.",
        outcome:
          "This gives you a truthful bullet for caching, performance optimization, and backend scalability.",
      });
    }

    if (gap.category === "Distributed systems evidence") {
      plan.push({
        title: "Add distributed-system behavior",
        action:
          "Build a background job flow, retry mechanism, queue-based workflow, or rate limiter in one project.",
        outcome:
          "This helps you answer system-design and backend reliability questions with real project evidence.",
      });
    }

    if (gap.category === "Cloud deployment proof") {
      plan.push({
        title: "Make deployment evidence concrete",
        action:
          "Document Docker Compose, health checks, environment variables, CI/CD, or cloud deployment steps.",
        outcome:
          "This turns vague cloud/devops keywords into production-readiness proof.",
      });
    }

    if (gap.category === "Security and authentication") {
      plan.push({
        title: "Highlight secure user-specific backend behavior",
        action:
          "Show JWT auth, protected routes, validation, and user-owned data access in your project bullets.",
        outcome:
          "This proves you can build safer backend APIs, not just CRUD endpoints.",
      });
    }
  }

  return plan.slice(0, 4);
}

function ScoreCard({ score, label }: { score: number; label: string }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardDescription>Overall match</CardDescription>
        <CardTitle className="text-2xl">{label}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/40 p-8 text-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-8 border-primary/20 bg-background">
            <div>
              <p className="text-5xl font-bold">{score}</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            This score combines skill match, role-signal relevance, experience
            evidence, formatting, and measurable impact.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="cc-product-card-static">
      <CardHeader>
        <CardTitle>No analysis yet</CardTitle>
        <CardDescription>
          Upload a resume, create a job description, then run ATS analysis.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground">
          Your results will appear here with a detailed report and an
          assistant-style fit summary.
        </div>
      </CardContent>
    </Card>
  );
}

function AssistantView({ result }: { result: ATSScoreResponse }) {
  const highPriorityGapCount = result.resume_gaps.filter(
    (gap) => gap.severity.toLowerCase() === "high"
  ).length;

  const applyDecision = getApplyDecision(result.ats_score, highPriorityGapCount);
  const interviewRisks = getInterviewRisks(result.resume_gaps);
  const buildPlan = getBuildToFixPlan(result.resume_gaps);

  return (
    <div className="cc-product-page space-y-6">
      <Card className="cc-product-card-static border-primary/20">
        <CardHeader>
          <Badge className="mb-2 w-fit" variant={applyDecision.variant}>
            {applyDecision.label}
          </Badge>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-5 w-5" />
            Am I a good fit?
          </CardTitle>
          <CardDescription>
            A practical read on fit, risk, and what to improve before applying.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="rounded-2xl border bg-muted/30 p-5 text-sm leading-6">
            {result.summary}
          </p>

          <div className="rounded-2xl border bg-background p-5">
            <p className="mb-2 font-medium">Apply decision</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {applyDecision.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="cc-product-card-static">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Where you’re already strong
            </CardTitle>
            <CardDescription>
              These are the resume signals that already map well to this role.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {result.strengths.map((strength, index) => (
                <div
                  key={`${strength.category}-${index}`}
                  className="rounded-xl border bg-background p-4"
                >
                  <p className="mb-1 font-medium">{strength.category}</p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {strength.evidence}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="cc-product-card-static">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              What to watch out for
            </CardTitle>
            <CardDescription>
              These are the areas that may come up in screening or interviews.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {result.resume_gaps.slice(0, 5).map((gap, index) => (
                <div
                  key={`${gap.category}-${index}`}
                  className="rounded-xl border bg-background p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-medium">{gap.category}</p>
                    <Badge variant={getSeverityVariant(gap.severity)}>
                      {gap.severity}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {gap.problem}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="cc-product-card-static">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Build-to-fix plan
          </CardTitle>
          <CardDescription>
            Turn resume gaps into real project improvements you can truthfully show.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {buildPlan.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {buildPlan.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border bg-background p-5"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="font-semibold">{item.title}</p>
                  </div>

                  <p className="mb-3 text-sm leading-6 text-muted-foreground">
                    {item.action}
                  </p>

                  <div className="rounded-xl bg-muted/40 p-4 text-sm leading-6">
                    <span className="font-medium">Outcome:</span> {item.outcome}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
              No major build-to-fix actions detected. Focus on polishing project
              impact and measurable results.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="cc-product-card-static">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Best resume bullets after you build the proof
            </CardTitle>
            <CardDescription>
              Use these only after the work is truthful and interview-ready.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {result.suggested_bullets.slice(0, 3).map((bullet, index) => (
                <div
                  key={`${bullet.category}-${index}`}
                  className="rounded-xl border bg-background p-4"
                >
                  <Badge variant="secondary" className="mb-3">
                    {bullet.category}
                  </Badge>
                  <p className="text-sm leading-6">{bullet.bullet}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="cc-product-card-static">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Interview risks
            </CardTitle>
            <CardDescription>
              Likely questions based on the gaps in this match.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {interviewRisks.length > 0 ? (
              <div className="space-y-3">
                {interviewRisks.map((risk, index) => (
                  <div
                    key={`${risk}-${index}`}
                    className="flex gap-3 rounded-xl border bg-muted/30 p-4 text-sm"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold">
                      {index + 1}
                    </div>
                    <p className="leading-6">{risk}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
                No major interview risks detected from this analysis.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="cc-product-card-static">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Role signals
          </CardTitle>
          <CardDescription>
            Cleaned signals from the job description and your resume.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium">Strongest matched role signals</p>
            <div className="flex flex-wrap gap-2">
              {result.keyword_details.matched.slice(0, 12).map((signal) => (
                <Badge key={signal}>{signal}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-3 text-sm font-medium">Highest-priority role signals to improve</p>
            <div className="flex flex-wrap gap-2">
              {result.keyword_details.missing.slice(0, 8).map((signal) => (
                <Badge key={signal} variant="secondary">
                  {signal}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportView({ result }: { result: ATSScoreResponse }) {
  return (
    <div className="cc-product-page space-y-6">
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <ScoreCard score={result.ats_score} label={result.match_level} />

        <Card className="cc-product-card-static">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Executive summary
            </CardTitle>
            <CardDescription>
              What this result means for your resume.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="rounded-xl border bg-muted/30 p-4 text-sm leading-6">
              {result.summary}
            </p>

            <div>
              <p className="mb-3 text-sm font-medium">Score breakdown</p>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(result.breakdown).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm"
                  >
                    <span className="capitalize text-muted-foreground">
                      {key.replaceAll("_", " ")}
                    </span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="cc-product-card-static">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Top resume gaps
          </CardTitle>
          <CardDescription>
            These are the main problems to fix before applying.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {result.resume_gaps.map((gap, index) => (
              <div
                key={`${gap.category}-${index}`}
                className="rounded-2xl border bg-background p-5"
              >
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold">{gap.category}</h3>
                  </div>

                  <Badge variant={getSeverityVariant(gap.severity)}>
                    {gap.severity} priority
                  </Badge>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm font-medium">Problem</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {gap.problem}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-medium">Suggestion</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {gap.suggestion}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <p className="mb-2 text-sm font-medium">
                    Example bullet after you actually build or verify it
                  </p>
                  <div className="rounded-xl bg-muted/40 p-4 text-sm leading-6">
                    {gap.example_bullet}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="cc-product-card-static">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Priority actions
            </CardTitle>
            <CardDescription>
              What to do next to improve this resume match.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {result.priority_actions.map((action, index) => (
                <div
                  key={`${action}-${index}`}
                  className="flex gap-3 rounded-xl border bg-muted/30 p-4 text-sm"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold">
                    {index + 1}
                  </div>
                  <p className="leading-6">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="cc-product-card-static">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Strengths
            </CardTitle>
            <CardDescription>
              Areas where your resume already aligns with the job.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {result.strengths.map((strength, index) => (
                <div
                  key={`${strength.category}-${index}`}
                  className="rounded-xl border bg-background p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="font-medium">{strength.category}</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {strength.evidence}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="cc-product-card-static">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Suggested resume bullets
          </CardTitle>
          <CardDescription>
            Use these only after the work is truthful, built, or measurable.
            Do not copy bullets for skills you cannot explain.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {result.suggested_bullets.map((bullet, index) => (
              <div
                key={`${bullet.category}-${index}`}
                className="rounded-2xl border bg-background p-5"
              >
                <Badge variant="secondary" className="mb-3">
                  {bullet.category}
                </Badge>

                <p className="rounded-xl bg-muted/40 p-4 text-sm leading-6">
                  {bullet.bullet}
                </p>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    Why it helps:
                  </span>{" "}
                  {bullet.why_it_helps}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalysisPage() {
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [industry, setIndustry] = useState("technology");
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadMessage, setResumeUploadMessage] = useState("");

  useEffect(() => {
    const syncLatestAnalysisIds = () => {
      const latestResumeId =
        localStorage.getItem("latestResumeId") ||
        localStorage.getItem("latestUploadedResumeId") ||
        localStorage.getItem("resumeId");

      const latestJobId =
        localStorage.getItem("latestJobDescriptionId") ||
        localStorage.getItem("latestJobId") ||
        localStorage.getItem("jobDescriptionId");

      if (latestResumeId) {
        setResumeId(latestResumeId);
      }

      if (latestJobId) {
        setJobId(latestJobId);
      }
    };

    syncLatestAnalysisIds();
  }, []);

  const [result, setResult] = useState<ATSScoreResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const latestResumeId = localStorage.getItem("careercopilot_latest_resume_id");
    const latestJobId = localStorage.getItem("careercopilot_latest_job_id");

    if (latestResumeId) {
      setResumeId(latestResumeId);
    }

    if (latestJobId) {
      setJobId(latestJobId);
    }
  }, []);

  async function handleResumeUpload() {
    if (!selectedResumeFile) {
      setResumeUploadMessage("Choose a PDF resume first.");
      return;
    }

    setIsUploadingResume(true);
    setResumeUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedResumeFile);

      const response = await api.post("/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const newResumeId =
        response.data.resume_id ?? response.data.id ?? response.data.resumeId;

      if (newResumeId) {
        setResumeId(String(newResumeId));
        localStorage.setItem("latestResumeId", String(newResumeId));
        localStorage.setItem("latestUploadedResumeId", String(newResumeId));
        setResumeUploadMessage(
          `Resume uploaded successfully. Resume ID ${newResumeId} is ready for analysis.`
        );
      } else {
        setResumeUploadMessage("Resume uploaded, but no resume ID was returned.");
      }
    } catch {
      setResumeUploadMessage(
        "Resume upload failed. Make sure the backend is running and the file is a PDF."
      );
    } finally {
      setIsUploadingResume(false);
    }
  }

  async function handleRunAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post<ATSScoreResponse>("/analysis/ats-score", {
        resume_id: Number(resumeId),
        job_id: Number(jobId),
        industry,
      });

      setResult(response.data);
    } catch {
      setError(
        "Analysis failed. Check that the resume ID and job ID belong to your logged-in account."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

    const analysisReady =
    resumeId.trim().length > 0 && jobId.trim().length > 0;

return (
    <AppShell>
        <div className="mb-6 flex justify-end">
          <Button variant="outline" asChild className="cc-cta-secondary">
            <Link href="/export-center?type=analysis">
              <Download className="mr-2 h-4 w-4" />
              Export analysis
            </Link>
          </Button>
        </div>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Step 3
          </Badge>
          <CareerWorkflowBar activeStep="analysis" />
<h1 className="cc-gradient-title text-3xl font-black tracking-tight sm:text-4xl">ATS Analysis</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Get a detailed ATS report and an assistant-style fit review that
            explains whether to apply now, tailor first, or build missing proof.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto lg:self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Analyze match
            </CardTitle>
            <CardDescription>
                Upload a resume, use your latest saved job, then run a fit report with score, gaps, role signals, and recommended fixes.
              </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRunAnalysis} className="space-y-5">
              <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">
                        Upload resume for analysis
                      </p>

                {/* Analysis setup strip */}
                <div className="mt-4 rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="secondary">Match setup</Badge>
                      <p className="mt-2 text-sm font-medium">
                        Analyze one resume against one saved job
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Upload a resume, use your latest saved job, then run the fit report.
                      </p>
                    </div>

                    <Badge variant={resumeId && jobId ? "secondary" : "outline"}>
                      {resumeId && jobId ? "Ready" : "Needs setup"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border bg-background p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Resume
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {resumeId ? `#${resumeId}` : "Upload needed"}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-background p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Job
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {jobId ? `#${jobId}` : "Save job first"}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-background p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Industry
                      </p>
                      <p className="mt-1 text-sm font-semibold capitalize">
                        {industry}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      const latestJobId =
                        localStorage.getItem("latestJobDescriptionId") ||
                        localStorage.getItem("latestJobId") ||
                        localStorage.getItem("jobDescriptionId");

                      if (latestJobId) {
                        setJobId(latestJobId);
                      }
                    }}
                  >
                    Use latest saved job
                  </Button>
                </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Upload a PDF resume and CareerCopilot will prepare it for analysis.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(event) =>
                        setSelectedResumeFile(event.target.files?.[0] ?? null)
                      }
                      className="rounded-xl border bg-background px-3 py-2 text-sm"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResumeUpload}
                      disabled={isUploadingResume}
                    >
                      {isUploadingResume ? "Uploading..." : "Upload resume"}
                    </Button>
                  </div>

                  {resumeUploadMessage ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {resumeUploadMessage}
                    </p>
                  ) : null}
                </div>




              {error ? <p className="text-sm text-destructive">{error}</p> : null}

                                <details className="rounded-2xl border bg-muted/10 p-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Advanced details
                  </summary>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    These fields are used by the local development backend. In the final product, users will select a resume and job without seeing IDs.
                  </p>

                  <div className="mt-4 space-y-4">
                <div className="space-y-2">
                <Label htmlFor="resumeId">Resume ID</Label>
                <Input
                  id="resumeId"
                  type="number"
                  value={resumeId}
                  onChange={(event) => setResumeId(event.target.value)}
                  placeholder="6"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobId">Job ID</Label>
                <Input
                  id="jobId"
                  type="number"
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  placeholder="9"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  placeholder="technology"
                  required
                />
              </div>

                  </div>
                </details>

<Button type="submit" disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analyze resume fit
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="cc-product-page space-y-6">
          {!result ? (
            <EmptyState />
          ) : (
            <Tabs defaultValue="assistant" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assistant">Assistant View</TabsTrigger>
                <TabsTrigger value="report">Report View</TabsTrigger>
              </TabsList>

              <TabsContent value="assistant" className="space-y-6">
                <AssistantView result={result} />
              </TabsContent>

              <TabsContent value="report" className="space-y-6">
                <ReportView result={result} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </AppShell>
  );
}
