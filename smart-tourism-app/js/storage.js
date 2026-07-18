/* =====================================================
   storage.js
   Small wrapper around localStorage so every other file
   reads/writes data the same way instead of repeating
   JSON.parse/stringify everywhere (keeps code DRY).
   ===================================================== */

const STORAGE_KEYS = {
  FAVORITES: "st_favorites",   // array of destination ids
  ITINERARIES: "st_itineraries", // array of saved trip plans
  THEME: "st_theme"            // "light" | "dark"
};

const Storage = {
  /** Generic getter — returns fallback if key is missing or invalid JSON */
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error("Storage read error:", err);
      return fallback;
    }
  },

  /** Generic setter */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error("Storage write error:", err);
    }
  },

  /* ---------- Favorites ---------- */
  getFavorites() {
    return this.get(STORAGE_KEYS.FAVORITES, []);
  },
  isFavorite(id) {
    return this.getFavorites().includes(id);
  },
  toggleFavorite(id) {
    const favs = this.getFavorites();
    const index = favs.indexOf(id);
    if (index === -1) {
      favs.push(id);
    } else {
      favs.splice(index, 1);
    }
    this.set(STORAGE_KEYS.FAVORITES, favs);
    return this.isFavorite(id);
  },
  removeFavorite(id) {
    const favs = this.getFavorites().filter((f) => f !== id);
    this.set(STORAGE_KEYS.FAVORITES, favs);
  },

  /* ---------- Itineraries (Trip Planner) ---------- */
  getItineraries() {
    return this.get(STORAGE_KEYS.ITINERARIES, []);
  },
  saveItinerary(itinerary) {
    const list = this.getItineraries();
    list.unshift(itinerary); // newest first
    this.set(STORAGE_KEYS.ITINERARIES, list);
  },
  deleteItinerary(id) {
    const list = this.getItineraries().filter((it) => it.id !== id);
    this.set(STORAGE_KEYS.ITINERARIES, list);
  },

  /* ---------- Theme ---------- */
  getTheme() {
    return this.get(STORAGE_KEYS.THEME, "light");
  },
  setTheme(theme) {
    this.set(STORAGE_KEYS.THEME, theme);
  }
};
