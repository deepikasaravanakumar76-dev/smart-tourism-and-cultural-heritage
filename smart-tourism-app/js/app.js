/* =====================================================
   app.js
   Site-wide behaviour shared by every page: loading
   spinner, responsive nav, dark/light mode, scroll
   reveal animations, animated counters, back-to-top
   button and the FAQ accordion.
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initNav();
  initTheme();
  initScrollReveal();
  initCounters();
  initBackToTop();
  initFAQ();
});

/* ---------- Loading spinner ----------
   Hides the full-screen loader once the page has
   finished loading, giving a premium first-impression. */
function initLoader() {
  const loader = document.querySelector(".loader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("hide"), 350);
  });
}

/* ---------- Responsive navigation ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen);
  });

  // Close the mobile menu after a link is chosen
  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => links.classList.remove("open"));
  });

  // Mark the current page's nav link for styling + accessibility
  const current = location.pathname.split("/").pop() || "index.html";
  links.querySelectorAll("a").forEach((link) => {
    if (link.getAttribute("href") === current) {
      link.setAttribute("aria-current", "page");
    }
  });
}

/* ---------- Dark / light mode ----------
   Theme choice is saved to localStorage via storage.js
   so it persists across every page of the app. */
function initTheme() {
  const toggle = document.querySelector(".theme-toggle");
  const saved = Storage.getTheme();
  applyTheme(saved);

  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    Storage.setTheme(next);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.innerHTML = theme === "dark" ? "&#9728;" : "&#9789;"; // sun / moon icon
    toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  }
}

/* ---------- Scroll reveal animations ----------
   Uses IntersectionObserver (lightweight, no library)
   to fade+lift elements in as the user scrolls. */
function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Animated counters (statistics section) ---------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString() + (el.dataset.suffix || "");
        el.classList.add("counted");
      }
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => observer.observe(el));
}

/* ---------- Back to top button ---------- */
function initBackToTop() {
  const btn = document.querySelector(".back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 500);
  });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- FAQ accordion ---------- */
function initFAQ() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      items.forEach((i) => i.classList.remove("open"));
      if (!isOpen) item.classList.add("open");
    });
  });
}

/* ---------- Small reusable helper ----------
   Builds a row of star characters for a rating value,
   used by destinations.js, gallery.js and map.js. */
function starRating(rating) {
  const full = Math.round(rating);
  return "&#9733; ".repeat(full).trim() + " " + rating.toFixed(1);
}
