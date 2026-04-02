---
name: feature-development-dashboard-entity
description: Workflow command scaffold for feature-development-dashboard-entity in pns-web.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-development-dashboard-entity

Use this workflow when working on **feature-development-dashboard-entity** in `pns-web`.

## Goal

Implements a new dashboard entity (e.g. staff, suppliers, products) with CRUD UI, API integration, and type updates.

## Common Files

- `src/app/(dashboard)/dashboard/*/page.tsx`
- `src/components/dashboard/*/*.tsx`
- `src/lib/api.ts`
- `src/types/*.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update dashboard page under src/app/(dashboard)/dashboard/{entity}/page.tsx
- Add or update form and dialog components under src/components/dashboard/{entity}/
- Update API client methods in src/lib/api.ts
- Update or add types in src/types/{entity or financial}.ts
- Optionally add tests under tests/ or update issues/ for tracking

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.