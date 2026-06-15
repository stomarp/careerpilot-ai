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
} from "lucide-react";

import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Workspace",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
      },
      {
        title: "Job Workspace",
        href: "/jobs/workspace",
        icon: Layers3,
      },
      {
        title: "Jobs",
        href: "/jobs",
        icon: BriefcaseBusiness,
        exact: true,
      },
      {
        title: "Resumes",
        href: "/resumes",
        icon: FileText,
      },
    ],
  },
  {
    label: "AI Tools",
    items: [
      {
        title: "Analysis",
        href: "/analysis",
        icon: FileSearch,
      },
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
      {
        title: "Interview Prep",
        href: "/interview-prep",
        icon: MessageSquareText,
      },
      {
        title: "Roadmap",
        href: "/roadmap",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Outputs",
    items: [
      {
        title: "Export Center",
        href: "/export-center",
        icon: Download,
      },
      {
        title: "Applications",
        href: "/applications",
        icon: NotebookText,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 border-r bg-background px-4 py-5 lg:block">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <p className="text-base font-semibold leading-none">CareerCopilot AI</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Job search command center
          </p>
        </div>
      </Link>

      <nav className="space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
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
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
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
