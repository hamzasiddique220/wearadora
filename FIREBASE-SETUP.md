# Firebase Setup Guide

Ye step-by-step guide follow karein Firebase setup karne ke liye.

---

## Step 1: Firebase Project Create Karein

1. **https://console.firebase.google.com** pe jaayein
2. Google account se sign in karein
3. **"Add project"** click karein
4. Project name: `wearadora` → Continue
5. Google Analytics: "Continue without Analytics" (optional)
6. **Create Project** click karein

## Step 2: Web App Register Karein

1. Project dashboard mein **`</>`** icon (Web) click karein
2. App nickname: `wearadora-web`
3. Firebase Hosting check NA karein
4. **Register app** click karein
5. **Config code copy karein** — ye kuch aisa hoga:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "wearadora.firebaseapp.com",
  projectId: "wearadora",
  storageBucket: "wearadora.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 3: `.env.local` File Banayein

Project root mein `.env.local` naam ki file banayein aur ye content paste karein:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=wearadora.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=wearadora
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=wearadora.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_WHATSAPP_NUMBER=923112032415
NEXT_PUBLIC_STORE_NAME=WEARADORA
NEXT_PUBLIC_STORE_TAGLINE=Adorned in Artistry

NEXT_PUBLIC_ADMIN_PASSWORD=wearRUHAAFIDAZ321!@#
```

Firebase config ke values apni wali dalein.

## Step 4: Firestore Database Enable Karein

1. Left sidebar → **"Firestore Database"**
2. **"Create database"** click karein
3. **"Start in test mode"** select karein
4. Location: `asia-south1` (Mumbai — Pakistan ke liye best)
5. **Enable** click karein

## Step 5: Storage Enable Karein

1. Left sidebar → **"Storage"**
2. **"Get started"** click karein
3. **"Start in test mode"** select karein
4. Same location rakhein
5. **Done** click karein

## Step 6: Storage Rules Update Karein

1. Storage page → **"Rules"** tab
2. Saara code replace karein:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

3. **Publish** click karein

## Step 7: Firestore Rules Update Karein

1. Firestore Database → **"Rules"** tab
2. Saara code replace karein:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **Publish** click karein

## Step 8: Test Karein

```bash
npm run dev
```

`http://localhost:3000` open karein.

### Checklist:
- [ ] Home page load ho raha hai
- [ ] `/admin/login` pe password `wearadora2026` kaam kar raha hai
- [ ] Admin → Products → New Product add ho raha hai
- [ ] Image upload kaam kar raha hai
- [ ] Product customer side pe dikh raha hai
- [ ] Cart mein add hota hai
- [ ] Checkout WhatsApp open karta hai

---

## Production Deployment

### Vercel pe Deploy

1. **GitHub pe push karein:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/wearadora.git
git push -u origin main
```

2. **Vercel setup:**
   - https://vercel.com pe jaayein
   - "Import Project" → wearadora repo select karein
   - **Environment Variables** tab mein `.env.local` ki saari values add karein
   - **Deploy** click karein

3. 2-3 minutes mein live URL milegi (e.g., `wearadora.vercel.app`)

---

## ⚠️ Production Security Note

Abhi rules **test mode** mein hain. Real customers ke liye live karne se pehle proper authentication rules set karni zaroori hain. Ye karne ke liye alag guide chahiye ho to batayein.

---

## Troubleshooting

**Error: "Firebase: Error (auth/invalid-api-key)"**
→ `.env.local` mein config check karein, quotes na dalein

**Images upload nahi ho rahi**
→ Storage Rules check karein (Step 6)

**Products save ho rahe hain lekin dikh nahi rahe**
→ Firestore Rules check karein (Step 7), browser refresh karein

**Port 3000 busy hai**
→ `npm run dev -- --port 3001`
