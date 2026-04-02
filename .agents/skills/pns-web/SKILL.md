```markdown
# pns-web Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and common workflows used in the `pns-web` repository—a TypeScript project built with Next.js. You'll learn how to structure features, follow code style guidelines, and efficiently contribute new dashboard entities, API integrations, UI refactors, and navigation updates. The guide includes step-by-step instructions and code examples to help you work productively within this codebase.

## Coding Conventions

### File Naming

- Use **camelCase** for file and directory names.
  - Example: `dashboardSidebar.tsx`, `productDialog.tsx`

### Import Style

- Use **alias imports** (typically via `tsconfig` path aliases).
  - Example:
    ```typescript
    import api from '@/lib/api';
    import ProductForm from '@/components/dashboard/products/ProductForm';
    ```

### Export Style

- Use **default exports** for components and modules.
  - Example:
    ```typescript
    // src/components/dashboard/products/ProductForm.tsx
    const ProductForm = () => { /* ... */ };
    export default ProductForm;
    ```

### Commit Messages

- Use **Conventional Commits** with these prefixes: `feat`, `style`, `refactor`, `chore`, `docs`.
- Average commit message length: ~76 characters.
  - Example: `feat: add supplier management dashboard entity with CRUD support`

## Workflows

### Feature Development: Dashboard Entity

**Trigger:** When adding a new dashboard entity or major feature (e.g., staff, suppliers, products).  
**Command:** `/new-dashboard-entity`

1. Create or update the dashboard page:  
   `src/app/(dashboard)/dashboard/{entity}/page.tsx`
2. Add or update form/dialog components:  
   `src/components/dashboard/{entity}/`
3. Update API client methods:  
   `src/lib/api.ts`
4. Update or add types:  
   `src/types/{entity or financial}.ts`
5. Optionally add tests under `tests/` or update issues for tracking.

**Example:**
```typescript
// src/app/(dashboard)/dashboard/suppliers/page.tsx
import SupplierForm from '@/components/dashboard/suppliers/SupplierForm';
import api from '@/lib/api';

export default function SuppliersPage() {
  // ...page logic
}
```

---

### API Integration and Variant Flow

**Trigger:** When adding or enhancing product variant creation/editing with API integration.  
**Command:** `/add-variant-flow`

1. Update the product detail page:  
   `src/app/(dashboard)/dashboard/products/[id]/page.tsx`
2. Add or update dialog/form components:  
   `src/components/dashboard/products/`
3. Update API methods:  
   `src/lib/api.ts`

**Example:**
```typescript
// src/lib/api.ts
export default {
  // ...
  createProductVariant: async (productId, variantData) => {
    // API call logic
  },
};
```

---

### Server-Side Search on List Pages

**Trigger:** When implementing or improving server-side search for dashboard list pages.  
**Command:** `/enable-server-search`

1. Update list page(s) to use server-side search:  
   `src/app/(dashboard)/dashboard/*/page.tsx`
2. Update API client to support search params:  
   `src/lib/api.ts`, `src/lib/products-db.ts`

**Example:**
```typescript
// src/app/(dashboard)/dashboard/products/page.tsx
const products = await api.getProducts({ search: query });
```

---

### UI Refactor: Split Layout

**Trigger:** When improving the UX of a dashboard entity by introducing a split layout.  
**Command:** `/refactor-split-layout`

1. Update the dashboard page:  
   `src/app/(dashboard)/dashboard/{entity}/page.tsx`
2. Refactor or add dialog/form components:  
   `src/components/dashboard/{entity}/`

**Example:**
```typescript
// src/app/(dashboard)/dashboard/staff/page.tsx
import StaffList from '@/components/dashboard/staff/StaffList';
import StaffForm from '@/components/dashboard/staff/StaffForm';

export default function StaffPage() {
  // Render split layout with list and form
}
```

---

### Sidebar Navigation Update

**Trigger:** When changing the navigation structure or icons in the dashboard sidebar.  
**Command:** `/update-sidebar`

1. Update the sidebar component:  
   `src/components/dashboard/DashboardSidebar.tsx`
2. Optionally update related header/layout files:  
   `src/components/dashboard/DashboardHeader.tsx`

**Example:**
```typescript
// src/components/dashboard/DashboardSidebar.tsx
const sidebarItems = [
  { label: 'Products', icon: ProductIcon, href: '/dashboard/products' },
  // ...
];
```

---

## Testing Patterns

- **Test files** use the pattern: `*.test.*`
- **Testing framework** is not specified (check for Jest, Vitest, etc.).
- Place tests under `tests/` or alongside components.
- Example test file: `src/components/dashboard/products/ProductForm.test.tsx`

## Commands

| Command                | Purpose                                                      |
|------------------------|--------------------------------------------------------------|
| /new-dashboard-entity  | Scaffold a new dashboard entity with CRUD, API, and types    |
| /add-variant-flow      | Add or enhance product variant creation/editing with API     |
| /enable-server-search  | Convert list pages to server-side search                     |
| /refactor-split-layout | Refactor a dashboard section to use a split layout           |
| /update-sidebar        | Update the dashboard sidebar navigation                      |
```