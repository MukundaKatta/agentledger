import { recordIngest } from "../src/lib/ingest";
import { syntheticRun } from "../src/lib/demo";

const N = Number(process.env.SEED_COUNT ?? 12);

async function main() {
  const table = process.env.DDB_TABLE ?? "AgentLedger";
  console.log(`Seeding ${N} synthetic runs into "${table}" ...`);
  for (let i = 0; i < N; i++) {
    const run = await recordIngest(syntheticRun());
    console.log(`  + ${run.agent.padEnd(14)} ${run.runId}  $${run.totalUsd.toFixed(4)}  ${run.status}`);
  }
  console.log("Done. Open the dashboard to see them.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
