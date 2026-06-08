import assert from "node:assert/strict";
import { test } from "node:test";

import { syntheticRun } from "../src/lib/demo";
import { IngestPayload } from "../src/lib/types";
import { emptyAggregates, foldEvents } from "../src/lib/aggregate";

test("syntheticRun always produces a payload that passes IngestPayload validation", () => {
  // Run many times because the generator is randomized.
  for (let i = 0; i < 200; i++) {
    const run = syntheticRun();
    const res = IngestPayload.safeParse(run);
    assert.equal(res.success, true, `synthetic run failed validation: ${JSON.stringify(run)}`);
  }
});

test("syntheticRun emits a unique runId per call", () => {
  const ids = new Set(Array.from({ length: 50 }, () => syntheticRun().runId));
  assert.equal(ids.size, 50);
});

test("syntheticRun status is consistent with whether an error event was emitted", () => {
  for (let i = 0; i < 200; i++) {
    const run = syntheticRun();
    const hasError = run.events.some((e) => e.type === "error");
    if (hasError) {
      assert.equal(run.status, "error");
    } else {
      assert.equal(run.status, "ok");
    }
  }
});

test("syntheticRun events fold into non-negative aggregates", () => {
  const run = syntheticRun();
  const agg = foldEvents(emptyAggregates(), run.events);
  assert.ok(agg.totalUsd >= 0);
  assert.ok(agg.totalTokens >= 0);
  assert.ok(agg.latencyMs >= 0);
  assert.equal(agg.eventCount, run.events.length);
  assert.equal(agg.modelCalls + agg.toolCalls + agg.errors, run.events.length);
});
