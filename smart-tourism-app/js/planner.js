/* =====================================================
   planner.js
   Powers the Trip Planner page: reads the user's chosen
   destination, number of days, budget and interests, then
   builds a simple sample itinerary from the destinations
   data set and saves/loads plans via storage.js.
   ===================================================== */

const PLANNER_ACTIVITIES = {
  historical: ["Guided heritage walk", "Monument photography session", "Local history talk"],
  temple: ["Sunrise darshan visit", "Temple architecture tour", "Evening aarti ceremony"],
  fort: ["Fort ramparts walk", "Light & sound show", "Museum inside the fort"],
  nature: ["Nature trail hike", "Sunset viewpoint stop", "Boat or wildlife safari"],
  adventure: ["Adventure sport session", "River-side trek", "Local adventure market"],
  beach: ["Sunrise beach walk", "Water sports session", "Beachside local cuisine"],
  museum: ["Guided museum tour", "Art & artefact exhibit", "Museum café break"],
  religious: ["Morning prayer visit", "Community kitchen (langar/prasad)", "Evening ceremony"]
};

document.addEventListener("DOMContentLoaded", () => {
  initPlannerForm();
  renderSavedItineraries();
});

async function initPlannerForm() {
  const form = document.getElementById("planner-form");
  if (!form) return;

  const data = await loadDestinations();
  const destSelect = document.getElementById("planner-destination");
  if (destSelect) {
    destSelect.innerHTML = data
      .map((d) => `<option value="${d.id}">${d.name} — ${d.location}</option>`)
      .join("");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const destId = Number(destSelect.value);
    const days = Number(document.getElementById("planner-days").value);
    const budget = document.getElementById("planner-budget").value;
    const interests = Array.from(document.querySelectorAll('input[name="interest"]:checked')).map((i) => i.value);

    const destination = data.find((d) => d.id === destId);
    if (!destination) return;

    const itinerary = buildItinerary(destination, days, budget, interests);
    renderItinerary(itinerary);
  });

  document.getElementById("save-itinerary-btn")?.addEventListener("click", () => {
    const container = document.getElementById("itinerary-result");
    const current = container?.dataset.itinerary;
    if (!current) return;
    Storage.saveItinerary(JSON.parse(current));
    renderSavedItineraries();
    flashMessage("Itinerary saved! Scroll down to see it under 'Saved Trips'.");
  });
}

/** Builds a simple day-by-day plan. Not a real booking engine — a sample generator. */
function buildItinerary(destination, days, budget, interests) {
  const pool = interests.length
    ? interests.flatMap((cat) => PLANNER_ACTIVITIES[cat] || [])
    : PLANNER_ACTIVITIES[destination.category] || ["Free exploration day"];

  const dayPlans = [];
  for (let i = 1; i <= days; i++) {
    const morning = pool[(i - 1) % pool.length] || "Local sightseeing";
    const afternoon = pool[i % pool.length] || "Explore local markets";
    const evening = i === 1 ? `Arrival & settle in near ${destination.location}` : "Relax and try local cuisine";
    dayPlans.push({ day: i, morning, afternoon, evening });
  }

  return {
    id: Date.now(),
    destinationId: destination.id,
    destinationName: destination.name,
    location: destination.location,
    days,
    budget,
    interests,
    dayPlans,
    createdAt: new Date().toISOString()
  };
}

function renderItinerary(itinerary) {
  const container = document.getElementById("itinerary-result");
  if (!container) return;

  container.dataset.itinerary = JSON.stringify(itinerary);
  container.innerHTML = `
    <div class="card jali-frame" style="padding:26px;">
      <h3>${itinerary.days}-Day Trip to ${itinerary.destinationName}</h3>
      <p class="card-meta">&#128205; ${itinerary.location} &nbsp;|&nbsp; Budget: ${capitalize(itinerary.budget)}</p>
      <div class="mt-40">
        ${itinerary.dayPlans
          .map(
            (d) => `
          <div class="faq-item open" style="border-bottom:1px solid var(--border-soft); padding:14px 0;">
            <strong>Day ${d.day}</strong>
            <ul style="margin-top:8px; color:var(--text-secondary); font-size:0.92rem; line-height:1.9;">
              <li>&#9728; Morning — ${d.morning}</li>
              <li>&#9730; Afternoon — ${d.afternoon}</li>
              <li>&#9789; Evening — ${d.evening}</li>
            </ul>
          </div>`
          )
          .join("")}
      </div>
      <button id="save-itinerary-btn" class="btn btn-primary mt-40">Save This Itinerary</button>
    </div>
  `;
  container.scrollIntoView({ behavior: "smooth", block: "start" });

  // Re-attach the save handler since the button was just re-rendered
  document.getElementById("save-itinerary-btn").addEventListener("click", () => {
    Storage.saveItinerary(itinerary);
    renderSavedItineraries();
    flashMessage("Itinerary saved! Scroll down to see it under 'Saved Trips'.");
  });
}

function renderSavedItineraries() {
  const list = document.getElementById("saved-itineraries");
  if (!list) return;

  const saved = Storage.getItineraries();
  if (!saved.length) {
    list.innerHTML = `<div class="empty-state">No saved trips yet. Build a plan above and click "Save This Itinerary".</div>`;
    return;
  }

  list.innerHTML = saved
    .map(
      (it) => `
      <div class="card jali-frame" style="padding:22px; margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <h4>${it.days}-Day Trip to ${it.destinationName}</h4>
            <p class="card-meta">&#128205; ${it.location} &nbsp;|&nbsp; Budget: ${capitalize(it.budget)}</p>
          </div>
          <button class="btn btn-outline btn-sm" data-delete-itinerary="${it.id}">Remove</button>
        </div>
      </div>`
    )
    .join("");

  list.querySelectorAll("[data-delete-itinerary]").forEach((btn) => {
    btn.addEventListener("click", () => {
      Storage.deleteItinerary(Number(btn.dataset.deleteItinerary));
      renderSavedItineraries();
    });
  });
}

/** Small toast-style confirmation message. */
function flashMessage(text) {
  let toast = document.getElementById("flash-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "flash-toast";
    toast.style.cssText =
      "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--ink-indigo);color:#fff;padding:14px 24px;border-radius:50px;box-shadow:var(--shadow-strong);z-index:2000;font-size:0.9rem;";
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.style.opacity = "1";
  setTimeout(() => (toast.style.opacity = "0"), 2600);
}
