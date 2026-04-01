```markdown
# pns-web Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you how to contribute effectively to the `pns-web` codebase, a TypeScript project built with Next.js. You'll learn the repository's coding conventions, how to implement and enhance dashboard features, manage product variants, migrate to server-side search, develop features across UI/API/types, and improve UI styling. Each workflow is documented with step-by-step instructions and command suggestions to streamline your contributions.

---

## Coding Conventions

### File Naming

- Use **camelCase** for file and folder names.
  - Example: `productEditDialog.tsx`, `variantCreateDialog.tsx`

### Import Style

- Use **alias imports** for modules.
  - Example:
    ```typescript
    import api from '@/lib/api';
    import ProductEditDialog from '@/components/dashboard/products/ProductEditDialog';
    ```

### Export Style

- Use **default exports** for components and modules.
  - Example:
    ```typescript
    const ProductEditDialog = () => { /* ... */ };
    export default ProductEditDialog;
    ```

### Commit Messages

- Follow **Conventional Commits**: `feat`, `refactor`, `style`, `chore`, `docs`
- Keep commit messages concise (~77 characters on average).
  - Example: `feat: add server-side search to supplier dashboard`

---

## Workflows

### Add or Enhance Dashboard Feature

**Trigger:** When adding or improving a dashboard feature (e.g., staff management, supplier management, repacks, server-side search).  
**Command:** `/new-dashboard-feature`

1. Create or update the dashboard page in `src/app/(dashboard)/dashboard/[feature]/page.tsx`
2. Create or update supporting components in `src/components/dashboard/[feature]/`
3. Update or extend the API client in `src/lib/api.ts`
4. Update types in `src/types/[feature].ts` if needed
5. Add or update tests in `tests/` if applicable

**Example:**
```typescript
// src/app/(dashboard)/dashboard/suppliers/page.tsx
import SupplierList from '@/components/dashboard/suppliers/SupplierList';
export default function SuppliersPage() {
  return <SupplierList />;
}
```

---

### Add or Update Product Variant Flow

**Trigger:** When adding or modifying product variant creation/editing flows.  
**Command:** `/edit-product-variant`

1. Update the product detail page at `src/app/(dashboard)/dashboard/products/[id]/page.tsx`
2. Create or update dialog/form components in `src/components/dashboard/products/` (e.g., `ProductEditDialog.tsx`, `VariantCreateDialog.tsx`)
3. Update the API client in `src/lib/api.ts`

**Example:**
```typescript
// src/components/dashboard/products/VariantCreateDialog.tsx
import api from '@/lib/api';
export default function VariantCreateDialog({ productId }) {
  // ...dialog logic
  const handleCreate = async (data) => {
    await api.createVariant(productId, data);
  };
  // ...
}
```

---

### Implement Server-Side Search in Dashboard Lists

**Trigger:** When improving dashboard list search scalability and accuracy.  
**Command:** `/server-side-search`

1. Update relevant dashboard list page files in `src/app/(dashboard)/dashboard/*/page.tsx`
2. Update list/table components in `src/components/dashboard/*/`
3. Update the API client in `src/lib/api.ts`
4. Update DB helpers in `src/lib/products-db.ts` if product-related

**Example:**
```typescript
// src/app/(dashboard)/dashboard/products/page.tsx
import api from '@/lib/api';
export default async function ProductsPage({ searchParams }) {
  const products = await api.getProducts({ search: searchParams.q });
  // ...
}
```

---

### Feature Development with UI, API, and Types

**Trigger:** When adding a new feature or enhancement requiring UI, API, and type changes.  
**Command:** `/feature-dev`

1. Update or create UI components/pages
2. Update the API client in `src/lib/api.ts`
3. Update or add types in `src/types/*.ts`

**Example:**
```typescript
// src/types/inventory.ts
export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
};

// src/lib/api.ts
export async function getInventory(): Promise<InventoryItem[]> {
  // ...
}
```

---

### UI Style or Animation Improvement

**Trigger:** When enhancing the visual appearance or interactivity of the UI.  
**Command:** `/ui-style`

1. Update component or page files to adjust styles or add animation
2. Update CSS or style files if necessary (`src/app/globals.css`)

**Example:**
```typescript
// src/components/dashboard/products/ProductCard.tsx
export default function ProductCard({ product }) {
  return (
    <div className="product-card animate-fade-in">
      {product.name}
    </div>
  );
}

// src/app/globals.css
.animate-fade-in {
  animation: fadeIn 0.5s ease;
}
```

---

## Testing Patterns

- **Test files** use the pattern: `*.test.*`
- The testing framework is **unknown** (check for `jest`, `vitest`, or similar in project dependencies).
- Place tests in the `tests/` directory.
- Example test file: `tests/productEditDialog.test.tsx`

---

## Commands

| Command                | Purpose                                                        |
|------------------------|----------------------------------------------------------------|
| /new-dashboard-feature | Add or enhance a dashboard feature                             |
| /edit-product-variant  | Add or update product variant creation/editing flows           |
| /server-side-search    | Migrate dashboard list search to server-side                   |
| /feature-dev           | Develop a feature involving UI, API, and type changes         |
| /ui-style              | Improve UI styling or add animation                            |
```
