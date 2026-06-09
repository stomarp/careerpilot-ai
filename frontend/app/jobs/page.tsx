"use client";

import { FormEvent, useState } from "react";
import { BriefcaseBusiness, CheckCircle2, Loader2, Save } from "lucide-react";

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
          <h1 className="text-3xl font-bold tracking-tight">
            Add Job Description
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Save a job description so CareerCopilot can compare it with your
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
              Job details
            </CardTitle>
            <CardDescription>
              Paste a real job description for best ATS analysis results.
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

              <Button type="submit" disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving job...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save job description
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
