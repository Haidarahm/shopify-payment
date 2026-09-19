import { fakeItems } from "./fakeItems.js";

export function renderOrderItems(items = fakeItems) {
  const list = document.getElementById("order-items-list");
  const title = document.getElementById("order-items-title");
  if (!list) return;

  if (title) title.textContent = `Order items (${items.length})`;

  list.replaceChildren();

  for (const item of items) {
    const article = document.createElement("article");
    article.className = "order-item";

    const img = document.createElement("img");
    img.className = "order-item__thumb";
    img.src = item.image;
    img.alt = item.alt || "Order item";
    img.width = 72;
    img.height = 72;
    img.loading = "lazy";

    const price = document.createElement("p");
    price.className = "order-item__price";
    price.textContent = item.price;

    article.append(img, price);
    list.appendChild(article);
  }
}
