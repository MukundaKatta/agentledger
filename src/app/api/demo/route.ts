import { NextResponse } from "next/server";
import { recordIngest } from "@/lib/ingest";
import { syntheticRun } from "@/lib/demo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/demo — writes one synthetic run to DynamoDB (powers the "Send test run" button). */
export async function POST() {
  try {
    const run = await recordIngest(syntheticRun());
    return NextResponse.json({ ok: true, run });
  } catch (err) {
    return NextResponse.json({ error: "server error", message: String(err) }, { status: 500 });
  }
}
