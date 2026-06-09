"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  FileSearch,
  Loader2,
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

type ATSScoreResponse = {
  resume_id: number;
  job_id: number;
  industry: string;
  ats_score: number;
  breakdown: Record<string, number>;
  matching_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  recommendations: string[];
};

function ScoreRing({ score }: { score: number }) {
  const scoreLabel =
    score >= 80 ? "Strong match" : score >= 60 ? "Good start" : "Needs work";

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-muted/30 p-8 text-center">
      <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary/20 bg-background">
        <div>
          <p className="text-4xl font-bold">{score}</p>
          <p className="text-xs text-muted-foreground">ATS Score</p>
        </div>
      </div>

      <Badge className="mt-4">{scoreLabel}</Badge>
    </div>
  );
}

function ListSection({
  title,
  items,
  emptyText,
  type,
}: {
  title: string;
  items: string[];
  emptyText: string;
  type: "success" | "warning" | "neutral";
}) {
  const Icon = type === "success" ? CheckCircle2 : type === "warning" ? AlertCircle : Target;

  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <h3 className="font-semibold">{title}</h3>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge
              key={item}
              variant={type === "success" ? "default" : "secondary"}
            >
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
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
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Compare your resume against a saved job description and get a clear
            score, matching keywords, missing keywords, and recommendations.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Run analysis
            </CardTitle>
            <CardDescription>
              We automatically use the latest resume and job IDs saved from this
              browser session.
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
                  placeholder="4"
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
                  placeholder="6"
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
          {result ? (
            <>
              <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
                <ScoreRing score={result.ats_score} />

                <Card>
                  <CardHeader>
                    <CardTitle>Score breakdown</CardTitle>
                    <CardDescription>
                      How CareerCopilot calculated the ATS fit.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(result.breakdown).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3 text-sm"
                        >
                          <span className="capitalize text-muted-foreground">
                            {key.replaceAll("_", " ")}
                          </span>
                          <span className="font-semibold">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <ListSection
                  title="Matched keywords"
                  items={result.matched_keywords}
                  emptyText="No matched keywords returned."
                  type="success"
                />

                <ListSection
                  title="Missing keywords"
                  items={result.missing_keywords}
                  emptyText="No missing keywords returned."
                  type="warning"
                />

                <ListSection
                  title="Matching skills"
                  items={result.matching_skills}
                  emptyText="No matching skills returned."
                  type="success"
                />

                <ListSection
                  title="Missing skills"
                  items={result.missing_skills}
                  emptyText="No missing skills returned."
                  type="warning"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Next actions to improve your resume match.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {result.recommendations.map((recommendation) => (
                      <div
                        key={recommendation}
                        className="rounded-xl border bg-muted/30 p-4 text-sm"
                      >
                        {recommendation}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No analysis yet</CardTitle>
                <CardDescription>
                  Upload a resume, create a job description, then run ATS
                  analysis.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground">
                  Your analysis results will appear here with score breakdown,
                  matched keywords, missing keywords, and recommendations.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
