/* =====================================================
   map.js
   Renders the Leaflet interactive map: tourist locations
   from destinations.json plus sample hotel/restaurant/
   museum points of interest, each with a popup showing
   an image, description, location and rating.
   ===================================================== */

// Sample points of interest that aren't in destinations.json
// (hotels & restaurants) — kept here since they are map-only.
const EXTRA_POIS = [
  {
    name: "Rambagh Palace Hotel",
    type: "hotel",
    lat: 26.8951,
    lng: 75.8092,
    rating: 4.8,
    description: "A former royal residence turned heritage luxury hotel in Jaipur, set in 47 acres of manicured gardens.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80"
  },
  {
    name: "Bukhara Restaurant",
    type: "restaurant",
    lat: 28.5921,
    lng: 77.1808,
    rating: 4.7,
    description: "An iconic North-West Frontier grill restaurant in Delhi, famous for its tandoori dishes and dal Bukhara.",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80"
  },
  {
    name: "City Palace Museum",
    type: "museum",
    lat: 26.9258,
    lng: 75.8237,
    rating: 4.6,
    description: "A former royal residence in Jaipur now open as a museum showcasing textiles, weapons and royal artefacts.",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=500&q=80"
  }
];

const CATEGORY_ICON_COLOR = {
  historical: "#C6952C",
  temple: "#7A2331",
  fort: "#8A5A18",
  nature: "#2F6B5E",
  adventure: "#1F6F78",
  beach: "#1E88A8",
  museum: "#5B3E96",
  religious: "#7A2331",
  hotel: "#B8862E",
  restaurant: "#B04A3B",
  monument: "#C6952C"
};

document.addEventListener("DOMContentLoaded", initMap);

async function initMap() {
  const mapEl = document.getElementById("tourism-map");
  if (!mapEl || typeof L === "undefined") return;

  const map = L.map("tourism-map", { scrollWheelZoom: false }).setView([22.9734, 78.6569], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  const destinations = await loadDestinations();
  const allPoints = [
    ...destinations.map((d) => ({
      name: d.name,
      type: d.category,
      lat: d.lat,
      lng: d.lng,
      rating: d.rating,
      description: d.description,
      image: d.image,
      location: d.location
    })),
    ...EXTRA_POIS.map((p) => ({ ...p, location: p.name }))
  ];

  const markers = allPoints.map((point) => {
    const marker = L.circleMarker([point.lat, point.lng], {
      radius: 9,
      color: "#fff",
      weight: 2,
      fillColor: CATEGORY_ICON_COLOR[point.type] || "#C6952C",
      fillOpacity: 0.95
    }).addTo(map);

    marker.bindPopup(`
      <div style="max-width:220px; font-family:'Poppins',sans-serif;">
        <img src="${point.image}" alt="${point.name}" style="width:100%; height:110px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
        <strong>${point.name}</strong>
        <p style="font-size:0.78rem; color:#666; margin:4px 0;">${point.location || ""}</p>
        <p style="font-size:0.82rem; color:#333; margin-bottom:6px;">${point.description}</p>
        <span style="color:#C6952C; font-weight:700;">&#9733; ${point.rating.toFixed(1)}</span>
      </div>
    `);
    return { marker, type: point.type };
  });

  // Legend / filter buttons above the map
  const legend = document.getElementById("map-legend");
  if (legend) {
    const types = [...new Set(allPoints.map((p) => p.type))];
    legend.innerHTML = `<button class="chip active" data-map-filter="all">All</button>` +
      types.map((t) => `<button class="chip" data-map-filter="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</button>`).join("");

    legend.querySelectorAll("[data-map-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        legend.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        const filter = btn.dataset.mapFilter;
        markers.forEach(({ marker, type }) => {
          const visible = filter === "all" || filter === type;
          if (visible) {
            map.hasLayer(marker) || marker.addTo(map);
          } else {
            map.removeLayer(marker);
          }
        });
      });
    });
  }
}
