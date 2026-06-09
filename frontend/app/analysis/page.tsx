"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Lightbulb,
  Loader2,
  ShieldCheck,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
    <Card>
      <CardHeader>
        <CardTitle>No analysis yet</CardTitle>
        <CardDescription>
          Upload a resume, create a job description, then run ATS analysis.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground">
          Your results will appear here with an overall score, resume gaps,
          priority actions, suggested bullets, strengths, and role-signal
          details.
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalysisPage() {
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [industry, setIndustry] = useState("technology");

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

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Step 3
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">ATS Analysis</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Get a realistic resume review based on the job description.
            CareerCopilot highlights strengths, resume gaps, priority fixes,
            suggested bullets, and meaningful role signals.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Run analysis
            </CardTitle>
            <CardDescription>
              CareerCopilot uses your latest uploaded resume and job description
              IDs from this browser session.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRunAnalysis} className="space-y-5">
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

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Run ATS analysis
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!result ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <ScoreCard score={result.ats_score} label={result.match_level} />

                <Card>
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

              <Card>
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
                <Card>
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

                <Card>
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Suggested resume bullets
                  </CardTitle>
                  <CardDescription>
                    Use these only after the work is truthful, built, or
                    measurable. Do not copy bullets for skills you cannot
                    explain.
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Role signal details
                  </CardTitle>
                  <CardDescription>{result.keyword_details.note}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div>
                    <p className="mb-3 text-sm font-medium">
                      Matched role signals
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.keyword_details.matched.length > 0 ? (
                        result.keyword_details.matched.map((signal) => (
                          <Badge key={signal}>{signal}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No matched role signals returned.
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="mb-3 text-sm font-medium">
                      Missing role signals
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.keyword_details.missing.length > 0 ? (
                        result.keyword_details.missing.map((signal) => (
                          <Badge key={signal} variant="secondary">
                            {signal}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No missing role signals returned.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
