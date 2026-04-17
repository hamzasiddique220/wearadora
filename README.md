# WEARADORA — Next.js Ecommerce Platform

Production-ready ecommerce platform built with Next.js 14 (App Router), TypeScript, Firebase, and Tailwind CSS. Features a customer-facing storefront, admin panel, and WhatsApp-based order placement.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Firebase Firestore (real-time)
- **Storage:** Firebase Storage (product images)
- **State Management:** Zustand (with persistence)
- **Styling:** Tailwind CSS (custom luxury theme)
- **Icons:** Lucide React
- **Deployment:** Vercel-ready

## Features

### Customer
- Hero landing page with split-screen design
- Product catalog with real-time updates
- Category filtering and search
- Product detail modal
- Shopping cart with persistence
- Wishlist
- WhatsApp checkout integration
- Fully responsive mobile design

### Admin
- Password-protected admin panel
- Real-time dashboard with revenue stats
- Product CRUD operations
- Image upload to Firebase Storage
- Order management with status workflow
- Direct customer WhatsApp contact
- Route-level auth protection

## Project Structure

```
wearadora/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home
│   │   ├── shop/              # Shop page
│   │   ├── cart/              # Cart page
│   │   ├── wishlist/          # Wishlist
│   │   ├── about/             # About page
│   │   └── admin/             # Admin panel (protected)
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── orders/
│   │       └── login/
│   ├── components/            # Reusable components
│   │   ├── ui/               # Generic UI (Modal, Toast, etc.)
│   │   ├── layout/           # Header, Footer, AnnouncementBar
│   │   ├── home/             # Home page sections
│   │   ├── shop/             # Product cards, modals
│   │   ├── cart/             # Checkout modal
│   │   └── admin/            # Admin-specific components
│   ├── lib/
│   │   ├── firebase.ts       # Firebase initialization
│   │   ├── constants.ts      # App-wide constants
│   │   ├── utils.ts          # Helper functions
│   │   ├── whatsapp.ts       # WhatsApp message builder
│   │   ├── services/         # Firebase CRUD services
│   │   │   ├── products.ts
│   │   │   └── orders.ts
│   │   └── stores/           # Zustand stores
│   │       ├── cart.ts
│   │       ├── wishlist.ts
│   │       ├── auth.ts
│   │       └── ui.ts
│   ├── hooks/                # Custom hooks
│   │   ├── useProducts.ts
│   │   └── useOrders.ts
│   └── types/
│       └── index.ts          # TypeScript interfaces
├── public/
├── .env.local.example         # Environment template
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Firebase
Follow `FIREBASE-SETUP.md` for complete Firebase setup instructions.

### 3. Configure Environment
```bash
cp .env.local.example .env.local
```
Fill in your Firebase config and credentials.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 5. Build for Production
```bash
npm run build
npm start
```

## Admin Access

- **URL:** `/admin/login`
- **Default Password:** `wearadora2026` (change in `.env.local`)

## Architecture Decisions

### Why Zustand over Context?
- Better performance (no unnecessary re-renders)
- Built-in persistence middleware
- Less boilerplate
- Server-side rendering friendly

### Why Firebase?
- Real-time sync out of the box
- Generous free tier
- No backend server needed
- Built-in image storage

### Why App Router?
- Modern React patterns
- Server components by default
- Better SEO with metadata API
- Nested layouts

### Service Layer Pattern
All Firebase operations are abstracted in `src/lib/services/`. This means:
- Components don't know about Firebase
- Easy to swap backend later
- Consistent error handling
- Testable business logic

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Environment Variables on Vercel
Add all variables from `.env.local.example` to your Vercel project settings.

## License

Private project — WEARADORA © 2026
