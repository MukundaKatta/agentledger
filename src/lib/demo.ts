import type { IngestPayload, RunEventInput } from "./types";

const AGENTS = ["research-agent", "support-bot", "sql-copilot", "code-reviewer", "ops-triage"];
const MODELS = ["gemini-2.5-flash", "gpt-5.4", "sonnet-4.6", "gemini-2.5-pro"];
const TOOLS = ["web_search", "read_file", "run_query", "http_get", "vector_search"];

const pick = <T>(xs: T[]): T => xs[Math.floor(Math.random() * xs.length)];
const round = (n: number, dp = 4) => Math.round(n * 10 ** dp) / 10 ** dp;

/** Build a realistic synthetic run so the dashboard and demo have data. */
export function syntheticRun(): IngestPayload {
  const agent = pick(AGENTS);
  const model = pick(MODELS);
  const steps = 3 + Math.floor(Math.random() * 6);
  const events: RunEventInput[] = [];

  for (let i = 0; i < steps; i++) {
    const isTool = Math.random() < 0.45;
    if (isTool) {
      events.push({
        type: "tool_call",
        name: pick(TOOLS),
        latencyMs: 40 + Math.floor(Math.random() * 600),
        detail: "tool invoked by the agent",
      });
    } else {
      const tokens = 200 + Math.floor(Math.random() * 3000);
      events.push({
        type: "model_call",
        name: model,
        tokens,
        usd: round((tokens / 1000) * 0.002),
        latencyMs: 300 + Math.floor(Math.random() * 1800),
      });
    }
  }

  const failed = Math.random() < 0.15;
  if (failed) {
    events.push({ type: "error", name: "ToolTimeout", detail: "upstream call exceeded 30s" });
  }

  return {
    runId: `run-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    agent,
    model,
    status: failed ? "error" : "ok",
    startedAt: new Date().toISOString(),
    events,
  };
}
