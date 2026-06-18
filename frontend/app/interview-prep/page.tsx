"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  Building2,
  Code2,
  Layers3,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const companyPrep: Record<string, string[]> = {
  amazon: ["Leadership Principles stories", "Arrays/strings", "HashMap", "System design basics", "Ownership examples"],
  google: ["DSA depth", "Graphs/trees", "Dynamic programming basics", "Clean problem solving", "Scalability fundamentals"],
  meta: ["Fast coding rounds", "Product sense basics", "Trees/graphs", "System design tradeoffs", "Clear communication"],
  microsoft: ["OOP design", "Arrays/strings", "Behavioral examples", "API design", "Debugging stories"],
  visa: ["Backend APIs", "SQL/database design", "Reliability", "Security basics", "Java/Python fundamentals"],
};

export default function InterviewPrepPage() {
  const [company, setCompany] = useState("Visa");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("New Grad / Entry Level");
  const [jobText, setJobText] = useState("");

  const normalizedCompany = company.trim().toLowerCase();

  const generatedPrep = useMemo(() => {
    const topics =
      companyPrep[normalizedCompany] ??
      ["Arrays/strings", "HashMap", "SQL/API basics", "System design fundamentals", "Behavioral stories"];

    return {
      focus: topics,
      coding: [
        "Two Sum / HashMap pattern",
        "Longest substring / sliding window",
        "Merge intervals or meeting rooms",
        "Tree BFS/DFS traversal",
        "SQL join and aggregation question",
      ],
      systemDesign: [
        "Design a job application tracker",
        "Design a resume upload and parsing service",
        "Design notification/reminder system",
        "Discuss database schema, indexes, caching, and API rate limits",
      ],
      behavioral: [
        "Tell me about yourself in 90 seconds",
        "Describe a project you built end-to-end",
        "Tell me about a debugging challenge",
        "Tell me about a time you learned something quickly",
      ],
      projectTalk: [
        "Explain CareerPilot AI architecture: Next.js frontend, FastAPI backend, PostgreSQL database, Render/Vercel deployment.",
        "Explain auth, resume upload, ATS scoring, application tracker, and production CORS/debugging work.",
      ],
    };
  }, [normalizedCompany]);

  return (
    <AppShell>
      <main className="space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100">
                <Sparkles className="h-4 w-4" />
                AI Interview Prep Generator
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Generate focused interview prep for a specific company and role.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                Creates SWE-focused prep with coding patterns, system design, behavioral answers, and project talking points.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Prep inputs</CardTitle>
              <CardDescription>Keep it simple: company, role, level, and optional job description.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google, Visa, Amazon..." />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="New Grad / Entry Level" />
              </div>

              <div className="space-y-2">
                <Label>Job description or notes</Label>
                <Textarea
                  rows={6}
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Paste important JD keywords here. Example: Python, Java, SQL, REST APIs, distributed systems..."
                />
              </div>

              <Button className="w-full rounded-2xl">
                <Brain className="mr-2 h-4 w-4" />
                Generate prep
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-[2rem] border-blue-100 bg-blue-50/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Prep summary
                </CardTitle>
                <CardDescription>
                  {company || "Company"} • {role || "Role"} • {level || "Level"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-700">
                  Focus on clear problem solving, backend fundamentals, project explanation, and company-style preparation.
                  These are commonly practiced topic areas, not guaranteed interview questions.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <PrepCard icon={Building2} title="Company focus" items={generatedPrep.focus} />
              <PrepCard icon={Code2} title="Coding practice" items={generatedPrep.coding} />
              <PrepCard icon={Layers3} title="System design" items={generatedPrep.systemDesign} />
              <PrepCard icon={MessageSquareText} title="Behavioral + project" items={[...generatedPrep.behavioral, ...generatedPrep.projectTalk]} />
            </div>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function PrepCard({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border bg-white p-3 text-sm leading-6 text-slate-700">
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
