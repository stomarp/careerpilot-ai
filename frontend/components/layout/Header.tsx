"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Search, Sparkles } from "lucide-react";

import { clearAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";

export function Header() {
  const router = useRouter();

  function handleLogout() {
    clearAuthToken();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-80 border-r-0 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15 sm:flex">
            <Sparkles className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
              CareerPilot Workspace
            </p>
            <p className="truncate text-xs text-slate-500">
              Analyze resumes, prepare interviews, and track applications.
            </p>
          </div>
        </div>

        <div className="hidden min-w-[260px] max-w-md flex-1 items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
          <Search className="mr-2 h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">
            Search resumes, jobs, reports...
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live
          </div>

          <Button variant="outline" size="icon" className="hidden rounded-2xl sm:inline-flex">
            <Bell className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" className="rounded-2xl" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
