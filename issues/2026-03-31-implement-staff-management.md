# [FEATURE] Implement Staff Management (Client)

## What
Implement the Staff Management Dashboard UI to strictly allow Managers to manage employee access.

## Why
A user-friendly module is required in the backend dashboard for managers to invite new cashiers, edit their roles, and remove outdated accounts without relying on back-office operations.

## How
- Display a new Staff page at `/dashboard/staff` using Shadcn generic UI.
- Secure the entire path/sidebar item from generic cashiers.
- Integrate `#hookform/resolvers/zod` with reactive validation forms for robust user input.
- Show Confirmation Dialogs on delete action.
