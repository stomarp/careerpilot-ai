import Link from "next/link";
import { ArrowRight, BarChart3, BriefcaseBusiness, FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Analyze resumes",
    description: "Upload your resume and compare it against real job descriptions.",
    icon: FileText,
  },
  {
    title: "Track applications",
    description: "Manage job applications, statuses, notes, follow-ups, and reports.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Prepare interviews",
    description: "Generate company-aware interview questions and learning roadmaps.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          AI-powered career workspace
        </div>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          Your AI copilot for resumes, jobs, interviews, and career growth.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          CareerCopilot AI helps you upload resumes, analyze ATS fit, track job
          applications, generate interview prep, and build learning roadmaps.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="/login">Log in</Link>
          </Button>
        </div>

        <div className="mt-14 grid w-full gap-4 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="text-left">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h2 className="font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
