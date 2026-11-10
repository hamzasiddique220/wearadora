# 🎯 INSTRUCTIONS FOR CLAUDE (VS Code) — WEARADORA Project

Salam Claude! Mere paas ek complete Next.js 14 ecommerce project ki saari files hain (ZIP ya folder mein). Aapko help karni hai isse run karwane mein.

---

## ⚡ QUICK SETUP (Agar Files Already Local Hain)

Agar user ne ye folder laptop pe extract kar liya hai aur aap folder mein hain:

### Step 1: Install Dependencies
Terminal mein chalayein:
```bash
npm install
```

Ye chalane mein 2-3 minutes lag sakte hain.

### Step 2: Firebase Setup (Manual — User Karega)
Mujhe bolein `FIREBASE-SETUP.md` file padh lun aur user ko step-by-step guide karun. Firebase ke steps browser mein manual hote hain.

User ko follow karne ke liye main ye sequence suggest karunga:
1. https://console.firebase.google.com pe project banayein
2. Web app register karein
3. Config copy karein
4. `.env.local` file banayein (template `.env.local.example` se)
5. Firestore + Storage enable karein
6. Rules update karein (test mode)

### Step 3: Run Development Server
```bash
npm run dev
```

Browser: http://localhost:3000

---

## 📁 PROJECT ARCHITECTURE

```
wearadora/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home
│   │   ├── shop/         # Product listing
│   │   ├── cart/         # Shopping cart
│   │   ├── wishlist/     # Wishlist
│   │   ├── about/        # About page
│   │   └── admin/        # Admin panel (auth protected)
│   │       ├── login/
│   │       ├── dashboard/
│   │       ├── products/
│   │       └── orders/
│   ├── components/       # Reusable React components
│   ├── lib/              # Firebase, utils, stores, services
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript definitions
```

### Tech Stack:
- Next.js 14 (App Router)
- TypeScript
- Firebase Firestore + Storage
- Zustand (state management with persistence)
- Tailwind CSS (custom luxury theme)
- Lucide React (icons)

---

## 🔑 CONFIGURATION

### Environment Variables (`.env.local`)
User ko `.env.local.example` se copy karke `.env.local` banana hai aur values fill karni hain:

```env
# Firebase (copy from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Business config (already set, user can change)
# WhatsApp/phone number is no longer an env var — it lives in CONTACT_PHONE (src/lib/constants.ts)
NEXT_PUBLIC_STORE_NAME=WEARADORA
NEXT_PUBLIC_STORE_TAGLINE=Adorned in Artistry
# Admin login uses Firebase Auth + an admin custom claim (see README → Admin Access). No password env var.
```

---

## ✅ TESTING CHECKLIST

Setup complete hone ke baad ye test karein:

1. **Home page** — `http://localhost:3000` pe load ho
2. **Admin Login** — `http://localhost:3000/admin/login` pe Firebase Auth admin email/password se sign in karein (README → Admin Access)
3. **Add Product** — Admin → Products → New Product button
4. **Image Upload** — Product form mein image upload kaam kare
5. **Customer flow** — Home pe product dikhe → Add to cart → Checkout → WhatsApp open ho

---

## 🐛 COMMON ISSUES

**Issue:** `Firebase: Error (auth/invalid-api-key)`
**Fix:** `.env.local` mein values check karein, dev server restart karein (`Ctrl+C` then `npm run dev`)

**Issue:** Products save nahi ho rahe
**Fix:** Firestore Rules test mode mein check karein (FIREBASE-SETUP.md Step 7)

**Issue:** Images upload nahi ho rahi
**Fix:** Storage Rules test mode mein check karein (FIREBASE-SETUP.md Step 6)

**Issue:** `Module not found: 'zustand'` ya koi bhi package
**Fix:** `npm install` dobara chalayein

**Issue:** Port 3000 busy
**Fix:** `npm run dev -- --port 3001`

---

## 🚀 DEPLOYMENT TO VERCEL

Jab sab kuch local pe kaam kare:

### 1. GitHub Push
```bash
git init
git add .
git commit -m "Initial commit"
# GitHub pe repo banayein, phir:
git remote add origin <repo-url>
git push -u origin main
```

### 2. Vercel Deploy
1. https://vercel.com → Sign in with GitHub
2. "Import Project" → select wearadora repo
3. **Important:** Environment Variables tab mein saari `.env.local` values add karein
4. Deploy click karein

2-3 minutes mein live URL milegi.

---

## 📝 FOR CLAUDE: HOW TO HELP THE USER

User ka background:
- Urdu/Roman Urdu comfortable hai
- Beginner level programming knowledge
- Windows user (most likely)
- VS Code use kar rahe hain

**Preferred approach:**
1. Har step ka output dikhayein
2. Commands chalane se pehle bata dein kya hoga
3. Errors aayein to clear explanation dein
4. Firebase jaisa manual step aaye to screenshots wali language use karein ("left sidebar mein click karein", etc.)
5. Urdu/Roman Urdu mein reply karein

### Initial Greeting
Jab user ye folder aapko de to pehle ye karein:
1. `ls` ya `dir` se check karein saari files hain
2. `package.json` padh lein confirm kar ke dependencies sahi hain
3. User ko pucchein: "Node.js installed hai? Terminal mein `node --version` chala kar batayein"
4. Agar Node.js hai to `npm install` start karein
5. Install complete hone ke baad Firebase setup start karwayein

---

## ✨ FEATURES ALREADY IMPLEMENTED

### Customer Side
- Hero landing page with elegant typography
- Product catalog with real-time Firestore sync
- Category filters + search
- Product detail modal
- Shopping cart (persisted in localStorage)
- Wishlist (persisted)
- Checkout form with validation
- WhatsApp order message with formatted details
- Fully responsive (mobile + desktop)

### Admin Side
- Protected admin panel (sessionStorage auth)
- Dashboard with revenue stats
- Product CRUD (create, read, update, delete)
- Image upload to Firebase Storage
- Order management with status workflow:
  pending → confirmed → shipped → completed
- Filter orders by status
- Direct WhatsApp contact per customer
- Real-time data sync

### Architecture
- Clean separation: services, stores, hooks, components
- TypeScript for type safety
- Zustand for state (better than Context)
- Service layer abstracts Firebase
- Environment variables for config
- Ready for Vercel deployment

---

**Best of luck! Koi bhi confusion ho to step-by-step chalein aur user ko involve karte rahein.** 🌟
