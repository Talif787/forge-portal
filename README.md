# Forge Portal

The web control plane for Forge, an internal developer platform. A Next.js 15
App Router application that fully covers the Forge control-plane HTTP API
(catalog services and tenants).

## Stack

TypeScript, Next.js 15 (App Router), TanStack Query (data, caching, retries),
Zod (schema-validated API responses), Tailwind CSS with a shadcn-style token
system, class-variance-authority for component variants, next-themes for
light/dark/system, Radix primitives, lucide icons, and Vitest with Testing
Library.

## Architecture

The browser never holds a token. It calls the Next.js backend-for-frontend proxy
at `/api/proxy/<path>`, which mints a short-lived token server-side (from a
secret that stays on the server) and forwards to the control plane. This keeps
credentials off the client and avoids CORS, since the browser is always
same-origin. In production the dev-token step is replaced by an OIDC session.

```
src/
  app/               routes (App Router) + the BFF proxy under app/api
  components/ui/     design-system primitives (button, card, badge, skeleton)
  components/        composed pieces (sidebar, theme toggle)
  features/          per-domain data layer: Zod schema + TanStack Query hooks
    catalog/  tenants/  health/
  lib/               api client, dev-token signing, query client, utils
  providers/         React Query + theme providers
```

## Prerequisites

The Forge backend must be running and reachable, with its
`FORGE_AUTH_HMAC_SECRET` matching this app's (dev / hmac mode).

## Setup

```bash
cp .env.example .env.local     # ensure FORGE_AUTH_HMAC_SECRET matches the backend
npm install                    # add --legacy-peer-deps if peer deps conflict
npm run build                  # type-checks and compiles (the gate)
npm run dev                    # http://localhost:3000
```

## Environment

| Variable | Default | Purpose |
|---|---|---|
| FORGE_BACKEND_URL | http://localhost:8080 | Control-plane base URL (server-side only) |
| FORGE_AUTH_HMAC_SECRET | local-development-secret-change-me | Must match the backend in dev |
| FORGE_DEV_SUBJECT | portal-dev-user | Subject claim in the dev token |
| FORGE_DEV_GROUPS | platform | Groups claim in the dev token |

## Testing

```bash
npm run test        # Vitest unit/component tests
npm run typecheck   # tsc --noEmit
npm run build       # full build
```

## Scope

Phase 1 delivers the foundation (providers, tokens, theme, design-system
primitives, schema-validated data layer) and read views for the dashboard,
services, and tenants. Later phases add create/edit forms with React Hook Form
and Zod, TanStack Table with sorting and bulk actions, optimistic mutations with
`If-Match` concurrency, and a command palette.

## Security notes

The critical React Server Components RCE (React2Shell, CVE-2025-66478) and the
follow-up DoS/source-exposure advisories are patched: this app pins `next@15.1.11`
and `react@19.0.1`, verified with `npx fix-react2shell-next` ("no vulnerable
packages found").

The remaining `npm audit` findings are transitive, dev/build-time only, and not
reachable in the shipped runtime: esbuild's dev-server advisory (via Vitest), and
copies of postcss and sharp bundled inside Next 15's own dependency tree. The only
`npm audit fix --force` remedy is a breaking upgrade to Next 16, which is deferred
rather than applied blindly. This is a deliberate, documented decision.
