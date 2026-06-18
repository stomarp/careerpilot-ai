"use client";

import Link from "next/link";
import {
  useMemo,
  useState } from "react";import {  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Code2,
  Database,
  Layers3,
  Loader2,
  RefreshCw,
  Rocket,
  Server,
  Sparkles,
  Target,
  Trophy,
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

type TrackKey =
  | "ai_engineer"
  | "backend_engineer"
  | "software_engineer"
  | "data_analyst"
  | "marketing"
  | "finance"
  | "hr"
  | "teacher"
  | "general";

type RoadmapTab = "overview" | "weekly" | "daily" | "projects" | "actions";

type LearningRoadmapResponse = {
  target_role: string;
  role_type: string;
  industry: string;
  experience_level: string;
  timeline_days: number;
  provider_used: string;
  fallback_used: boolean;
  overview: {
    summary: string;
    readiness_level: string;
    target_outcome: string;
  };
  skill_gap_summary: {
    category: string;
    priority: string;
    skills: string[];
    why_it_matters: string;
  }[];
  priority_skills: {
    skill: string;
    priority: string;
    reason: string;
  }[];
  weekly_plan: {
    week: number;
    theme: string;
    goals: string[];
    success_criteria: string[];
  }[];
  roadmap: {
    day: number;
    week: number;
    focus: string;
    tasks: string[];
    deliverable: string;
    estimated_time: string;
  }[];
  mini_projects: {
    title: string;
    difficulty: string;
    description: string;
    why_it_matters: string;
    skills_practiced: string[];
    implementation_steps: string[];
    resume_bullet_templates: string[];
  }[];
  resume_actions: string[];
  interview_prep_actions: string[];
  study_topics: string[];
  progress_checkpoints: {
    checkpoint_day: number;
    questions_to_answer: string[];
    expected_output: string;
  }[];
  final_advice: string[];
};

const trackOptions: { value: TrackKey; label: string; targetRole: string }[] = [
  { value: "ai_engineer", label: "AI Engineer", targetRole: "AI Software Engineer" },
  { value: "backend_engineer", label: "Backend Engineer", targetRole: "Backend Engineer" },
  { value: "software_engineer", label: "Software Engineer", targetRole: "Software Engineer" },
  { value: "data_analyst", label: "Data Analyst", targetRole: "Data Analyst" },
  { value: "marketing", label: "Marketing", targetRole: "Marketing Specialist" },
  { value: "finance", label: "Finance", targetRole: "Financial Analyst" },
  { value: "hr", label: "HR", targetRole: "HR Specialist" },
  { value: "teacher", label: "Teacher", targetRole: "Computer Science Teacher" },
  { value: "general", label: "General", targetRole: "Professional Role" },
];

const roadmapTabs: { value: RoadmapTab; label: string; description: string }[] = [
  { value: "overview", label: "Overview", description: "Readiness, gaps, and target skills" },
  { value: "weekly", label: "Weekly Plan", description: "Week-by-week learning roadmap" },
  { value: "daily", label: "Daily Plan", description: "Concrete daily tasks" },
  { value: "projects", label: "Projects", description: "Portfolio proof to build" },
  { value: "actions", label: "Actions", description: "Resume and interview next steps" },
];

const focusOptions = [
  "DSA",
  "System Design",
  "Projects",
  "Deployment",
  "Testing",
  "AI/LLM",
  "Databases",
  "Interview Prep",
];

const localTopicsByRole: Record<TrackKey, string[]> = {
  ai_engineer: [
    "Prompt engineering",
    "Embeddings",
    "RAG",
    "Vector databases",
    "LLM evaluation",
    "AI agents",
    "AI system design",
  ],
  backend_engineer: [
    "REST API design",
    "PostgreSQL",
    "Caching",
    "Testing",
    "Authentication",
    "System design",
    "Deployment",
  ],
  software_engineer: ["DSA", "OOP", "Testing", "System design", "Clean code", "Projects"],
  data_analyst: ["SQL", "Dashboards", "Metrics", "Excel", "Data cleaning"],
  marketing: ["SEO", "Campaigns", "Analytics", "A/B testing", "Content"],
  finance: ["Financial modeling", "Forecasting", "Budgeting", "Reporting"],
  hr: ["Recruiting", "Onboarding", "Compliance", "Employee relations"],
  teacher: ["Lesson planning", "Assessment", "Classroom management"],
  general: ["Communication", "Problem solving", "Documentation", "Projects"],
};

const dsaTopics = [
  "Arrays and strings",
  "Hash maps and sets",
  "Two pointers",
  "Sliding window",
  "Stacks and queues",
  "Trees BFS/DFS",
  "Graphs basics",
  "Dynamic programming basics",
];

const systemTopics = [
  "REST API design",
  "Authentication",
  "Rate limiting",
  "Caching",
  "Background jobs",
  "Database indexing",
  "Observability",
  "Scalability",
];

const previewMiniProjects = [
  {
    title: "CareerPilot AI roadmap generator",
    difficulty: "medium",
    description:
      "Connect roadmap inputs to AI output and turn missing skills into weekly, daily, and project-based study plans.",
    why_it_matters:
      "Shows AI product thinking, backend integration, and user workflow design.",
  },
  {
    title: "Interview Prep AI generator",
    difficulty: "medium",
    description:
      "Generate role-specific interview questions, company prep, and answer coaching from target role and project context.",
    why_it_matters:
      "Proves practical AI workflow design beyond a basic chatbot.",
  },
  {
    title: "Backend tests and CI proof",
    difficulty: "easy",
    description:
      "Add backend tests for application workflow and API behavior, then document passing test results.",
    why_it_matters:
      "Shows production-readiness and engineering quality.",
  },
];

function getTrackLabel(value: TrackKey) {
  return trackOptions.find((item) => item.value === value)?.label ?? value;
}

function getTargetRole(value: TrackKey) {
  return trackOptions.find((item) => item.value === value)?.targetRole ?? "Software Engineer";
}

function buildLocalWeeklyPlan(roleType: TrackKey, weeks: number, focusAreas: string[]) {
  return Array.from({ length: weeks }, (_, index) => {
    const dsa = dsaTopics[index % dsaTopics.length];
    const system = systemTopics[index % systemTopics.length];
    const domain = localTopicsByRole[roleType][index % localTopicsByRole[roleType].length];

    const goals = [
      focusAreas.includes("DSA") ? `Practice ${dsa}` : null,
      focusAreas.includes("System Design") ? `Study ${system}` : null,
      focusAreas.includes("AI/LLM") ? `Build notes for ${domain}` : null,
      focusAreas.includes("Projects") ? "Add one visible CareerPilot project improvement" : null,
      focusAreas.includes("Testing") ? "Add or improve backend/frontend tests" : null,
      focusAreas.includes("Deployment") ? "Document deployment-readiness proof" : null,
    ].filter(Boolean) as string[];

    return {
      week: index + 1,
      theme:
        index % 4 === 0
          ? "Foundation"
          : index % 4 === 1
            ? "Build"
            : index % 4 === 2
              ? "System depth"
              : "Portfolio polish",
      goals: goals.slice(0, 5),
      success_criteria: [
        "Complete study notes",
        "Finish one practical task",
        "Prepare one interview story",
      ],
    };
  });
}

export default function RoadmapPage() {
  const [roleType, setRoleType] = useState<TrackKey>("ai_engineer");
  const [targetRole, setTargetRole] = useState("AI Software Engineer");
  const [level, setLevel] = useState("entry_level");
  const [duration, setDuration] = useState("56");
  const [weeklyHours, setWeeklyHours] = useState("12");
  const [selectedFocus, setSelectedFocus] = useState<string[]>([
    "DSA",
    "System Design",
    "Projects",
    "Testing",
    "Deployment",
    "AI/LLM",
  ]);
  const [goalNotes, setGoalNotes] = useState(
    "I want to become job-ready for AI Software Engineer and backend-focused roles using CareerPilot AI as my flagship project."
  );
  const [missingItemsText, setMissingItemsText] = useState(
    "RAG, vector databases, system design, backend testing, deployment, GitHub Actions CI"
  );
  const [roadmap, setRoadmap] = useState<LearningRoadmapResponse | null>(null);
  const [activeTab, setActiveTab] = useState<RoadmapTab>("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const timelineDays = Number(duration) || 56;
  const timelineWeeks = Math.max(1, Math.ceil(timelineDays / 7));
  const weeklyHoursNumber = Number(weeklyHours) || 12;

  const localWeeklyPlan = useMemo(
    () => buildLocalWeeklyPlan(roleType, timelineWeeks, selectedFocus),
    [roleType, timelineWeeks, selectedFocus]
  );

  const activeWeeklyPlan = roadmap?.weekly_plan?.length ? roadmap.weekly_plan : localWeeklyPlan;
  const activeStudyTopics = roadmap?.study_topics?.length
    ? roadmap.study_topics
    : localTopicsByRole[roleType];

  const activeMiniProjects = roadmap?.mini_projects?.length
    ? roadmap.mini_projects
    : previewMiniProjects;

  const resumeActions = roadmap?.resume_actions?.length
    ? roadmap.resume_actions
    : [
        "Add measurable project bullets to your resume.",
        "Highlight backend, AI, database, testing, and deployment proof.",
        "Update GitHub README screenshots and feature summary.",
        "Prepare a truthful CareerPilot AI resume bullet.",
      ];

  const interviewActions = roadmap?.interview_prep_actions?.length
    ? roadmap.interview_prep_actions
    : [
        "Practice explaining the user problem CareerPilot AI solves.",
        "Prepare one backend API design story.",
        "Prepare one debugging and testing story.",
        "Practice answering why you chose FastAPI, PostgreSQL, Docker, and Next.js.",
      ];

  const dailyTasks = roadmap?.roadmap ?? [];

  function toggleFocus(focus: string) {
    setSelectedFocus((current) =>
      current.includes(focus)
        ? current.filter((item) => item !== focus)
        : [...current, focus]
    );
  }

  function handleRoleTypeChange(value: TrackKey) {
    setRoleType(value);
    setTargetRole(getTargetRole(value));
  }

  async function generateRoadmap() {
    setIsGenerating(true);
    setError("");

    try {
      const missingItems = missingItemsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await api.post<LearningRoadmapResponse>("/learning-roadmap", {
        target_role: targetRole,
        role_type: roleType,
        industry: "technology",
        experience_level: level,
        timeline_days: timelineDays,
        weekly_hours: weeklyHoursNumber,
        focus_areas: selectedFocus,
        goal_notes: goalNotes,
        missing_items: missingItems,
      });

      setRoadmap(response.data);
      setActiveTab("overview");
    } catch (err) {
      console.error(err);
      setError(
        "AI roadmap generation failed. Check backend and AI config. Showing local roadmap preview."
      );
      setRoadmap(null);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <AppShell>
      <div className="cc-product-page space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" asChild className="cc-cta-secondary">
            <Link href="/export-center?type=roadmap">
              <Download className="mr-2 h-4 w-4" />
              Export roadmap
            </Link>
          </Button>
        </div>
        <div className="cc-page-hero-visual p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                AI Learning Roadmap
              </Badge>
              <h1 className="cc-gradient-title text-3xl font-black tracking-tight sm:text-4xl">
                Generate a personalized career roadmap
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Turn missing skills into a structured study plan with weekly goals,
                daily tasks, portfolio projects, resume actions, and interview prep.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild className="cc-cta-secondary">
                <Link href="/interview-prep">Back to Interview Prep</Link>
              </Button>
              <Button asChild className="cc-cta-primary">
                <Link href="/applications">
                  Track Applications
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

        {roadmap ? (
          <Card className="border-primary/20 bg-muted/20">
            <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">AI roadmap generated</p>
                <p className="text-sm text-muted-foreground">
                  Provider: {roadmap.provider_used}
                  {roadmap.fallback_used ? " • Guided Roadmap Mode" : " • AI Generated"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {roadmap.priority_skills.slice(0, 5).map((skill) => (
                  <Badge key={skill.skill} variant="secondary">
                    {skill.skill}
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
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Roadmap generator</CardTitle>
                  <CardDescription>
                    Customize your role, timeline, gaps, and study focus.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Target field</Label>
                  <Select
                    value={roleType}
                    onValueChange={(value) => handleRoleTypeChange(value as TrackKey)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trackOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target role</Label>
                  <Input
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    placeholder="AI Software Engineer"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Current level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="entry_level">Entry level</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timeline</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="28">4 weeks</SelectItem>
                      <SelectItem value="56">8 weeks</SelectItem>
                      <SelectItem value="84">12 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Weekly hours</Label>
                  <Input
                    value={weeklyHours}
                    onChange={(event) => setWeeklyHours(event.target.value)}
                    placeholder="12"
                  />
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
                      variant={selectedFocus.includes(focus) ? "default" : "outline"}
                      onClick={() => toggleFocus(focus)}
                    >
                      {focus}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Missing skills / gaps</Label>
                <Textarea
                  value={missingItemsText}
                  onChange={(event) => setMissingItemsText(event.target.value)}
                  rows={3}
                  placeholder="RAG, system design, testing, deployment..."
                />
              </div>

              <div className="space-y-2">
                <Label>Goal notes</Label>
                <Textarea
                  value={goalNotes}
                  onChange={(event) => setGoalNotes(event.target.value)}
                  rows={4}
                  placeholder="Describe your career goal..."
                />
              </div>

              <Button onClick={generateRoadmap} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "Generating roadmap..." : "Generate AI roadmap"}
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant={roadmap ? "default" : "secondary"}>
                    {roadmap ? "AI generated" : "Preview mode"}
                  </Badge>
                  <CardTitle className="mt-3">
                    {roadmap?.target_role ?? targetRole}
                  </CardTitle>
                  <CardDescription className="mt-1 leading-6">
                    {roadmap?.overview.summary ??
                      `Preview roadmap for ${getTrackLabel(roleType)} based on your selected focus areas.`}
                  </CardDescription>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground">Plan</p>
                  <p className="text-4xl font-bold">{timelineWeeks}</p>
                  <p className="text-xs text-muted-foreground">weeks</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Readiness</p>
                  <p className="mt-2 text-2xl font-semibold capitalize">
                    {roadmap?.overview.readiness_level ?? "Building"}
                  </p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Weekly hours</p>
                  <p className="mt-2 text-2xl font-semibold">{weeklyHoursNumber}</p>
                </div>

                <div className="rounded-2xl border p-4">
                  <p className="text-sm text-muted-foreground">Focus areas</p>
                  <p className="mt-2 text-2xl font-semibold">{selectedFocus.length}</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/20 p-5">
                <div className="flex gap-3">
                  <Brain className="mt-1 h-5 w-5 shrink-0" />
                  <p className="text-sm leading-7 text-muted-foreground">
                    {roadmap?.overview.target_outcome ?? goalNotes}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeStudyTopics.slice(0, 8).map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="cc-product-card-static">
            <CardHeader className="pb-2">
              <CardDescription>Study topics</CardDescription>
              <CardTitle className="text-3xl">{activeStudyTopics.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Topics generated for your target role.
              </p>
            </CardContent>
          </Card>

          <Card className="cc-product-card-static">
            <CardHeader className="pb-2">
              <CardDescription>Weekly plan</CardDescription>
              <CardTitle className="text-3xl">{activeWeeklyPlan.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Week-by-week roadmap blocks.
              </p>
            </CardContent>
          </Card>

          <Card className="cc-product-card-static">
            <CardHeader className="pb-2">
              <CardDescription>Mini projects</CardDescription>
              <CardTitle className="text-3xl">{activeMiniProjects.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Portfolio proof to build.
              </p>
            </CardContent>
          </Card>

          <Card className="cc-product-card-static">
            <CardHeader className="pb-2">
              <CardDescription>Resume actions</CardDescription>
              <CardTitle className="text-3xl">{resumeActions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Resume improvements from this roadmap.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="cc-product-card-static border-primary/20">
          <CardContent className="p-3">
            <div className="grid gap-2 md:grid-cols-5">
              {roadmapTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    activeTab === tab.value
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "bg-background hover:bg-muted/40"
                  }`}
                >
                  <p className="font-medium">{tab.label}</p>
                  <p
                    className={`mt-1 text-xs leading-5 ${
                      activeTab === tab.value
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {activeTab === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="cc-product-card-static">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <CardTitle>Skill gap strategy</CardTitle>
                </div>
                <CardDescription>
                  What this roadmap is trying to close first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {roadmap?.skill_gap_summary?.length ? (
                  roadmap.skill_gap_summary.map((gap) => (
                    <div key={gap.category} className="rounded-2xl border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{gap.category}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {gap.why_it_matters}
                          </p>
                        </div>
                        <Badge variant="secondary">{gap.priority}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {gap.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border bg-muted/20 p-4">
                    <p className="font-semibold">Roadmap preview</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Generate the AI roadmap to convert your gaps into priority
                      skills, weekly goals, daily tasks, and project milestones.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="cc-product-page space-y-6">
              <Card className="cc-product-card-static">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <CardTitle>Priority skills</CardTitle>
                  </div>
                  <CardDescription>
                    Skills to focus on first.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(roadmap?.priority_skills?.length
                    ? roadmap.priority_skills
                    : activeStudyTopics.slice(0, 6).map((topic) => ({
                        skill: topic,
                        priority: "focus",
                        reason: "Important for your selected target role.",
                      }))
                  ).map((skill) => (
                    <div key={skill.skill} className="rounded-xl border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{skill.skill}</p>
                        <Badge variant="secondary">{skill.priority}</Badge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {skill.reason}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="cc-product-card-static">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <CardTitle>Study topics</CardTitle>
                  </div>
                  <CardDescription>
                    AI or preview topics for your selected track.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {activeStudyTopics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === "weekly" ? (
          <Card className="cc-product-card-static border-primary/20">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border bg-muted/30 p-3">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Weekly roadmap</CardTitle>
                  <CardDescription>
                    A compact week-by-week plan for your selected target role.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {activeWeeklyPlan.map((item) => (
                  <div key={item.week} className="rounded-2xl border p-4">
                    <Badge variant="secondary">Week {item.week}</Badge>
                    <h3 className="mt-3 font-semibold">{item.theme}</h3>

                    <div className="mt-4 space-y-2">
                      {item.goals.map((goal) => (
                        <div key={goal} className="flex gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          <span className="text-muted-foreground">{goal}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl bg-muted/30 p-3">
                      <p className="text-xs font-medium">Success criteria</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {item.success_criteria.join(" • ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "daily" ? (
          <Card className="cc-product-card-static">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4" />
                <CardTitle>Daily action plan</CardTitle>
              </div>
              <CardDescription>
                Concrete daily tasks from the AI roadmap response.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {dailyTasks.length ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {dailyTasks.slice(0, 12).map((task) => (
                    <div
                      key={`${task.day}-${task.focus}`}
                      className="rounded-2xl border bg-muted/20 p-4"
                    >
                      <Badge variant="secondary">Day {task.day}</Badge>
                      <h3 className="mt-3 font-semibold">{task.focus}</h3>
                      <div className="mt-3 space-y-2">
                        {task.tasks.slice(0, 3).map((item) => (
                          <div key={item} className="flex gap-2 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Deliverable: {task.deliverable}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Time: {task.estimated_time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
                  <p className="font-medium">Generate AI roadmap to unlock daily tasks.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Daily tasks appear after the backend AI roadmap is generated.
                  </p>
                  <Button className="mt-4" onClick={generateRoadmap} disabled={isGenerating}>
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate AI roadmap
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "projects" ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="cc-product-card-static">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  <CardTitle>Portfolio mini projects</CardTitle>
                </div>
                <CardDescription>
                  Practical proof that turns learning into resume evidence.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeMiniProjects.map((project) => (
                  <div key={project.title} className="rounded-2xl border bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge variant="outline">{project.difficulty}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      Why it matters: {project.why_it_matters}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="cc-product-card-static">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    <CardTitle>DSA plan</CardTitle>
                  </div>
                  <CardDescription>Coding patterns to practice.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {dsaTopics.map((topic) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              <Card className="cc-product-card-static">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    <CardTitle>System design plan</CardTitle>
                  </div>
                  <CardDescription>Architecture topics to explain.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {systemTopics.map((topic) => (
                    <div key={topic} className="rounded-xl border bg-muted/20 p-3 text-sm">
                      {topic}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}

        {activeTab === "actions" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="cc-product-card-static">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers3 className="h-4 w-4" />
                  <CardTitle>Resume actions</CardTitle>
                </div>
                <CardDescription>
                  What to update after completing this roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {resumeActions.map((item) => (
                  <div key={item} className="rounded-xl border bg-muted/20 p-3 text-sm">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="cc-product-card-static">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <CardTitle>Interview prep actions</CardTitle>
                </div>
                <CardDescription>
                  What to practice before interviews.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {interviewActions.map((item) => (
                  <div key={item} className="rounded-xl border bg-muted/20 p-3 text-sm">
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>

            {roadmap?.progress_checkpoints?.length ? (
              <Card className="cc-product-card-static">
                <CardHeader>
                  <CardTitle>Progress checkpoints</CardTitle>
                  <CardDescription>
                    How to verify progress during the roadmap.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roadmap.progress_checkpoints.map((checkpoint) => (
                    <div key={checkpoint.checkpoint_day} className="rounded-2xl border bg-muted/20 p-4">
                      <Badge variant="secondary">Day {checkpoint.checkpoint_day}</Badge>
                      <div className="mt-3 space-y-2">
                        {checkpoint.questions_to_answer.map((question) => (
                          <p key={question} className="text-sm text-muted-foreground">
                            {question}
                          </p>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Output: {checkpoint.expected_output}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {roadmap?.final_advice?.length ? (
              <Card className="cc-product-card-static">
                <CardHeader>
                  <CardTitle>Final advice</CardTitle>
                  <CardDescription>
                    AI guidance for finishing the plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {roadmap.final_advice.map((item) => (
                    <div key={item} className="rounded-xl border bg-muted/20 p-3 text-sm">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}

        <Card className="cc-product-card-static">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <CardTitle>Finish checklist</CardTitle>
            </div>
            <CardDescription>
              Use this before adding CareerPilot AI to applications.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                "README with screenshots",
                "Backend tests passing",
                "Interview Prep AI generator",
                "Roadmap AI generator",
                "Deployment proof",
                "LinkedIn project update",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3 text-sm"
                >
                  <Trophy className="h-4 w-4" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={generateRoadmap} disabled={isGenerating}>
                {isGenerating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? "Generating..." : "Regenerate roadmap"}
              </Button>
              <Button variant="outline" asChild className="cc-cta-secondary">
                <Link href="/interview-prep">Practice interview</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
