"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  Download,
  FileSearch,
  FileText,
  GraduationCap,
  Home,
  Layers3,
  MessageSquareText,
  NotebookText,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Home },
      { title: "Jobs", href: "/jobs", icon: BriefcaseBusiness, exact: true },
      { title: "Resumes", href: "/resumes", icon: FileText },
    ],
  },
  {
    label: "AI Tools",
    items: [
      { title: "Analysis", href: "/analysis", icon: FileSearch },
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "Interview Prep", href: "/interview-prep", icon: MessageSquareText },
      { title: "Roadmap", href: "/roadmap", icon: GraduationCap },
    ],
  },
  {
    label: "Outputs",
    items: [
      { title: "Applications", href: "/applications", icon: NotebookText },
      { title: "Application Packs", href: "/application-packs", icon: FileText },
      { title: "Export Center", href: "/export-center", icon: Download },
      { title: "Job Workspace", href: "/jobs/workspace", icon: Layers3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-80 border-r border-white/70 bg-slate-950 px-4 py-5 text-white shadow-2xl shadow-slate-950/20 lg:w-72">
      <Link href="/dashboard" className="mb-6 flex items-center gap-3 rounded-3xl bg-white/10 p-3 ring-1 ring-white/10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-950/30">
          <Sparkles className="h-6 w-6" />
        </div>

        <div>
          <p className="text-base font-bold leading-none">CareerPilot AI</p>
          <p className="mt-1 text-xs text-slate-300">Job search command center</p>
        </div>
      </Link>

      <div className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-violet-500/15 to-fuchsia-500/20 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
          <WandSparkles className="h-4 w-4" />
          AI Workflow
        </div>
        <p className="mt-2 text-sm font-semibold text-white">
          Resume → ATS Score → Interview → Roadmap
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-300">
          One workspace to improve every application.
        </p>
      </div>

      <nav className="space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white",
                      isActive &&
                        "bg-white text-slate-950 shadow-lg shadow-black/20 hover:bg-white hover:text-slate-950"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-200 transition group-hover:bg-white/15 group-hover:text-white",
                        isActive && "bg-slate-950 text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
