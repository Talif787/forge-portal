import { SignJWT } from "jose";

// Signs a short-lived HS256 token matching the backend's dev (hmac) verifier.
// Runs only on the server (in the proxy route handler), so the secret never
// reaches the browser. In production this is replaced by an OIDC session.
export async function mintDevToken(): Promise<string> {
  const secret = new TextEncoder().encode(
    process.env.FORGE_AUTH_HMAC_SECRET ?? "local-development-secret-change-me",
  );
  const groups = (process.env.FORGE_DEV_GROUPS ?? "platform")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);

  return new SignJWT({ email: "dev@portal.forge", groups })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(process.env.FORGE_DEV_SUBJECT ?? "portal-dev-user")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}
