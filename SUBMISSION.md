# agentledger — Devpost submission copy

Paste-ready. Written for H0: Hack the Zero Stack with Vercel v0 and AWS Databases.

## Tagline
Every agent run, tool call, token, and dollar. Stored in DynamoDB, served on Vercel.

## Inspiration
I run a lot of small AI agents and I could never answer simple questions about them. What did that run cost? Which tool calls were slow? Did it error out? The data was scattered across logs. I wanted one page that answers those questions, with no server to run and no database to babysit.

## What it does
Agents send their runs to one endpoint. Each run lands on a dashboard with cost, tokens, tool calls, and latency, plus a bar chart of spend across recent runs. Click a run to see the full timeline of model calls, tool calls, and errors. A "send test run" button fills the dashboard with data in one click.

## How I built it
Next.js on Vercel for the dashboard and the API routes. Amazon DynamoDB is the only datastore, with a single-table design and one index, so "recent runs" and "one run's timeline" each take a single query. The serverless functions talk straight to DynamoDB over HTTPS, so there is no connection pool and nothing to keep warm. Ingest is additive, so an agent can post the same run id again and the totals roll up.

## Challenges I ran into
Staying truly zero-ops came down to the key design. I used a constant partition with a time-sorted index for the run list, and a per-run partition for the timeline, so everything is one query and there are no scans. I also made the dashboard degrade gracefully when AWS is not set, so it never shows a blank 500. The run aggregation is a pure function with its own unit tests, separate from the DynamoDB code.

## What's next
Alerts on cost spikes, a compare view across agents, and retention windows on the event log.

## Built with
typescript, next.js, react, vercel, amazon-dynamodb, aws-sdk

## Try it out
- Code: https://github.com/MukundaKatta/agentledger
- Live: [paste your Vercel URL here]

## Demo video script (about 75 seconds)
1. "This is agentledger. Agent observability on Vercel and DynamoDB, no servers." Show the dashboard.
2. Click "send test run." A row and a chart bar appear.
3. Open a run. Walk the timeline: model call, tool call, cost, latency.
4. Switch to the DynamoDB console. Show the RUN# and EVT# items that just landed.
5. Show the architecture diagram in the README: agents to Vercel functions to DynamoDB.
6. "One table, one index, zero servers." Done.

## Steps left before you can submit (need your AWS account)
1. You are not registered for H0 yet (it was in your recommendations, not your joined list). Join it on Devpost first.
2. Set AWS env vars and run `npm run create-table`.
3. Deploy to Vercel, set the same env vars there, then `npm run seed` for demo data.
4. Record the video above and upload it to YouTube.
5. Submit with the live Vercel URL, your Vercel Team ID, and docs/architecture.md.
