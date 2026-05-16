# NutriTrack — Personal Nutrition Tracker PWA

A production-ready, offline-capable PWA for accurate macro and micronutrient tracking.

## Stack

| Layer      | Technology                      |
|------------|---------------------------------|
| Framework  | Next.js 14 (App Router)         |
| Language   | TypeScript                      |
| Styling    | Custom CSS (dark glassmorphism) |
| State      | Zustand                         |
| Database   | IndexedDB via Dexie.js          |
| Charts     | Recharts                        |
| PWA        | @ducanh2912/next-pwa            |
| Food Data  | USDA FoodData Central API       |
| Hosting    | Vercel (free tier)              |

## Features

- ✅ Dashboard with calorie hero, macro donuts, micro radar + full vitamin/mineral tracking
- ✅ Meal logging (Breakfast / Lunch / Dinner / Snacks)
- ✅ USDA FoodData Central search (1M+ foods, server-side proxied)
- ✅ Recipe builder with nutrient auto-aggregation
- ✅ Weight tracker with 30-day trend chart
- ✅ Custom daily nutrition targets
- ✅ Full offline support (IndexedDB + service worker)
- ✅ Installable PWA (Android Chrome + iPhone Safari)
- ✅ No account / no backend / no data leaving your device

---

## Local Development

### 1. Clone and install

```bash
cd nutritrack
npm install
```

### 2. Get a free USDA API key

1. Go to https://fdc.nal.usda.gov/api-guide.html
2. Click "Get an API Key" → free, instant, no credit card
3. Free tier: 1,000 requests/hour

### 3. Set environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
USDA_API_KEY=your_actual_key_here
```

> `DEMO_KEY` works for testing but has very low rate limits.

### 4. Run dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## Deploy to Vercel (Free Tier)

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

Follow prompts. Then add your env var:

```bash
vercel env add USDA_API_KEY
# paste your key, select all environments
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Under **Environment Variables**, add:
   - Key: `USDA_API_KEY`
   - Value: your USDA key
5. Click **Deploy**

Everything runs on Vercel's free tier:
- Next.js API routes = Vercel serverless functions (free)
- No database server needed (IndexedDB is client-side)
- Static assets cached on CDN

---

## PWA Installation

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **⋮ menu → "Add to Home screen"**

### iPhone (Safari)
1. Open the app URL in Safari
2. Tap **Share → "Add to Home Screen"**

### Desktop (Chrome/Edge)
- Click the install icon in the address bar

---

## Icons

You need 192×192 and 512×512 PNG icons at `/public/icons/`.

Quick way to generate:
```bash
# Install sharp CLI
npx sharp-cli --input logo.png --output public/icons/icon-192.png --width 192 --height 192
npx sharp-cli --input logo.png --output public/icons/icon-512.png --width 512 --height 512
```

Or use https://favicon.io to generate and drop into `public/icons/`.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + PWA meta
│   ├── page.tsx            # Entry point
│   └── api/food/
│       ├── search/route.ts # USDA search proxy
│       └── [fdcId]/route.ts# USDA detail proxy
├── components/
│   ├── Shell/AppShell.tsx  # Nav + routing shell
│   ├── Dashboard/          # Calorie hero, macros, micros
│   ├── MealLog/            # 4-meal logging UI
│   ├── FoodSearch/         # Search overlay + detail panel
│   ├── Recipes/            # Recipe builder & list
│   ├── WeightTracker/      # Weight log + trend chart
│   ├── Settings/           # Nutrition target editor
│   └── ui/                 # ProgressBar, Donut
├── lib/
│   ├── nutrients.ts        # Constants, IDs, labels, defaults
│   ├── utils.ts            # Helpers (sumFoods, parseNutrients…)
│   └── db.ts               # Dexie IndexedDB schema + helpers
├── store/
│   └── useStore.ts         # Zustand global state
├── styles/
│   └── globals.css         # Full design system
└── types/
    └── nutrition.ts        # All TypeScript types
```

---

## Data Privacy

- All food logs, recipes, and weight data are stored in **IndexedDB** on the user's device.
- The only external request is to the USDA API (via your own Next.js proxy), which does not store any personal data.
- No analytics, no tracking, no accounts.
