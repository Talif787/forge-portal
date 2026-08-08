export class ApiError extends Error {
  code: string;
  status: number;
  details?: string[];

  constructor(message: string, code: string, status: number, details?: string[]) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface ErrorBody {
  code?: string;
  message?: string;
  details?: string[];
}

// apiFetch talks to the Next.js BFF proxy (never the backend directly), so the
// browser stays same-origin and token-free. It normalizes the backend's error
// envelope into a typed ApiError.
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/proxy/${path}`, { ...init, cache: "no-store" });
  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : undefined;

  if (!res.ok) {
    const e = (body ?? {}) as ErrorBody;
    throw new ApiError(e.message ?? res.statusText, e.code ?? String(res.status), res.status, e.details);
  }
  return body as T;
}
