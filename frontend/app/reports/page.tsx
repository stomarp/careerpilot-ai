"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
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
import { Separator } from "@/components/ui/separator";

type AnalysisReport = {
  id: number;
  application_id: number | null;
  resume_id: number | null;
  job_description_id: number | null;
  report_type: string;
  industry: string;
  ats_score: number | null;
  provider_used: string | null;
  fallback_used: boolean;
  title: string | null;
  summary: string | null;
  matching_skills: string[] | null;
  missing_skills: string[] | null;
  matched_keywords: string[] | null;
  missing_keywords: string[] | null;
  recommendations: string[] | null;
  section_feedback: Record<string, unknown>[] | null;
  improved_bullets: Record<string, unknown>[] | null;
  project_enhancements: Record<string, unknown>[] | null;
  certifications_or_learning: string[] | null;
  raw_report_json: Record<string, unknown>;
  created_at: string;
};

function getScoreLabel(score: number | null) {
  if (score === null || score === undefined) return "Not scored";
  if (score >= 85) return "Excellent match";
  if (score >= 70) return "Strong match";
  if (score >= 55) return "Moderate match";
  return "Needs work";
}

function getScoreTone(score: number | null) {
  if (score === null || score === undefined) return "secondary";
  if (score >= 85) return "default";
  if (score >= 70) return "secondary";
  return "destructive";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getReportTypeLabel(type: string) {
  const labels: Record<string, string> = {
    ats_score: "ATS Score",
    resume_score: "Resume Score",
    resume_optimizer: "Resume Optimizer",
    ai_resume_optimizer: "AI Resume Optimizer",
  };

  return labels[type] ?? type;
}

function getScoreBreakdown(report: AnalysisReport | null) {
  if (!report?.raw_report_json) return [];

  const breakdown = report.raw_report_json.score_breakdown;

  if (!breakdown || typeof breakdown !== "object" || Array.isArray(breakdown)) {
    return [];
  }

  return Object.entries(breakdown as Record<string, number>).filter(
    ([, value]) => typeof value === "number"
  );
}

function PillList({
  items,
  emptyText,
}: {
  items?: string[] | null;
  emptyText: string;
}) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} variant="secondary" className="rounded-full">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<AnalysisReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [error, setError] = useState("");

  const latestReport = reports[0] ?? null;

  const averageScore = useMemo(() => {
    const scores = reports
      .map((report) => report.ats_score)
      .filter((score): score is number => typeof score === "number");

    if (scores.length === 0) return null;

    return Math.round(
      scores.reduce((total, score) => total + score, 0) / scores.length
    );
  }, [reports]);

  const highestScore = useMemo(() => {
    const scores = reports
      .map((report) => report.ats_score)
      .filter((score): score is number => typeof score === "number");

    return scores.length ? Math.max(...scores) : null;
  }, [reports]);

  const totalRecommendations = useMemo(
    () =>
      reports.reduce(
        (total, report) => total + (report.recommendations?.length ?? 0),
        0
      ),
    [reports]
  );

  const scoreBreakdown = getScoreBreakdown(latestReport);

  async function loadReports() {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.get<AnalysisReport[]>("/analysis-reports");
      setReports(response.data);
    } catch (err) {
      console.error(err);
      setError("Reports could not load. Refresh the page or create a sample report to preview the experience.");
    } finally {
      setIsLoading(false);
    }
  }

  async function createDemoReport() {
    setIsCreatingDemo(true);
    setError("");

    try {
      await api.post("/analysis-reports", {
        report_type: "ats_score",
        industry: "technology",
        ats_score: 89,
        provider_used: "smart_report_engine",
        fallback_used: false,
        title: "Backend Engineer ATS Fit Report",
        summary:
          "The resume is strongly aligned with backend engineering roles because it highlights FastAPI, PostgreSQL, Docker, REST APIs, and full-stack product delivery. The strongest improvement areas are deployment proof, stronger metrics, and more role-specific backend keywords.",
        matching_skills: [
          "FastAPI",
          "PostgreSQL",
          "Docker",
          "REST APIs",
          "Next.js",
          "TypeScript",
        ],
        missing_skills: [
          "Production deployment",
          "Cloud monitoring",
          "Automated test coverage",
        ],
        matched_keywords: [
          "Backend",
          "API design",
          "Database",
          "Docker",
          "CI/CD",
        ],
        missing_keywords: ["AWS deployment", "Observability", "Scalability"],
        recommendations: [
          "Add deployment details and public demo link.",
          "Quantify project impact with API count, test coverage, and workflow completion.",
          "Add backend testing and CI/CD proof to strengthen engineering credibility.",
          "Mention PostgreSQL schema design and API validation more clearly in resume bullets.",
        ],
        section_feedback: [
          {
            section: "Projects",
            feedback:
              "CareerPilot should be presented as a full-stack career platform, not only a resume builder.",
          },
          {
            section: "Skills",
            feedback:
              "Group backend, frontend, database, DevOps, and AI skills clearly.",
          },
        ],
        improved_bullets: [
          {
            before: "Built a resume app using FastAPI and Next.js.",
            after:
              "Built CareerPilot AI, a full-stack career platform using FastAPI, PostgreSQL, Docker, Next.js, and TypeScript to parse resumes and job descriptions, generate ATS-style fit analysis, and track applications through a Kanban pipeline.",
          },
        ],
        project_enhancements: [
          {
            project: "CareerPilot AI",
            suggestion:
              "Add deployed frontend/backend URLs, GitHub Actions CI, and backend test coverage badge.",
          },
        ],
        certifications_or_learning: [
          "Backend API testing with pytest",
          "GitHub Actions CI",
          "Cloud deployment",
        ],
        raw_report_json: {
          score_breakdown: {
            Skills: 92,
            Experience: 85,
            Keywords: 88,
            Projects: 91,
            "Production Readiness": 72,
          },
        },
      });

      await loadReports();
    } catch (err) {
      console.error(err);
      setError("Unable to create demo report.");
    } finally {
      setIsCreatingDemo(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <AppShell>
      <div className="cc-product-page space-y-6">
        <div className="cc-page-hero-visual p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                Report Studio
              </Badge>
              <h1 className="cc-gradient-title text-3xl font-black tracking-tight sm:text-4xl">
                Resume-job fit reports
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Turn ATS analysis into a polished improvement report with match
                scores, skill gaps, keyword gaps, and action steps.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild className="cc-cta-secondary">
                <Link href="/analysis">Back to Analysis</Link>
              </Button>

              <Button onClick={loadReports} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>

              <Button onClick={createDemoReport} disabled={isCreatingDemo}>
                {isCreatingDemo ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate sample report
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="cc-product-card-static">
            <CardHeader className="pb-2">
              <CardDescription>Total reports</CardDescription>
              <CardTitle className="text-3xl">{reports.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Saved ATS and resume analysis reports.
              </p>
            </CardContent>
          </Card>

          <Card className="cc-product-card-static">
            <CardHeader className="pb-2">
              <CardDescription>Average score</CardDescription>
              <CardTitle className="text-3xl">
                {averageScore ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Average ATS score across reports.
              </p>
            </CardContent>
          </Card>

          <Card className="cc-product-card-static">
            <CardHeader className="pb-2">
              <CardDescription>Highest score</CardDescription>
              <CardTitle className="text-3xl">
                {highestScore ?? "—"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Best resume-job alignment so far.
              </p>
            </CardContent>
          </Card>

          <Card className="cc-product-card-static">
            <CardHeader className="pb-2">
              <CardDescription>Recommendations</CardDescription>
              <CardTitle className="text-3xl">
                {totalRecommendations}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Action items generated from reports.
              </p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Card className="cc-product-card-static">
            <CardContent className="flex min-h-64 items-center justify-center">
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading reports...
              </div>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex min-h-80 flex-col items-center justify-center text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="text-xl font-semibold">No reports yet</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Generate a report from ATS Analysis, or create a demo report to
                preview how the reporting experience will look.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/analysis">Go to Analysis</Link>
                </Button>
                <Button onClick={createDemoReport} disabled={isCreatingDemo}>
                  {isCreatingDemo ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate sample report
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden border-primary/20">
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <Badge variant={getScoreTone(latestReport?.ats_score ?? null)}>
                      {getScoreLabel(latestReport?.ats_score ?? null)}
                    </Badge>
                    <CardTitle className="mt-3 text-2xl">
                      {latestReport?.title ?? "Latest analysis report"}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {latestReport
                        ? `${getReportTypeLabel(
                            latestReport.report_type
                          )} • ${latestReport.industry} • ${formatDate(
                            latestReport.created_at
                          )}`
                        : "Latest saved report"}
                    </CardDescription>
                  </div>

                  <div className="rounded-2xl border bg-muted/30 p-5 text-center">
                    <p className="text-sm text-muted-foreground">ATS score</p>
                    <p className="mt-1 text-5xl font-bold">
                      {latestReport?.ats_score ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      out of 100
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="cc-product-page space-y-6">
                <p className="rounded-2xl border bg-muted/20 p-5 text-sm leading-7 text-muted-foreground">
                  {latestReport?.summary ??
                    "No summary available for this report."}
                </p>

                {scoreBreakdown.length > 0 ? (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <h3 className="font-semibold">Score breakdown</h3>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      {scoreBreakdown.map(([label, value]) => (
                        <div key={label} className="rounded-2xl border p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="font-semibold">{value}</p>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${Math.min(value, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <Separator />

                <div className="grid gap-4 xl:grid-cols-3">
                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <CardTitle className="text-base">
                          Matching strengths
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <PillList
                        items={latestReport?.matching_skills}
                        emptyText="No matching skills saved yet."
                      />
                    </CardContent>
                  </Card>

                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <CardTitle className="text-base">
                          Missing skills
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <PillList
                        items={latestReport?.missing_skills}
                        emptyText="No missing skills saved yet."
                      />
                    </CardContent>
                  </Card>

                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        <CardTitle className="text-base">
                          Learning suggestions
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <PillList
                        items={latestReport?.certifications_or_learning}
                        emptyText="No learning suggestions saved yet."
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Priority recommendations
                      </CardTitle>
                      <CardDescription>
                        The highest-impact improvements for this resume-job
                        match.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {latestReport?.recommendations?.length ? (
                        <div className="space-y-3">
                          {latestReport.recommendations.map((item, index) => (
                            <div
                              key={item}
                              className="rounded-xl border bg-muted/20 p-3 text-sm leading-6"
                            >
                              <span className="mr-2 font-semibold">
                                {index + 1}.
                              </span>
                              {item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No recommendations saved yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="cc-product-card-static">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Next product steps
                      </CardTitle>
                      <CardDescription>
                        Continue the workflow from report to preparation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-between" asChild>
                        <Link href="/interview-prep">
                          Continue to Interview Prep
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button
                        className="w-full justify-between"
                        variant="outline"
                        asChild
                      >
                        <Link href="/roadmap">
                          Build Learning Roadmap
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button
                        className="w-full justify-between"
                        variant="outline"
                        asChild
                      >
                        <Link href="/applications">
                          Track Application
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="cc-product-card-static">
              <CardHeader>
                <CardTitle>Report history</CardTitle>
                <CardDescription>
                  Saved reports ordered by most recent first.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex flex-col gap-3 rounded-2xl border bg-background p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">
                            {report.title ?? getReportTypeLabel(report.report_type)}
                          </p>
                          <Badge variant={getScoreTone(report.ats_score)}>
                            {report.ats_score ?? "—"}
                          </Badge>
                          <Badge variant="outline">
                            {getReportTypeLabel(report.report_type)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(report.created_at)} • {report.industry}
                        </p>
                      </div>

                      <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                        {report.summary?.slice(0, 180) ??
                          "No summary available."}
                        {report.summary && report.summary.length > 180
                          ? "..."
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  );
}
