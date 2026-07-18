/* =====================================================
   gallery.js
   Renders the photo gallery from destinations.json,
   supports category filtering, and powers a lightweight
   custom lightbox (no external library).
   ===================================================== */

let galleryItems = [];
let currentLightboxIndex = 0;

document.addEventListener("DOMContentLoaded", initGallery);

async function initGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;

  const data = await loadDestinations();
  galleryItems = data;

  const chips = document.querySelectorAll("[data-gallery-filter]");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderGallery(chip.dataset.galleryFilter);
    });
  });

  renderGallery("all");
  buildLightbox();
}

function renderGallery(category) {
  const grid = document.getElementById("gallery-grid");
  const filtered = category === "all" ? galleryItems : galleryItems.filter((d) => d.category === category);

  grid.innerHTML = filtered
    .map(
      (item, index) => `
      <div class="gallery-item reveal in-view" data-index="${galleryItems.indexOf(item)}" tabindex="0" role="button" aria-label="Open ${item.name} in lightbox">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <div class="gallery-item-caption">${item.name} — ${item.location}</div>
      </div>`
    )
    .join("");

  grid.querySelectorAll(".gallery-item").forEach((el) => {
    el.addEventListener("click", () => openLightbox(Number(el.dataset.index)));
    el.addEventListener("keypress", (e) => {
      if (e.key === "Enter") openLightbox(Number(el.dataset.index));
    });
  });
}

function buildLightbox() {
  if (document.getElementById("gallery-lightbox")) return;

  const overlay = document.createElement("div");
  overlay.id = "gallery-lightbox";
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <div class="lightbox-box">
      <button class="lightbox-close" aria-label="Close gallery">&times;</button>
      <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
      <img id="lightbox-img" src="" alt="">
      <p class="lightbox-caption" id="lightbox-caption"></p>
      <button class="lightbox-next" aria-label="Next image">&#10095;</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLightbox();
  });
  overlay.querySelector(".lightbox-prev").addEventListener("click", () => stepLightbox(-1));
  overlay.querySelector(".lightbox-next").addEventListener("click", () => stepLightbox(1));

  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });
}

function openLightbox(index) {
  currentLightboxIndex = index;
  updateLightboxImage();
  document.getElementById("gallery-lightbox").classList.add("open");
}

function closeLightbox() {
  document.getElementById("gallery-lightbox").classList.remove("open");
}

function stepLightbox(direction) {
  currentLightboxIndex = (currentLightboxIndex + direction + galleryItems.length) % galleryItems.length;
  updateLightboxImage();
}

function updateLightboxImage() {
  const item = galleryItems[currentLightboxIndex];
  document.getElementById("lightbox-img").src = item.image;
  document.getElementById("lightbox-img").alt = item.name;
  document.getElementById("lightbox-caption").textContent = `${item.name} — ${item.location}`;
}
