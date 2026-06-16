#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-}"
WEB_URL="${WEB_URL:-}"

if [[ -z "$API_URL" ]]; then
  echo "Missing API_URL. Example:"
  echo "API_URL=https://careercopilot-api.onrender.com WEB_URL=https://careercopilot-ai.vercel.app ./scripts/smoke_production.sh"
  exit 1
fi

API_URL="${API_URL%/}"
WEB_URL="${WEB_URL%/}"

echo "Checking backend health: $API_URL/health"
curl --fail --silent --show-error "$API_URL/health" | python -m json.tool

echo "Checking backend OpenAPI: $API_URL/openapi.json"
curl --fail --silent --show-error "$API_URL/openapi.json" >/dev/null
echo "Backend OpenAPI OK"

if [[ -n "$WEB_URL" ]]; then
  echo "Checking frontend: $WEB_URL"
  curl --fail --silent --show-error --head "$WEB_URL" >/dev/null
  echo "Frontend OK"

  echo "Checking frontend can reach configured backend manually:"
  curl --fail --silent --show-error "$API_URL/health" >/dev/null
  echo "Frontend/backend production URLs are reachable"
fi

echo "Production smoke test passed"
