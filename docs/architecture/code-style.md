# Code Style

Rules that apply to every file in `src/`. Layer rules live in [`backend.md`](./backend.md) and
[`frontend.md`](./frontend.md). Anything marked **(lint)** is enforced by `pnpm lint`; everything
else is enforced in review.

---

## Language

- Code, identifiers, comments and the docs in `docs/` are written in **English**.
- User-facing copy (UI text, emails, `AppError` messages) is written in **Turkish**.
- The product name is spelled **Invitorg** in all user-facing copy.

## Files & folders

- File names are `kebab-case` **(lint)**.
- Folder names are `kebab-case`, plus the Next.js forms `(group)`, `[param]`, `[...param]` and
  `_private` **(lint)**.
- Dynamic segments are camelCase and name what they hold: `[eventSlug]`, `[ticketId]`.
- A component file is named after its component: `ticket-status-badge.tsx` → `TicketStatusBadge`. A
  `.ts` module is named after the concept it holds: `tokens.ts`, `email.ts`.

## Identifiers

| Kind                                   | Case                 | Example                                |
| -------------------------------------- | -------------------- | -------------------------------------- |
| Variables, functions, parameters       | `camelCase`          | `eventId`, `getEventService`           |
| Components, types, interfaces          | `PascalCase`         | `TicketCard`, `EventWithTicketTypes`   |
| Module-level constants and lookup maps | `SCREAMING_SNAKE`    | `ORDER_HOLD_MINUTES`, `STATUS_CLASSES` |
| Zod schemas                            | `camelCase` + suffix | `createTicketTypeSchema`               |

**Acronyms are written as words:** `qrToken`, `SendOtpInput`, `imageUrl`, `exportCsv`. Never `QR`,
`OTP`, `URL`, `CSV` inside identifiers. (shadcn's upstream names such as `InputOTP` are left as
shipped.)

**Naming by role:**

- Functions start with a verb: `getSafeNextPath`, `randomToken`, `buildCheckInLog`.
- Booleans start with `is` / `has` / `can` / `should`: `isPending`, `isPrivate`, `hasCheckedIn`,
  `canCheckIn`. This applies to state too: `const [isPending, setIsPending]`.
- Event handlers defined in a component are `handle<Event>`; callback props are `on<Event>`:
  `onSubmit={handleSubmit}`, `onComplete={…}`.
- Refs end in `Ref`: `videoRef`, `hasScannedRef`.

## Types

- Object shapes are `interface`; unions, aliases and derived types (`Pick`, `Omit`, `&`, `z.infer`)
  are `type` **(lint)**.
- Component props are always a named `interface <Component>Props` declared above the component,
  never an inline object type.
- Type-only imports use a top-level `import type { … }`, never inline `type` specifiers **(lint)**.
  A module that supplies both values and types is imported twice:

  ```ts
  import { NextResponse } from "next/server";
  import type { NextRequest } from "next/server";
  ```

## Imports

- Always import through the `@/` alias **(lint)**.
- Relative imports (`./`, `../`) are allowed **only inside `src/app`**, where a route imports its own
  `_components` **(lint)**.
- Import order is fixed **(lint, auto-fixable)**:
  1. packages
  2. `@/…`
  3. relative

  The groups are separated by one blank line and alphabetised within each group.

## Exports

- Backend folders (`actions`, `constants`, `dal`, `db`, `lib`, `schemas`, `services`) use **named
  exports only** **(lint)**.
- React components use a default export. See
  [`frontend.md` → Component files](./frontend.md#4-component-files).
- Nothing is exported "just in case". An export with no importer is deleted.

## Comments

- Explain **why**, not what. Explain a decision, a constraint, or a non-obvious trade-off. Code that
  reads clearly gets no comment.
- Section dividers inside a file use `// ── Title ──`.

## Tests

- Do not write test files (`*.test.ts`). Correctness is checked by the tooling below and by running
  the app.

## Tooling

```bash
pnpm lint          # ESLint: naming, imports, layer boundaries, type style
pnpm format:check  # Prettier (pnpm format to fix)
pnpm typecheck     # next typegen (route types) + tsc --noEmit
pnpm build         # also enforces the Suspense rules (cacheComponents)
```

All four must pass before a change is done.
