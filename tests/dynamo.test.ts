import assert from "node:assert/strict";
import { test } from "node:test";

import { runPk, evtSk, META_SK, RUNS_GSI_PK, GSI1 } from "../src/lib/dynamo";

test("runPk namespaces a runId under the RUN# partition", () => {
  assert.equal(runPk("run-123"), "RUN#run-123");
  assert.equal(runPk(""), "RUN#");
});

test("evtSk zero-pads the seq to 6 digits so lexical sort == numeric sort", () => {
  const ts = "2026-01-01T00:00:00.000Z";
  assert.equal(evtSk(1, ts), `EVT#${ts}#000001`);
  assert.equal(evtSk(42, ts), `EVT#${ts}#000042`);
  assert.equal(evtSk(123456, ts), `EVT#${ts}#123456`);
});

test("evtSk keys sort by timestamp then seq lexicographically", () => {
  // Same timestamp: padding makes 2 sort before 10 (it would not, unpadded).
  const a = evtSk(2, "2026-01-01T00:00:00.000Z");
  const b = evtSk(10, "2026-01-01T00:00:00.000Z");
  assert.ok(a < b, `${a} should sort before ${b}`);

  // ISO-8601 timestamps sort chronologically as plain strings.
  const earlier = evtSk(1, "2026-01-01T00:00:00.000Z");
  const later = evtSk(1, "2026-01-02T00:00:00.000Z");
  assert.ok(earlier < later, `${earlier} should sort before ${later}`);
});

test("constants match the documented single-table design", () => {
  assert.equal(META_SK, "#META");
  assert.equal(RUNS_GSI_PK, "RUNS");
  assert.equal(GSI1, "GSI1");
});

test("the meta sort key sorts before any event sort key for a run", () => {
  // "#META" must precede "EVT#..." so a forward query returns meta first.
  const evt = evtSk(1, "2026-01-01T00:00:00.000Z");
  assert.ok(META_SK < evt, `${META_SK} should sort before ${evt}`);
});
