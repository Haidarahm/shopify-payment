import { resolveShippingAddress } from "./location.js";

const COMPONENTS = [
  "CheckoutHeader",
  "OrderItemsCard",
  "ShippingAddressCard",
  "OrderSummaryCard",
];

async function mountComponent(name) {
  const target = document.querySelector(`[data-component="${name}"]`);
  if (!target) return;

  const response = await fetch(`./components/${name}.html`);
  if (!response.ok) {
    target.textContent = `Failed to load ${name}`;
    return;
  }

  target.innerHTML = await response.text();
}

function wireFullNameValidation() {
  const input = document.getElementById("full-name");
  const field = document.getElementById("full-name-field");
  const error = document.getElementById("full-name-error");
  if (!input || !field || !error) return;

  const validate = () => {
    const empty = !input.value.trim();
    field.classList.toggle("field--error", empty);
    input.setAttribute("aria-invalid", empty ? "true" : "false");
    error.hidden = !empty;
  };

  input.addEventListener("input", validate);
  input.addEventListener("blur", validate);
}

await Promise.all(COMPONENTS.map(mountComponent));
wireFullNameValidation();
await resolveShippingAddress();
