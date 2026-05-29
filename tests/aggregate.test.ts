import assert from "node:assert/strict";
import { test } from "node:test";

import { emptyAggregates, foldEvents } from "../src/lib/aggregate";

test("foldEvents sums cost/tokens/latency and counts by type", () => {
  const out = foldEvents(emptyAggregates(), [
    { type: "model_call", name: "m", usd: 0.002, tokens: 1000, latencyMs: 900 },
    { type: "tool_call", name: "web_search", latencyMs: 300 },
    { type: "error", name: "Timeout" },
  ]);
  assert.equal(out.modelCalls, 1);
  assert.equal(out.toolCalls, 1);
  assert.equal(out.errors, 1);
  assert.equal(out.totalTokens, 1000);
  assert.equal(out.latencyMs, 1200);
  assert.equal(out.eventCount, 3);
  assert.ok(Math.abs(out.totalUsd - 0.002) < 1e-9);
});

test("foldEvents accumulates onto a prior base (idempotent append)", () => {
  const base = foldEvents(emptyAggregates(), [{ type: "model_call", name: "m", tokens: 100 }]);
  const out = foldEvents(base, [{ type: "tool_call", name: "t" }]);
  assert.equal(out.eventCount, 2);
  assert.equal(out.modelCalls, 1);
  assert.equal(out.toolCalls, 1);
  assert.equal(out.totalTokens, 100);
});

test("missing numeric fields default to zero", () => {
  const out = foldEvents(emptyAggregates(), [{ type: "info", name: "note" }]);
  assert.equal(out.totalUsd, 0);
  assert.equal(out.totalTokens, 0);
  assert.equal(out.eventCount, 1);
});

test("eventCount seeds from the base (continuing an existing run)", () => {
  const out = foldEvents(emptyAggregates(5), [{ type: "tool_call", name: "t" }]);
  assert.equal(out.eventCount, 6);
});
