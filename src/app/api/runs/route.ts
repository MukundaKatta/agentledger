import { NextResponse } from "next/server";
import { listRuns } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/runs — recent runs, newest first. */
export async function GET() {
  try {
    const runs = await listRuns(50);
    return NextResponse.json({ runs });
  } catch (err) {
    return NextResponse.json({ error: "server error", message: String(err) }, { status: 500 });
  }
}
