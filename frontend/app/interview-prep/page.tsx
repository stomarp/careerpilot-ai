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

const companyPrep: Record<string, { focus: string[]; leetcode: string[]; systemDesign: string[] }> = {
  amazon: {
    focus: ["Leadership Principles", "Ownership", "Backend services", "Scalability", "Operational excellence"],
    leetcode: ["Two Sum", "LRU Cache", "Merge Intervals", "Number of Islands", "Top K Frequent Elements"],
    systemDesign: ["Design an order tracking system", "Design a notification service", "Design a rate limiter"],
  },
  google: {
    focus: ["Problem solving depth", "Graphs/trees", "Clean code", "Scalability", "Tradeoff explanation"],
    leetcode: ["Longest Substring Without Repeating Characters", "Word Ladder", "Course Schedule", "Binary Tree Maximum Path Sum", "Merge K Sorted Lists"],
    systemDesign: ["Design Google Drive", "Design autocomplete", "Design a URL shortener"],
  },
  meta: {
    focus: ["Fast coding rounds", "Trees/graphs", "Product thinking", "Clear communication", "System tradeoffs"],
    leetcode: ["Valid Palindrome", "Subarray Sum Equals K", "Lowest Common Ancestor", "Clone Graph", "Random Pick with Weight"],
    systemDesign: ["Design news feed", "Design Messenger", "Design Instagram stories"],
  },
  microsoft: {
    focus: ["OOP design", "Debugging", "API design", "Behavioral examples", "Collaboration"],
    leetcode: ["Reverse Linked List", "Merge Two Sorted Lists", "Design Parking Lot", "Binary Tree Level Order Traversal", "Meeting Rooms II"],
    systemDesign: ["Design Teams chat", "Design file sync", "Design calendar scheduling"],
  },
  visa: {
    focus: ["Backend APIs", "SQL/database design", "Reliability", "Security basics", "Java/Python fundamentals"],
    leetcode: ["Two Sum", "Valid Parentheses", "Group Anagrams", "Product of Array Except Self", "Top K Frequent Elements"],
    systemDesign: ["Design payment transaction tracker", "Design fraud alert service", "Design secure API gateway"],
  },
};

const levelGuidance: Record<string, string[]> = {
  "New Grad": ["DSA fundamentals", "OOP basics", "SQL basics", "Resume project explanation", "Behavioral STAR answers"],
  "Entry Level": ["Clean coding", "API basics", "Database CRUD", "Testing/debugging stories", "Project ownership"],
  "Mid Level": ["System design basics", "API scalability", "Database indexes", "Production debugging", "Cross-team collaboration"],
  "Senior": ["Architecture tradeoffs", "Mentorship", "Reliability", "Distributed systems", "Technical leadership"],
};

export default function InterviewPrepPage() {
  const [company, setCompany] = useState("Visa");
  const [role, setRole] = useState("Software Engineer");
  const [level, setLevel] = useState("Entry Level");
  const [jobText, setJobText] = useState("");

  const normalizedCompany = company.trim().toLowerCase();

  const generatedPrep = useMemo(() => {
    const companyBank =
      companyPrep[normalizedCompany] ??
      {
        focus: ["DSA fundamentals", "Backend APIs", "SQL/API basics", "System design fundamentals", "Behavioral stories"],
        leetcode: ["Two Sum", "Longest Substring Without Repeating Characters", "Merge Intervals", "Binary Tree Level Order Traversal", "Top K Frequent Elements"],
        systemDesign: ["Design a job application tracker", "Design a resume upload and parsing service", "Design notification/reminder system"],
      };

    return {
      focus: [...companyBank.focus, ...(levelGuidance[level] ?? [])].slice(0, 8),
      coding: companyBank.leetcode,
      systemDesign: companyBank.systemDesign,
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
  }, [normalizedCompany, level]);

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
                  These are commonly practiced and reported company-style topic areas, not guaranteed interview questions.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <PrepCard icon={Building2} title="Company focus" items={generatedPrep.focus} />
              <PrepCard icon={Code2} title="Company-style LeetCode practice" items={generatedPrep.coding} />
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
