---
name: add-or-enhance-dashboard-feature
description: Workflow command scaffold for add-or-enhance-dashboard-feature in pns-web.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-enhance-dashboard-feature

Use this workflow when working on **add-or-enhance-dashboard-feature** in `pns-web`.

## Goal

Implements or enhances a dashboard feature, typically involving a page, supporting components, and API integration.

## Common Files

- `src/app/(dashboard)/dashboard/*/page.tsx`
- `src/components/dashboard/*/`
- `src/lib/api.ts`
- `src/types/*.ts`
- `tests/*.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update dashboard page file in src/app/(dashboard)/dashboard/[feature]/page.tsx
- Create or update supporting components in src/components/dashboard/[feature]/
- Update or extend API client in src/lib/api.ts
- Update types in src/types/[feature].ts if needed
- Add or update tests in tests/ if applicable

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.