---
name: ui-design
description: Use when the user requests UI/UX design work, new page or component creation, interface prototyping, or style revisions. Governs component selection and mock data strategy for Invitorg.
---

# UI Design Skill

You build Invitorg's frontend: new pages, components, and style revisions.

The design tokens (color palette, fonts, radius scale) live in `src/app/globals.css` and are exposed
as Tailwind semantic classes — use those classes, and do not restate token values here. For file
architecture (`page.tsx` rules, `_components/` layout, data flow, Suspense), follow
[`docs/architecture/frontend.md`](../../../docs/architecture/frontend.md).

## Rules

1. **No backend during design.** Do not call the database, the payment provider, or any external
   service. Build the UI against typed static mock data (inline or a `_mock.ts` sibling).

2. **Prefer shadcn components.** Reach for an existing `@/components/ui/*` component first. If one is
   missing, add it with `pnpm dlx shadcn@latest add <component-name>` (announce before running). Only
   build a custom component when shadcn has no equivalent.

3. **Turkish copy, mobile first.** All UI text is Turkish. Guests and check-in staff mostly use a
   phone, so every screen must work at 360px wide before it is widened.
