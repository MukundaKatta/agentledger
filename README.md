# agentledger

**Zero-ops observability for AI agents.** Every run, tool call, token, and dollar — stored in **Amazon DynamoDB**, served from a **Next.js app on Vercel**. No servers, no database cluster, no ops. That is the "zero stack."

> Built for **H0: Hack the Zero Stack with Vercel v0 and AWS Databases**. DynamoDB is the primary (and only) datastore; the frontend deploys on Vercel.

---

## Why DynamoDB is the right backend

Agent telemetry is an append-heavy event log: thousands of small writes keyed by run, read back as "recent runs" and "this run's timeline." That is exactly DynamoDB's sweet spot — a single-table design with one GSI covers every access pattern with no joins, no schema migrations, and no connection pool to babysit from serverless functions.

See [`docs/architecture.md`](docs/architecture.md) for the diagram and data model.

```
agents ──POST /api/ingest──▶  Vercel (Next.js functions)  ──Put/BatchWrite──▶  DynamoDB
browser ─────────────────▶  Vercel (dashboard, server)   ──Query GSI1───────▶  DynamoDB
```

---

## Quickstart (local)

```bash
npm install
cp .env.example .env          # fill in AWS creds + a random INGEST_TOKEN
npm run create-table          # one-time: creates the DynamoDB table + GSI1
npm run seed                  # optional: 12 synthetic runs so the UI has data
npm run dev                   # http://localhost:3000
```

No AWS yet? The dashboard still loads and shows a "connect AWS" state — it never crashes without credentials.

---

## AWS setup

1. **Credentials.** Create an IAM user (or use SSO locally). For *running* the app, the least-privilege policy is in [`iam-policy.json`](iam-policy.json) (Get/Put/BatchWrite/Query on the `AgentLedger` table + its indexes). Creating the table needs `CreateTable`/`DescribeTable`, so run `npm run create-table` with an admin profile, then hand the app the scoped key.
2. **Table.** `npm run create-table` builds table `AgentLedger` (on-demand billing) with keys `pk`/`sk` and index `GSI1` (`GSI1PK`/`GSI1SK`). Override the name with `DDB_TABLE`.
3. **Env vars** (see `.env.example`): `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DDB_TABLE`, `INGEST_TOKEN`.

---

## Deploy to Vercel

1. Push this repo to GitHub, then **Vercel → Add New → Project → Import**.
2. Framework preset auto-detects **Next.js**. No build overrides needed.
3. **Project → Settings → Environment Variables** — add `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DDB_TABLE`, `INGEST_TOKEN`.
4. **Deploy.** Open the URL, click **Send test run** (or `npm run seed` against the same table) and watch rows land in DynamoDB.

---

## Ingest API

`POST /api/ingest` with header `x-ingest-token: <INGEST_TOKEN>`:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/ingest \
  -H "x-ingest-token: $INGEST_TOKEN" \
  -H "content-type: application/json" \
  -d '{
    "runId": "run-123",
    "agent": "research-agent",
    "model": "gemini-2.5-flash",
    "status": "ok",
    "events": [
      {"type":"model_call","name":"gemini-2.5-flash","tokens":1240,"usd":0.0025,"latencyMs":900},
      {"type":"tool_call","name":"web_search","latencyMs":320}
    ]
  }'
```

Calls are additive: POST again with the same `runId` to append events and roll up totals. A Python reporter is in [`examples/report.py`](examples/report.py). Read endpoints: `GET /api/runs`, `GET /api/runs/:id`.

---

## H0 submission checklist

| H0 requirement | Where it's covered |
|---|---|
| **AWS database as primary backend** | DynamoDB single-table `AgentLedger` is the only datastore ([`src/lib/dynamo.ts`](src/lib/dynamo.ts), [`src/lib/ingest.ts`](src/lib/ingest.ts)) |
| **Frontend on Vercel / v0** | Next.js App Router app, zero-config Vercel deploy |
| **Architecture diagram** | [`docs/architecture.md`](docs/architecture.md) (Mermaid — renders on GitHub; screenshot it for the form) |
| **Demo video (< 3 min)** | Script below |
| **Screenshots proving DynamoDB usage** | DynamoDB console → `AgentLedger` → *Explore items* (show `RUN#…` + `EVT#…` rows) |
| **Published Vercel link + Team ID** | Your deploy URL; Team ID in Vercel → Settings → General |

**Eligibility:** open to the US; solo entry is fine. **Built-during:** this project is created new during the H0 submission window — git history shows first commit inside the window, satisfying the "built during the event" rule honestly.

### 90-second video script
1. One line: "agentledger — zero-ops observability for AI agents on Vercel + DynamoDB."
2. Show the live Vercel dashboard. Click **Send test run** → a row appears.
3. Open a run → show the event timeline (model calls, tool calls, cost, latency).
4. Cut to the **DynamoDB console** → `AgentLedger` → *Explore items* → show the `RUN#…`/`EVT#…` items that just appeared. (This is the "AWS database in use" proof judges want.)
5. One line on the architecture diagram: agents → Vercel functions → DynamoDB, no servers.

---

## Development & testing

The cost/event aggregation and the single-table key helpers are pure functions, kept
separate from the DynamoDB client so they can be unit-tested without any AWS credentials.

```bash
npm install
npm test          # runs the unit suite (node:test via tsx, no AWS needed)
npm run build     # production Next.js build
npx tsc --noEmit  # type-check only
```

`npm test` discovers every `tests/**/*.test.ts` file. The suite covers:

- `foldEvents` / `emptyAggregates` — cost, token and latency roll-ups and idempotent appends ([`tests/aggregate.test.ts`](tests/aggregate.test.ts)).
- `runPk` / `evtSk` — single-table key construction and the zero-padding that keeps event sort keys in numeric order ([`tests/dynamo.test.ts`](tests/dynamo.test.ts)).
- The `IngestPayload` / `RunEventInput` Zod schemas — defaults, bounds and rejection of bad input ([`tests/types.test.ts`](tests/types.test.ts)).
- `syntheticRun` — every generated demo run validates against the real ingest schema ([`tests/demo.test.ts`](tests/demo.test.ts)).

Every push and pull request runs type-check, tests and the build on Node 20 and 22 via
GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

---

## What's here

```
src/lib/        DynamoDB client, single-table helpers, ingest + query logic, demo generator
src/app/        dashboard (/), run detail (/runs/[id]), API routes (/api/ingest|runs|demo)
src/components/ StatCards, RunTable, EventTimeline, SendTestRun
scripts/        create-table, delete-table, seed
tests/          unit tests for the pure aggregation, key, schema and demo helpers
docs/           architecture diagram + data model
examples/       report.py (agent-side reporter)
iam-policy.json least-privilege runtime policy
.github/        CI workflow (type-check + test + build on Node 20/22)
```

MIT.
