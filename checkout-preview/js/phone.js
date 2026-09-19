/** @typedef {{ iso: string, name: string, dial: string }} Country */

/** GCC-first, then common shipping markets. */
const COUNTRIES = /** @type {Country[]} */ ([
  { iso: "OM", name: "Oman", dial: "968" },
  { iso: "AE", name: "United Arab Emirates", dial: "971" },
  { iso: "SA", name: "Saudi Arabia", dial: "966" },
  { iso: "KW", name: "Kuwait", dial: "965" },
  { iso: "BH", name: "Bahrain", dial: "973" },
  { iso: "QA", name: "Qatar", dial: "974" },
  { iso: "YE", name: "Yemen", dial: "967" },
  { iso: "IQ", name: "Iraq", dial: "964" },
  { iso: "JO", name: "Jordan", dial: "962" },
  { iso: "LB", name: "Lebanon", dial: "961" },
  { iso: "EG", name: "Egypt", dial: "20" },
  { iso: "IN", name: "India", dial: "91" },
  { iso: "PK", name: "Pakistan", dial: "92" },
  { iso: "BD", name: "Bangladesh", dial: "880" },
  { iso: "PH", name: "Philippines", dial: "63" },
  { iso: "ID", name: "Indonesia", dial: "62" },
  { iso: "MY", name: "Malaysia", dial: "60" },
  { iso: "SG", name: "Singapore", dial: "65" },
  { iso: "CN", name: "China", dial: "86" },
  { iso: "JP", name: "Japan", dial: "81" },
  { iso: "KR", name: "South Korea", dial: "82" },
  { iso: "TR", name: "Turkey", dial: "90" },
  { iso: "GB", name: "United Kingdom", dial: "44" },
  { iso: "IE", name: "Ireland", dial: "353" },
  { iso: "FR", name: "France", dial: "33" },
  { iso: "DE", name: "Germany", dial: "49" },
  { iso: "IT", name: "Italy", dial: "39" },
  { iso: "ES", name: "Spain", dial: "34" },
  { iso: "NL", name: "Netherlands", dial: "31" },
  { iso: "BE", name: "Belgium", dial: "32" },
  { iso: "CH", name: "Switzerland", dial: "41" },
  { iso: "AT", name: "Austria", dial: "43" },
  { iso: "SE", name: "Sweden", dial: "46" },
  { iso: "NO", name: "Norway", dial: "47" },
  { iso: "DK", name: "Denmark", dial: "45" },
  { iso: "FI", name: "Finland", dial: "358" },
  { iso: "PL", name: "Poland", dial: "48" },
  { iso: "PT", name: "Portugal", dial: "351" },
  { iso: "GR", name: "Greece", dial: "30" },
  { iso: "RU", name: "Russia", dial: "7" },
  { iso: "UA", name: "Ukraine", dial: "380" },
  { iso: "US", name: "United States", dial: "1" },
  { iso: "CA", name: "Canada", dial: "1" },
  { iso: "MX", name: "Mexico", dial: "52" },
  { iso: "BR", name: "Brazil", dial: "55" },
  { iso: "AR", name: "Argentina", dial: "54" },
  { iso: "CL", name: "Chile", dial: "56" },
  { iso: "CO", name: "Colombia", dial: "57" },
  { iso: "AU", name: "Australia", dial: "61" },
  { iso: "NZ", name: "New Zealand", dial: "64" },
  { iso: "ZA", name: "South Africa", dial: "27" },
  { iso: "NG", name: "Nigeria", dial: "234" },
  { iso: "KE", name: "Kenya", dial: "254" },
  { iso: "MA", name: "Morocco", dial: "212" },
  { iso: "TN", name: "Tunisia", dial: "216" },
]);

let selectedIso = "OM";

/** PNG flags — Windows does not render emoji flags. */
function flagUrl(iso) {
  return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
}

function flagImg(iso, className) {
  const img = document.createElement("img");
  img.className = className;
  img.src = flagUrl(iso);
  img.alt = "";
  img.width = 20;
  img.height = 15;
  img.loading = "lazy";
  img.decoding = "async";
  return img;
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

function searchCountries(query) {
  const q = query.trim().replace(/^\+/, "");
  if (!q) return COUNTRIES;

  return COUNTRIES.map((c) => ({
    ...c,
    score: Math.max(
      fuzzyScore(q, c.name),
      fuzzyScore(q, c.iso),
      fuzzyScore(q, c.dial),
      fuzzyScore(q, `+${c.dial}`)
    ),
  }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

function applyCountry(country) {
  selectedIso = country.iso;
  const flagEl = document.getElementById("phone-prefix-flag");
  const codeEl = document.getElementById("phone-prefix-code");
  const btn = document.getElementById("phone-prefix-btn");

  if (flagEl) {
    flagEl.src = flagUrl(country.iso);
    flagEl.alt = "";
  }
  if (codeEl) codeEl.textContent = `+${country.dial}`;
  if (btn) {
    btn.setAttribute("aria-label", `Country code ${country.name} +${country.dial}`);
  }
}

function openCountrySheet() {
  const sheet = document.getElementById("country-sheet");
  const input = document.getElementById("country-search-input");
  if (!sheet || !input) return;

  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  input.value = "";
  renderCountryResults(searchCountries(""));
  requestAnimationFrame(() => input.focus());
}

function closeCountrySheet() {
  const sheet = document.getElementById("country-sheet");
  const input = document.getElementById("country-search-input");
  if (!sheet?.classList.contains("is-open")) return;

  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (input) input.value = "";
  renderCountryResults([]);
}

function renderCountryResults(matches) {
  const list = document.getElementById("country-search-results");
  if (!list) return;

  list.replaceChildren();
  for (const country of matches) {
    const li = document.createElement("li");
    li.className = "location-sheet__option country-option";
    li.setAttribute("role", "option");
    li.tabIndex = 0;
    if (country.iso === selectedIso) li.setAttribute("aria-selected", "true");

    const name = document.createElement("span");
    name.className = "country-option__name";
    name.textContent = country.name;

    const dial = document.createElement("span");
    dial.className = "country-option__dial";
    dial.textContent = `+${country.dial}`;

    li.append(flagImg(country.iso, "country-option__flag"), name, dial);

    const pick = () => {
      applyCountry(country);
      closeCountrySheet();
    };
    li.addEventListener("click", pick);
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    });
    list.appendChild(li);
  }
}

export function wirePhoneCountryPicker() {
  const btn = document.getElementById("phone-prefix-btn");
  const input = document.getElementById("country-search-input");
  const backdrop = document.getElementById("country-sheet-backdrop");
  if (!btn || !input) return;

  const current = COUNTRIES.find((c) => c.iso === selectedIso) || COUNTRIES[0];
  applyCountry(current);

  btn.addEventListener("click", () => openCountrySheet());

  input.addEventListener("input", () => {
    renderCountryResults(searchCountries(input.value));
  });

  backdrop?.addEventListener("click", () => closeCountrySheet());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCountrySheet();
  });
}

// ponytail: preview list is curated (~55), not full ITU — expand COUNTRIES if a market is missing.
if (new URLSearchParams(location.search).has("selfcheck")) {
  console.assert(flagUrl("OM") === "https://flagcdn.com/w40/om.png", "flag url");
  console.assert(searchCountries("oman")[0]?.iso === "OM", "search name");
  console.assert(searchCountries("971")[0]?.iso === "AE", "search dial");
  console.assert(searchCountries("").length === COUNTRIES.length, "empty lists all");
}
