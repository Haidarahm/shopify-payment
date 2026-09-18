const MAX_POINT_KM = 25;

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
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + 0) + xi;
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

function showSetLocation() {
  const btn = document.getElementById("address-action-btn");
  if (btn) btn.textContent = "Set location";

  const row = document.getElementById("shipping-address-row");
  if (row) row.hidden = true;
}

function clearAddressSkeleton(addressEl) {
  addressEl.classList.remove("skeleton-text");
  addressEl.removeAttribute("aria-busy");
  addressEl.replaceChildren();
}

export async function resolveShippingAddress() {
  const addressEl = document.getElementById("shipping-address-text");
  if (!addressEl) return;

  try {
    const [{ latitude, longitude }, mapRes] = await Promise.all([
      getPosition(),
      fetch("./assets/map.geojson"),
    ]);

    if (!mapRes.ok) throw new Error("Failed to load map");

    const map = await mapRes.json();
    const label = matchLocation(latitude, longitude, map.features || []);

    clearAddressSkeleton(addressEl);

    if (label) {
      addressEl.textContent = label;
    } else {
      showSetLocation();
    }
  } catch {
    clearAddressSkeleton(addressEl);
    showSetLocation();
  }
}
