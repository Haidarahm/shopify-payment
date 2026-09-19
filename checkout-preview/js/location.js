const MAX_POINT_KM = 25;
const MAX_RESULTS = 8;
const MAP_URL = "./assets/map.geojson";

let mapFeatures = null;
let locationOptions = [];

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInPolygon(lng, lat, geometry) {
  const rings = geometry.type === "Polygon" ? geometry.coordinates : null;
  if (!rings?.length) return false;
  if (!pointInRing(lng, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lng, lat, rings[i])) return false;
  }
  return true;
}

function formatLocation(props) {
  const parts = [];
  if (props.Area) parts.push(props.Area.trim());
  if (props.State && props.State !== ".") parts.push(props.State.trim());
  if (props.Country) parts.push(props.Country.trim());
  return parts.join(", ");
}

function specificity(props) {
  let score = 0;
  if (props.Area) score += 4;
  if (props.State && props.State !== ".") score += 2;
  if (props.Country) score += 1;
  return score;
}

function matchLocation(lat, lng, features) {
  let bestPoint = null;
  let bestPointKm = Infinity;

  for (const feature of features) {
    const { geometry, properties } = feature;
    if (geometry?.type !== "Point" || !properties?.Area) continue;
    const [pLng, pLat] = geometry.coordinates;
    const km = distanceKm(lat, lng, pLat, pLng);
    if (km <= MAX_POINT_KM && km < bestPointKm) {
      bestPointKm = km;
      bestPoint = feature;
    }
  }
  if (bestPoint) return formatLocation(bestPoint.properties);

  let bestPoly = null;
  let bestScore = -1;
  for (const feature of features) {
    const { geometry, properties } = feature;
    if (geometry?.type !== "Polygon" || !properties) continue;
    if (!pointInPolygon(lng, lat, geometry)) continue;
    const score = specificity(properties);
    if (score > bestScore) {
      bestScore = score;
      bestPoly = feature;
    }
  }
  if (bestPoly) return formatLocation(bestPoly.properties);

  return null;
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      reject,
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

function buildLocationOptions(features) {
  const seen = new Set();
  const options = [];

  for (const feature of features) {
    const props = feature.properties || {};
    const label = formatLocation(props);
    if (!label || seen.has(label)) continue;
    seen.add(label);

    const searchText = [
      props.Area,
      props["Area-AR"],
      props.State !== "." ? props.State : "",
      props["State-AR"] !== "." ? props["State-AR"] : "",
      props.Country,
      props["Country-AR"],
      label,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    options.push({ label, searchText });
  }

  return options;
}

async function loadMap() {
  if (mapFeatures) return mapFeatures;
  const res = await fetch(MAP_URL);
  if (!res.ok) throw new Error("Failed to load map");
  const map = await res.json();
  mapFeatures = map.features || [];
  locationOptions = buildLocationOptions(mapFeatures);
  return mapFeatures;
}

function fuzzyScore(query, text) {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const t = text.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 75;

  let qi = 0;
  let gaps = 0;
  let last = -1;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (last >= 0) gaps += i - last - 1;
      last = i;
      qi++;
    }
  }
  if (qi !== q.length) return 0;
  return Math.max(20, 55 - gaps);
}

function fuzzySearch(query) {
  const q = query.trim();
  if (!q) {
    return locationOptions.slice(0, MAX_RESULTS);
  }

  return locationOptions
    .map((opt) => ({
      ...opt,
      score: Math.max(fuzzyScore(q, opt.label), fuzzyScore(q, opt.searchText) * 0.9),
    }))
    .filter((opt) => opt.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, MAX_RESULTS);
}

function clearAddressSkeleton(addressEl) {
  addressEl.classList.remove("skeleton-text");
  addressEl.removeAttribute("aria-busy");
  addressEl.replaceChildren();
}

function showSetLocation() {
  const btn = document.getElementById("address-action-btn");
  if (btn) btn.textContent = "Set location";

  const row = document.getElementById("shipping-address-row");
  if (row) row.hidden = true;
}

function setAddress(label) {
  const row = document.getElementById("shipping-address-row");
  const addressEl = document.getElementById("shipping-address-text");
  const btn = document.getElementById("address-action-btn");

  if (addressEl) {
    clearAddressSkeleton(addressEl);
    addressEl.textContent = label;
  }
  if (row) row.hidden = false;
  if (btn) btn.textContent = "Change Address";
  closeLocationSheet();
}

function openLocationSheet() {
  const sheet = document.getElementById("location-sheet");
  const input = document.getElementById("location-search-input");
  if (!sheet || !input) return;

  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  input.value = "";
  renderResults(fuzzySearch(""));
  requestAnimationFrame(() => input.focus());
}

function closeLocationSheet() {
  const sheet = document.getElementById("location-sheet");
  const input = document.getElementById("location-search-input");
  if (!sheet?.classList.contains("is-open")) return;

  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (input) input.value = "";
  renderResults([]);
}

const PIN_SVG =
  '<svg class="location-sheet__option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';

function renderResults(matches) {
  const list = document.getElementById("location-search-results");
  if (!list) return;

  list.replaceChildren();
  for (const match of matches) {
    const li = document.createElement("li");
    li.className = "location-sheet__option";
    li.setAttribute("role", "option");
    li.tabIndex = 0;
    li.innerHTML = PIN_SVG;
    const span = document.createElement("span");
    span.textContent = match.label;
    li.appendChild(span);
    li.addEventListener("click", () => setAddress(match.label));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setAddress(match.label);
      }
    });
    list.appendChild(li);
  }
}

function wireLocationSearch() {
  const btn = document.getElementById("address-action-btn");
  const input = document.getElementById("location-search-input");
  const backdrop = document.getElementById("location-sheet-backdrop");
  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    openLocationSheet();
  });

  input.addEventListener("input", () => {
    renderResults(fuzzySearch(input.value));
  });

  backdrop?.addEventListener("click", () => {
    closeLocationSheet();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLocationSheet();
  });
}

export async function resolveShippingAddress() {
  const addressEl = document.getElementById("shipping-address-text");
  if (!addressEl) return;

  wireLocationSearch();

  try {
    const [coords, features] = await Promise.all([getPosition(), loadMap()]);
    const label = matchLocation(coords.latitude, coords.longitude, features);

    clearAddressSkeleton(addressEl);

    if (label) {
      addressEl.textContent = label;
    } else {
      showSetLocation();
    }
  } catch {
    try {
      await loadMap();
    } catch {
      /* map optional for set-location UI */
    }
    clearAddressSkeleton(addressEl);
    showSetLocation();
  }
}
