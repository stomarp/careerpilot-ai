"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";

import { api, saveAuthToken } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
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

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("swati@example.com");
  const [password, setPassword] = useState("StrongPassword123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      saveAuthToken(response.data.access_token);
      router.push("/dashboard");
    } catch {
      setError("Login failed. Check your email and password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f7f8fb] text-slate-950 lg:grid-cols-[1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.5),transparent_26rem),radial-gradient(circle_at_top_right,rgba(217,70,239,0.35),transparent_26rem),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.22),transparent_26rem)]" />

        <div className="relative flex h-full flex-col justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black">CareerPilot AI</p>
              <p className="text-xs text-slate-300">Job search command center</p>
            </div>
          </Link>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100">
              <LockKeyhole className="h-4 w-4" />
              Secure workspace login
            </div>

            <h1 className="max-w-xl text-5xl font-black tracking-tight">
              Welcome back to your career command center.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
              Continue analyzing resumes, tracking applications, and preparing
              for your next interview with one focused workspace.
            </p>
          </div>

          <div className="grid gap-3">
            {["ATS analysis", "Interview prep", "Application tracking"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <Card className="w-full max-w-md rounded-[2rem] border-white/70 bg-white/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-950/20">
              <Sparkles className="h-6 w-6" />
            </div>

            <CardTitle className="text-3xl font-black">Welcome back</CardTitle>
            <CardDescription>
              Log in to continue building your career workspace.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-11 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-11 rounded-2xl"
                />
              </div>

              {error ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {error}
                </p>
              ) : null}

              <Button className="h-11 w-full rounded-2xl bg-slate-950 text-white hover:bg-slate-800" type="submit" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
                {!isLoading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New here?{" "}
              <Link href="/register" className="font-bold text-slate-950 underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
