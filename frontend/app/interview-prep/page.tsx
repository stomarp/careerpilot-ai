"use client";

import Link from "next/link";
import {
  useMemo,
  useState } from "react";import {  ArrowRight,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  Code2,
  Gauge,
  MessageSquareText,
  Mic,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Target,
  Timer,
  Wand2,
  Download
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
import { Textarea } from "@/components/ui/textarea";

type BackendInterviewQuestion = {
  question: string;
  difficulty: string;
  source_style: string;
  practice_priority: string;
  what_interviewer_is_testing: string;
  answer_hint: string;
};

type BackendInterviewQuestionSet = {
  category: string;
  why_this_category_matters: string;
  questions: BackendInterviewQuestion[];
};

type BackendCompanyPrepInsight = {
  area: string;
  guidance: string;
};

type BackendInterviewResponse = {
  target_role: string;
  company_name: string | null;
  role_type: string;
  industry: string;
  experience_level: string;
  provider_used: string;
  fallback_used: boolean;
  question_sets: BackendInterviewQuestionSet[];
  company_prep: BackendCompanyPrepInsight[];
  preparation_tips: string[];
  focus_areas: string[];
};

type QuestionCategory = "Role fit" | "Technical" | "Behavioral" | "Project" | "System design";

type PracticeQuestion = {
  id: string;
  category: QuestionCategory;
  question: string;
  whyItMatters: string;
};

type PracticeSession = {
  title: string;
  company: string;
  difficulty: string;
  interviewType: string;
  createdAt: string;
  questions: PracticeQuestion[];
};

const focusOptions = [
  "Backend APIs",
  "Databases",
  "System Design",
  "Behavioral",
  "Projects",
  "Testing",
  "Deployment",
  "AI Product",
];

const answerFramework = [
  "Start with the user problem.",
  "Explain your technical decision.",
  "Describe the implementation.",
  "Mention tradeoffs, bugs, or constraints.",
  "End with measurable impact or next improvement.",
];

function buildQuestions({
  jobTitle,
  company,
  interviewType,
  difficulty,
  selectedFocus,
  questionCount,
  jobDescription,
  resumeContext,
}: {
  jobTitle: string;
  company: string;
  interviewType: string;
  difficulty: string;
  selectedFocus: string[];
  questionCount: number;
  jobDescription: string;
  resumeContext: string;
}): PracticeQuestion[] {
  const role = jobTitle || "Software Engineer";
  const org = company || "the company";
  const hasJobContext = jobDescription.trim().length > 40;
  const hasResumeContext = resumeContext.trim().length > 40;

  const roleFit: PracticeQuestion[] = [
    {
      id: "role-1",
      category: "Role fit",
      question: `Why are you interested in the ${role} role at ${org}?`,
      whyItMatters: "Tests motivation, company fit, and role understanding.",
    },
    {
      id: "role-2",
      category: "Role fit",
      question: `Walk me through the most relevant project on your resume for this ${role} role.`,
      whyItMatters: "Checks whether your project story maps to the job.",
    },
    {
      id: "role-3",
      category: "Role fit",
      question: hasJobContext
        ? `Based on this job description, which requirement are you strongest in and which one needs work?`
        : `Which technical gap would you improve first before interviewing for ${org}?`,
      whyItMatters: "Shows self-awareness and job-description understanding.",
    },
  ];

  const technical: PracticeQuestion[] = [
    {
      id: "tech-1",
      category: "Technical",
      question: "Explain how you designed the FastAPI backend and database models for CareerCopilot AI.",
      whyItMatters: "Tests backend architecture and data modeling clarity.",
    },
    {
      id: "tech-2",
      category: "Technical",
      question: "How would you test the resume parsing, ATS analysis, and application tracking APIs?",
      whyItMatters: "Shows engineering quality and testing mindset.",
    },
    {
      id: "tech-3",
      category: "Technical",
      question: "How would you improve the ATS scoring system if this product had thousands of users?",
      whyItMatters: "Tests scalability, ranking logic, and product thinking.",
    },
    {
      id: "tech-4",
      category: "Technical",
      question: "How would you design authentication and user-specific authorization for this product?",
      whyItMatters: "Checks production-readiness thinking.",
    },
  ];

  const systemDesign: PracticeQuestion[] = [
    {
      id: "system-1",
      category: "System design",
      question: "Design a scalable version of CareerCopilot AI for thousands of users uploading resumes and jobs.",
      whyItMatters: "Tests API, storage, queues, database, and scaling decisions.",
    },
    {
      id: "system-2",
      category: "System design",
      question: "How would you add background jobs for resume parsing and report generation?",
      whyItMatters: "Checks async processing and reliability thinking.",
    },
    {
      id: "system-3",
      category: "System design",
      question: "How would you monitor failures in resume parsing, AI report generation, and application updates?",
      whyItMatters: "Tests observability and operational maturity.",
    },
  ];

  const behavioral: PracticeQuestion[] = [
    {
      id: "beh-1",
      category: "Behavioral",
      question: "Tell me about a time you built something complex from scratch.",
      whyItMatters: "Tests ownership and execution.",
    },
    {
      id: "beh-2",
      category: "Behavioral",
      question: "How did you handle bugs or blockers while building CareerCopilot AI?",
      whyItMatters: "Shows debugging and persistence.",
    },
    {
      id: "beh-3",
      category: "Behavioral",
      question: "How do you prioritize product features when building under time pressure?",
      whyItMatters: "Shows product judgment.",
    },
  ];

  const project: PracticeQuestion[] = [
    {
      id: "project-1",
      category: "Project",
      question: "Why did you choose FastAPI, PostgreSQL, Docker, Next.js, and TypeScript?",
      whyItMatters: "Tests technical decision-making.",
    },
    {
      id: "project-2",
      category: "Project",
      question: "What part of CareerCopilot AI are you most proud of?",
      whyItMatters: "Helps you explain impact confidently.",
    },
    {
      id: "project-3",
      category: "Project",
      question: hasResumeContext
        ? "Which resume bullet best proves your CareerCopilot AI work, and how would you defend it?"
        : "How would you explain CareerCopilot AI to a non-technical recruiter?",
      whyItMatters: "Tests resume/project storytelling.",
    },
  ];

  const focusGenerated: PracticeQuestion[] = selectedFocus.map((focus, index) => ({
    id: `focus-${index}`,
    category:
      focus === "System Design"
        ? "System design"
        : focus === "Behavioral"
        ? "Behavioral"
        : focus === "Projects"
        ? "Project"
        : "Technical",
    question: `How would you demonstrate ${focus.toLowerCase()} experience for this ${role} interview?`,
    whyItMatters: `Connects your ${focus.toLowerCase()} practice directly to the target role.`,
  }));

  let bank: PracticeQuestion[] = [];

  if (interviewType === "technical") {
    bank = [...roleFit, ...technical, ...systemDesign, ...focusGenerated];
  } else if (interviewType === "behavioral") {
    bank = [...roleFit, ...behavioral, ...project, ...focusGenerated];
  } else if (interviewType === "project") {
    bank = [...roleFit, ...project, ...technical, ...focusGenerated];
  } else {
    bank = [
      ...roleFit,
      ...technical,
      ...behavioral,
      ...project,
      ...systemDesign,
      ...focusGenerated,
    ];
  }

  if (difficulty === "faang") {
    bank = [
      {
        id: "faang-1",
        category: "System design",
        question: `Design an AI-powered career platform like CareerCopilot AI for 1 million users.`,
        whyItMatters: "FAANG-style system design depth.",
      },
      ...bank,
    ];
  }

  return bank.slice(0, questionCount);
}

function getDifficultyLabel(value: string) {
  const labels: Record<string, string> = {
    beginner: "Beginner",
    normal: "Normal",
    challenging: "Challenging",
    faang: "FAANG-style",
  };

  return labels[value] ?? value;
}

function analyzeAnswer(answer: string) {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const lower = answer.toLowerCase();

  const fillerPatterns = ["um", "like", "actually", "basically", "you know", "sort of", "kind of"];
  const fillerCount = fillerPatterns.reduce(
    (total, filler) => total + (lower.includes(filler) ? 1 : 0),
    0
  );

  let clarity = 5;
  if (words.length >= 60) clarity += 1;
  if (lower.includes("problem") || lower.includes("user")) clarity += 1;
  if (lower.includes("built") || lower.includes("designed") || lower.includes("implemented")) clarity += 1;
  if (lower.includes("impact") || lower.includes("improve") || lower.includes("result")) clarity += 1;
  if (fillerCount === 0) clarity += 1;

  const estimatedSeconds = Math.max(15, Math.round(words.length / 2));
  const readiness = Math.min(95, Math.max(45, clarity * 10 - fillerCount * 4));

  return {
    wordCount: words.length,
    estimatedSeconds,
    fillerCount,
    clarity: Math.min(10, clarity),
    readiness,
  };
}

export default function InterviewPrepPage() {
  const [jobTitle, setJobTitle] = useState("AI Software Engineer");
  const [company, setCompany] = useState("OpenAI");
  const [roleType, setRoleType] = useState("ai_engineer");
  const [interviewType, setInterviewType] = useState("mixed");
  const [difficulty, setDifficulty] = useState("challenging");
  const [questionCount, setQuestionCount] = useState("9");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    "Backend APIs",
    "System Design",
    "AI Product",
    "Testing",
    "Deployment",
  ]);
  const [jobDescription, setJobDescription] = useState(
    "Backend and AI-focused role requiring API design, distributed systems, testing, cloud deployment, and AI product thinking."
  );
  const [resumeContext, setResumeContext] = useState(
    "CareerCopilot AI: FastAPI, PostgreSQL, Docker, Next.js, TypeScript, ATS analysis, resume parsing, application tracking, backend tests."
  );
  const [answerDraft, setAnswerDraft] = useState(
    "I built CareerCopilot AI to solve the problem of managing resumes, job descriptions, ATS analysis, and application tracking in one workflow. I used FastAPI for backend APIs, PostgreSQL for persistence, Docker for local services, and Next.js with TypeScript for the product interface."
  );
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [aiResponse, setAiResponse] = useState<BackendInterviewResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const previewQuestions = useMemo(
    () =>
      buildQuestions({
        jobTitle,
        company,
        interviewType,
        difficulty,
        selectedFocus,
        questionCount: Number(questionCount),
        jobDescription,
        resumeContext,
      }),
    [
      jobTitle,
      company,
      interviewType,
      difficulty,
      selectedFocus,
      questionCount,
      jobDescription,
      resumeContext,
    ]
  );

  const aiQuestions: PracticeQuestion[] = useMemo(() => {
    if (!aiResponse) return [];

    return aiResponse.question_sets.flatMap((set, setIndex) =>
      set.questions.map((question, questionIndex) => ({
        id: `ai-${setIndex}-${questionIndex}`,
        category:
          set.category.toLowerCase().includes("behavior")
            ? "Behavioral"
            : set.category.toLowerCase().includes("system")
            ? "System design"
            : set.category.toLowerCase().includes("project")
            ? "Project"
            : set.category.toLowerCase().includes("role")
            ? "Role fit"
            : "Technical",
        question: question.question,
        whyItMatters:
          question.what_interviewer_is_testing ||
          question.answer_hint ||
          set.why_this_category_matters,
      }))
    );
  }, [aiResponse]);

  const activeQuestions = aiQuestions.length
    ? aiQuestions
    : session?.questions ?? previewQuestions;
  const currentQuestion =
    activeQuestions[currentQuestionIndex] ?? activeQuestions[0];

  const answerStats = useMemo(() => analyzeAnswer(answerDraft), [answerDraft]);

  function toggleFocus(focus: string) {
    setSelectedFocus((current) =>
      current.includes(focus)
        ? current.filter((item) => item !== focus)
        : [...current, focus]
    );
  }

  async function generateInterview() {
    setIsGenerating(true);
    setError("");

    try {
      const response = await api.post<BackendInterviewResponse>(
        "/interview/questions",
        {
          target_role: jobTitle || "Software Engineer",
          company_name: company || null,
          role_type: roleType,
          industry: "technology",
          experience_level: "entry_level",
          question_count: Number(questionCount),
          question_style:
            interviewType === "mixed"
              ? "company_and_role_pattern"
              : interviewType,
          include_company_prep: true,
          include_platform_patterns: true,
          difficulty,
          job_description_text: jobDescription,
          resume_context: resumeContext,
          focus_areas: selectedFocus,
        }
      );

      setAiResponse(response.data);

      const fallbackQuestions = buildQuestions({
        jobTitle,
        company,
        interviewType,
        difficulty,
        selectedFocus,
        questionCount: Number(questionCount),
        jobDescription,
        resumeContext,
      });

      setSession({
        title: response.data.target_role,
        company: response.data.company_name || company || "Target company",
        difficulty,
        interviewType,
        createdAt: new Date().toISOString(),
        questions: fallbackQuestions,
      });

      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error(err);
      setError(
        "AI generation failed. Check that backend is running and Gemini/OpenAI config is available. Showing local preview instead."
      );

      const questions = buildQuestions({
        jobTitle,
        company,
        interviewType,
        difficulty,
        selectedFocus,
        questionCount: Number(questionCount),
        jobDescription,
        resumeContext,
      });

      setSession({
        title: jobTitle || "Software Engineer",
        company: company || "Target company",
        difficulty,
        interviewType,
        createdAt: new Date().toISOString(),
        questions,
      });

      setAiResponse(null);
      setCurrentQuestionIndex(0);
    } finally {
      setIsGenerating(false);
    }
  }

  function loadAiEngineerPreset() {
    setJobTitle("AI Software Engineer");
    setCompany("OpenAI");
    setInterviewType("mixed");
    setDifficulty("challenging");
    setQuestionCount("9");
    setSelectedFocus([
      "Backend APIs",
      "System Design",
      "AI Product",
      "Testing",
      "Deployment",
    ]);
    setJobDescription(
      "AI Software Engineer role focused on backend APIs, LLM-powered product features, system design, reliable services, testing, deployment, and AI product thinking."
    );
    setResumeContext(
      "CareerCopilot AI: full-stack AI career platform using FastAPI, PostgreSQL, Docker, Next.js, TypeScript, resume parsing, ATS analysis, application pipeline, reports, and backend tests."
    );
  }

  return (
    <AppShell>
      <div className="cc-product-page space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" asChild className="cc-cta-secondary">
            <Link href="/export-center?type=interview">
              <Download className="mr-2 h-4 w-4" />
              Export interview prep
            </Link>
          </Button>
        </div>
        <div className="cc-page-hero-visual p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                Interview Coach
              </Badge>
              <h1 className="cc-gradient-title text-3xl font-black tracking-tight sm:text-4xl">
                Generate a custom interview practice session
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Build a role-specific mock interview from your target company,
                job description, resume context, difficulty, and focus areas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild className="cc-cta-secondary">
                <Link href="/reports">Back to Reports</Link>
              </Button>
              <Button asChild className="cc-cta-primary">
                <Link href="/roadmap">
                  Build Roadmap
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {aiResponse ? (
          <Card className="border-primary/20 bg-muted/20">
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">AI interview generated</p>
                <p className="text-sm text-muted-foreground">
                  Provider: {aiResponse.provider_used}
                  {aiResponse.fallback_used ? " • Smart Practice Mode" : " • AI Generated"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiResponse.focus_areas.slice(0, 5).map((area) => (
                  <Badge key={area} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="cc-product-card-static border-primary/20">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border bg-muted/30 p-3">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Interview generator</CardTitle>
                  <CardDescription>
                    Customize the role, company, context, and question style.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Job title</Label>
                  <Input
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="e.g. Backend Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="e.g. Visa, Amazon, OpenAI"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role category for AI generation</Label>
                <Select value={roleType} onValueChange={setRoleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_engineer">AI Engineer</SelectItem>
                    <SelectItem value="backend_engineer">Backend Engineer</SelectItem>
                    <SelectItem value="software_engineer">Software Engineer</SelectItem>
                    <SelectItem value="data_analyst">Data Analyst</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Interview type</Label>
                  <Select value={interviewType} onValueChange={setInterviewType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed interview</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="project">Project deep dive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                      <SelectItem value="faang">FAANG-style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Questions</Label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 questions</SelectItem>
                      <SelectItem value="9">9 questions</SelectItem>
                      <SelectItem value="12">12 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Focus areas</Label>
                <div className="flex flex-wrap gap-2">
                  {focusOptions.map((focus) => (
                    <Button
                      key={focus}
                      type="button"
                      size="sm"
                      variant={
                        selectedFocus.includes(focus) ? "default" : "outline"
                      }
                      onClick={() => toggleFocus(focus)}
                    >
                      {focus}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Job description context</Label>
                <Textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  rows={4}
                  placeholder="Paste important job requirements..."
                />
              </div>

              <div className="space-y-2">
                <Label>Resume / project context</Label>
                <Textarea
                  value={resumeContext}
                  onChange={(event) => setResumeContext(event.target.value)}
                  rows={4}
                  placeholder="Paste your resume/project highlights..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={generateInterview} disabled={isGenerating}>
                  {isGenerating ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate interview"}
                </Button>

                <Button type="button" variant="outline" onClick={loadAiEngineerPreset}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  AI SWE preset
                </Button>

                {session ? (
                  <Button type="button" variant="outline" onClick={generateInterview} disabled={isGenerating}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                    Regenerate
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant={session ? "default" : "secondary"}>
                    {session ? "Active mock interview" : "Preview mode"}
                  </Badge>
                  <CardTitle className="mt-3">
                    {session
                      ? `${session.title} at ${session.company}`
                      : "Generate a session to start"}
                  </CardTitle>
                  <CardDescription>
                    {session
                      ? `${getDifficultyLabel(session.difficulty)} • ${activeQuestions.length} questions`
                      : "Your questions update as you customize the setup."}
                  </CardDescription>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p className="text-4xl font-bold">{answerStats.readiness}%</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-muted/20 p-5">
                <div className="flex gap-3">
                  <Sparkles className="mt-1 h-5 w-5 shrink-0" />
                  <p className="text-sm leading-7 text-muted-foreground">
                    {session
                      ? "Your mock interview is ready. Select any question, draft an answer, then use the coaching metrics to improve clarity, structure, and confidence."
                      : "Customize the role and click Generate Interview to create a real practice session."}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Words</p>
                  <p className="mt-2 text-3xl font-semibold">{answerStats.wordCount}</p>
                  <Badge className="mt-3" variant="secondary">
                    {answerStats.estimatedSeconds}s answer
                  </Badge>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Filler signals</p>
                  <p className="mt-2 text-3xl font-semibold">{answerStats.fillerCount}</p>
                  <Badge className="mt-3" variant="outline">
                    Lower is better
                  </Badge>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Answer clarity</p>
                  <p className="mt-2 text-3xl font-semibold">{answerStats.clarity}/10</p>
                  <Badge className="mt-3" variant="secondary">
                    Structure score
                  </Badge>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Target role</p>
                  <p className="mt-2 text-2xl font-semibold">{jobTitle || "Role"}</p>
                  <Badge className="mt-3" variant="secondary">
                    {company || "Company"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="cc-product-card-static border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border bg-muted/30 p-3">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>
                    {session ? "Generated interview session" : "Question preview"}
                  </CardTitle>
                  <CardDescription>
                    Select a question to practice. Regenerate when you change the setup.
                  </CardDescription>
                </div>
              </div>

              <Badge variant="outline">{activeQuestions.length} questions</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 lg:grid-cols-3">
              {activeQuestions.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`rounded-2xl border bg-background p-4 text-left transition hover:border-primary ${
                    currentQuestionIndex === index ? "border-primary shadow-sm" : ""
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge variant="secondary">Q{index + 1}</Badge>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  <p className="text-sm font-medium leading-7">{item.question}</p>
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {item.whyItMatters}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="cc-product-card-static">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <CardTitle>Practice answer workspace</CardTitle>
              </div>
              <CardDescription>
                Draft or paste an answer and improve it using the live coaching metrics.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Current question</p>
                  <Badge variant="outline">{currentQuestion?.category}</Badge>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {currentQuestion?.question}
                </p>
              </div>

              <Textarea
                value={answerDraft}
                onChange={(event) => setAnswerDraft(event.target.value)}
                rows={8}
                placeholder="Write your answer here..."
              />

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border p-3">
                  <Timer className="mb-2 h-4 w-4" />
                  <p className="text-sm font-medium">Target length</p>
                  <p className="text-xs text-muted-foreground">60–90 seconds</p>
                </div>

                <div className="rounded-xl border p-3">
                  <Gauge className="mb-2 h-4 w-4" />
                  <p className="text-sm font-medium">Answer structure</p>
                  <p className="text-xs text-muted-foreground">
                    Problem → Build → Impact
                  </p>
                </div>

                <div className="rounded-xl border p-3">
                  <Target className="mb-2 h-4 w-4" />
                  <p className="text-sm font-medium">Role match</p>
                  <p className="text-xs text-muted-foreground">
                    Tie back to {jobTitle || "role"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cc-product-card-static">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4" />
                <CardTitle>Answer coaching checklist</CardTitle>
              </div>
              <CardDescription>
                Use this structure before speaking your final answer.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {answerFramework.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-xl border p-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {aiResponse ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="cc-product-card-static">
              <CardHeader>
                <CardTitle>AI company prep</CardTitle>
                <CardDescription>
                  Company-aware preparation from the generated interview response.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiResponse.company_prep.length ? (
                  aiResponse.company_prep.map((item) => (
                    <div key={item.area} className="rounded-xl border bg-muted/20 p-3">
                      <p className="font-medium">{item.area}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.guidance}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No company prep returned.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="cc-product-card-static">
              <CardHeader>
                <CardTitle>AI preparation tips</CardTitle>
                <CardDescription>
                  What to practice before the interview.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiResponse.preparation_tips.map((tip, index) => (
                  <div key={tip} className="flex gap-3 rounded-xl border bg-muted/20 p-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <p className="text-sm leading-6 text-muted-foreground">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : null}

        <Card className="cc-product-card-static">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <CardTitle>Mock interview plan</CardTitle>
            </div>
            <CardDescription>
              A focused plan for preparing before applying or interviewing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                "Practice CareerCopilot project explanation in 90 seconds.",
                "Prepare one backend API design story.",
                "Prepare one debugging story from the Applications page.",
                "Practice one database schema design explanation.",
                "Prepare one testing/CI answer using pytest work.",
                "Record answers and improve clarity.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border bg-muted/20 p-3 text-sm leading-6"
                >
                  <CheckCircle2 className="mb-2 h-4 w-4" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={generateInterview} disabled={isGenerating}>
                {isGenerating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "Generate new mock interview"}
              </Button>
              <Button variant="outline" asChild className="cc-cta-secondary">
                <Link href="/roadmap">Turn gaps into roadmap</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
