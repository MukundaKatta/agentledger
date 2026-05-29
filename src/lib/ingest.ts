import {
  GetCommand,
  PutCommand,
  QueryCommand,
  BatchWriteCommand,
  type BatchWriteCommandInput,
  type BatchWriteCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import {
  doc,
  TABLE,
  GSI1,
  RUNS_GSI_PK,
  META_SK,
  runPk,
  evtSk,
} from "./dynamo";
import { foldEvents } from "./aggregate";
import type { IngestPayload, RunSummary, StoredEvent } from "./types";

/**
 * Upsert a run and append its events. Idempotent-friendly: calling again with
 * the same runId continues the run (events append, totals accumulate).
 */
export async function recordIngest(p: IngestPayload): Promise<RunSummary> {
  const d = doc();
  const now = new Date().toISOString();

  const existing = await d.send(
    new GetCommand({ TableName: TABLE, Key: { pk: runPk(p.runId), sk: META_SK } }),
  );
  const prev = existing.Item as RunSummary | undefined;

  const startedAt = prev?.startedAt ?? p.startedAt ?? now;
  const seqBase = prev?.eventCount ?? 0;

  const agg = foldEvents(
    {
      totalUsd: prev?.totalUsd ?? 0,
      totalTokens: prev?.totalTokens ?? 0,
      toolCalls: prev?.toolCalls ?? 0,
      modelCalls: prev?.modelCalls ?? 0,
      errors: prev?.errors ?? 0,
      latencyMs: prev?.latencyMs ?? 0,
      eventCount: seqBase,
    },
    p.events,
  );

  const eventItems = p.events.map((e, i) => {
    const seq = seqBase + i + 1;
    const ts = e.ts ?? now;
    return {
      pk: runPk(p.runId),
      sk: evtSk(seq, ts),
      seq,
      ts,
      type: e.type,
      name: e.name,
      usd: e.usd ?? 0,
      tokens: e.tokens ?? 0,
      latencyMs: e.latencyMs ?? 0,
      detail: e.detail,
    };
  });

  const meta = {
    pk: runPk(p.runId),
    sk: META_SK,
    GSI1PK: RUNS_GSI_PK,
    GSI1SK: startedAt,
    runId: p.runId,
    agent: p.agent ?? prev?.agent ?? "unknown",
    model: p.model ?? prev?.model,
    status: p.status ?? prev?.status ?? "running",
    startedAt,
    updatedAt: now,
    ...agg,
  };

  // Events first (batches of 25), then the aggregated meta item.
  for (let i = 0; i < eventItems.length; i += 25) {
    const chunk = eventItems.slice(i, i + 25);
    let requestItems: BatchWriteCommandInput["RequestItems"] = {
      [TABLE]: chunk.map((Item) => ({ PutRequest: { Item } })),
    };
    // retry any unprocessed items a few times (DynamoDB can throttle batches)
    for (let attempt = 0; attempt < 5 && requestItems && Object.keys(requestItems).length; attempt++) {
      const res: BatchWriteCommandOutput = await d.send(
        new BatchWriteCommand({ RequestItems: requestItems }),
      );
      requestItems =
        res.UnprocessedItems && Object.keys(res.UnprocessedItems).length
          ? res.UnprocessedItems
          : undefined;
    }
  }

  await d.send(new PutCommand({ TableName: TABLE, Item: meta }));

  return stripKeys(meta) as unknown as RunSummary;
}

/** Recent runs, newest first, via GSI1. */
export async function listRuns(limit = 50): Promise<RunSummary[]> {
  const d = doc();
  const res = await d.send(
    new QueryCommand({
      TableName: TABLE,
      IndexName: GSI1,
      KeyConditionExpression: "GSI1PK = :p",
      ExpressionAttributeValues: { ":p": RUNS_GSI_PK },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return (res.Items ?? []).map(stripKeys) as unknown as RunSummary[];
}

/** A run's meta + its events, oldest event first. */
export async function getRun(
  runId: string,
): Promise<{ run: RunSummary | null; events: StoredEvent[] }> {
  const d = doc();
  const res = await d.send(
    new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: "pk = :p",
      ExpressionAttributeValues: { ":p": runPk(runId) },
      ScanIndexForward: true,
    }),
  );
  const items = res.Items ?? [];
  let run: RunSummary | null = null;
  const events: StoredEvent[] = [];
  for (const it of items) {
    if (it.sk === META_SK) {
      run = stripKeys(it) as unknown as RunSummary;
    } else {
      events.push({
        seq: it.seq,
        ts: it.ts,
        type: it.type,
        name: it.name,
        usd: it.usd ?? 0,
        tokens: it.tokens ?? 0,
        latencyMs: it.latencyMs ?? 0,
        detail: it.detail,
      });
    }
  }
  events.sort((a, b) => a.seq - b.seq);
  return { run, events };
}

function stripKeys(it: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...it };
  delete rest.pk;
  delete rest.sk;
  delete rest.GSI1PK;
  delete rest.GSI1SK;
  return rest;
}
