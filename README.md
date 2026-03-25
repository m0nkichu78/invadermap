```
█░░ █▄░█ █░█ ▄▀█ █▀▄ █▀▀ █▀█ █▀▄▀█ ▄▀█ █▀▀
█▄▄ █░▀█ ▀▄▀ █▀█ █▄▀ ██▄ █▀▄ █░▀░█ █▀█ ██▄
```

> Track the invasion. One mosaic at a time.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)
![Mapbox](https://img.shields.io/badge/Mapbox_GL-000000?style=flat-square&logo=mapbox)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## 👾 What is InvaderMap?

InvaderMap is a mobile-first web app to discover, locate, and track the [Space Invader](https://www.space-invaders.com) mosaics scattered across the world — 4,285 pieces across 86 cities, all on a single interactive map.

Built on the open-source database [`world_space_invaders.json`](https://github.com/goguelnikov/SpaceInvaders) by goguelnikov.

---

## ✨ Features

**🗺️ Interactive Map**
- Mapbox GL JS with dynamic clustering
- Color-coded markers by status — active, damaged, destroyed, hidden
- SVG checkmark overlay on mosaics you've already scanned
- Smooth halo glow on every pin

**📍 Geolocation**
- Real-time GPS tracking with live position updates
- Accuracy radius circle
- "Follow me" mode — map stays centered on your position
- Proximity filter — show only mosaics within X km

**👤 Personal Collection**
- Sign in anonymously or via magic link
- Mark each mosaic as Scanned / Seen / Not Found
- Collection page grouped by city with collapsible sections
- Running score based on official point values

**🏙️ City Pages**
- Browse all 86 invaded cities
- Mini status bar per city (active / damaged / destroyed ratio)
- Sort by name, invader count, or % active
- City completion indicator when you've scanned everything

**📸 Photos**
- 2,161 mosaic photos sourced from [invader-spotter.art](https://www.invader-spotter.art)
- Displayed on each invader detail page and in map popups

---

## 🗂️ Routes

```
/                   → Interactive map (home)
/cities             → All invaded cities
/city/[slug]        → City detail — full invader list
/invader/[id]       → Individual mosaic detail + photo
/collection         → Your personal tracker
```

---

## 🛠️ Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Map | Mapbox GL JS |
| Database | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth (anonymous + magic link) |
| State | Zustand |
| Styling | Tailwind CSS + shadcn/ui |
| Font | JetBrains Mono |
| Animations | Framer Motion |
| Icons | Phosphor Icons |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Mapbox](https://account.mapbox.com) account (free tier works)
- A [Supabase](https://supabase.com) project

### Installation

```bash
git clone https://github.com/m0nkichu78/invadermap.git
cd invadermap
npm install
```

### Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyxxxxxxxxxxxxxxxx   # server-side only
```

### Database setup

Run `supabase/schema.sql` in your Supabase SQL Editor, then seed the data:

```bash
npm run seed:db       # import all 4,285 invaders
npm run scrape:photos # fetch photos from invader-spotter.art (~2,161 images)
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
invadermap/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Map (home)
│   ├── cities/             # City browser
│   ├── city/[slug]/        # City detail
│   ├── collection/         # Personal tracker
│   └── invader/[id]/       # Mosaic detail
├── components/
│   ├── map/                # Mapbox components + marker logic
│   ├── ui/                 # shadcn/ui components
│   └── auth/               # Auth modal
├── lib/
│   ├── data/               # Normalized invader data + city names
│   ├── store/              # Zustand stores (map, user)
│   ├── supabase/           # Client, server, middleware
│   ├── actions/            # Server Actions (scans)
│   ├── map/                # Marker creation, geo utils
│   └── types/              # TypeScript types
├── scripts/
│   ├── seed-supabase.ts    # DB seeder
│   └── scrape-photos.ts    # Photo scraper
└── data/
    └── world_space_invaders.json
```

---

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- `SUPABASE_SERVICE_ROLE_KEY` never exposed to the client
- Security headers configured in `next.config.ts`
- Mapbox token restricted to allowed domains
- All write operations require authenticated session

---

## 📊 Data

| Stat | Value |
|------|-------|
| Total mosaics | 4,285 |
| Cities | 86 |
| With GPS coordinates | 4,142 (96.7%) |
| With photos | 2,161 (50.4%) |
| Status: active | 2,358 (55%) |
| Status: destroyed | 1,434 (33.5%) |

Data sourced from [goguelnikov/SpaceInvaders](https://github.com/goguelnikov/SpaceInvaders).
Photos sourced from [invader-spotter.art](https://www.invader-spotter.art).

---

## 🙏 Credits

- [Invader](https://www.space-invaders.com) — the artist behind the invasion
- [goguelnikov](https://github.com/goguelnikov/SpaceInvaders) — open-source world database
- [invader-spotter.art](https://www.invader-spotter.art) — mosaic photos and status tracking
- [pnote.eu](https://pnote.eu/projects/invaders/) — inspiration and data sources

---

*This project is not affiliated with the artist Invader or the official Flash Invaders app.*
