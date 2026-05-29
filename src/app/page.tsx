import { listRuns } from "@/lib/ingest";
import { StatCards } from "@/components/StatCards";
import { RunTable } from "@/components/RunTable";
import { SendTestRun } from "@/components/SendTestRun";
import type { RunSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let runs: RunSummary[] = [];
  let error: string | null = null;
  try {
    runs = await listRuns(50);
  } catch (err) {
    error = String(err);
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <h1>Agent runs</h1>
          <p className="muted">A live ledger of every agent run, backed by Amazon DynamoDB.</p>
        </div>
        <SendTestRun />
      </div>

      {error ? (
        <div className="card warn">
          <strong>Can’t reach DynamoDB yet.</strong>
          <p className="muted" style={{ marginTop: 8 }}>
            Set <code>AWS_REGION</code>, <code>AWS_ACCESS_KEY_ID</code>,{" "}
            <code>AWS_SECRET_ACCESS_KEY</code>, <code>DDB_TABLE</code> and run{" "}
            <code>npm run create-table</code>. See the README.
          </p>
          <p className="muted" style={{ marginTop: 8, opacity: 0.7 }}>{error}</p>
        </div>
      ) : runs.length === 0 ? (
        <div className="card">
          <strong>No runs yet.</strong>
          <p className="muted" style={{ marginTop: 8 }}>
            Click <strong>Send test run</strong>, run <code>npm run seed</code>, or POST to{" "}
            <code>/api/ingest</code>.
          </p>
        </div>
      ) : (
        <>
          <StatCards runs={runs} />
          <RunTable runs={runs} />
        </>
      )}
    </>
  );
}
