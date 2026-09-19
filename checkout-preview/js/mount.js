import { resolveShippingAddress } from "./location.js";
import { renderOrderItems } from "./orderItems.js";

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

function wireRequiredField(inputId, fieldId, errorId) {
  const input = document.getElementById(inputId);
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
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
renderOrderItems();
wireRequiredField("full-name", "full-name-field", "full-name-error");
wireRequiredField("phone-number", "phone-number-field", "phone-number-error");
await resolveShippingAddress();
