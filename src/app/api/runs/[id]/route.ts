import { NextResponse } from "next/server";
import { getRun } from "@/lib/ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/runs/:id — one run's summary + event timeline. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await getRun(id);
    if (!data.run) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "server error", message: String(err) }, { status: 500 });
  }
}
