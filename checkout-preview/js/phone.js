/** @typedef {{ iso: string, name: string, dial: string, min: number, max: number, placeholder: string, startsWith?: string[] }} Country */

/**
 * National number rules (digits after country code, leading 0 stripped).
 * ponytail: length-based preview rules, not full libphonenumber — tighten per market as needed.
 */
const COUNTRIES = /** @type {Country[]} */ ([
  { iso: "OM", name: "Oman", dial: "968", min: 8, max: 8, placeholder: "9XXX XXXX", startsWith: ["7", "9"] },
  { iso: "AE", name: "United Arab Emirates", dial: "971", min: 9, max: 9, placeholder: "5X XXX XXXX", startsWith: ["5"] },
  { iso: "SA", name: "Saudi Arabia", dial: "966", min: 9, max: 9, placeholder: "5X XXX XXXX", startsWith: ["5"] },
  { iso: "KW", name: "Kuwait", dial: "965", min: 8, max: 8, placeholder: "9XXX XXXX", startsWith: ["5", "6", "9"] },
  { iso: "BH", name: "Bahrain", dial: "973", min: 8, max: 8, placeholder: "3XXX XXXX", startsWith: ["3", "6"] },
  { iso: "QA", name: "Qatar", dial: "974", min: 8, max: 8, placeholder: "3XXX XXXX", startsWith: ["3", "5", "6", "7"] },
  { iso: "YE", name: "Yemen", dial: "967", min: 9, max: 9, placeholder: "7XX XXX XXX" },
  { iso: "IQ", name: "Iraq", dial: "964", min: 10, max: 10, placeholder: "7XX XXX XXXX", startsWith: ["7"] },
  { iso: "JO", name: "Jordan", dial: "962", min: 9, max: 9, placeholder: "7X XXX XXXX", startsWith: ["7"] },
  { iso: "LB", name: "Lebanon", dial: "961", min: 7, max: 8, placeholder: "XX XXX XXX" },
  { iso: "EG", name: "Egypt", dial: "20", min: 10, max: 10, placeholder: "1X XXXX XXXX", startsWith: ["1"] },
  { iso: "IN", name: "India", dial: "91", min: 10, max: 10, placeholder: "XXXXX XXXXX" },
  { iso: "PK", name: "Pakistan", dial: "92", min: 10, max: 10, placeholder: "3XX XXXXXXX", startsWith: ["3"] },
  { iso: "BD", name: "Bangladesh", dial: "880", min: 10, max: 10, placeholder: "1XXX XXXXXX", startsWith: ["1"] },
  { iso: "PH", name: "Philippines", dial: "63", min: 10, max: 10, placeholder: "9XX XXX XXXX", startsWith: ["9"] },
  { iso: "ID", name: "Indonesia", dial: "62", min: 9, max: 12, placeholder: "8XX XXX XXXX", startsWith: ["8"] },
  { iso: "MY", name: "Malaysia", dial: "60", min: 9, max: 10, placeholder: "1X XXX XXXX", startsWith: ["1"] },
  { iso: "SG", name: "Singapore", dial: "65", min: 8, max: 8, placeholder: "8XXX XXXX", startsWith: ["8", "9"] },
  { iso: "CN", name: "China", dial: "86", min: 11, max: 11, placeholder: "1XX XXXX XXXX", startsWith: ["1"] },
  { iso: "JP", name: "Japan", dial: "81", min: 10, max: 11, placeholder: "90 XXXX XXXX" },
  { iso: "KR", name: "South Korea", dial: "82", min: 9, max: 11, placeholder: "10 XXXX XXXX" },
  { iso: "TR", name: "Turkey", dial: "90", min: 10, max: 10, placeholder: "5XX XXX XXXX", startsWith: ["5"] },
  { iso: "GB", name: "United Kingdom", dial: "44", min: 10, max: 10, placeholder: "7XXX XXXXXX", startsWith: ["7"] },
  { iso: "IE", name: "Ireland", dial: "353", min: 9, max: 9, placeholder: "8X XXX XXXX", startsWith: ["8"] },
  { iso: "FR", name: "France", dial: "33", min: 9, max: 9, placeholder: "6 XX XX XX XX", startsWith: ["6", "7"] },
  { iso: "DE", name: "Germany", dial: "49", min: 10, max: 11, placeholder: "15X XXXXXXX" },
  { iso: "IT", name: "Italy", dial: "39", min: 9, max: 10, placeholder: "3XX XXX XXXX", startsWith: ["3"] },
  { iso: "ES", name: "Spain", dial: "34", min: 9, max: 9, placeholder: "6XX XXX XXX", startsWith: ["6", "7"] },
  { iso: "NL", name: "Netherlands", dial: "31", min: 9, max: 9, placeholder: "6 XXXXXXXX", startsWith: ["6"] },
  { iso: "BE", name: "Belgium", dial: "32", min: 9, max: 9, placeholder: "4XX XX XX XX", startsWith: ["4"] },
  { iso: "CH", name: "Switzerland", dial: "41", min: 9, max: 9, placeholder: "7X XXX XX XX", startsWith: ["7"] },
  { iso: "AT", name: "Austria", dial: "43", min: 10, max: 13, placeholder: "6XX XXXXXXX" },
  { iso: "SE", name: "Sweden", dial: "46", min: 9, max: 9, placeholder: "7X XXX XX XX", startsWith: ["7"] },
  { iso: "NO", name: "Norway", dial: "47", min: 8, max: 8, placeholder: "4XX XX XXX", startsWith: ["4", "9"] },
  { iso: "DK", name: "Denmark", dial: "45", min: 8, max: 8, placeholder: "XX XX XX XX" },
  { iso: "FI", name: "Finland", dial: "358", min: 9, max: 10, placeholder: "4X XXX XXXX" },
  { iso: "PL", name: "Poland", dial: "48", min: 9, max: 9, placeholder: "5XX XXX XXX", startsWith: ["5", "6", "7", "8"] },
  { iso: "PT", name: "Portugal", dial: "351", min: 9, max: 9, placeholder: "9XX XXX XXX", startsWith: ["9"] },
  { iso: "GR", name: "Greece", dial: "30", min: 10, max: 10, placeholder: "69X XXX XXXX", startsWith: ["6"] },
  { iso: "RU", name: "Russia", dial: "7", min: 10, max: 10, placeholder: "9XX XXX XX XX", startsWith: ["9"] },
  { iso: "UA", name: "Ukraine", dial: "380", min: 9, max: 9, placeholder: "XX XXX XXXX" },
  { iso: "US", name: "United States", dial: "1", min: 10, max: 10, placeholder: "(XXX) XXX-XXXX" },
  { iso: "CA", name: "Canada", dial: "1", min: 10, max: 10, placeholder: "(XXX) XXX-XXXX" },
  { iso: "MX", name: "Mexico", dial: "52", min: 10, max: 10, placeholder: "XX XXXX XXXX" },
  { iso: "BR", name: "Brazil", dial: "55", min: 10, max: 11, placeholder: "XX 9XXXX XXXX" },
  { iso: "AR", name: "Argentina", dial: "54", min: 10, max: 10, placeholder: "9XX XXX XXXX" },
  { iso: "CL", name: "Chile", dial: "56", min: 9, max: 9, placeholder: "9 XXXX XXXX", startsWith: ["9"] },
  { iso: "CO", name: "Colombia", dial: "57", min: 10, max: 10, placeholder: "3XX XXX XXXX", startsWith: ["3"] },
  { iso: "AU", name: "Australia", dial: "61", min: 9, max: 9, placeholder: "4XX XXX XXX", startsWith: ["4"] },
  { iso: "NZ", name: "New Zealand", dial: "64", min: 8, max: 10, placeholder: "2X XXX XXXX", startsWith: ["2"] },
  { iso: "ZA", name: "South Africa", dial: "27", min: 9, max: 9, placeholder: "XX XXX XXXX" },
  { iso: "NG", name: "Nigeria", dial: "234", min: 10, max: 10, placeholder: "8XX XXX XXXX", startsWith: ["7", "8", "9"] },
  { iso: "KE", name: "Kenya", dial: "254", min: 9, max: 9, placeholder: "7XX XXX XXX", startsWith: ["7", "1"] },
  { iso: "MA", name: "Morocco", dial: "212", min: 9, max: 9, placeholder: "6XX XXXXXX", startsWith: ["6", "7"] },
  { iso: "TN", name: "Tunisia", dial: "216", min: 8, max: 8, placeholder: "XX XXX XXX" },
]);

let selectedIso = "OM";
let phoneValidate = () => {};
let phoneTouched = false;

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
  return COUNTRIES.find((c) => c.iso === selectedIso) || COUNTRIES[0];
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

export function wirePhoneCountryPicker() {
  const btn = document.getElementById("phone-prefix-btn");
  const input = document.getElementById("country-search-input");
  const backdrop = document.getElementById("country-sheet-backdrop");
  if (!btn || !input) return;

  wirePhoneValidation();

  const current = selectedCountry();
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

// ponytail: curated length rules — expand COUNTRIES / tighten startsWith if a market rejects valid locals.
if (
  typeof location !== "undefined" &&
  new URLSearchParams(location.search).has("selfcheck")
) {
  const om = COUNTRIES.find((c) => c.iso === "OM");
  console.assert(validatePhoneNumber("91234567", om).ok, "OM valid");
  console.assert(!validatePhoneNumber("51234567", om).ok, "OM bad prefix");
  console.assert(!validatePhoneNumber("9123456", om).ok, "OM too short");
  console.assert(validatePhoneNumber("091234567", om).ok, "OM strip leading 0");
  console.assert(validatePhoneNumber("96891234567", om).ok, "OM strip dial");
  const ae = COUNTRIES.find((c) => c.iso === "AE");
  console.assert(validatePhoneNumber("501234567", ae).ok, "AE valid");
  console.assert(!validatePhoneNumber("401234567", ae).ok, "AE bad prefix");
  console.assert(flagUrl("OM") === "https://flagcdn.com/w40/om.png", "flag url");
}
