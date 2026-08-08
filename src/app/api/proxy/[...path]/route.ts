import { NextRequest, NextResponse } from "next/server";
import { mintDevToken } from "@/lib/auth";

const BACKEND = process.env.FORGE_BACKEND_URL ?? "http://localhost:8080";

// Backend-for-frontend proxy: the browser calls /api/proxy/<path>; this handler
// injects the bearer token server-side and forwards to the control plane. Keeps
// the token off the client and avoids CORS, since the browser only talks to the
// Next.js origin. If-Match and Idempotency-Key pass through for concurrency and
// idempotency.
async function forward(req: NextRequest, path: string[]): Promise<NextResponse> {
  const token = await mintDevToken();
  const url = `${BACKEND}/api/v1/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  headers.set("authorization", `Bearer ${token}`);
  for (const h of ["content-type", "if-match", "idempotency-key"]) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }

  const method = req.method.toUpperCase();
  const body = method === "GET" || method === "HEAD" ? undefined : await req.text();

  let upstream: Response;
  try {
    upstream = await fetch(url, { method, headers, body, cache: "no-store" });
  } catch {
    return NextResponse.json(
      { code: "BACKEND_UNREACHABLE", message: "the control plane is not reachable", correlationId: "" },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const out = new NextResponse(text, { status: upstream.status });
  out.headers.set("content-type", upstream.headers.get("content-type") ?? "application/json");
  for (const h of ["etag", "location"]) {
    const v = upstream.headers.get(h);
    if (v) out.headers.set(h, v);
  }
  return out;
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return forward(req, (await ctx.params).path);
}
