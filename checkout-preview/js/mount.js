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

await Promise.all(COMPONENTS.map(mountComponent));
