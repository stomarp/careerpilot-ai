import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f8fb] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_30rem),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_28rem),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_30rem)]" />

      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="min-h-screen flex-1">
          <Header />

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
