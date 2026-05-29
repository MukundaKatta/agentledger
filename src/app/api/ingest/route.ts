import { NextResponse } from "next/server";
import { IngestPayload } from "@/lib/types";
import { recordIngest } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/ingest — agents report a run + events here. Auth: x-ingest-token. */
export async function POST(req: Request) {
  const token = process.env.INGEST_TOKEN;
  if (token && req.headers.get("x-ingest-token") !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = IngestPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const run = await recordIngest(parsed.data);
    return NextResponse.json({ ok: true, run });
  } catch (err) {
    console.error("ingest error", err);
    return NextResponse.json({ error: "server error", message: String(err) }, { status: 500 });
  }
}
