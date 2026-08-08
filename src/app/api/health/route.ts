import { NextResponse } from "next/server";

const BACKEND = process.env.FORGE_BACKEND_URL ?? "http://localhost:8080";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/readyz`, { cache: "no-store" });
    const body = (await res.json().catch(() => ({ status: "unknown" }))) as { status?: string };
    return NextResponse.json({ ok: res.ok, status: body.status ?? "unknown" });
  } catch {
    return NextResponse.json({ ok: false, status: "unreachable" });
  }
}
