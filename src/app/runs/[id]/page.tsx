import Link from "next/link";
import { notFound } from "next/navigation";
import { getRun } from "@/lib/ingest";
import { EventTimeline } from "@/components/EventTimeline";

export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { run, events } = await getRun(id);
  if (!run) notFound();

  return (
    <>
      <p>
        <Link className="muted" href="/">
          ← all runs
        </Link>
      </p>
      <div className="pagehead">
        <div>
          <h1>{run.agent}</h1>
          <p className="muted">
            run <code>{run.runId}</code> · {run.model ?? "—"} ·{" "}
            <span className={`pill ${run.status}`}>{run.status}</span>
          </p>
        </div>
      </div>

      <div className="grid">
        <Stat label="Cost" value={`$${run.totalUsd.toFixed(4)}`} />
        <Stat label="Tokens" value={run.totalTokens.toLocaleString()} />
        <Stat label="Tool calls" value={String(run.toolCalls)} />
        <Stat label="Latency" value={`${run.latencyMs.toLocaleString()} ms`} />
      </div>

      <h2>Timeline</h2>
      <EventTimeline events={events} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card stat">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
