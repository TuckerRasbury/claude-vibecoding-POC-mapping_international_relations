# CLAUDE.md — Curiosity Engine: International News & History

## Project Name
**Curiosity Engine** — An interactive map for curious Americans exploring international news, conflict, and history for the first time.

---

## Mission
Make international relations accessible and emotionally resonant for Americans with no background in global affairs. Use a map as a discovery surface — not a dashboard — so users stumble into stories they didn't know existed and leave wanting to learn more.

---

## Project Soul
"This tool was built for my past self — the version of me who was learning to think about politics, war, history, and conflict with a global mental map for the first time. I hope someone in the US will open this and encounter an atrocity, a conflict, or a people they had never thought about before. I want people to learn. That is the only goal."

---

## UX Blueprint
The homepage opens with a featured story or region — something curated to draw the user in. Below or beside it is the map. The map is the primary discovery surface — users explore it, click countries, and stumble into stories they didn't know existed. Each story is a gateway: enough context to spark curiosity, with a clear path to real sources. Every story has a Background section that explains the history and context in plain language, so nothing feels random. The tool never assumes the user already knows why a place or conflict matters.

---

## Learning Objectives
Every feature decision must serve at least one of these four objectives. They are listed here verbatim and must not be paraphrased:

1. **Discovery** — Did this help someone find a story they would never have found otherwise?
2. **Orientation** — Does the user now know where this is happening and roughly why?
3. **Connection** — Does the user feel even a small sense of why this matters to the world they live in?
4. **Curiosity** — Did this make them want to go read more from a real source?

---

## Approved Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Component model matches UI structure; Vite outputs static `dist/` for GitHub Pages |
| Map | Leaflet.js | Industry standard for clickable country maps; lightweight, no API key, excellent docs |
| Styling | Tailwind CSS | Utility-first; fast to learn and iterate; no CSS file management overhead |
| Data | GDELT + Wikipedia REST API + Wikidata | All CORS-enabled, browser-callable, fully free, no server required |
| Deployment | GitHub Actions → GitHub Pages | Runs `vite build` on push to `main`, deploys `dist/` to `gh-pages` branch |

**Why not alternatives:**
- No Node/Express server — GitHub Pages is static hosting only
- Leaflet over MapLibre GL JS — MapLibre is more powerful but overkill for country-level interaction at this stage
- React over Vue — broader documentation ecosystem; better fit for growing frontend skills from a data background

---

## Proposed Folder Structure

```
curiosity-engine/
├── public/
│   └── data/
│       └── countries.geojson          # Country border polygons for Leaflet
├── src/
│   ├── components/
│   │   ├── Map/
│   │   │   ├── MapView.jsx            # Leaflet map, country GeoJSON, click handlers
│   │   │   └── CountryLayer.jsx       # Renders and styles individual country polygons
│   │   ├── Story/
│   │   │   ├── StoryPanel.jsx         # Slide-in panel showing story + background
│   │   │   ├── StoryCard.jsx          # Headline, summary, source link
│   │   │   └── BackgroundSection.jsx  # Plain-language historical context
│   │   ├── FeaturedStory.jsx          # Hero story shown above/beside map on load
│   │   └── SourceLinks.jsx            # Links to real sources (Wikipedia, news outlets)
│   ├── hooks/
│   │   ├── useGdelt.js                # Fetches and normalizes GDELT event data
│   │   ├── useWikipedia.js            # Fetches Wikipedia summaries
│   │   └── useWikidata.js             # Fetches structured Wikidata facts
│   ├── utils/
│   │   ├── gdeltParser.js             # Parses GDELT CSV/JSON responses
│   │   └── countryCodeMap.js          # Maps GDELT FIPS/ISO codes to country names
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .github/
│   └── workflows/
│       └── deploy.yml                 # GitHub Actions: build + deploy to gh-pages
├── CLAUDE.md                          # This file
├── README.md
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Data Sources

### GDELT Project API
- **What it provides:** Real-time and historical global event data — conflict, protest, diplomacy, humanitarian crises — coded by country, event type, and date.
- **Base URL:** `https://api.gdeltproject.org/api/v2/doc/doc`
- **Format:** JSON or CSV depending on query mode
- **Rate limits:** No published hard limit, but GDELT documentation requests respectful usage. Avoid hammering on every keypress. Cache responses in `sessionStorage`.
- **Key query parameters:** `query`, `mode` (ArtList, TimelineVol, etc.), `format`, `maxrecords`, `timespan`
- **Attribution:** "Powered by the GDELT Project (gdeltproject.org)"
- **Notes:** GDELT data is event-coded from news articles worldwide. It is not editorially curated. All displayed content must be framed neutrally and linked back to primary sources.

### Wikipedia REST API
- **What it provides:** Article summaries, plain-language introductions, and thumbnail images for countries, conflicts, and historical events.
- **Base URL:** `https://en.wikipedia.org/api/rest_v1/`
- **Useful endpoints:**
  - `/page/summary/{title}` — Short extract + thumbnail
  - `/page/related/{title}` — Related articles for discovery
- **Rate limit:** 200 requests/second per the Wikimedia rate limit policy. In practice, cache aggressively — one fetch per country per session.
- **Attribution:** "Content from Wikipedia, licensed under CC BY-SA 4.0" with a link to the source article.
- **CORS:** Enabled. Callable directly from the browser.

### Wikidata
- **What it provides:** Structured facts — population, capital, head of state, bordering countries, conflict start dates, casualty estimates — queryable via SPARQL.
- **Base URL (SPARQL endpoint):** `https://query.wikidata.org/sparql`
- **Format:** JSON (`?format=json` query parameter)
- **Rate limit:** No published hard limit. Queries should be specific and results cached. Avoid wide open-ended queries.
- **Attribution:** "Data from Wikidata, licensed under CC0."
- **CORS:** Enabled. Callable directly from the browser.

---

## Design Principles

1. **Neutral editorial voice** — Stories are presented factually, sourced from primary outlets and Wikipedia. The tool does not editorialize. Framing should be plain, not sensationalized.

2. **Gateway, not destination** — Every story ends with a clear path out: links to Wikipedia articles, original news sources, and related reading. The tool's job is to spark curiosity, not satisfy it.

3. **Map as discovery surface** — The map is not a data dashboard. It is an invitation. Countries are clickable invitations to learn, not data points to analyze. Avoid turning the map into a heatmap of statistics.

4. **Historical anchor on every story** — Nothing should feel random or disconnected. Every story must include a Background section that explains why this place or conflict matters, even if the user has never heard of it. Context is not optional.

---

## Session Startup Checklist

At the start of every new Claude Code session on this project, do the following before writing any code:

- [ ] Read `CLAUDE.md` (this file) in full
- [ ] Read `README.md` for project origin and intent
- [ ] Run `git status` and `git log --oneline -10` to understand current state
- [ ] Run `npm install` if `node_modules/` is absent
- [ ] Run `npm run dev` to verify the dev server starts cleanly
- [ ] Check which branch you are on — all development goes on `claude/curiosity-engine-news-Y7BUV`
- [ ] Review any open TODO comments in `src/` before adding new code
- [ ] Before scaffolding new components, confirm they serve at least one of the four Learning Objectives

**Never:**
- Push to `main` or `master` directly
- Add server-side code (Express, FastAPI, etc.) — this is a static site
- Add a paid API or one that requires a private key stored in the repo
- Display GDELT data without linking to a primary source
- Build features that don't serve Discovery, Orientation, Connection, or Curiosity
