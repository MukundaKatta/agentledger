import { z } from "zod";

/** What kind of thing happened inside an agent run. */
export const EventType = z.enum(["model_call", "tool_call", "error", "info"]);
export type EventType = z.infer<typeof EventType>;

/** One reported event inside a run (a model call, a tool call, an error, …). */
export const RunEventInput = z.object({
  type: EventType,
  name: z.string().min(1).max(200),
  ts: z.string().datetime().optional(), // ISO 8601; defaults to server time
  usd: z.number().nonnegative().optional(),
  tokens: z.number().int().nonnegative().optional(),
  latencyMs: z.number().nonnegative().optional(),
  detail: z.string().max(4000).optional(),
});
export type RunEventInput = z.infer<typeof RunEventInput>;

/** Payload accepted by POST /api/ingest. Safe to call repeatedly for the same runId. */
export const IngestPayload = z.object({
  runId: z.string().min(1).max(120),
  agent: z.string().min(1).max(120).default("unknown"),
  model: z.string().max(120).optional(),
  status: z.enum(["running", "ok", "error"]).default("running"),
  startedAt: z.string().datetime().optional(),
  events: z.array(RunEventInput).default([]),
});
export type IngestPayload = z.infer<typeof IngestPayload>;

/** Aggregated run record stored at sk = "#META" and shown on the dashboard. */
export interface RunSummary {
  runId: string;
  agent: string;
  model?: string;
  status: "running" | "ok" | "error";
  startedAt: string;
  updatedAt: string;
  totalUsd: number;
  totalTokens: number;
  toolCalls: number;
  modelCalls: number;
  errors: number;
  latencyMs: number;
  eventCount: number;
}

/** A single stored event, returned on the run detail page. */
export interface StoredEvent {
  seq: number;
  ts: string;
  type: EventType;
  name: string;
  usd: number;
  tokens: number;
  latencyMs: number;
  detail?: string;
}
