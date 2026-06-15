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
    <div className="mb-8 rounded-3xl border bg-gradient-to-br from-background via-background to-muted/40 p-5 shadow-sm">
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


import { FormEvent, useMemo, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Layers3, Loader2, Save } from "lucide-react";

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

function analyzeJobDescription(title: string, company: string, description: string) {
  const content = `${title} ${company} ${description}`.toLowerCase();

  const skillBank = [
    "python",
    "java",
    "javascript",
    "typescript",
    "go",
    "fastapi",
    "spring boot",
    "node",
    "react",
    "next.js",
    "postgresql",
    "mysql",
    "sql",
    "mongodb",
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
  ];

  const detectedSkills = skillBank.filter((skill) => content.includes(skill));

  const seniority = content.includes("principal") || content.includes("staff")
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

  const responsibilitySignals = [
    {
      label: "Build backend services",
      active: content.includes("backend") || content.includes("service") || content.includes("api"),
    },
    {
      label: "Design scalable systems",
      active: content.includes("scalable") || content.includes("distributed") || content.includes("reliable"),
    },
    {
      label: "Own production quality",
      active: content.includes("production") || content.includes("incident") || content.includes("reliability"),
    },
    {
      label: "Collaborate cross-functionally",
      active: content.includes("product manager") || content.includes("designer") || content.includes("cross-functional"),
    },
    {
      label: "Improve performance",
      active: content.includes("latency") || content.includes("performance") || content.includes("optimization") || content.includes("caching"),
    },
    {
      label: "Write tested code",
      active: content.includes("test") || content.includes("well-tested") || content.includes("quality"),
    },
  ].filter((item) => item.active);

  const roleKeywords = [
    ...detectedSkills,
    seniority,
    workType,
    title,
    company,
  ]
    .filter(Boolean)
    .slice(0, 18);

  const score = Math.min(
    100,
    Math.round(
      35 +
        Math.min(detectedSkills.length, 12) * 4 +
        Math.min(responsibilitySignals.length, 6) * 3
    )
  );

  return {
    score,
    seniority,
    workType,
    detectedSkills,
    responsibilitySignals,
    roleKeywords,
  };
}

type JobCreateResponse = {
  job_id: number;
  title: string;
  company: string | null;
  status: string;
};

export default function JobsPage() {
  const [title, setTitle] = useState("Backend Engineer");
  const [company, setCompany] = useState("Visa");
  const [description, setDescription] = useState(
    "We are looking for a Backend Engineer with experience building REST APIs, PostgreSQL-backed services, caching, distributed systems, testing, CI/CD, and cloud-based backend applications."
  );

  const [createdJob, setCreatedJob] = useState<JobCreateResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const jobIntelligence = useMemo(
    () => analyzeJobDescription(title, company, description),
    [title, company, description]
  );

  async function handleCreateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await api.post<JobCreateResponse>("/jobs", {
        title,
        company,
        description,
      });

      setCreatedJob(response.data);

      localStorage.setItem(
        "careercopilot_latest_job_id",
        String(response.data.job_id)
      );
    } catch {
      setError(
        "Job description creation failed. Make sure you are logged in and the backend is running."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Step 2
          </Badge>
          <CareerWorkflowBar activeStep="jobs" />

        <div className="mb-8 rounded-3xl border bg-muted/20 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Next step after saving a job</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Open the Job Workspace to run ATS match, AI resume optimizer, interview prep, roadmap, and pipeline strategy from one place.
              </p>
            </div>

            <Button asChild>
              <Link href="/jobs/workspace">
                <Layers3 className="mr-2 h-4 w-4" />
                Open Job Workspace
              </Link>
            </Button>
          </div>
        </div>

<h1 className="text-3xl font-bold tracking-tight">
            Smart Job Intake
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Paste a job post and CareerCopilot will extract role signals, keywords, and requirements before comparing it with your
            resume and identify matched skills, missing keywords, and
            improvement opportunities.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5" />
              Job post
            </CardTitle>
            <CardDescription>
              Paste the full job post. CareerCopilot will read it like a recruiter and prepare it for fit analysis.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateJob} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Role title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Backend Engineer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Visa"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Paste the full job description here..."
                  className="min-h-72"
                  required
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

                              <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="secondary">Live Job Intelligence</Badge>
                      <h3 className="mt-3 text-lg font-semibold">
                        Parsed role signals
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        This preview updates as you paste the job description.
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-semibold">
                        {jobIntelligence.score}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        signal strength
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border bg-background p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Seniority
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {jobIntelligence.seniority}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-background p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Work type
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {jobIntelligence.workType}
                      </p>
                    </div>

                    <div className="rounded-xl border bg-background p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Skills found
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {jobIntelligence.detectedSkills.length}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border bg-background p-4">
                      <p className="text-sm font-medium">Detected skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {jobIntelligence.detectedSkills.length > 0 ? (
                          jobIntelligence.detectedSkills.slice(0, 14).map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Paste a longer job description to detect skills.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border bg-background p-4">
                      <p className="text-sm font-medium">Responsibilities</p>
                      <div className="mt-3 space-y-2">
                        {jobIntelligence.responsibilitySignals.length > 0 ? (
                          jobIntelligence.responsibilitySignals.map((item) => (
                            <p
                              key={item.label}
                              className="rounded-lg bg-muted/40 px-3 py-2 text-sm"
                            >
                              ✓ {item.label}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Responsibilities will appear here after pasting more detail.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-background p-4">
                    <p className="text-sm font-medium">Top ATS keywords from this job</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {jobIntelligence.roleKeywords.slice(0, 18).map((keyword) => (
                        <Badge key={keyword} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

<Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving job...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save job and prepare analysis
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved job</CardTitle>
            <CardDescription>
              Your latest job ID will be saved locally for ATS analysis.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {createdJob ? (
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Job description saved
                </div>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Job ID</dt>
                    <dd className="font-medium">{createdJob.job_id}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="font-medium">{createdJob.title}</dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Company</dt>
                    <dd className="font-medium">
                      {createdJob.company || "Not provided"}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium">{createdJob.status}</dd>
                  </div>
                </dl>

                  <Button
                    type="button"
                    className="mt-5 w-full"
                    onClick={() => {
                      if (createdJob) {
                        localStorage.setItem(
                          "latestJobDescriptionId",
                          String(createdJob.job_id)
                        );
                        localStorage.setItem("latestJobId", String(createdJob.job_id));
                        localStorage.setItem("jobDescriptionId", String(createdJob.job_id));
                        window.location.href = "/analysis";
                      }
                    }}
                  >
                    Continue to Analysis
                  </Button>
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground">
                No job saved in this session yet. Add a job description to run
                ATS analysis.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
