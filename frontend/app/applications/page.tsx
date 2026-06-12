"use client";

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


import { FormEvent, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

type ApplicationStatus =
  | "saved"
  | "applied"
  | "oa_received"
  | "oa_completed"
  | "phone_screen"
  | "interviewing"
  | "final_round"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "ghosted";

type ApplicationPriority = "low" | "medium" | "high";

type Application = {
  id: number;
  company_name: string;
  role_title: string;
  job_url?: string | null;
  job_location?: string | null;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  source?: string | null;
  notes?: string | null;
  next_action?: string | null;
  applied_date?: string | null;
  follow_up_date?: string | null;
  ats_score?: number | null;
  created_at?: string;
};

type DashboardStats = {
  total_applications: number;
  saved: number;
  applied: number;
  interviewing: number;
  offers: number;
  rejected: number;
  upcoming_followups: number;
  average_ats_score?: number | null;
};

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "oa_received", label: "OA Received" },
  { value: "oa_completed", label: "OA Completed" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "interviewing", label: "Interviewing" },
  { value: "final_round", label: "Final Round" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "ghosted", label: "Ghosted" },
];

const PRIORITY_OPTIONS: { value: ApplicationPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

function getStatusLabel(status: ApplicationStatus) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label || status
  );
}

function getStatusVariant(status: ApplicationStatus): BadgeVariant {
  if (status === "offer") {
    return "default";
  }

  if (
    status === "oa_received" ||
    status === "oa_completed" ||
    status === "phone_screen" ||
    status === "interviewing" ||
    status === "final_round"
  ) {
    return "secondary";
  }

  if (status === "rejected" || status === "withdrawn" || status === "ghosted") {
    return "destructive";
  }

  return "outline";
}

function getPriorityVariant(priority: ApplicationPriority): BadgeVariant {
  if (priority === "high") {
    return "destructive";
  }

  if (priority === "medium") {
    return "secondary";
  }

  return "outline";
}

function formatDate(dateValue?: string | null) {
  if (!dateValue) {
    return null;
  }

  return dateValue;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("saved");
  const [priority, setPriority] = useState<ApplicationPriority>("medium");
  const [source, setSource] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [nextAction, setNextAction] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadApplications() {
    setIsLoading(true);
    setError("");

    try {
      const [applicationsResponse, dashboardResponse] = await Promise.all([
        api.get<Application[]>("/applications"),
        api.get<DashboardStats>("/applications/dashboard"),
      ]);

      setApplications(applicationsResponse.data);
      setDashboard(dashboardResponse.data);
    } catch {
      setError(
        "Could not load applications. Make sure you are logged in and the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleCreateApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      await api.post("/applications", {
        company_name: companyName,
        role_title: roleTitle,
        job_location: jobLocation || null,
        job_url: jobUrl || null,
        status,
        priority,
        source: source || null,
        applied_date: appliedDate || null,
        follow_up_date: followUpDate || null,
        notes: notes || null,
        next_action: nextAction || null,
      });

      setCompanyName("");
      setRoleTitle("");
      setJobLocation("");
      setJobUrl("");
      setStatus("saved");
      setPriority("medium");
      setSource("");
      setAppliedDate("");
      setFollowUpDate("");
      setNotes("");
      setNextAction("");

      await loadApplications();
    } catch {
      setError("Could not create application. Please check the form and try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleStatusChange(
    applicationId: number,
    nextStatus: ApplicationStatus
  ) {
    setUpdatingId(applicationId);
    setError("");

    try {
      await api.patch(`/applications/${applicationId}`, {
        status: nextStatus,
      });

      await loadApplications();
    } catch {
      setError("Could not update application status.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(applicationId: number) {
    const confirmed = window.confirm(
      "Delete this application from your tracker?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(applicationId);
    setError("");

    try {
      await api.delete(`/applications/${applicationId}`);
      await loadApplications();
    } catch {
      setError("Could not delete application.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Application Tracker
          </Badge>
          <CareerWorkflowBar activeStep="applications" />
<h1 className="text-3xl font-bold tracking-tight">
            Track Your Job Applications
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Organize every job in one place. Track status, priority, follow-ups,
            notes, and next actions as you move through your job search.
          </p>
        </div>

        <Button variant="outline" onClick={loadApplications} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle>{dashboard?.total_applications ?? applications.length}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Saved</CardDescription>
            <CardTitle>{dashboard?.saved ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applied/OA</CardDescription>
            <CardTitle>{dashboard?.applied ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interviewing</CardDescription>
            <CardTitle>{dashboard?.interviewing ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Offers</CardDescription>
            <CardTitle>{dashboard?.offers ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejected</CardDescription>
            <CardTitle>{dashboard?.rejected ?? 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Follow-ups</CardDescription>
            <CardTitle>{dashboard?.upcoming_followups ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add application
            </CardTitle>
            <CardDescription>
              Save a job you applied to or want to apply to later.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateApplication} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Stripe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roleTitle">Role</Label>
                <Input
                  id="roleTitle"
                  value={roleTitle}
                  onChange={(event) => setRoleTitle(event.target.value)}
                  placeholder="Software Engineer I"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobLocation">Location</Label>
                <Input
                  id="jobLocation"
                  value={jobLocation}
                  onChange={(event) => setJobLocation(event.target.value)}
                  placeholder="Seattle, WA / Remote"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobUrl">Job URL</Label>
                <Input
                  id="jobUrl"
                  value={jobUrl}
                  onChange={(event) => setJobUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as ApplicationStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setPriority(value as ApplicationPriority)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  placeholder="LinkedIn, company site, recruiter..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appliedDate">Applied date</Label>
                  <Input
                    id="appliedDate"
                    type="date"
                    value={appliedDate}
                    onChange={(event) => setAppliedDate(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUpDate">Follow-up date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={followUpDate}
                    onChange={(event) => setFollowUpDate(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextAction">Next action</Label>
                <Input
                  id="nextAction"
                  value={nextAction}
                  onChange={(event) => setNextAction(event.target.value)}
                  placeholder="Follow up with recruiter next week"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Recruiter name, interview notes, job details..."
                  className="min-h-28"
                />
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <BriefcaseBusiness className="mr-2 h-4 w-4" />
                    Save application
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>
              Update each application as it moves through your job-search
              pipeline.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center rounded-xl border bg-muted/30">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading applications...
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-xl border bg-muted/30 p-8 text-center">
                <BriefcaseBusiness className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <h3 className="font-semibold">No applications yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Add your first job application to start tracking your job
                  search pipeline.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl border bg-background p-5"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {application.role_title}
                          </h3>

                          <Badge variant={getStatusVariant(application.status)}>
                            {getStatusLabel(application.status)}
                          </Badge>

                          <Badge variant={getPriorityVariant(application.priority)}>
                            {application.priority} priority
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {application.company_name}
                          </span>

                          {application.job_location ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.job_location}
                            </span>
                          ) : null}

                          {formatDate(application.applied_date) ? (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              Applied {application.applied_date}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Select
                          value={application.status}
                          onValueChange={(value) =>
                            handleStatusChange(
                              application.id,
                              value as ApplicationStatus
                            )
                          }
                          disabled={updatingId === application.id}
                        >
                          <SelectTrigger className="w-full sm:w-44">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {application.job_url ? (
                          <Button variant="outline" size="icon" asChild>
                            <a
                              href={application.job_url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="Open job posting"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : null}

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(application.id)}
                          disabled={deletingId === application.id}
                          aria-label="Delete application"
                        >
                          {deletingId === application.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {(application.notes || application.next_action) ? (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                          {application.next_action ? (
                            <p>
                              <span className="font-medium text-foreground">
                                Next action:
                              </span>{" "}
                              {application.next_action}
                            </p>
                          ) : null}

                          {application.notes ? <p>{application.notes}</p> : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
