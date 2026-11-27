# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev            # start dev server (Next.js)
pnpm build          # production build (also enforces the Suspense rules)
pnpm start          # serve the production build
pnpm lint           # ESLint: naming, imports, layer boundaries
pnpm format         # Prettier (format:check in CI)
pnpm typecheck      # next typegen + tsc --noEmit

pnpm db:generate    # generate a migration from src/db/schema/ into drizzle/
pnpm db:migrate     # apply migrations (uses DATABASE_URL_UNPOOLED)
pnpm vercel-build   # Vercel build command: migrate, then build (preview runs on its own Neon branch)
pnpm db:studio      # Drizzle Studio
```

A change is done when `lint`, `format:check`, `typecheck` and `build` all pass.

**Do not write test files (`*.test.ts`).** Verify changes with the commands above and by running the
app.

## Stack

Next.js 16 (App Router, React 19, React Compiler, `cacheComponents`) · Drizzle ORM (+ drizzle-zod) ·
PostgreSQL on Neon (WebSocket driver) · better-auth (email OTP + Google) · Resend · Zod v4 ·
Tailwind CSS v4 with shadcn (Base UI) · pnpm.

## Conventions

Every file follows written rules; read the relevant doc before writing code:

- [`docs/architecture/code-style.md`](./docs/architecture/code-style.md): language, naming, types,
  imports, exports and comments (all of `src/`).
- [`docs/architecture/backend.md`](./docs/architecture/backend.md): layers and modules, `db/`,
  schemas, DAL, services, actions, route handlers, auth and integrations.
- [`docs/architecture/frontend.md`](./docs/architecture/frontend.md): route anatomy
  (`page.tsx` → sections), Suspense, data rules, component files and styling. The design system
  itself is governed by the `ui-design` skill.

Code, comments and docs are in English; everything the user sees (UI, emails, `AppError` messages)
is in Turkish.

```
src/
  app/          # routes: page.tsx → _components/ sections; api/ = auth, webhooks, cron
  actions/      # server actions: one per mutation service
  services/     # module public API: auth, business rules, cached reads
  dal/          # raw Drizzle, per module: {queries,mutations}.ts
  schemas/      # Zod DTOs per module; column-types.ts = JSONB shapes (below db/)
  constants/    # value arrays + literal types; source of the DB enums
  lib/          # auth.ts, auth-client.ts, action.ts (ActionResult), errors.ts (AppError), email.ts, ids.ts, tokens.ts, utils.ts
  db/           # schema/ (tables per area), rows.ts (generated row schemas), index.ts (db)
  components/   # shared/ (app-wide) and ui/ (shadcn)
  env.ts        # validated environment (server-only)
  proxy.ts      # optimistic session-cookie redirect for /dashboard
```

The product plan, scope and weekly milestones live in [`roadmap.md`](./roadmap.md) (Turkish).

### Data model

Invitorg handles invitations, payment and QR check-in for small private events (dinners, supper
clubs, workshops).

Auth tables (`user`, `session`, `account`, `verification`) are owned by better-auth. `user.role` is a
global role (`user` | `admin`) only. **Host and staff are per event:** the host is `events.hostId`,
staff are rows in `event_staff`. The host can always check in guests of their own event; staff only
those of events they are assigned to.

An event (`events`, unguessable `slug`, `isPrivate` = reachable only by link) has `ticket_types`
(price and `quota`), `menu_options` (with `dietaryTags`), `invitations` (a unique `code`, optional
`email`, `plusOnes`) and `waitlist_entries` (ordered by `position`). Its `status` moves from
`draft` → `published`, and ends as `cancelled` or `completed`.

A purchase is an `orders` row. A `pending` order **is** the temporary seat hold: it is valid until
`expiresAt` (about 10 minutes), after which it becomes `expired` and the seats are free again. Seats
are taken inside a transaction that locks the ticket type rows (`SELECT … FOR UPDATE`), so the last
seat cannot be sold twice. `payments` records each provider confirmation; `unique(provider,
providerRef)` makes the webhook idempotent, so a repeated webhook never issues tickets twice. Raw
provider payloads are kept in `rawPayload`.

A paid order issues one `tickets` row per seat. The QR code carries only `qrToken` (from
`randomToken()`), never personal data. Check-in is a single guarded update (`SET checked_in_at =
now() WHERE id = … AND checked_in_at IS NULL`), so a second scan of the same code is rejected. Every
scan, including invalid ones, writes a `check_in_logs` row with its `result` (`valid` |
`already_used` | `invalid`).

All money (`price`, `total`) is an integer in kuruş. Allergy and diet data is sensitive under KVKK:
only the event's host sees it, and only the minimum personal data is collected.

Payment runs in the provider's sandbox mode only.

## Environment variables

`DATABASE_URL` (Neon pooled), `DATABASE_URL_UNPOOLED` (direct, for migrations),
`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`RESEND_API_KEY` (optional: without it, emails and sign-in codes are printed to the server console),
`EMAIL_FROM`, `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL` (must be the sandbox URL).
All are validated in `src/env.ts`; see `.env.example`.
