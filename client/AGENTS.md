# AGENTS.md

## What this project is
Web frontend for an existing product. The product already ships as:
- A React Native mobile app (JavaScript) — the source of truth for screens, navigation, and business logic.
- A JavaScript backend API that the mobile app calls.

This repo is a new **Next.js (App Router) + TypeScript** web app. Goal: the same features and data as the mobile app, adapted properly for the browser — not a literal port of React Native code.

## Before writing implementation code
1. Read the mobile app's screens, navigation structure, and API-calling code to build a feature inventory (screen/flow → API endpoint(s) it uses → shared validation or business logic).
2. Read the backend's routes/controllers for the real request/response shapes. Don't guess at API contracts.
3. Write the plan as a checklist into `TASKS.md` at the repo root, grouped into small phases (roughly one feature/screen per phase). Show the plan before writing code for anything beyond the current phase.

## Stack & conventions
- TypeScript in `strict` mode. Avoid `any`; if unavoidable, comment why.
- Next.js App Router. Server Components by default — add `"use client"` only where state, effects, event handlers, or browser APIs are actually needed.
- Styling: check `package.json` / config files for what's already set up (Tailwind, CSS Modules, styled-components) and keep using that, consistently. If nothing is configured yet, default to Tailwind CSS.
- Forms/validation: a schema library (e.g. Zod), reused between client and server where practical.
- Auth tokens: never in `localStorage`. Prefer httpOnly cookies. If the mobile app's token model (e.g. AsyncStorage + bearer token) doesn't map cleanly to the browser, flag it as a decision needed in `TASKS.md` instead of guessing.
- Naming: `PascalCase` components (`UserCard.tsx`), `camelCase` functions/hooks (`useAuth.ts`), route-segment folders in `kebab-case`.
- Small, single-purpose components. Keep data-fetching and business logic in `lib/` or hooks — not inside JSX-heavy components.

## Folder structure
```
src/
  app/                 # routes only: page.tsx, layout.tsx, loading.tsx, error.tsx
  components/
    ui/                # generic, reusable, no business logic
    features/          # feature-specific composed components
    layout/            # header, footer, nav, shell
  lib/
    api/               # typed API client functions, one file per backend resource
    hooks/
    utils/
    validators/        # Zod schemas
  types/               # shared TS types/interfaces (mirror backend response shapes)
  constants/
```

Example of the pattern for `lib/api/`:
```typescript
// lib/api/users.ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
export type User = z.infer<typeof UserSchema>;

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch user ${id}`);
  return UserSchema.parse(await res.json());
}
```

## Mapping mobile → web (reference while porting)
| React Native | Next.js web |
|---|---|
| Screen (react-navigation) | Route: `app/.../page.tsx` |
| `View` / `Text` / `TouchableOpacity` | `div` / `p`, `span` / `button` |
| `StyleSheet.create` | Tailwind classes or CSS Modules |
| `AsyncStorage` | httpOnly cookie (auth) or `localStorage` (non-sensitive only) |
| `FlatList` | `.map()` + flex/grid, or a virtualization lib for long lists |
| Navigation params | Dynamic route segments / `searchParams` |
| Native device APIs (camera, etc.) | Browser Web APIs — flag anything with no direct equivalent |

## Workflow — read this every session
- Work one phase at a time. Never attempt the whole app in a single response.
- `TASKS.md` is the source of truth for progress, not chat history. Update it at the end of every session — including an interrupted one — so the next session, even under a different login, can pick up correctly.
- Commit after each completed, working phase with a clear message. Don't leave large uncommitted diffs hanging between sessions.
- Starting a new session: read `TASKS.md` and `git log` first, then continue from there — don't ask for the project to be re-explained.
- If a phase is too big to finish in one go, stop at a clean, compiling checkpoint and note what's left in `TASKS.md`.

## Don't
- Don't invent API endpoints or payload shapes — check backend source, or log the assumption in `TASKS.md`.
- Don't mix two styling approaches in the same app.
- Don't put a full feature's logic and markup into one giant component file.
