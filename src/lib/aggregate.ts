import type { RunEventInput } from "./types";

/** Rolled-up totals for a run. Pure + DynamoDB-free so it's unit-testable. */
export interface Aggregates {
  totalUsd: number;
  totalTokens: number;
  toolCalls: number;
  modelCalls: number;
  errors: number;
  latencyMs: number;
  eventCount: number;
}

export function emptyAggregates(eventCount = 0): Aggregates {
  return {
    totalUsd: 0,
    totalTokens: 0,
    toolCalls: 0,
    modelCalls: 0,
    errors: 0,
    latencyMs: 0,
    eventCount,
  };
}

/** Fold events onto a base total. Calling again with more events keeps accumulating. */
export function foldEvents(base: Aggregates, events: RunEventInput[]): Aggregates {
  const a = { ...base };
  for (const e of events) {
    a.totalUsd += e.usd ?? 0;
    a.totalTokens += e.tokens ?? 0;
    a.latencyMs += e.latencyMs ?? 0;
    if (e.type === "tool_call") a.toolCalls += 1;
    else if (e.type === "model_call") a.modelCalls += 1;
    else if (e.type === "error") a.errors += 1;
    a.eventCount += 1;
  }
  return a;
}
