import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Single-table design (the "zero stack" backend):
 *   pk = RUN#<runId>, sk = "#META"            -> aggregated run summary
 *   pk = RUN#<runId>, sk = EVT#<ts>#<seq>     -> one event in that run
 *   GSI1: GSI1PK = "RUNS", GSI1SK = startedAt -> list recent runs newest-first
 *
 * DynamoDB is the only datastore. No cluster, no connection pool — the
 * AWS SDK talks HTTPS straight from Vercel's serverless functions.
 */

export const TABLE = process.env.DDB_TABLE ?? "AgentLedger";
export const GSI1 = "GSI1";
export const RUNS_GSI_PK = "RUNS";
export const META_SK = "#META";

export const runPk = (runId: string) => `RUN#${runId}`;
export const evtSk = (seq: number, ts: string) =>
  `EVT#${ts}#${String(seq).padStart(6, "0")}`;

let _doc: DynamoDBDocumentClient | null = null;

/** Lazily-built Document client so `next build` never needs credentials. */
export function doc(): DynamoDBDocumentClient {
  if (_doc) return _doc;
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION ?? "us-east-1",
    // credentials come from the default provider chain:
    // AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (Vercel env) or `aws configure` locally.
  });
  _doc = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  });
  return _doc;
}
