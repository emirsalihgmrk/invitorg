# Backend Conventions

Covers `constants/`, `db/`, `schemas/`, `dal/`, `services/`, `actions/` and `lib/`. Cross-cutting
naming and import rules are in [`code-style.md`](./code-style.md). **(lint)** marks rules that
`pnpm lint` enforces.

---

## 1. Layers

```
constants/ ─┐
            ├→ db/ → schemas/ → dal/ → services/ → actions/ → client components
column-types┘                          ↑    ↑
                                      lib/ (server components and route handlers call services)
```

Each layer may import only from the layers listed for it. Every upward or skipping edge is a lint
error **(lint)**:

| Layer                     | May import                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `constants/`              | other constants                                                                                              |
| `schemas/column-types.ts` | `zod`, constants                                                                                             |
| `db/`                     | constants, `column-types`, `@/env`                                                                           |
| `schemas/`                | `db/rows`, other schemas, constants                                                                          |
| `dal/`                    | `db`, schemas, constants                                                                                     |
| `services/`               | its own module's `dal/*/queries`, any `dal/*/mutations`, other services, schemas, constants, `lib/`, `@/env` |
| `actions/`                | services, schemas, constants, `lib/action`                                                                   |
| `app/`, `components/`     | services, actions, schemas, constants, `lib/utils`, `lib/auth-client`                                        |
| `app/api/**` (handlers)   | services, schemas, constants, `lib/`                                                                         |
| `lib/`                    | `db`, schemas, constants, `@/env`, other `lib/` (infrastructure, never feature layers)                       |

- **Auth and business logic live only in services.** The DAL and actions contain neither.
- **Nothing calls upward.** The DAL never calls a service; a service never calls an action.
- `src/env.ts` is the only reader of `process.env` in `src/`. It is server-only, so UI code never
  imports it **(lint)**.

## 2. Modules

A module is one domain concept. Its name is **identical in every layer it has**. A module has only
the layers it needs, e.g. `auth` has no DAL.

| Module       | Owns tables                                             |
| ------------ | ------------------------------------------------------- |
| `auth`       | `session`, `account`, `verification` (better-auth)      |
| `user`       | `user`                                                  |
| `event`      | `events`, `event_staff`, `ticket_types`, `menu_options` |
| `invitation` | `invitations`                                           |
| `waitlist`   | `waitlist_entries`                                      |
| `order`      | `orders`, `payments`                                    |
| `ticket`     | `tickets`, `check_in_logs`                              |

A module without tables (a dashboard summary, for instance) only composes other modules' read
services; its schema file holds service result types only.

A module's DAL **writes only its own tables**. Reads may follow relations into other modules' tables
(e.g. `getEvent` includes the event's `ticketTypes`).

---

## 3. `constants/` and `db/`

- **`constants/<concept>.ts`** holds value arrays, the literal types derived from them, and pure
  lookups over those values:

  ```ts
  export const ORDER_STATUSES = ["pending", "paid", "expired", "cancelled", "refunded"] as const;
  export type OrderStatus = (typeof ORDER_STATUSES)[number];
  ```

  It never holds UI: no class names, icons or JSX.

- **DB enums** in `db/schema/` are always built from a `constants/` array
  (`pgEnum("order_status", ORDER_STATUSES)`), and so are `text({ enum })` columns. New enum values
  are added in `constants/`.
- **`db/schema/`** holds tables, relations and enums, one file per area, all re-exported from
  `db/schema/index.ts`. It defines no domain types. Tables are exported as `<table>Table`
  (`eventsTable`, `ticketTypesTable`) and enums as `<name>Enum` (`orderStatusEnum`), so they never
  collide with values or types of the same name. JSONB columns take their shape with `import type` +
  `$type<>()` from `schemas/column-types.ts`.
- **`db/index.ts`** exports `db` (and the `Transaction` type once a service passes `tx` around).
- **`db/rows.ts`** holds generated shapes only, with no narrowing:

  | Export                    | For                                    | Source               |
  | ------------------------- | -------------------------------------- | -------------------- |
  | `<Entity>Row`             | every table a schema derives from      | `$inferSelect`       |
  | `<entity>RowSchema`       | only where a read is parsed at runtime | `createSelectSchema` |
  | `create<Entity>RowSchema` | only tables the app writes             | `createInsertSchema` |

  There are **no update row schemas**. Update and upsert inputs derive from the create schema with
  `.partial()` (§4).

  ⚠️ drizzle-zod only _types_ `$type<>()` columns. At runtime it emits a generic JSON validator, so
  every typed jsonb column must be refined with its real schema:
  `createInsertSchema(someTable, { payload: payloadSchema })`.

- Schema changes ship as migrations: `pnpm db:generate`, review the SQL in `drizzle/`, then
  `pnpm db:migrate`. Migration files are never edited by hand once applied.

### JSONB shapes (`schemas/column-types.ts`)

Every JSONB shape is defined once, as a Zod schema, in this one file. It is the single exception to
one-file-per-module, because these shapes must sit _below_ `db/schema/`.

- **Leaf:** it imports only `zod` and `@/constants/*` **(lint)**.
- **Internal:** only `db/` and `schemas/` import it. Each module re-exports its own shapes from
  `schemas/<module>.ts`, and every other layer imports from the module **(lint)**.
- **Discriminant:** only the object stored at a column's root carries `type`. Nested parts do not.
- Raw third-party payloads stored for auditing (`payments.rawPayload`) stay `unknown` and get no
  shape.

---

## 4. Schemas (`schemas/<module>.ts`)

The public DTO contract. Layers above the DAL take their types from here, never from `db/`.

Every file uses the same section order. Sections a module doesn't need are left out. Later sections
derive from earlier ones.

```ts
// ── Re-exports ──            jsonb shapes owned by this module
// ── Query types ──           what the DAL returns
// ── DAL input schemas ──     what the DAL accepts
// ── Service input schemas ── what callers send to a service
// ── Service result types ──  what a service returns that the DAL doesn't read
```

### Query types

- Plain TS types derived from `<Entity>Row` with `Pick` / `Omit` plus relation composition.
- Names: `<Entity>`, `<Entity>ListItem`, `<Entity>Detail`, `<Entity>With<Relation>`
  (`Ticket`, `EventListItem`, `EventDetail`, `OrderWithTickets`).
- Relations stay nested under their relation name (`ticket.event.title`), never flattened.
- Exception: when a read is parsed at runtime because it comes from outside the DAL (the better-auth
  session), declare `<entity>Schema = <entity>RowSchema.pick(…)` and infer the type from it
  (`userSchema` / `User`).

### DAL input schemas

- **Named after the DAL function they feed:** `createTicketTypes` → `createTicketTypeSchema` /
  `CreateTicketTypeInput`. The verb is one of `create`, `update`, `upsert`, `delete`. A bulk
  function takes an array of the singular input (`createTicketTypes(eventId, CreateTicketTypeInput[])`).
- **Derived from `create<Entity>RowSchema`:**
  - `create…` → `.pick(…)`
  - `update…` / `upsert…` → `.pick(…).partial()`
- **Never include relation fields** (`hostId`, `eventId`, …). Those are separate DAL parameters.
- **Value rules live here** (allowed sets, trimming, lengths, user-facing messages), so every write
  is valid regardless of the caller:

  ```ts
  export const updateEventSchema = createEventRowSchema
    .pick({ title: true, capacity: true })
    .extend({
      title: z.string().trim().min(1, "Etkinliğe bir başlık verin").max(120),
      capacity: z.number().int().min(1, "Kontenjan en az 1 olmalı"),
    })
    .partial();
  ```

### Service input schemas

- **Named after the service without the `Service` suffix:** `publishEventService` →
  `publishEventSchema` / `PublishEventInput`.
- When the service takes exactly the DAL input, the DAL schema serves both (`createEventSchema`).
  When it must narrow it under the same name (`updateEvent` accepts `status`, the host's edit must
  not), the service gets a concrete verb instead: `editEventService` → `editEventSchema`.
- **Derived only by narrowing** the DAL input schema(s): `.pick`, `.omit`, `.required`, `.extend`
  with another module's shape.
- **Never include fields the server derives** (`slug`, `status`, `total`, `expiresAt`, `qrToken`).
- A service input over a JSONB shape is an **alias**, never a re-declaration.
- Exception: input that is never stored has no table to derive from and is declared with `z.object`
  (`checkInSchema`, which only carries the scanned token).

### Service result types

- Shapes a service returns that don't come from a DAL read (`CheckInOutcome`, `EventOccupancy`).

Every schema exports its `z.infer` type: `<Name>Schema` → `<Name>Input`.

---

## 5. DAL (`dal/<module>/{queries,mutations}.ts`)

Raw Drizzle, one statement per function, no business logic, no auth.

- **Names** say which operation on which table, never what for:
  `get|create|update|upsert|delete<Entity>[s]`. ❌ `getEventForCheckout` ✅ `getEvent`.
- **Queries**
  - Use relational `db.query.*` and project only the columns the query type needs.
  - Take only the parameters the query needs; an optional user id is `string | null`.
  - Return the query type: single → `<Type> | undefined`, list → `<Type>[]`.
  - Return the Drizzle call directly. Assign `row` / `rows` only when the result needs mapping.
  - A count is `db.$count(table, where)` returning `number` (`getTicketCount`); other aggregates are
    computed in the service from projected rows.
  - **Row locks:** a read that must hold `SELECT … FOR UPDATE` inside a service's transaction (the
    last seat of a ticket type) is named `lock<Entity>`, takes a **required** `tx` and is called
    only from mutation services. It is the one read that skips its `get…Service`. A read that
    must see the locked state in the same transaction (`getOrderItems` after `lockTicketTypes`)
    takes an optional `tx` and is called directly there; its read service calls it without one.
- **Mutations**
  - Signature is `(relationIds…, input, tx?)` and **every mutation accepts `tx?: Transaction`** as
    its last parameter:

    ```ts
    export async function createTickets(
      orderId: string,
      inputs: CreateTicketInput[],
      tx?: Transaction,
    ): Promise<void> {
      const executor = tx ?? db;
      await executor.insert(ticketsTable).values(…);
    }
    ```

  - The DAL **never opens a transaction**; services do.
  - Return a query type, `{ id: string }` (when the caller needs the new id), or `void`.
  - **Guarded writes** put the precondition in the `WHERE` clause and return the affected row or
    `undefined`, so the service learns whether it won the race:
    `UPDATE tickets SET checked_in_at = now() WHERE id = $1 AND checked_in_at IS NULL RETURNING …`.
  - `onConflictDoNothing()` + `returning()` yields nothing on conflict (an already processed
    webhook), so type the result `| undefined` and say so in a comment.
- **"Not found" is `undefined`** everywhere in the DAL (Drizzle-native). `null` is not used here.

---

## 6. Services (`services/<module>.ts`)

The module's public API. Pages call its read services; actions and route handlers call its mutation
services.

### Naming

- `<verb><Entity>[Qualifier]Service`, where the name states the whole use case: `getEventService`,
  `publishEventService`, `checkInTicketService`.
- **Read services mirror the DAL 1:1:** `getX` → `getXService`. The current user is always implicit
  (a service resolves it itself), so names never say "Current" (`getMyTicketsService` is wrong:
  `getTicketsService` already means "the signed-in user's"). The one exception is
  `getCurrentUserService` itself.
- Where the DAL verb is generic, the service verb is concrete: DAL `updateTicket` →
  `checkInTicketService`, `cancelTicketService`.
- Private helpers are not exported and have no suffix (`assertEventHost`).

### Reads go through services, writes go through the DAL

- **Every DAL query is called by exactly one function: its `get…Service`** (`lock…` queries
  excepted, §5). Any other read of that data, in the same module or another one, calls the service.
  That way auth scoping, `null` mapping and `cache()` apply every time. Importing another module's
  `dal/*/queries` is a lint error; the same-module case is checked in review.
- **Writes call DAL mutations directly, from any module**, because they must be composed into one
  transaction (`confirmPaymentService` → `updateOrder` + `createTickets`).

### Read services

```ts
export const getEventService = cache(async (slug: string): Promise<EventDetail | null> => {
  const user = await getCurrentUserService();
  const event = await getEvent(slug, user?.id ?? null);
  return event ?? null;
});
```

- Always wrapped in `React.cache` (dedupes calls within a request, which the preload pattern relies
  on).
- Guests get `null` / `[]`, never an error.
- Host- or staff-only data is scoped in the service: someone who is not the event's host (or, for
  check-in, an assigned staff member) gets `null`, exactly like a missing row.
- A read service that runs its DAL query in parallel with `getCurrentUserService()`
  (`Promise.all`) first calls `await connection()` from `next/server`. While prerendering,
  `headers()` never resolves but the parallel query would still open a database connection, which
  Next rejects (`blocking-prerender-random`). A service that awaits the user first needs no call.
- A read service that looks a row up by a uuid id (`getEventService(eventId)`) first checks it with
  `isUuid()` from `@/lib/ids` and returns `null` when it fails, so a malformed id from the URL is a
  plain "not found" rather than a uuid cast error in Postgres. Mutation services read through these
  services and so inherit the check. User ids are better-auth text ids and are not checked.

### Mutation services

```ts
export async function createOrderService(input: CreateOrderInput): Promise<OrderSummary> {
  const user = await getCurrentUserService(); //          1. auth
  if (!user) throw new AppError("Giriş yapmanız gerekiyor");

  const data = createOrderSchema.parse(input); //         2. validate

  const event = await getEventService(data.eventSlug); // 3. reads + rules
  if (!event) throw new AppError("Etkinlik bulunamadı");

  return db.transaction(async (tx) => { … }); //          4. writes
}
```

1. **Auth:** `getCurrentUserService()`. Throw an `AppError` when a user is required. A mutation that
   is deliberately open to guests returns early (no-op) and says so in a comment.
2. **Validate** untrusted input with `schema.parse(input)`. A `ZodError` reaches the client as its
   first issue message through `toActionFailure`.
3. **Reads and business rules**, via read services.
4. **Writes** via DAL mutations. More than one write runs in `db.transaction(async (tx) => …)`, with
   `tx` passed to each.

- Side effects that must not slow down or fail the request (emails) run in `after()`.

### Return types

- Single → `<Type> | null`, list → `<Type>[]`, or `void`.
- `<Type>` is always a named type from `schemas/` or `constants/`, never an inline object type.
- `undefined` from the DAL becomes `null` at this boundary (`?? null`), so `undefined` means "DAL"
  and `null` means "public contract".

### Errors

Expected failures throw `AppError` (`@/lib/errors`) with a short, user-safe sentence in Turkish
("Etkinlik bulunamadı", "Bu bilet zaten kullanıldı"). Anything else is treated as an internal error
and never shown to the user.

---

## 7. Actions (`actions/<module>.ts`)

- `"use server"` at the top.
- **One action per mutation service the client calls, named after it:** `publishEventService` →
  `publishEventAction`, with the same parameters.
- **No logic.** Every action has exactly this shape:

  ```ts
  export async function publishEventAction(eventId: string): Promise<ActionResult> {
    try {
      await publishEventService(eventId);
      return { ok: true, data: undefined };
    } catch (error) {
      return toActionFailure(error);
    }
  }
  ```

- `ActionResult<T>` and `toActionFailure` come from `@/lib/action`.

### Route handlers (`app/api/**/route.ts`)

Payment webhooks and cron jobs are not called by our client, so they are route handlers instead of
actions. They follow the same rule: verify the request (signature, cron secret), call one service,
map the result to a response. No logic of their own.

## 8. Auth (better-auth)

- better-auth owns the auth tables and the identity fields on `user`. The app writes only
  `user.name`, through `dal/user`. `user.role` (`user` | `admin`) is never client-writable
  (`input: false`).
- **Host and staff are per event, not global roles:** the host is `events.hostId`, staff are rows in
  `event_staff`. The checks live in the `event` services.
- `services/auth.ts` wraps better-auth's API instead of a DAL: `getCurrentUserService`,
  `signOutService`. `lib/auth.ts` (server config) is imported only by services, `lib/` and the auth
  route handler. `proxy.ts` reads the session cookie through `better-auth/cookies` only.
- Sign-in (email OTP and Google) is the one client-side call that skips actions. It goes through
  `authClient` so better-auth's `/api/auth` rate limits apply.

## 9. Integrations (`lib/`)

- Third-party services (email via Resend, the payment provider, QR images) get a thin wrapper in
  `lib/<name>.ts` that hides the SDK and reads its keys from `@/env`. It has no domain logic.
- Services decide when to call them and what to send. Copy that reaches users (email subjects and
  bodies) is written in the service or next to the wrapper, in Turkish.
- Secrets and tokens (`qrToken`, invitation codes, slugs) come from `randomToken()` in
  `lib/tokens.ts`, never `Math.random()`.
- Generic id checks live in `lib/ids.ts` (`isUuid`), not in a module's schema file: they carry no
  domain meaning, so `eventIdSchema`, `orderIdSchema`, … would only repeat `z.uuid()`.

---

## Quick reference

| Layer        | Query                                    | Mutation                                                    |
| ------------ | ---------------------------------------- | ----------------------------------------------------------- |
| `db/rows.ts` | `EventRow`, `userRowSchema`              | `createEventRowSchema` (no update row schemas)              |
| `schemas/`   | `EventDetail`                            | DAL `createTicketTypeSchema` · service `publishEventSchema` |
| `dal/`       | `getEvent` → `… \| undefined`            | `createTickets(orderId, inputs, tx?)`                       |
| `services/`  | `getEventService` → `… \| null` (cached) | `publishEventService` → `void \| <Type> \| null`            |
| `actions/`   | —                                        | `publishEventAction` → `ActionResult<T>`                    |
