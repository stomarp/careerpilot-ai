from pydantic import BaseModel, Field


class LearningRoadmapRequest(BaseModel):
    application_id: int | None = None
    analysis_report_id: int | None = None

    target_role: str
    role_type: str = "general"
    industry: str = "general"
    experience_level: str = "entry_level"

    timeline_days: int = Field(default=30, ge=7, le=90)

    weekly_hours: int | None = Field(default=None, ge=1, le=80)
    focus_areas: list[str] | None = None
    goal_notes: str | None = None
    missing_items: list[str] | None = None


class RoadmapOverview(BaseModel):
    summary: str
    readiness_level: str
    target_outcome: str


class SkillGapGroup(BaseModel):
    category: str
    priority: str
    skills: list[str]
    why_it_matters: str


class RoadmapSkillPriority(BaseModel):
    skill: str
    priority: str
    reason: str


class WeeklyPlan(BaseModel):
    week: int
    theme: str
    goals: list[str]
    success_criteria: list[str]


class RoadmapDayTask(BaseModel):
    day: int
    week: int
    focus: str
    tasks: list[str]
    deliverable: str
    estimated_time: str


class RoadmapMiniProject(BaseModel):
    title: str
    difficulty: str
    description: str
    why_it_matters: str
    skills_practiced: list[str]
    implementation_steps: list[str]
    resume_bullet_templates: list[str]


class ProgressCheckpoint(BaseModel):
    checkpoint_day: int
    questions_to_answer: list[str]
    expected_output: str


class LearningRoadmapResponse(BaseModel):
    target_role: str
    role_type: str
    industry: str
    experience_level: str
    timeline_days: int

    provider_used: str
    fallback_used: bool

    overview: RoadmapOverview
    skill_gap_summary: list[SkillGapGroup]
    priority_skills: list[RoadmapSkillPriority]
    weekly_plan: list[WeeklyPlan]
    roadmap: list[RoadmapDayTask]
    mini_projects: list[RoadmapMiniProject]
    resume_actions: list[str]
    interview_prep_actions: list[str]
    study_topics: list[str]
    progress_checkpoints: list[ProgressCheckpoint]
    final_advice: list[str]
