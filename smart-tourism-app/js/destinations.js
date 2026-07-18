/* =====================================================
   destinations.js
   Fetches data/destinations.json once and reuses it to
   render: the "Featured Destinations" strip on the home
   page, the full Destination Explorer grid (with filter,
   sort and search), and the Favorites page.
   ===================================================== */

let ALL_DESTINATIONS = [];

/** Fetches the JSON data file. Reused by every page that needs it. */
async function loadDestinations() {
  if (ALL_DESTINATIONS.length) return ALL_DESTINATIONS; // simple in-memory cache
  try {
    const res = await fetch("data/destinations.json");
    ALL_DESTINATIONS = await res.json();
  } catch (err) {
    console.error("Could not load destinations.json", err);
    ALL_DESTINATIONS = [];
  }
  return ALL_DESTINATIONS;
}

/** Builds the HTML for a single destination card. */
function destinationCard(dest) {
  const isFav = Storage.isFavorite(dest.id);
  return `
    <article class="card jali-frame reveal" data-id="${dest.id}">
      <div class="card-media">
        <img src="${dest.image}" alt="${dest.name}" loading="lazy">
        <span class="card-badge">${capitalize(dest.category)}</span>
        <button class="card-fav ${isFav ? "active" : ""}"
                aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}"
                aria-pressed="${isFav}"
                data-fav-id="${dest.id}">&#9829;</button>
      </div>
      <div class="card-body">
        <h3>${dest.name}</h3>
        <p class="card-meta">&#128205; ${dest.location}</p>
        <p class="card-desc">${dest.description}</p>
        <div class="card-footer">
          <span class="rating">&#9733; ${dest.rating.toFixed(1)}</span>
          <button class="btn btn-outline btn-sm" data-details-id="${dest.id}">View Details</button>
        </div>
      </div>
    </article>
  `;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Renders a list of destinations into a container and wires up card buttons. */
function renderDestinations(list, containerEl, emptyMessage = "No destinations match your search.") {
  if (!list.length) {
    containerEl.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }
  containerEl.innerHTML = list.map(destinationCard).join("");

  // Re-observe the new .reveal cards so the scroll-in animation still fires
  if (window.__revealObserver) {
    containerEl.querySelectorAll(".reveal").forEach((el) => window.__revealObserver.observe(el));
  } else {
    containerEl.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
  }

  // Favorite toggle buttons
  containerEl.querySelectorAll("[data-fav-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.favId);
      const nowFav = Storage.toggleFavorite(id);
      btn.classList.toggle("active", nowFav);
      btn.setAttribute("aria-pressed", nowFav);
      btn.setAttribute("aria-label", nowFav ? "Remove from favorites" : "Add to favorites");
    });
  });

  // "View Details" -> simple accessible alert-style modal using native dialog pattern
  containerEl.querySelectorAll("[data-details-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = ALL_DESTINATIONS.find((d) => d.id === Number(btn.dataset.detailsId));
      if (dest) showDetailsModal(dest);
    });
  });
}

/** Minimal, dependency-free modal for destination details. */
function showDetailsModal(dest) {
  let modal = document.getElementById("details-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "details-modal";
    modal.className = "lightbox-overlay";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  }
  modal.innerHTML = `
    <div class="lightbox-box" style="background:var(--bg-elevated); border-radius:16px; padding:24px; max-width:520px;">
      <button class="lightbox-close" style="position:static; margin-left:auto; display:flex;" aria-label="Close">&times;</button>
      <img src="${dest.image}" alt="${dest.name}" style="border-radius:12px; max-height:280px; object-fit:cover; width:100%;">
      <h3 style="margin-top:16px;">${dest.name}</h3>
      <p class="card-meta">&#128205; ${dest.location} &nbsp;|&nbsp; &#9733; ${dest.rating.toFixed(1)} &nbsp;|&nbsp; ${capitalize(dest.category)}</p>
      <p style="color:var(--text-secondary); margin-top:10px;">${dest.description}</p>
    </div>
  `;
  modal.querySelector(".lightbox-close").addEventListener("click", () => modal.classList.remove("open"));
  modal.classList.add("open");
}

/* =====================================================
   DESTINATION EXPLORER PAGE LOGIC
   (filter chips + sort dropdown + search box)
   ===================================================== */
async function initExplorer() {
  const grid = document.getElementById("destinations-grid");
  if (!grid) return;

  const data = await loadDestinations();
  const chips = document.querySelectorAll("[data-category-filter]");
  const sortSelect = document.getElementById("sort-select");
  const searchInput = document.getElementById("explorer-search");

  let activeCategory = "all";

  function apply() {
    let list = [...data];

    if (activeCategory !== "all") {
      list = list.filter((d) => d.category === activeCategory);
    }

    const query = (searchInput?.value || "").trim().toLowerCase();
    if (query) {
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.location.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query)
      );
    }

    const sortBy = sortSelect?.value || "popular";
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "alphabetical") list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => b.popularity - a.popularity); // "popular"

    renderDestinations(list, grid);
    const countEl = document.getElementById("results-count");
    if (countEl) countEl.textContent = `${list.length} destination${list.length !== 1 ? "s" : ""} found`;
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      activeCategory = chip.dataset.categoryFilter;
      apply();
    });
  });

  sortSelect?.addEventListener("change", apply);
  searchInput?.addEventListener("input", debounce(apply, 200));

  apply();
}

/* =====================================================
   HOME PAGE — Featured Destinations strip
   ===================================================== */
async function initFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  const data = await loadDestinations();
  const featured = [...data].sort((a, b) => b.popularity - a.popularity).slice(0, 6);
  renderDestinations(featured, grid);
}

/* =====================================================
   HOME PAGE — hero search bar redirects to Explorer
   ===================================================== */
function initHeroSearch() {
  const form = document.getElementById("hero-search-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = document.getElementById("hero-search-input").value.trim();
    window.location.href = `destinations.html?q=${encodeURIComponent(query)}`;
  });
}

/* =====================================================
   FAVORITES PAGE
   ===================================================== */
async function initFavoritesPage() {
  const grid = document.getElementById("favorites-grid");
  if (!grid) return;
  const data = await loadDestinations();
  const favIds = Storage.getFavorites();
  const favs = data.filter((d) => favIds.includes(d.id));
  renderDestinations(favs, grid, "You haven't saved any favorites yet. Explore destinations and tap the heart icon to save them here.");

  // Re-render whenever a favorite is removed from this page so the grid stays accurate
  grid.addEventListener("click", (e) => {
    if (e.target.closest("[data-fav-id]")) {
      setTimeout(() => initFavoritesPage(), 250);
    }
  });
}

/** Small debounce helper so search doesn't re-render on every keystroke. */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  initFeatured();
  initHeroSearch();
  initExplorer();
  initFavoritesPage();

  // If arriving from the hero search (destinations.html?q=...), pre-fill the search box
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  const searchInput = document.getElementById("explorer-search");
  if (q && searchInput) {
    searchInput.value = q;
    searchInput.dispatchEvent(new Event("input"));
  }
});
