"""Minimal example: report an agent run to agentledger from any Python agent.

    pip install requests
    AGENTLEDGER_URL=https://your-app.vercel.app INGEST_TOKEN=... python examples/report.py
"""
import os
import time

import requests

BASE = os.environ.get("AGENTLEDGER_URL", "http://localhost:3000")
TOKEN = os.environ.get("INGEST_TOKEN", "change-me-to-a-long-random-string")

payload = {
    "runId": f"run-{int(time.time())}",
    "agent": "my-agent",
    "model": "gemini-2.5-flash",
    "status": "ok",
    "events": [
        {"type": "model_call", "name": "gemini-2.5-flash", "tokens": 1240, "usd": 0.0025, "latencyMs": 900},
        {"type": "tool_call", "name": "web_search", "latencyMs": 320},
        {"type": "model_call", "name": "gemini-2.5-flash", "tokens": 880, "usd": 0.0018, "latencyMs": 740},
    ],
}

resp = requests.post(
    f"{BASE}/api/ingest",
    json=payload,
    headers={"x-ingest-token": TOKEN},
    timeout=15,
)
print(resp.status_code, resp.json())
