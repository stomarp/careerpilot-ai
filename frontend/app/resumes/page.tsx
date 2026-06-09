"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";

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

type ResumeUploadResponse = {
  resume_id: number;
  filename: string;
  status: string;
  parsed_text_preview: string;
};

export default function ResumesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] =
    useState<ResumeUploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setError("");
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose a resume file first.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post<ResumeUploadResponse>(
        "/resumes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedResume(response.data);

      localStorage.setItem(
        "careercopilot_latest_resume_id",
        String(response.data.resume_id)
      );
    } catch {
      setError(
        "Resume upload failed. Make sure you are logged in and the backend is running."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Step 1
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Upload your resume so CareerCopilot can parse it and use it for ATS
            scoring, optimization, interview prep, and learning roadmap
            generation.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Resume upload
            </CardTitle>
            <CardDescription>
              Supported formats depend on your backend parser. PDF is the main
              tested format.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleUpload} className="space-y-5">
              <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-background">
                  <FileText className="h-6 w-6" />
                </div>

                <p className="font-medium">Choose your resume file</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload the resume you want to analyze for job matching.
                </p>

                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="mx-auto mt-5 block max-w-sm cursor-pointer rounded-md border bg-background p-2 text-sm"
                />

                {selectedFile ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Selected:{" "}
                    <span className="font-medium text-foreground">
                      {selectedFile.name}
                    </span>
                  </p>
                ) : null}
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Button type="submit" disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload resume
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload status</CardTitle>
            <CardDescription>
              Your latest resume ID will be saved locally for the analysis flow.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {uploadedResume ? (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Resume uploaded successfully
                  </div>

                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Resume ID</dt>
                      <dd className="font-medium">{uploadedResume.resume_id}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Filename</dt>
                      <dd className="max-w-52 truncate font-medium">
                        {uploadedResume.filename}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="font-medium">{uploadedResume.status}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Parsed preview</p>
                  <div className="max-h-72 overflow-auto rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                    {uploadedResume.parsed_text_preview || "No preview returned."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/30 p-6 text-sm text-muted-foreground">
                No resume uploaded in this session yet. Upload a resume to
                continue to job matching.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
