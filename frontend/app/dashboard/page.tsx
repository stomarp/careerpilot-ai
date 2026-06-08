import {
  BarChart3,
  BriefcaseBusiness,
  FileSearch,
  FileText,
  GraduationCap,
  MessageSquareText,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const stats = [
  {
    label: "Resumes",
    value: "Ready",
    description: "Upload and parse resumes",
  },
  {
    label: "ATS Analysis",
    value: "Active",
    description: "Compare resumes with jobs",
  },
  {
    label: "Applications",
    value: "Tracked",
    description: "Monitor job progress",
  },
  {
    label: "Interview Prep",
    value: "AI-ready",
    description: "Generate company-aware questions",
  },
];

const workflow = [
  {
    title: "Upload Resume",
    description: "Parse your resume and prepare it for ATS analysis.",
    icon: FileText,
  },
  {
    title: "Add Job Description",
    description: "Save job descriptions and compare them with your resume.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Run ATS Score",
    description: "Find matching skills, missing keywords, and recommendations.",
    icon: FileSearch,
  },
  {
    title: "Track Application",
    description: "Create an application record with status and follow-up notes.",
    icon: BarChart3,
  },
  {
    title: "Prepare Interview",
    description: "Generate role-specific and company-aware interview questions.",
    icon: MessageSquareText,
  },
  {
    title: "Build Roadmap",
    description: "Create a learning plan from gaps in your ATS report.",
    icon: GraduationCap,
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Frontend foundation
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            CareerCopilot Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your central workspace for resumes, job matching, applications,
            interview prep, and learning plans.
          </p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle>{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>CareerCopilot workflow</CardTitle>
            <CardDescription>
              This is the product flow we will connect to the backend APIs.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {workflow.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border bg-background p-5"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
