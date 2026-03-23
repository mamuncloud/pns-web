# PNS Web

PNS Web is the frontend web application for the PNS online ordering and product catalog system. Explore various snack options, add to your cart, pay seamlessly via QRIS, and pick up your items at the nearest PNS outlet!

## 🚀 Features

- **Product Catalog**: Browse through a variety of snacks, top-selling categories, and promotional packages.
- **Easy Ordering Process**: A streamlined 3-step ordering process: 
  1. Choose snacks.
  2. Pay via QRIS instantly.
  3. Pick up at the nearest store.
- **Responsive Layout**: Designed to be rich, visually appealing, and work seamlessly on mobile, tablet, and desktop devices.
- **WhatsApp Integration**: Fast customer support via a floating WhatsApp button for quick inquiries.

## 🛠 Tech Stack

- **Framework:** Next.js 16.2.0 (App Router paradigm)
- **Language:** TypeScript 5.x (Strict Mode)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui & lucide-react
- **Package Manager:** Bun

## 📦 Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh/) installed locally.

### Installation

1. From the project root, install all dependencies:
   ```bash
   bun install
   ```

### Running the Development Server

Start the application locally:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page will auto-update as you edit files in the `src/` directory.

## 📐 Project Structure

- `src/app/`: Handles Next.js routing, nested layouts, and page-level data fetching.
- `src/components/ui/`: Atomic, highly reusable UI primitives (includes `shadcn/ui` components).
- `src/components/`: Domain-specific components composing the app views, such as `Navbar`, `Hero`, `HowToOrder`, `Wholesale`, and `Categories`.
- `src/lib/`: Reusable utility functions like `cn()` tailwind merger.
- `public/`: General static assets like fonts, icons, and logos.
