# WEARADORA — Analytics & Tracking Setup

Technical Implementation Guide implement ho chuki hai. Code ready hai — bas Pixel IDs daalni hain.

## 1. IDs kahan daalni hain

`.env.local` (project root) me:

```
NEXT_PUBLIC_META_PIXEL_ID=        # Meta Events Manager se (sirf numbers)
NEXT_PUBLIC_TIKTOK_PIXEL_ID=      # TikTok Ads > Assets > Events
NEXT_PUBLIC_GA_ID=                # khaali = Firebase ka G-73HWZJNY5Y use hoga
```

- ID khaali ho to woh pixel **apne aap off** rehta hai (site normal chalti hai).
- ID daal ke **dubara deploy/restart** karna zaroori hai (NEXT_PUBLIC vars build-time pe load hote hain).
- GA4 by default Firebase wale measurement ID se chal jaata hai — alag web stream ho to hi `NEXT_PUBLIC_GA_ID` set karo.

## 2. Kya kya track hota hai

Saara tracking ek jagah hai: `src/lib/analytics.ts`. Yeh teeno platforms (Meta, TikTok, GA4) ko ek saath events bhejta hai.

| Event | Kab fire hota hai | Meta | TikTok | GA4 |
|---|---|---|---|---|
| PageView | Har page + SPA route change | PageView | page | page_view |
| ViewContent | Product detail page khulte hi | ViewContent | ViewContent | view_item |
| AddToCart | "Add to Bag" (card / modal / detail / buy now) | AddToCart | AddToCart | add_to_cart |
| InitiateCheckout | Cart pe "Place Order" | InitiateCheckout | InitiateCheckout | begin_checkout |
| Purchase | Order successfully place hone par | Purchase + Lead | CompletePayment | purchase |

> Note: WEARADORA ka asal sale aksar WhatsApp/COD pe confirm hota hai. Is liye order place hone pe `Lead` bhi bheja jaata hai taake ads ka learning behtar ho.

## 3. Components

- `src/components/analytics/Analytics.tsx` — root layout me lagaya hua single entry point
- `MetaPixel.tsx`, `TikTokPixel.tsx`, `GoogleAnalytics.tsx` — har ek apni ID na hone par null return karta hai

## 4. Test kaise karein (deploy ke baad)

1. **Meta Pixel Helper** (Chrome extension) — site kholo, green dikhe = chal raha hai.
2. **TikTok Pixel Helper** (Chrome extension) — same.
3. **GA4 > Realtime** report me apni visit dikhni chahiye.
4. Ek product page kholo → AddToCart → cart → Place Order: har step pe events fire hone chahiye.

## 5. SEO (pehle se done)

- Metadata + OpenGraph: `src/app/layout.tsx`, product page `generateMetadata`
- `sitemap.xml`: `src/app/sitemap.ts` • `robots.txt`: `src/app/robots.ts`
- Product JSON-LD: `src/components/seo/ProductJsonLd.tsx`
- Organization JSON-LD (logo = `/wearadora-monogram.jpg`): `src/components/seo/OrganizationJsonLd.tsx`

Google Search Console me `sitemap.xml` submit kar dena.
