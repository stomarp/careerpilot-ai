"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  Download,
  FileText,
  Loader2,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Trash2,
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

type ApplicationPack = {
  id: number;
  job_id: number | null;
  resume_id: number | null;
  title: string;
  company: string | null;
  role_title: string;
  pack_type: string;
  ats_score: number | null;
  decision: string | null;
  summary: string | null;
  content_markdown: string;
  artifacts: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function scoreTone(score: number | null) {
  if (score === null || score === undefined) return "secondary";
  if (score >= 85) return "default";
  if (score >= 70) return "secondary";
  return "destructive";
}

export default function ApplicationPacksPage() {
  const [packs, setPacks] = useState<ApplicationPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<ApplicationPack | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  const filteredPacks = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    if (!normalized) return packs;

    return packs.filter((pack) =>
      [pack.title, pack.company, pack.role_title, pack.decision, pack.summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [packs, query]);

  async function loadPacks() {
    setIsLoading(true);
    setStatus("");

    try {
      const response = await api.get<ApplicationPack[]>("/application-packs");
      setPacks(response.data);
      setSelectedPack(response.data[0] ?? null);
    } catch (err) {
      console.error(err);
      setStatus("Could not load saved application packs.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyPack(pack: ApplicationPack) {
    await navigator.clipboard.writeText(pack.content_markdown);
    setStatus(`Copied ${pack.title}.`);
  }

  function downloadPack(pack: ApplicationPack) {
    const blob = new Blob([pack.content_markdown], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = pack.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    link.href = url;
    link.download = `${fileName || "application-pack"}.md`;
    link.click();

    URL.revokeObjectURL(url);
    setStatus(`Downloaded ${pack.title}.`);
  }

  function printPack(pack: ApplicationPack) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${pack.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; line-height: 1.6; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <pre>${pack.content_markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  async function deletePack(packId: number) {
    try {
      await api.delete(`/application-packs/${packId}`);
      setPacks((current) => current.filter((pack) => pack.id !== packId));
      setSelectedPack((current) => (current?.id === packId ? null : current));
      setStatus("Application pack deleted.");
    } catch (err) {
      console.error(err);
      setStatus("Could not delete application pack.");
    }
  }

  useEffect(() => {
    loadPacks();
  }, []);

  return (
    <AppShell>
      <div className="cc-product-page space-y-6">
        <div className="cc-page-hero-visual p-6 sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <Badge variant="secondary" className="mb-3">
                Application Packs
              </Badge>
              <h1 className="cc-gradient-title text-3xl font-black tracking-tight sm:text-4xl">
                Saved candidate artifacts
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                Store and reopen exported job-search packs for each role, company,
                application strategy, interview plan, and roadmap.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild className="cc-cta-secondary">
                <Link href="/export-center">Create Pack</Link>
              </Button>
              <Button asChild className="cc-cta-primary">
                <Link href="/jobs/workspace">
                  Job Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {status ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm font-medium text-blue-700 shadow-sm">
            {status}
          </div>
        ) : null}

        <div className="grid items-start gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card className="cc-product-card-static border-primary/20">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border bg-muted/30 p-3">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Saved packs</CardTitle>
                  <CardDescription>
                    Search previous exports by company, role, decision, or summary.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="cc-input-premium pl-9"
                  placeholder="Search packs..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>

              <Button variant="outline" className="cc-cta-secondary" onClick={loadPacks} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="cc-empty-state text-sm text-slate-500">
                    Loading packs...
                  </div>
                ) : filteredPacks.length ? (
                  filteredPacks.map((pack) => (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPack(pack)}
                      className={`w-full rounded-2xl border p-4 text-left transition hover:bg-muted/40 ${
                        selectedPack?.id === pack.id ? "border-primary bg-muted/40" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{pack.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {pack.company || "Company not set"} • {formatDate(pack.created_at)}
                          </p>
                        </div>
                        <Badge variant={scoreTone(pack.ats_score)}>
                          {pack.ats_score ?? "—"}%
                        </Badge>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {pack.summary || "No summary saved."}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-3 font-medium">No saved packs yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create one from Export Center after running the Job Workspace.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="cc-product-card-static">
            <CardHeader>
              {selectedPack ? (
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Badge variant="secondary">{selectedPack.pack_type}</Badge>
                    <CardTitle className="mt-3 text-2xl">{selectedPack.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedPack.role_title}
                      {selectedPack.company ? ` at ${selectedPack.company}` : ""} •{" "}
                      {selectedPack.decision || "No decision"}
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => copyPack(selectedPack)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="outline" onClick={() => downloadPack(selectedPack)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={() => printPack(selectedPack)}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => deletePack(selectedPack.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle>No pack selected</CardTitle>
                  <CardDescription>
                    Select a saved pack to preview, copy, download, print, or delete.
                  </CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent>
              {selectedPack ? (
                <div className="rounded-2xl border bg-muted/20 p-5">
                  <pre className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {selectedPack.content_markdown}
                  </pre>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-12 text-center">
                  <PackageCheck className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 font-medium">Application pack library</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Saved packs will appear here after you create them from Export Center.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
