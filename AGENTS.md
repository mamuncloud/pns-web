<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Architecture and Development Rules

As a Software Architect, the following rules have been established for this project. All AI agents and developers must strictly adhere to these guidelines when making modifications or generating new code.

## 1. Tech Stack Overview
- **Framework:** Next.js 16.2.0 (App Router paradigm)
- **UI & Styling:** React 19, Tailwind CSS v4, shadcn/ui
- **Language:** TypeScript 5+ (Strict Mode)
- **Package Manager:** Bun

## 2. Core Architectural Principles
- **Server Components First:** Default to React Server Components (RSC) to minimize client bundle size. Only append `"use client"` at the top of a file when interactivity, React state hooks (`useState`, `useEffect`), or client-side Browser APIs are strictly required.
- **Directory Structure & Concerns:**
  - `src/app/`: Reserved for routing, nested layouts, and page-level data fetching. Keep logic minimal here; delegate to components.
  - `src/components/ui/`: Reserved for highly reusable, atomic UI primitives. All `shadcn/ui` components should reside here.
  - `src/components/`: Domain-specific components mapped to business logic, composed from the primitives in `ui/`.
  - `src/lib/`: Reusable utility functions, data formatting, shared constants, and core business logic.
  - `src/hooks/`: Custom React hooks (if needed).
- **Data Fetching:** Leverage Next.js App Router native data fetching within Server Components where possible.
- **Type Safety:** Avoid `any` types. Ensure strong typing with TypeScript interfaces or types for component props, API responses, and function signatures.

## 3. UI and Styling Guidelines
- **shadcn/ui Priority:** The use of `shadcn` as the UI component library is highly preferred. Instead of writing bespoke HTML/Tailwind from scratch, use or generate `shadcn` components for uniform and accessible UI.
- **Tailwind CSS v4:** Utilize Tailwind for all styling. Use utility classes via the `className` prop. 
- **Style Merging:** Always use `clsx` and `tailwind-merge` (typically merged in a `cn()` utility located in `src/lib/utils.ts`) to compose conditional styles and avoid Tailwind class-name conflicts.
- **No Raw CSS:** Avoid writing custom CSS in global stylesheets except for baseline `@theme` overrides or global Tailwind setup.

## 4. Coding Conventions
- **Naming Conventions:**
  - Use **PascalCase** for React component files (e.g., `Button.tsx`, `UserProfile.tsx`), unless routing dictates otherwise (e.g., `page.tsx`, `layout.tsx`).
  - Use **camelCase** for utilities, custom hooks, and standard variables.
  - Custom React hooks must start with `use`.
- **Exports:** Prefer named exports for shared functions and components. Next.js App Router files (`page.tsx`, `layout.tsx`, `loading.tsx`) *must* use default exports.
- **Clean Code:** Write modular, single-responsibility functions and components. Keep files small and focused. Extract sub-components if a file exceeds ~200 lines.

## 5. Development Workflow Rules
- **Iterative Updates:** Perform modifications carefully in small steps. Run tests or built-in linters to verify changes don't break existing functionality.
- **Rich Aesthetics:** Ensure high-quality, modern, and rich designs natively. The application should look premium, leveraging modern web design aesthetics.
- **Warning on Deprecated APIs:** Since this is Next.js 16+, be extremely cautious about deprecated legacy APIs (like old Middleware conventions). Check Node modules or official docs if unsure.
- **Clean up after completion:** Every time you finish developing a feature or modifying code, you MUST remove any unused files, unused variables, and dead code to maintain a clean codebase.
