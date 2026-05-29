import type { RunSummary } from "@/lib/types";

export function StatCards({ runs }: { runs: RunSummary[] }) {
  const totalUsd = runs.reduce((s, r) => s + (r.totalUsd ?? 0), 0);
  const totalTokens = runs.reduce((s, r) => s + (r.totalTokens ?? 0), 0);
  const toolCalls = runs.reduce((s, r) => s + (r.toolCalls ?? 0), 0);
  const errors = runs.reduce((s, r) => s + (r.errors ?? 0), 0);

  return (
    <div className="grid">
      <Stat label="Runs" value={runs.length.toLocaleString()} />
      <Stat label="Spend" value={`$${totalUsd.toFixed(4)}`} />
      <Stat label="Tokens" value={totalTokens.toLocaleString()} />
      <Stat label="Tool calls / errors" value={`${toolCalls} / ${errors}`} />
    </div>
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
