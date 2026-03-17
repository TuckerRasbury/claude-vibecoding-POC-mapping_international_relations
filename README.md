# Claude Vibecoding — Proof of Concept: Mapping International Relations and News

> *(Work in progress as of March 2026)*

An interactive 3D globe for curious Americans exploring international news, conflict, and history for the first time.

---

## Why this exists

I want to make international relations easier to understand for Americans. The ignorance and lack of empathy of the people of the United States must be fought. Dataviz is a great way to fight that apathy, at best, because it has the power to crack through the hateful scripts of supremacy and hegemony and disinformation. I want to be able to drop in a fun piece of local news in a remote village, a story on gelato in Italy, or something serious and multifaceted like the Pentagon Papers, the Vietnam Papers, the Epstein files. Protect people who need to be protected, but illuminate that which is hidden and impure.

Now let's ask AI to build it.

Subsequently, the objectives of this project are simple:

1. _Create an educational tool_
2. _Scratch the itch for my data, creative, and news-oriented interests_
3. _Gain experience using Claude Code and other AI agents_
4. Gain experience doing **"AI-assisted software engineering"** (as opposed to vibe coding, which traditionally requires less investment in preplanning)

---

## What it does

The homepage opens on a spinning dark globe. Countries that have recent news activity glow amber. Click any country — or search for one — and a panel slides in with:

- **Recent news** from the GDELT Project (real-time global event data)
- **Background context** from Wikipedia, in plain language
- **Structured facts** (capital, population, region) from Wikidata
- **Source links** — paths out to real journalism and Wikipedia articles

There is also a persistent **search bar** at the top for investigators: search by keyword, country, date range, and topic category. Matched countries glow teal on the globe.

Every feature decision must serve at least one of four learning objectives:

| Objective | Description |
|---|---|
| **Discovery** | Did this help someone find a story they would never have found otherwise? |
| **Orientation** | Does the user now know where this is happening and roughly why? |
| **Connection** | Does the user feel even a small sense of why this matters to the world they live in? |
| **Curiosity** | Did this make them want to go read more from a real source? |

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Globe | react-globe.gl (Three.js / WebGL) |
| Styling | Tailwind CSS |
| News data | GDELT Project API v2 (ArtList mode) |
| Background context | Wikipedia REST API |
| Structured facts | Wikidata SPARQL endpoint |
| Deployment | GitHub Actions → GitHub Pages |

**No server. No API keys. No paid services.** Everything runs in the browser against free, CORS-enabled APIs.

---

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

Node 20+ is required. No environment variables are needed.

---

## Project structure

```
curiosity-engine/
├── public/
│   └── data/
│       └── countries.geojson          # Natural Earth country polygons (110m)
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   └── GlobeView.jsx          # 3D globe, country polygons, click/hover handlers
│   │   ├── Search/
│   │   │   ├── SearchBar.jsx          # Keyword · country · date range · topic inputs
│   │   │   └── SearchResultsPanel.jsx # Slide-in results panel, highlights globe
│   │   ├── Story/
│   │   │   ├── StoryPanel.jsx         # Slide-in panel for a clicked country
│   │   │   ├── StoryCard.jsx          # Individual news headline + source link
│   │   │   └── BackgroundSection.jsx  # Wikipedia summary as historical anchor
│   │   ├── FeaturedStory.jsx          # Top bar: live curated story from GDELT
│   │   ├── TopicFilter.jsx            # Quick-filter pills (Conflict, Elections, etc.)
│   │   └── SourceLinks.jsx            # "Go deeper" links to Wikipedia + related articles
│   ├── hooks/
│   │   ├── useGdelt.js                # Fetches and normalizes GDELT article lists
│   │   ├── useGlobalActivity.js       # Single broad query → Set<iso3> for globe glow
│   │   ├── useWikipedia.js            # Wikipedia page summary + related articles
│   │   └── useWikidata.js             # Wikidata SPARQL: capital, population, region
│   ├── utils/
│   │   ├── gdeltParser.js             # Normalizes raw GDELT JSON → NewsStory objects
│   │   └── countryCodeMap.js          # FIPS 10-4 ↔ ISO 3166-1 alpha-2/3 + display names
│   ├── App.jsx                        # Root layout and shared state
│   ├── main.jsx                       # React entry point
│   └── index.css                      # Tailwind base import
├── .github/
│   └── workflows/
│       └── deploy.yml                 # Build + deploy to GitHub Pages on push to main
├── CLAUDE.md                          # AI session instructions and project blueprint
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Data sources

### GDELT Project
- **What:** Real-time global event data sourced from news articles worldwide — conflicts, protests, elections, disasters, diplomacy.
- **Endpoint:** `https://api.gdeltproject.org/api/v2/doc/doc`
- **Mode used:** `ArtList` — returns article headlines, URLs, domains, source countries, and dates.
- **Caching:** Results are cached in `sessionStorage` for 15 minutes (global activity: 30 minutes) to respect GDELT's request for polite usage.
- **Limitation:** GDELT is algorithmically coded from news articles. It is not editorially curated. All displayed content links back to its primary source.
- **Attribution required:** "Powered by the GDELT Project · gdeltproject.org"

### Wikipedia REST API
- **What:** Article summaries and related article lists for countries, conflicts, and events.
- **Endpoint:** `https://en.wikipedia.org/api/rest_v1/page/summary/{title}`
- **Used for:** The Background section in the StoryPanel — plain-language historical context.
- **Rate limit:** 200 req/s per Wikimedia policy. One fetch per country per session.
- **Attribution required:** "Content from Wikipedia, licensed under CC BY-SA 4.0"

### Wikidata SPARQL
- **What:** Structured facts — capital city, population, head of state, region.
- **Endpoint:** `https://query.wikidata.org/sparql`
- **Used for:** The header of the StoryPanel (capital, population, region chips).
- **Attribution required:** "Data from Wikidata, licensed under CC0"

---

## Globe color legend

| Color | Meaning |
|---|---|
| Amber glow | Country has recent GDELT news activity (last 14 days) |
| Teal glow | Country matches an active search query |
| Bright amber / raised | Currently selected country (StoryPanel is open) |
| Dark navy | No recent data |

---

## Deployment

Merging to `main` triggers a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
1. Installs dependencies with `npm ci`
2. Runs `npm run build` (Vite outputs to `dist/`)
3. Deploys `dist/` to the `gh-pages` branch via `actions/deploy-pages`

The `BASE_URL` for asset paths is set in `vite.config.js` and does not require an environment variable.

**All development happens on feature branches** prefixed `claude/`. Never push directly to `main`.

---

## Contributing / auditing

This project is intentionally simple. Before making changes:

1. Read `CLAUDE.md` — it contains the mission, UX blueprint, and every architectural decision made so far.
2. Run `npm run dev` and click around the globe for a few minutes.
3. Check that any new feature serves at least one of the four learning objectives (Discovery, Orientation, Connection, Curiosity).

**Hard constraints:**
- No server-side code — this is a static site hosted on GitHub Pages.
- No paid APIs or private keys stored in the repository.
- No editorializing — stories are presented neutrally and linked to their primary sources.
- GDELT data must always link out to its source article.

---

## Origin

Started in March 2026 by an analytics engineer. Built with Claude Code (Anthropic).
