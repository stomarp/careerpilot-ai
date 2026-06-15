#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "CareerCopilot AI demo verification"
echo "Backend:  $API_BASE_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

echo "1. Checking backend health..."
curl -fsS "$API_BASE_URL/health" >/tmp/careercopilot_health.json
cat /tmp/careercopilot_health.json
echo ""
echo ""

echo "2. Checking backend readiness..."
curl -fsS "$API_BASE_URL/ready" >/tmp/careercopilot_ready.json
cat /tmp/careercopilot_ready.json
echo ""
echo ""

echo "3. Checking OpenAPI schema..."
curl -fsS "$API_BASE_URL/openapi.json" >/tmp/careercopilot_openapi.json
python - <<'PY'
import json
from pathlib import Path

data = json.loads(Path("/tmp/careercopilot_openapi.json").read_text())
paths = data.get("paths", {})

required_paths = [
    "/health",
    "/ready",
    "/resumes/upload",
    "/jobs",
    "/analysis/ats-score",
    "/analysis/ai-resume-optimizer",
    "/interview/questions",
    "/learning-roadmap",
    "/application-packs",
]

missing = [path for path in required_paths if path not in paths]

if missing:
    print("Missing expected API paths:")
    for path in missing:
        print(f"- {path}")
    raise SystemExit(1)

print("OpenAPI check passed.")
print(f"Total API paths: {len(paths)}")
PY

echo ""
echo "Demo verification passed."
