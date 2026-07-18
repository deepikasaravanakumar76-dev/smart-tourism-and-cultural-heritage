# 🕌 Bharat Yatra — Smart Tourism & Cultural Heritage Web App

A fully front-end web application for discovering destinations, exploring cultural heritage, planning trips, and browsing an interactive map — built entirely with **HTML5, CSS3, vanilla JavaScript, and Leaflet.js**. No frameworks, no backend, no build step.

## 📖 Project Overview

Bharat Yatra is a portfolio project that showcases a complete, multi-page tourism platform. It combines a destination explorer, a cultural heritage archive, an interactive Leaflet map, a Local-Storage-backed trip planner and favorites system, a filterable photo gallery, and a validated contact form — all wrapped in a responsive, animated, accessible UI.

## ✨ Features

- **Home page** — hero with background image, live search bar, featured destinations, category shortcuts, animated statistics, testimonials
- **Destination Explorer** — filter by 8 categories, sort by rating/alphabetical/popularity, live search
- **Cultural Heritage** — monuments, historical timeline, festivals, classical dances, traditional food, handicrafts
- **Interactive Map** (Leaflet.js + OpenStreetMap) — tourist spots, monuments, hotels, restaurants, museums with popups and category filters
- **Trip Planner** — choose destination/days/budget/interests, auto-generate a sample itinerary, save it to Local Storage
- **Favorites** — heart any destination card, saved and persisted with Local Storage
- **Gallery** — filterable image grid with a custom keyboard-accessible lightbox
- **About** — mission, vision, tech stack, developer info, FAQ accordion
- **Contact** — client-side validated form with inline errors and a success message
- **Extras** — dark/light mode, responsive nav, scroll-reveal animations, loading spinner, back-to-top button, animated counters, semantic HTML & ARIA labels, full keyboard navigation

## 📸 Screenshots

_Add screenshots here after running the app locally, e.g._
`assets/images/screenshot-home.png`, `assets/images/screenshot-map.png`

## 📁 Folder Structure

```
smart-tourism-app/
│
├── index.html
├── about.html
├── destinations.html
├── heritage.html
├── map.html
├── planner.html
├── gallery.html
├── favorites.html
├── contact.html
│
├── css/
│   ├── style.css         # design tokens, layout, components
│   ├── responsive.css    # tablet & mobile breakpoints
│   └── animations.css    # keyframes, scroll reveal, lightbox motion
│
├── js/
│   ├── app.js             # nav, theme, scroll reveal, counters, back-to-top, FAQ
│   ├── destinations.js    # data loading, cards, filter/sort/search, favorites UI
│   ├── planner.js         # itinerary generation + saved trips
│   ├── storage.js         # Local Storage helper (favorites, itineraries, theme)
│   ├── map.js              # Leaflet map markers & popups
│   ├── gallery.js         # gallery filter + lightbox
│   └── validation.js      # contact form validation
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── videos/
│
├── data/
│   └── destinations.json  # sample destination dataset
│
└── README.md
```

## 🛠 Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure |
| CSS3 | Design tokens, layout, responsive design, animations |
| Vanilla JavaScript (ES6+) | All interactivity — no frameworks |
| Leaflet.js | Interactive map |
| OpenStreetMap | Map tiles |
| Local Storage | Favorites, saved itineraries, theme preference |
| Google Fonts (Marcellus + Poppins) | Typography |

## 🚀 Installation Guide

This is a static site — no npm install or build step required.

1. Download or clone the project folder.
2. Because `destinations.js` and `map.js` use `fetch()` to load `data/destinations.json`, opening `index.html` directly via `file://` will fail in most browsers (CORS restriction on local file fetches). Serve the folder with any lightweight local server instead:

   ```bash
   # Option A — Python
   cd smart-tourism-app
   python -m http.server 8000

   # Option B — Node
   npx serve smart-tourism-app

   # Option C — VS Code
   Right-click index.html → "Open with Live Server"
   ```
3. Open `http://localhost:8000` in your browser.

## 🌱 Future Enhancements

- Replace sample itinerary logic with a real recommendation algorithm
- Add a live weather API integration on the destination detail view
- User accounts with cloud-synced favorites (would require a backend)
- Multi-language support
- Booking integration for hotels and experiences

## 📄 License

This project is released under the **MIT License** — free to use, modify, and share for learning or portfolio purposes.
