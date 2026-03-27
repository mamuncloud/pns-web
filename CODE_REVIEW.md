# Code Review Best Practices

> This document is the **technical reviewer's checklist** for this project.
> It complements `AGENTS.md` by translating architectural rules into concrete review criteria.
> Every PR must be evaluated against these sections before it is merged.

---

## 1. Commit & Branch Hygiene

- [ ] Commit message follows Conventional Commits with a **mandatory scope** (see `AGENTS.md §6`).
- [ ] Subject line is ≤ 72 chars, lowercase, imperative mood, and has **no trailing period**.
- [ ] The scope matches the directory/feature area being changed (e.g. `feat(purchases): …`).
- [ ] No "WIP", "temp", "fix stuff", or other vague messages squashed into the final diff.
- [ ] Each commit is **atomic** – one logical change per commit.

---

## 2. TypeScript & Type Safety

- [ ] **No `any`** – use precise interfaces, `unknown` with type guards, or generics instead.
- [ ] All component props are typed with an explicit `interface` or `type` (not inlined object literals for anything non-trivial).
- [ ] API response shapes are typed (leverage `ApiResponse<T>` from `src/lib/api.ts`).
- [ ] Return types are explicit on non-trivial functions (server actions, API helpers, hooks).
- [ ] No `as` type casts unless strictly necessary, and always accompanied by a comment explaining why.
- [ ] `Record<string, unknown>` is a code smell – prefer a more specific shape if the structure is known.

---

## 3. React Server vs. Client Components

- [ ] **Default is Server Component** – `"use client"` must be present **only when** the file uses:
  - `useState`, `useEffect`, `useReducer`, or other stateful hooks
  - Browser APIs (`window`, `localStorage`, `document`, etc.)
  - Event handlers that cannot be passed as props from a Server Component
- [ ] Data fetching happens in Server Components wherever possible (no `useEffect` fetch waterfall).
- [ ] Client components are **pushed to the leaves** of the component tree to minimise client bundle.
- [ ] `localStorage`/`sessionStorage` access is always guarded: `typeof window !== 'undefined'`.

---

## 4. Directory Structure & File Placement

| Location | Allowed content |
|---|---|
| `src/app/` | Routing files only (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). Inline minimal JSX; delegate to components. |
| `src/components/ui/` | Atomic shadcn/ui primitives only. |
| `src/components/` | Domain-specific, composed components. No raw Tailwind utility walls. |
| `src/lib/` | Pure utility functions, constants, API client, formatters. No React imports. |
| `src/hooks/` | Custom hooks prefixed with `use`. |
| `src/types/` | Shared TypeScript types/interfaces. |

- [ ] New component is in the correct directory per the table above.
- [ ] No business logic leaking into `src/app/` pages.
- [ ] No shadcn component created outside `src/components/ui/`.

---

## 5. Naming Conventions

- [ ] **PascalCase** for component files: `ProductCard.tsx`, `StatCards.tsx`.
- [ ] **camelCase** for utilities, hooks, and regular variables: `formatPrice.ts`, `useStoreSettings.ts`.
- [ ] Route/Next.js convention files remain lowercase: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.
- [ ] Custom hooks **start with `use`**: `useAuth`, `useStoreSettings`.
- [ ] Event handlers are named `handleXxx` (e.g., `handleSubmit`, `handleDelete`).
- [ ] Boolean variables/props read as sentences: `isLoading`, `hasError`, `isStoreOpen`.

---

## 6. Exports

- [ ] **Named exports** for all shared components and utilities.
- [ ] **Default exports** only in Next.js App Router convention files (`page.tsx`, `layout.tsx`).
- [ ] No barrel files (`index.ts`) that re-export everything – they defeat tree-shaking and create circular dependency risk.

---

## 7. UI & Styling

- [ ] All styling is done via **Tailwind utility classes** in `className` props – no inline `style={{}}` unless absolutely necessary.
- [ ] Conditional class names are composed with **`cn()`** (`clsx` + `tailwind-merge`) from `src/lib/utils.ts` – never via string concatenation.
- [ ] shadcn/ui components are used instead of bespoke HTML for standard UI patterns (buttons, inputs, cards, badges, dialogs, etc.).
- [ ] No custom CSS written to global stylesheets unless it is a `@theme` override or Tailwind base setup.
- [ ] Dark mode handled via Tailwind `dark:` utilities and `next-themes` – no manual `document.body.classList` manipulation.
- [ ] Hardcoded hex/rgb colors (e.g. `bg-[#34D399]`) are acceptable for **one-off accents** but should become design tokens if used in ≥ 2 places.
- [ ] Loading states have skeleton/pulse placeholders; they never show a blank area.
- [ ] Design feels **premium**: consistent spacing, typography hierarchy, and hover/focus interactions.

---

## 8. Component Quality

- [ ] **Single Responsibility** – each component does one thing. If a file exceeds ~200 lines, sub-components have been extracted.
- [ ] Props are **not overloaded** – if a component needs more than ~7 props, consider composition or a context.
- [ ] No prop-drilling past 2 levels – use context or co-locate state instead.
- [ ] Lists always have stable, meaningful `key` props (not array index unless the list is static and never reordered).
- [ ] Conditional rendering follows the pattern `{condition && <Component />}` or a ternary; never a nested `if` inside JSX.
- [ ] Accessibility: interactive elements are keyboard-navigable; images have `alt`; form inputs have associated `<label>` or `aria-label`.

---

## 9. API & Data Layer (`src/lib/api.ts`)

- [ ] All API calls go through the `api` object (or `fetchApi`) in `src/lib/api.ts` – no raw `fetch` calls scattered in components.
- [ ] Errors are caught and typed as `ApiError`; callers handle `404` gracefully (redirect or show Not Found UI) rather than logging to console.
- [ ] New API resource groups (e.g. `api.products`, `api.purchases`) are added to the `api` namespace object, not as standalone functions.
- [ ] Request bodies are typed DTOs, not plain `Record<string, unknown>`.
- [ ] No auth tokens or secrets are hardcoded – they come from `process.env.NEXT_PUBLIC_*` or `localStorage` via the existing helper pattern.

---

## 10. Performance & Next.js Best Practices

- [ ] Images use `next/image` with explicit `width`/`height` or `fill` to prevent CLS.
- [ ] Navigation uses `next/link` – no `<a href>` for internal routes.
- [ ] No deprecated Next.js APIs are used (check `node_modules/next/dist/docs/` if unsure).
- [ ] Large client-only libraries are dynamically imported: `const Comp = dynamic(() => import('…'), { ssr: false })`.
- [ ] Server Components do not import client-only modules (no `localStorage`, `window`, etc. at module scope).
- [ ] `use cache` / `revalidate` / `unstable_cache` strategies are intentional and documented with a brief comment.

---

## 11. Clean Code & Housekeeping

- [ ] **No dead code** – unused variables, imports, commented-out blocks, and orphaned files are removed.
- [ ] `console.log` / `console.error` calls are not present in merged code (use proper error boundaries or logging utilities).
- [ ] No `TODO` or `FIXME` left without an associated issue/ticket reference.
- [ ] Placeholder/mock data (e.g., hardcoded `recentActivities` arrays) is flagged for replacement with real API calls before the feature ships.
- [ ] `eslint` and `tsc --noEmit` pass with zero errors and zero new warnings.

---

## 12. Security Basics

- [ ] No sensitive data rendered to the DOM or logged.
- [ ] User-supplied strings are never dangerously set as `innerHTML` (`dangerouslySetInnerHTML` requires explicit reviewer sign-off).
- [ ] Auth token is in `localStorage` (current pattern) – reviewer must verify no XSS vectors exist for the route being changed.
- [ ] API endpoints that mutate state require authentication (`Authorization: Bearer` header is sent via `fetchApi`).

---

## Review Sign-off

Before approving, confirm:

1. ✅ All checklist items above are satisfied or have an explicit documented exception.
2. ✅ The feature was manually tested in both **light and dark mode**.
3. ✅ The feature was checked on a **mobile viewport** (≤ 375 px) if it touches any UI.
4. ✅ `bun run build` completes without errors.

@CODE_REVIEW.md