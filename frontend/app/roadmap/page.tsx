"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Code2, GraduationCap, Rocket, Sparkles } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RoadmapPage() {
  const [role, setRole] = useState("Software Engineer");
  const [company, setCompany] = useState("Visa");
  const [timeline, setTimeline] = useState("4 weeks");
  const [level, setLevel] = useState("Entry Level");
  const [gaps, setGaps] = useState("System design, SQL, caching, LeetCode, backend deployment");

  const plan = useMemo(
    () => [
      {
        week: "Week 1",
        title: "Core role foundation",
        tasks: [
          `Review ${role} job keywords and rewrite project bullets around them.`,
          "Practice arrays, strings, HashMap, two pointers, and sliding window.",
          "Prepare 90-second CareerPilot AI project explanation.",
        ],
      },
      {
        week: "Week 2",
        title: "Backend + database strength",
        tasks: [
          "Practice REST API design, authentication, validation, and error handling.",
          "Review SQL joins, indexes, schema design, and query optimization.",
          "Add one measurable backend impact point to resume.",
        ],
      },
      {
        week: "Week 3",
        title: "System design + project polish",
        tasks: [
          "Design resume upload/parser, application tracker, and notification system.",
          "Practice caching, rate limits, queues, and database tradeoffs.",
          "Polish GitHub README with architecture and live demo link.",
        ],
      },
      {
        week: "Week 4",
        title: "Interview-ready final prep",
        tasks: [
          `Prepare company-specific talking points for ${company}.`,
          "Practice behavioral stories: ownership, debugging, learning quickly, teamwork.",
          "Do 2 mock interviews and revise weak answers.",
        ],
      },
      ...(timeline === "6 weeks" || timeline === "8 weeks" || timeline === "3 months" || timeline === "6 months"
        ? [{
            week: "Weeks 5-6",
            title: "Company-specific practice",
            tasks: [
              "Practice company-style LeetCode patterns and SQL questions.",
              "Write 3 STAR stories for project ownership, debugging, and learning quickly.",
              "Improve CareerPilot AI README with screenshots, architecture, and demo link.",
            ],
          }]
        : []),
      ...(timeline === "8 weeks" || timeline === "3 months" || timeline === "6 months"
        ? [{
            week: "Weeks 7-8",
            title: "Advanced backend readiness",
            tasks: [
              "Practice caching, queues, rate limiting, and API scalability.",
              "Prepare one system design story based on CareerPilot AI.",
              "Complete 10 targeted LeetCode problems and review mistakes.",
            ],
          }]
        : []),
      ...(timeline === "3 months" || timeline === "6 months"
        ? [{
            week: "Month 3",
            title: "Interview loop preparation",
            tasks: [
              "Do weekly mock interviews for coding, system design, and behavioral rounds.",
              "Apply to 30-40 targeted roles with tailored resume bullets.",
              "Track responses and follow-ups in the application tracker.",
            ],
          }]
        : []),
      ...(timeline === "6 months"
        ? [{
            week: "Months 4-6",
            title: "Portfolio and market strength",
            tasks: [
              "Build 1-2 smaller end-to-end projects with real users/use cases.",
              "Add deeper AI features, file limits, and job-link extraction to CareerPilot AI.",
              "Prepare for mid-level style backend/system design interviews.",
            ],
          }]
        : []),
    ],
    [role, company, timeline]
  );

  return (
    <AppShell>
      <main className="space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100">
            <Sparkles className="h-4 w-4" />
            AI Roadmap Generator
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Turn skill gaps into a clear weekly job-prep plan.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Generate a focused roadmap for coding, backend, system design, resume polish, and interview readiness.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Roadmap inputs</CardTitle>
              <CardDescription>Simple inputs. Clear output. No clutter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target role</Label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target company</Label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Experience level</Label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option>New Grad</option>
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Timeline</Label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option>4 weeks</option>
                    <option>6 weeks</option>
                    <option>8 weeks</option>
                    <option>3 months</option>
                    <option>6 months</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Missing skills / focus areas</Label>
                <Textarea rows={5} value={gaps} onChange={(e) => setGaps(e.target.value)} />
              </div>

              <Button className="w-full rounded-2xl">
                <Rocket className="mr-2 h-4 w-4" />
                Generate roadmap
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-[2rem] border-emerald-100 bg-emerald-50/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Generated roadmap
                </CardTitle>
                <CardDescription>
                  {role} • {company} • {level} • {timeline}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-700">
                  Focus areas: {gaps || "Add missing skills to generate a targeted plan."}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {plan.map((week) => (
                <Card key={week.week} className="rounded-[2rem]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarDays className="h-5 w-5" />
                      {week.week}: {week.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {week.tasks.map((task) => (
                      <div key={task} className="flex gap-3 rounded-2xl border bg-white p-3 text-sm leading-6 text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-[2rem]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Code2 className="h-5 w-5" />
                  Coding checklist
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                {["Arrays/Strings", "HashMap", "Two Pointers", "Sliding Window", "Trees BFS/DFS", "SQL", "API Design", "Basic System Design"].map((item) => (
                  <div key={item} className="rounded-2xl border bg-white p-3 text-sm font-medium text-slate-700">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
