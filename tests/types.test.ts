import assert from "node:assert/strict";
import { test } from "node:test";

import { IngestPayload, RunEventInput, EventType } from "../src/lib/types";

test("IngestPayload applies documented defaults", () => {
  const parsed = IngestPayload.parse({ runId: "run-1" });
  assert.equal(parsed.agent, "unknown");
  assert.equal(parsed.status, "running");
  assert.deepEqual(parsed.events, []);
});

test("IngestPayload requires a non-empty runId", () => {
  assert.equal(IngestPayload.safeParse({ runId: "" }).success, false);
  assert.equal(IngestPayload.safeParse({}).success, false);
});

test("IngestPayload rejects an unknown status", () => {
  const res = IngestPayload.safeParse({ runId: "r", status: "paused" });
  assert.equal(res.success, false);
});

test("IngestPayload accepts a full, valid payload", () => {
  const res = IngestPayload.safeParse({
    runId: "run-123",
    agent: "research-agent",
    model: "gemini-2.5-flash",
    status: "ok",
    events: [
      { type: "model_call", name: "gemini-2.5-flash", tokens: 1240, usd: 0.0025, latencyMs: 900 },
      { type: "tool_call", name: "web_search", latencyMs: 320 },
    ],
  });
  assert.equal(res.success, true);
  if (res.success) assert.equal(res.data.events.length, 2);
});

test("RunEventInput requires a known type and a non-empty name", () => {
  assert.equal(RunEventInput.safeParse({ type: "model_call", name: "m" }).success, true);
  assert.equal(RunEventInput.safeParse({ type: "model_call", name: "" }).success, false);
  assert.equal(RunEventInput.safeParse({ type: "nope", name: "m" }).success, false);
});

test("RunEventInput rejects negative cost/tokens/latency", () => {
  assert.equal(RunEventInput.safeParse({ type: "info", name: "n", usd: -1 }).success, false);
  assert.equal(RunEventInput.safeParse({ type: "info", name: "n", tokens: -5 }).success, false);
  assert.equal(RunEventInput.safeParse({ type: "info", name: "n", latencyMs: -10 }).success, false);
});

test("RunEventInput requires integer tokens", () => {
  assert.equal(RunEventInput.safeParse({ type: "model_call", name: "m", tokens: 1.5 }).success, false);
});

test("EventType enumerates exactly the four supported kinds", () => {
  assert.deepEqual(EventType.options, ["model_call", "tool_call", "error", "info"]);
});
