# Forge Portal

The web control plane for Forge, an internal developer platform. A Next.js 15
App Router application that provides a unified interface over the Forge control
plane: catalog services, tenants, and reconciled Kubernetes applications.

## Features

Dashboard with live control-plane health and counts. Full catalog management:
list (sortable, filterable, paginated), create with validation, and every state
transition (lifecycle, ownership, retire) with optimistic updates. Full tenant
management: create, status changes, and quota updates. A read-only applications
view pairing each workload's declared intent with its live reconcile status and
conditions. A Ctrl/Cmd-K command palette to search and jump across everything.
Light, dark, and system themes.

## Stack

TypeScript, Next.js 15 (App Router), TanStack Query (data, caching, optimistic
mutations, If-Match concurrency), TanStack Table (sorting, filtering,
pagination), React Hook Form + Zod (validated forms and schema-checked API
responses), Tailwind CSS with a shadcn-style token system, class-variance-
authority, Radix primitives, cmdk (command palette), next-themes, sonner
(toasts), lucide icons, and Vitest with Testing Library.

## Architecture

The browser never holds a token. It calls the Next.js backend-for-frontend proxy
at `/api/proxy/<path>`, which mints a short-lived token server-side and forwards
to the control plane. This keeps credentials off the client and avoids CORS. In
production the dev-token step is replaced by an OIDC session. See
`docs/ARCHITECTURE.md` for the full system diagram and design decisions.

```
src/
  app/            routes + the BFF proxy under app/api; error, not-found, loading
  components/ui/  design-system primitives (button, card, badge, input, dialog,
                  table, data-table, command, ...)
  components/     composed pieces (sidebar, theme toggle, command palette)
  features/       per-domain data layer (Zod schema + Query hooks + columns):
                  catalog, tenants, applications, health
  lib/            api client, dev-token signing, query client, utils
  providers/      React Query + theme providers
```

## Prerequisites

The Forge backend must be running and reachable, with its
`FORGE_AUTH_HMAC_SECRET` matching this app's. The applications view additionally
requires the backend to be configured with a Kubernetes cluster; without one it
degrades gracefully to an "unavailable" panel while catalog and tenants continue
to work.

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

## Security notes

The critical React Server Components RCE (React2Shell) and follow-up advisories
are patched; this app pins a patched Next.js and React 19.0.1, verified with
`npx fix-react2shell-next`. Remaining `npm audit` findings are transitive,
dev/build-time only (test runner and CSS tooling), not reachable in the shipped
runtime, and are deliberately not force-fixed to avoid breaking major upgrades.

## Scope

The portal covers everything the control plane exposes over HTTP: catalog,
tenants, and reconciled applications. Provisioning (Temporal workflows) is not
yet surfaced; it would need a read endpoint on the control plane, after which a
provisioning view would follow the same pattern as the applications view.
