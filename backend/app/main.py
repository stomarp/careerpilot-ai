from fastapi import FastAPI

app = FastAPI(
    title="CareerCopilot AI API",
    description="Backend API for resume analysis, ATS scoring, interview preparation, and application tracking.",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
