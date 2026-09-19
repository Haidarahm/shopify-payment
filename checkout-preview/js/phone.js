/** @typedef {{ iso: string, name: string, dial: string, min: number, max: number, placeholder: string, startsWith?: string[] }} Country */

/**
 * National number rules (digits after country code, leading 0 stripped).
 * ponytail: length-based preview rules, not full libphonenumber — tighten per market as needed.
 */
const COUNTRIES_URL = "./assets/countries.json";

/** @type {Country[]} */
let countries = [];
let selectedIso = "OM";
let phoneValidate = () => {};
let phoneTouched = false;

async function loadCountries() {
  if (countries.length) return countries;
  const res = await fetch(COUNTRIES_URL);
  if (!res.ok) throw new Error("Failed to load countries");
  countries = /** @type {Country[]} */ (await res.json());
  return countries;
}

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

function selectedCountry() {
  return countries.find((c) => c.iso === selectedIso) || countries[0];
}

/** Strip to national digits: drop spaces/dashes, leading 0, and accidental dial code. */
export function normalizeNationalNumber(raw, country = selectedCountry()) {
  let digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith(country.dial)) {
    digits = digits.slice(country.dial.length);
  }
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }
  return digits;
}

/**
 * @param {string} raw
 * @param {Country} [country]
 * @returns {{ ok: boolean, message: string, digits: string }}
 */
export function validatePhoneNumber(raw, country = selectedCountry()) {
  const digits = normalizeNationalNumber(raw, country);
  const label = country.name;
  const { min, max, startsWith } = country;

  if (!digits) {
    return { ok: false, message: "Phone number is required", digits };
  }

  if (digits.length < min || digits.length > max) {
    const lenHint = min === max ? `${min} digits` : `${min}–${max} digits`;
    return {
      ok: false,
      message: `Enter a valid ${label} number (${lenHint})`,
      digits,
    };
  }

  if (startsWith?.length && !startsWith.some((p) => digits.startsWith(p))) {
    const prefixes = startsWith.map((p) => `${p}…`).join(" or ");
    return {
      ok: false,
      message: `${label} numbers start with ${prefixes}`,
      digits,
    };
  }

  return { ok: true, message: "", digits };
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
  if (!q) return countries;

  return countries
    .map((c) => ({
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
  const phoneInput = document.getElementById("phone-number");

  if (flagEl) {
    flagEl.src = flagUrl(country.iso);
    flagEl.alt = "";
  }
  if (codeEl) codeEl.textContent = `+${country.dial}`;
  if (btn) {
    btn.setAttribute("aria-label", `Country code ${country.name} +${country.dial}`);
  }
  if (phoneInput) {
    phoneInput.placeholder = country.placeholder;
    phoneInput.setAttribute("inputmode", "numeric");
    phoneInput.setAttribute("autocomplete", "tel-national");
    phoneInput.maxLength = country.max + 4; // allow spaces while typing
  }
  if (phoneTouched) phoneValidate();
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

function isCountryPickerTarget(el) {
  return Boolean(el?.closest?.("#phone-prefix-btn, #country-sheet"));
}

function wirePhoneValidation() {
  const input = document.getElementById("phone-number");
  const field = document.getElementById("phone-number-field");
  const error = document.getElementById("phone-number-error");
  const prefixBtn = document.getElementById("phone-prefix-btn");
  if (!input || !field || !error) return;

  const clearError = () => {
    field.classList.remove("field--error");
    input.setAttribute("aria-invalid", "false");
    error.textContent = "";
    error.hidden = true;
  };

  phoneValidate = () => {
    if (!phoneTouched && !input.value.trim()) {
      clearError();
      return;
    }

    const { ok, message } = validatePhoneNumber(input.value);
    field.classList.toggle("field--error", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    error.textContent = message;
    error.hidden = ok;
  };

  // Keep focus on the phone field when opening the flag picker (avoids blur → empty error).
  prefixBtn?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
  });

  input.addEventListener("input", () => {
    // Clear stale error while typing; validate only on blur.
    if (field.classList.contains("field--error")) clearError();
  });
  input.addEventListener("blur", (e) => {
    if (isCountryPickerTarget(e.relatedTarget)) return;
    // blur can fire before the button/sheet gets focus — check on next tick
    setTimeout(() => {
      if (isCountryPickerTarget(document.activeElement)) return;
      if (document.getElementById("country-sheet")?.classList.contains("is-open")) return;
      phoneTouched = true;
      phoneValidate();
    }, 0);
  });

  clearError();
}

function runSelfcheck() {
  // ponytail: curated length rules — expand countries.json / tighten startsWith if a market rejects valid locals.
  if (
    typeof location === "undefined" ||
    !new URLSearchParams(location.search).has("selfcheck")
  ) {
    return;
  }

  const om = countries.find((c) => c.iso === "OM");
  console.assert(validatePhoneNumber("91234567", om).ok, "OM valid");
  console.assert(!validatePhoneNumber("51234567", om).ok, "OM bad prefix");
  console.assert(!validatePhoneNumber("9123456", om).ok, "OM too short");
  console.assert(validatePhoneNumber("091234567", om).ok, "OM strip leading 0");
  console.assert(validatePhoneNumber("96891234567", om).ok, "OM strip dial");
  const ae = countries.find((c) => c.iso === "AE");
  console.assert(validatePhoneNumber("501234567", ae).ok, "AE valid");
  console.assert(!validatePhoneNumber("401234567", ae).ok, "AE bad prefix");
  console.assert(flagUrl("OM") === "https://flagcdn.com/w40/om.png", "flag url");
}

export async function wirePhoneCountryPicker() {
  const btn = document.getElementById("phone-prefix-btn");
  const input = document.getElementById("country-search-input");
  if (!btn || !input) return;

  await loadCountries();
  runSelfcheck();

  wirePhoneValidation();

  const current = selectedCountry();
  applyCountry(current);

  btn.addEventListener("click", () => openCountrySheet());

  input.addEventListener("input", () => {
    renderCountryResults(searchCountries(input.value));
  });

  document.getElementById("country-sheet-backdrop")?.addEventListener("click", () => closeCountrySheet());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCountrySheet();
  });
}
