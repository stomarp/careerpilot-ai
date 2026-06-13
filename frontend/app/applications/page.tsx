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


import { FormEvent, useEffect, useMemo, useState } from "react";
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

const KANBAN_COLUMNS: {
  id: string;
  title: string;
  description: string;
  statuses: ApplicationStatus[];
}[] = [
  {
    id: "saved",
    title: "Saved",
    description: "Jobs to review or tailor for.",
    statuses: ["saved"],
  },
  {
    id: "applied",
    title: "Applied / OA",
    description: "Applications submitted or assessment stage.",
    statuses: ["applied", "oa_received", "oa_completed"],
  },
  {
    id: "interviewing",
    title: "Interviewing",
    description: "Phone screens, interviews, and final rounds.",
    statuses: ["phone_screen", "interviewing", "final_round"],
  },
  {
    id: "offer",
    title: "Offer",
    description: "Offers or negotiation stage.",
    statuses: ["offer"],
  },
  {
    id: "closed",
    title: "Closed",
    description: "Rejected, withdrawn, or ghosted.",
    statuses: ["rejected", "withdrawn", "ghosted"],
  },
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

function isFollowUpDue(dateValue?: string | null) {
  if (!dateValue) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const followUp = new Date(`${dateValue}T00:00:00`);
  return followUp <= today;
}

function getNeedsActionApplications(applications: Application[]) {
  return applications
    .filter((application) => {
      return (
        isFollowUpDue(application.follow_up_date) ||
        !application.next_action ||
        application.priority === "high"
      );
    })
    .slice(0, 5);
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
  const [applicationSearch, setApplicationSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);

  const filteredApplications = useMemo(() => {
    const query = applicationSearch.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch = query
        ? [
            application.company_name,
            application.role_title,
            application.job_location,
            application.source,
            application.notes,
            application.next_action,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      const matchesStatus =
        statusFilter === "all" ? true : application.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ? true : application.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [applications, applicationSearch, statusFilter, priorityFilter]);

  const kanbanApplications = useMemo(() => {
    return KANBAN_COLUMNS.map((column) => ({
      ...column,
      applications: filteredApplications.filter((application) =>
        column.statuses.includes(application.status)
      ),
    }));
  }, [applications]);

  const needsActionApplications = useMemo(
    () => getNeedsActionApplications(applications),
    [applications]
  );

  const dueFollowUpApplications = useMemo(
    () =>
      applications
        .filter((application) => isFollowUpDue(application.follow_up_date))
        .slice(0, 5),
    [applications]
  );

  const highPriorityApplications = useMemo(
    () => applications.filter((application) => application.priority === "high"),
    [applications]
  );

  const interviewingApplications = useMemo(
    () =>
      applications.filter((application) =>
        ["phone_screen", "interviewing", "final_round"].includes(
          application.status
        )
      ),
    [applications]
  );

  const averageMatchScore = useMemo(() => {
    const scores = applications
      .map((application) => application.ats_score)
      .filter((score): score is number => typeof score === "number");

    if (scores.length === 0) {
      return null;
    }

    return Math.round(
      scores.reduce((total, score) => total + score, 0) / scores.length
    );
  }, [applications]);

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

              <Card className="mb-6 overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-muted/30">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Badge variant="secondary">Job search command center</Badge>
                <CardTitle className="mt-3 text-2xl">
                  What needs attention now
                </CardTitle>
                <CardDescription className="mt-1 max-w-2xl">
                  Prioritize follow-ups, high-value roles, and active interviews instead of treating every application the same.
                </CardDescription>
              </div>

              <Button
                type="button"
                onClick={() => setIsApplicationFormOpen(true)}
              >
                Add application
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border bg-background p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">Today’s focus</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      The most important roles to act on first.
                    </p>
                  </div>

                  <Badge variant={needsActionApplications.length > 0 ? "destructive" : "secondary"}>
                    {needsActionApplications.length > 0
                      ? `${needsActionApplications.length} action items`
                      : "Clear"}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {needsActionApplications.length > 0 ? (
                    needsActionApplications.slice(0, 3).map((application) => (
                      <div
                        key={application.id}
                        className="rounded-xl border bg-muted/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {application.company_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {application.role_title}
                            </p>
                          </div>

                          <Badge variant={getPriorityVariant(application.priority)}>
                            {application.priority}
                          </Badge>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {application.next_action ||
                            "Add a clear next action so this role does not get lost."}
                        </p>

                        {application.follow_up_date ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Follow-up: {formatDate(application.follow_up_date)}
                          </p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                      No urgent follow-ups or missing next actions right now.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border bg-background p-5">
                  <p className="text-sm text-muted-foreground">Follow-ups due</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {dueFollowUpApplications.length}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Roles with a follow-up date due today or earlier.
                  </p>
                </div>

                <div className="rounded-2xl border bg-background p-5">
                  <p className="text-sm text-muted-foreground">High priority</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {highPriorityApplications.length}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Applications marked as most important.
                  </p>
                </div>

                <div className="rounded-2xl border bg-background p-5">
                  <p className="text-sm text-muted-foreground">Interviewing</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {interviewingApplications.length}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Active screens, interviews, and final rounds.
                  </p>
                </div>

                <div className="rounded-2xl border bg-background p-5">
                  <p className="text-sm text-muted-foreground">Average match</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {averageMatchScore ?? "—"}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Average ATS match score across tracked roles.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

<div className="grid min-w-0 gap-6">
        {isApplicationFormOpen ? (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsApplicationFormOpen(false)}
          />
        ) : null}

        <Card
          id="add-application"
          className={
            isApplicationFormOpen
              ? "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto shadow-2xl"
              : "hidden"
          }
        >
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
          <div className="min-w-0 space-y-6">
                          <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Badge variant="secondary">Smart filters</Badge>
                      <CardTitle className="mt-3">Search and filter applications</CardTitle>
                      <CardDescription>
                        Quickly focus on the applications that matter most right now.
                      </CardDescription>
                    </div>

                    <Badge variant="outline">
                      Showing {filteredApplications.length} of {applications.length}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-3 lg:grid-cols-[1fr_190px_170px_auto]">
                    <Input
                      value={applicationSearch}
                      onChange={(event) => setApplicationSearch(event.target.value)}
                      placeholder="Search company, role, notes, next action..."
                    />

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={priorityFilter}
                      onValueChange={setPriorityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setApplicationSearch("");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

<Card className="min-w-0 overflow-hidden border-primary/20 bg-gradient-to-br from-background to-muted/30">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge variant="secondary">Pipeline board</Badge>
                    <CardTitle className="mt-3">Application pipeline</CardTitle>
                    <CardDescription>
                      Move each opportunity through your job search pipeline and keep follow-ups visible.
                    </CardDescription>
                  </div>

                  <Badge variant="outline">
                    {applications.length} active records
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {needsActionApplications.length > 0 ? (
                  <div className="mb-5 rounded-2xl border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Needs action</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          High-priority roles, due follow-ups, or missing next actions.
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {needsActionApplications.length}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {needsActionApplications.map((application) => (
                        <div
                          key={application.id}
                          className="rounded-xl border bg-muted/20 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">
                                {application.company_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {application.role_title}
                              </p>
                            </div>
                            <Badge variant={getPriorityVariant(application.priority)}>
                              {application.priority}
                            </Badge>
                          </div>

                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {application.next_action ||
                              "Add a clear next action for this application."}
                          </p>

                          {application.follow_up_date ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Follow-up: {formatDate(application.follow_up_date)}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="w-full max-w-full overflow-x-auto pb-3">
                  {kanbanApplications.map((column) => (
                    <div
                      key={column.id}
                      className="rounded-2xl border bg-background p-4"
                    >
                      <div className="mb-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{column.title}</p>
                          <Badge variant="outline">
                            {column.applications.length}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {column.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {column.applications.length === 0 ? (
                          <div className="rounded-xl border border-dashed bg-muted/20 p-3 text-center text-xs text-muted-foreground">
                            No applications here yet.
                          </div>
                        ) : (
                          column.applications.map((application) => (
                            <div
                              key={application.id}
                              className="rounded-xl border bg-muted/20 p-3 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold">
                                    {application.company_name}
                                  </p>
                                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                    {application.role_title}
                                  </p>
                                </div>

                                <Badge
                                  variant={getPriorityVariant(application.priority)}
                                >
                                  {application.priority}
                                </Badge>
                              </div>

                              {application.ats_score ? (
                                <div className="mt-3 rounded-lg border bg-background p-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">
                                      Match
                                    </span>
                                    <span className="font-semibold">
                                      {application.ats_score}
                                    </span>
                                  </div>
                                  <div className="mt-2 h-1.5 rounded-full bg-muted">
                                    <div
                                      className="h-1.5 rounded-full bg-primary"
                                      style={{
                                        width: `${Math.min(
                                          application.ats_score ?? 0,
                                          100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : null}

                              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                {application.job_location ? (
                                  <p>{application.job_location}</p>
                                ) : null}

                                {application.follow_up_date ? (
                                  <p>
                                    Follow-up:{" "}
                                    {formatDate(application.follow_up_date)}
                                  </p>
                                ) : null}
                              </div>

                              <p className="mt-3 rounded-lg bg-background p-2 text-xs leading-5 text-muted-foreground">
                                {application.next_action ||
                                  "No next action added yet."}
                              </p>

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
                                <SelectTrigger className="mt-3 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
            <CardHeader>
            <CardTitle>All applications</CardTitle>
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
                {filteredApplications.map((application) => (
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
        </div>
      </AppShell>
  );
}
