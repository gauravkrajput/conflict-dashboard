# ⬡ WARWATCH — US · Israel · Iran Intelligence Dashboard

A real-time conflict intelligence dashboard built with **Next.js**, deployed on **Vercel**, tracking the US-Israel-Iran conflict across five data dimensions:

- 📡 **Latest News** — NewsData.io live feed
- ⚠ **Casualties** — ACLED conflict event data
- 🛢 **Energy & Oil Prices** — Alpha Vantage commodity data
- 🌐 **Global Economic Impact** — Macro risk indicators
- 📊 **GDELT Sentiment** — Global media tone analysis

Data refreshes every **30 minutes** via Vercel serverless caching.

---

## 🗺 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER                                                        │
│                                                                 │
│   ┌──────────────────────────────────────────────────────┐     │
│   │  User visits warwatch.vercel.app                     │     │
│   │  React + SWR  ·  auto-polls /api/* every 30 min      │     │
│   │  @vercel/analytics  ·  visitor tracking              │     │
│   └──────────────────────┬───────────────────────────────┘     │
└──────────────────────────┼──────────────────────────────────────┘
                    HTTPS request
┌──────────────────────────▼──────────────────────────────────────┐
│  VERCEL CDN / EDGE                                              │
│                                                                 │
│   ┌─────────────────────────────────────────────────────┐      │
│   │  Edge cache  ·  s-maxage=1800                        │      │
│   │  Serves cached response instantly if < 30 min old   │      │
│   └─────────────────────┬───────────────────────────────┘      │
└─────────────────────────┼───────────────────────────────────────┘
              cache miss → fetch fresh data
┌─────────────────────────▼───────────────────────────────────────┐
│  SERVERLESS FUNCTIONS  (pages/api/)                             │
│                                                                 │
│   ┌──────────┐  ┌─────────────┐  ┌──────────┐  ┌──────────┐   │
│   │ news.js  │  │casualties.js│  │energy.js │  │ gdelt.js │   │
│   │ 3-query  │  │ ACLED events│  │5 commodit│  │media tone│   │
│   └────┬─────┘  └──────┬──────┘  └────┬─────┘  └────┬─────┘   │
│        └───────────────┴───────────────┴─────────────┘         │
│                              │                                  │
│   ┌───────────────────────────▼───────────────────────────┐    │
│   │  lib/cache.js — in-memory TTL cache (30 min)          │    │
│   │  prevents duplicate API calls within same instance    │    │
│   └───────────────────────────┬───────────────────────────┘    │
└───────────────────────────────┼─────────────────────────────────┘
        only on cache miss (max 1 external call per 30 min)
┌───────────────────────────────▼─────────────────────────────────┐
│  EXTERNAL APIs                                                  │
│                                                                 │
│   ┌──────────────┐  ┌──────────┐  ┌───────────────┐  ┌──────┐  │
│   │ NewsData.io  │  │  ACLED   │  │ OilPriceAPI   │  │GDELT │  │
│   │ 200 req/day  │  │ research │  │ free, no card │  │ open │  │
│   └──────────────┘  └──────────┘  └───────────────┘  └──────┘  │
└─────────────────────────────────────────────────────────────────┘

  API keys → stored as Vercel Environment Variables (never in GitHub)

┌─────────────────────────────────────────────────────────────────┐
│  CI/CD                                                          │
│                                                                 │
│   GitHub repo  ──push to main──▶  Vercel build  ──~90s──▶ Live │
│                                   (other branches ignored)      │
└─────────────────────────────────────────────────────────────────┘
```

> **Two cache layers** keep external API usage minimal: Vercel's edge CDN serves
> repeat visitors instantly, and `lib/cache.js` ensures the same serverless instance
> never double-calls an API within the same 30-minute window.

---

## 🚀 QUICK START — GitHub + Vercel Deployment

### STEP 1: Create a GitHub Account & Repository

1. Go to **https://github.com** → click **Sign up**
2. Choose a username, enter your email, create a password
3. Verify your email address
4. Once logged in, click the **+** icon (top right) → **New repository**
5. Name it: `warwatch-dashboard`
6. Set to **Public** (required for free Vercel deploys)
7. ✅ Check **"Add a README file"**
8. Click **Create repository**

---

### STEP 2: Install Git & Push This Code

**Install Git** (if not already installed):
- macOS: `brew install git` or download from https://git-scm.com
- Windows: Download Git from https://git-scm.com/download/win
- Ubuntu/Debian: `sudo apt install git`

**Configure Git** (first-time setup):
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

**Push this project to your repo:**
```bash
# Navigate into the project folder
cd conflict-dashboard

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "feat: initial warwatch dashboard"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/warwatch-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### STEP 3: Get Your Free API Keys

#### 📰 NewsData.io (200 free requests/day)
1. Go to https://newsdata.io/register
2. Sign up with email
3. Dashboard → **API Key** tab → copy your key
4. Free tier: 200 requests/day, 10 results/page

#### ⚔ ACLED (Armed Conflict Location & Event Data)
1. Go to https://acleddata.com/register
2. Fill out the registration form (academic/research use)
3. Approval is usually within 1-2 business days
4. Once approved: **My Account** → **API Access** → copy key + note your email
5. Free for research and non-commercial use

#### 📊 GDELT Project
- **No API key needed!** Completely open and free
- The app queries it directly at `api.gdeltproject.org`

#### 🛢 Alpha Vantage (25 free requests/day)
1. Go to https://www.alphavantage.co/support/#api-key
2. Click **Get Free API Key**
3. Fill in your details → your key is shown instantly
4. Free tier: 25 requests/day (sufficient with 30-min caching)

---

### STEP 4: Deploy to Vercel

1. Go to **https://vercel.com** → **Sign Up**
2. Click **Continue with GitHub** → authorize Vercel
3. Click **Add New Project** → **Import Git Repository**
4. Select your `warwatch-dashboard` repo → click **Import**
5. Framework: **Next.js** (auto-detected)
6. Click **Environment Variables** and add each key:

| Variable Name | Value |
|---|---|
| `NEWSDATA_API_KEY` | your newsdata.io key |
| `ACLED_API_KEY` | your ACLED key |
| `ACLED_EMAIL` | your ACLED registered email |
| `ALPHA_VANTAGE_API_KEY` | your Alpha Vantage key |

7. Click **Deploy** 🎉

Your dashboard will be live at: `https://warwatch-dashboard.vercel.app`

---

### STEP 5: Custom Domain (Optional)

In Vercel dashboard → your project → **Settings** → **Domains**:
- Add your domain (e.g. `warwatch.yourdomain.com`)
- Follow DNS configuration instructions for your registrar

---

## 🔄 How the 30-Minute Refresh Works

Each API route in `/pages/api/` uses two caching layers:

1. **In-memory cache** (`lib/cache.js`) — prevents hitting APIs on every page load within the same Vercel function instance
2. **HTTP Cache-Control headers** — `s-maxage=1800` tells Vercel's CDN to cache responses for 30 minutes at the edge

```
Browser request
    └─> Vercel Edge (CDN cache hit? serve instantly)
           └─> If cache miss → Serverless function
                  └─> In-memory check (same instance?)
                         └─> If miss → External API call
                                └─> Store in both caches
```

To change the refresh interval, set `REVALIDATE_INTERVAL` env variable (in seconds):
- 15 min: `900`
- 30 min: `1800` (default)
- 1 hour: `3600`

---

## 📁 Project Structure

```
conflict-dashboard/
├── pages/
│   ├── index.js              # Main dashboard page
│   ├── _app.js               # App wrapper
│   └── api/
│       ├── news.js           # NewsData.io proxy
│       ├── casualties.js     # ACLED data proxy
│       ├── energy.js         # Alpha Vantage proxy
│       ├── gdelt.js          # GDELT Project proxy
│       └── economic.js       # Synthesized economic data
├── components/
│   ├── Header.jsx            # Sticky header + ticker
│   ├── NewsSection.jsx       # News feed panel
│   ├── CasualtiesSection.jsx # Casualty tracker panel
│   ├── EnergySection.jsx     # Oil/energy prices panel
│   ├── EconomicSection.jsx   # Economic impact panel
│   └── GdeltSection.jsx      # GDELT sentiment panel
├── lib/
│   ├── cache.js              # In-memory cache utility
│   └── mockData.js           # Fallback data (no API keys)
├── styles/
│   └── globals.css           # Full design system
├── .env.example              # Template for API keys
├── .gitignore                # Excludes .env, node_modules
├── vercel.json               # Vercel deployment config
└── next.config.js            # Next.js config
```

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env.local
# → Edit .env.local and add your API keys

# Run dev server
npm run dev
# → Open http://localhost:3000
```

**No API keys?** The app runs on realistic mock data automatically — perfect for development and testing the UI.

---

## 🛠 Extending the Dashboard

### Add more news sources
Edit `pages/api/news.js` — add additional fetch calls and merge results arrays.

### Add a map visualization
Install `react-simple-maps` or `leaflet` and create a `MapSection.jsx` component showing conflict zones.

### Add push alerts
Use Vercel Cron Jobs (Pro plan) + email/Telegram API to alert on significant casualty spikes.

### Add historical data storage
Connect a free **PlanetScale** or **Supabase** database to store snapshots and show week-over-week trends.

---

## ⚖ Disclaimer

This dashboard is for **informational and research purposes only**. Data accuracy depends on third-party API providers. Not affiliated with any government, military, or intelligence agency. Always verify critical information with authoritative primary sources.

---

*Built with Next.js · Deployed on Vercel · Data from NewsData.io, ACLED, GDELT Project, Alpha Vantage*
