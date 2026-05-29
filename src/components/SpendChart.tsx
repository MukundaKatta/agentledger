import type { RunSummary } from "@/lib/types";

/** Tiny dependency-free SVG bar chart of spend across recent runs (oldest → newest). */
export function SpendChart({ runs }: { runs: RunSummary[] }) {
  const data = runs.slice(0, 24).reverse();
  if (data.length === 0) return null;

  const max = Math.max(...data.map((r) => r.totalUsd), 0.0001);
  const W = 100;
  const H = 36;
  const gap = 0.8;
  const bw = (W - gap * (data.length - 1)) / data.length;

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <span className="muted">Spend per recent run (USD)</span>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 64, marginTop: 8, display: "block" }}
        role="img"
        aria-label="Spend per recent run"
      >
        {data.map((r, i) => {
          const h = Math.max(0.6, (r.totalUsd / max) * (H - 2));
          const fill = r.status === "error" ? "var(--err)" : "var(--accent)";
          return (
            <rect
              key={r.runId}
              x={i * (bw + gap)}
              y={H - h}
              width={bw}
              height={h}
              rx={0.4}
              fill={fill}
            />
          );
        })}
      </svg>
    </div>
  );
}
