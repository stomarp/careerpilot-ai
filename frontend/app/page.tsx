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
  Star,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Analyze resumes",
    description: "Upload your resume and compare it against real job descriptions.",
    icon: FileSearch,
    accent: "from-blue-500 to-cyan-500",
  },
  {
    title: "Track applications",
    description: "Manage job applications, statuses, notes, follow-ups, and reports.",
    icon: BriefcaseBusiness,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    title: "Prepare interviews",
    description: "Generate company-aware interview questions and learning roadmaps.",
    icon: MessageSquareText,
    accent: "from-violet-500 to-fuchsia-500",
  },
];

const flow = ["Resume", "Job Match", "ATS Report", "Interview", "Roadmap"];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_30rem),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_30rem),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_30rem)]" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-950/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-black leading-none">CareerPilot AI</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Job search command center
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="rounded-2xl">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            AI-powered career workspace
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
            Your job search, upgraded into a smart command center.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            CareerPilot AI helps you upload resumes, analyze ATS fit, track job
            applications, generate interview prep, and build learning roadmaps
            from one polished workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-2xl bg-slate-950 px-6 text-white shadow-xl shadow-slate-950/15 hover:bg-slate-800">
              <Link href="/register">
                Start free workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="rounded-2xl border-slate-200 bg-white/80 px-6 shadow-sm backdrop-blur hover:bg-white">
              <Link href="/login">Log in</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            {["Resume parsing", "ATS scoring", "Interview prep", "Learning roadmap"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-8 -right-4 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-5 shadow-2xl shadow-slate-950/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.45),transparent_22rem),radial-gradient(circle_at_top_right,rgba(217,70,239,0.32),transparent_22rem),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.2),transparent_22rem)]" />

            <div className="relative rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">Application Score</p>
                  <p className="text-xs text-slate-300">Software Engineer, New Grad</p>
                </div>
                <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                  Live
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[0.75fr_1.25fr]">
                <div className="rounded-3xl bg-white p-5 text-slate-950">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    ATS Match
                  </p>
                  <p className="mt-3 text-5xl font-black">84%</p>
                  <div className="mt-4 h-2 rounded-full bg-slate-100">
                    <div className="h-2 w-[84%] rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  {flow.map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{item}</p>
                        <div className="mt-1 h-1.5 rounded-full bg-white/10">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-fuchsia-400"
                            style={{ width: `${94 - index * 10}%` }}
                          />
                        </div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Reports", value: "Ready", icon: BarChart3 },
                { label: "Resume", value: "Parsed", icon: FileText },
                { label: "Roadmap", value: "Built", icon: GraduationCap },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <Icon className="h-5 w-5 text-blue-200" />
                    <p className="mt-3 text-xs text-slate-300">{item.label}</p>
                    <p className="text-sm font-bold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
              <Zap className="h-3.5 w-3.5" />
              Built for job seekers
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Everything you need before you apply.
            </h2>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Portfolio-ready full-stack product
          </div>
        </div>

        <div className="grid w-full gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="group overflow-hidden rounded-3xl border-white/70 bg-white/90 text-left shadow-xl shadow-slate-950/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10">
                <div className={`h-1.5 bg-gradient-to-r ${feature.accent}`} />
                <CardContent className="p-6">
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-white shadow-lg shadow-slate-950/10`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-black text-slate-950">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>

                  <div className="mt-5 flex items-center text-sm font-bold text-blue-600">
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
