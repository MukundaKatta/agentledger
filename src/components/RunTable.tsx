import Link from "next/link";
import type { RunSummary } from "@/lib/types";

export function RunTable({ runs }: { runs: RunSummary[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Agent</th>
          <th>Model</th>
          <th>Status</th>
          <th className="num">Cost</th>
          <th className="num">Tokens</th>
          <th className="num">Tools</th>
          <th>Started</th>
        </tr>
      </thead>
      <tbody>
        {runs.map((r) => (
          <tr key={r.runId}>
            <td>
              <Link className="linkrow" href={`/runs/${encodeURIComponent(r.runId)}`}>
                {r.agent}
              </Link>
            </td>
            <td>{r.model ?? "—"}</td>
            <td>
              <span className={`pill ${r.status}`}>{r.status}</span>
            </td>
            <td className="num">${(r.totalUsd ?? 0).toFixed(4)}</td>
            <td className="num">{(r.totalTokens ?? 0).toLocaleString()}</td>
            <td className="num">{r.toolCalls ?? 0}</td>
            <td>{new Date(r.startedAt).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
