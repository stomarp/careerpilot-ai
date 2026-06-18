import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileSearch,
  FileText,
  GraduationCap,
  MessageSquareText,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

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

const stats = [
  {
    label: "Resume Engine",
    value: "Ready",
    description: "Upload, parse, and reuse your best resume.",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    label: "ATS Match",
    value: "Active",
    description: "Compare every resume against real job descriptions.",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    label: "Applications",
    value: "Tracked",
    description: "Stay organized from saved to interview.",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    label: "Interview Prep",
    value: "AI-ready",
    description: "Generate role-specific practice plans.",
    accent: "from-orange-500 to-pink-500",
  },
];

const workflow = [
  {
    title: "Upload Resume",
    description: "Parse your resume and turn it into structured career data.",
    icon: FileText,
    href: "/resumes",
  },
  {
    title: "Add Job Description",
    description: "Save target jobs and extract the skills recruiters care about.",
    icon: BriefcaseBusiness,
    href: "/jobs",
  },
  {
    title: "Run ATS Score",
    description: "Find matching skills, missing keywords, and tailored fixes.",
    icon: FileSearch,
    href: "/analysis",
  },
  {
    title: "Track Application",
    description: "Manage application status, notes, and follow-up actions.",
    icon: BarChart3,
    href: "/applications",
  },
  {
    title: "Prepare Interview",
    description: "Practice technical, behavioral, and company-aware questions.",
    icon: MessageSquareText,
    href: "/interview-prep",
  },
  {
    title: "Build Roadmap",
    description: "Convert your gaps into a focused learning plan.",
    icon: GraduationCap,
    href: "/roadmap",
  },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 shadow-2xl shadow-slate-950/10">
          <div className="relative px-6 py-8 sm:px-8 lg:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.45),transparent_24rem),radial-gradient(circle_at_top_right,rgba(217,70,239,0.35),transparent_24rem),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.22),transparent_24rem)]" />

            <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <Badge className="mb-4 rounded-full border-white/15 bg-white/10 px-3 py-1 text-white hover:bg-white/10">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  AI-powered job search workspace
                </Badge>

                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Turn every job application into a smarter, stronger strategy.
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  Upload resumes, analyze job descriptions, generate reports,
                  prepare interviews, and build learning roadmaps from one clean
                  command center.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                    <Link href="/jobs/workspace">
                      Start job workspace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                    <Link href="/analysis">Run ATS analysis</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Product flow</p>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Live
                  </span>
                </div>

                <div className="space-y-3">
                  {["Resume", "Job Match", "ATS Report", "Interview", "Roadmap"].map(
                    (item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{item}</p>
                          <div className="mt-1 h-1.5 rounded-full bg-white/10">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-fuchsia-400"
                              style={{ width: `${92 - index * 10}%` }}
                            />
                          </div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="overflow-hidden rounded-3xl border-white/70 bg-white/85 shadow-xl shadow-slate-950/5 backdrop-blur">
              <div className={`h-1.5 bg-gradient-to-r ${stat.accent}`} />
              <CardHeader className="pb-3">
                <CardDescription className="font-semibold">{stat.label}</CardDescription>
                <CardTitle className="flex items-center justify-between text-2xl">
                  {stat.value}
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-500">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <Card className="rounded-[2rem] border-white/70 bg-white/90 shadow-xl shadow-slate-950/5 backdrop-blur">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-2xl">CareerPilot workflow</CardTitle>
                <CardDescription>
                  A simple step-by-step system to improve every application.
                </CardDescription>
              </div>

              <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
                <Zap className="mr-2 h-3.5 w-3.5" />
                Portfolio-ready flow
              </Badge>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {workflow.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/10"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          Step {index + 1}
                        </span>
                      </div>

                      <h2 className="font-bold text-slate-950">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>

                      <div className="mt-4 flex items-center text-sm font-semibold text-blue-600">
                        Open
                        <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
