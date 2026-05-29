import type { StoredEvent } from "@/lib/types";

export function EventTimeline({ events }: { events: StoredEvent[] }) {
  if (events.length === 0) {
    return <p className="muted">No events recorded for this run.</p>;
  }
  return (
    <div className="timeline">
      {events.map((e) => (
        <div className="evt" key={e.seq}>
          <span className={`kind ${e.type}`}>{e.type.replace("_", " ")}</span>
          <span>
            <strong>{e.name}</strong>
            {e.detail ? <span className="muted"> — {e.detail}</span> : null}
          </span>
          <span className="meta">
            {e.tokens ? `${e.tokens.toLocaleString()} tok · ` : ""}
            {e.usd ? `$${e.usd.toFixed(4)} · ` : ""}
            {e.latencyMs ? `${e.latencyMs} ms` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
