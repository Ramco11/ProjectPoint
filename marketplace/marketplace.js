"use strict";

document.addEventListener("DOMContentLoaded", () => {

  const { escapeHtml, getAllProducts, getProduct, createOrder, categoryIcons } = FarmSetu;

  const searchInput = document.getElementById("marketSearch");
  const sortSelect = document.getElementById("sortSelect");
  const grid = document.getElementById("productGrid");
  const count = document.getElementById("productCount");
  const emptyState = document.getElementById("emptyState");

  let category = "All";

  /* Pre-fill search from ?search=... (used by the home page) */
  const initial = new URLSearchParams(window.location.search).get("search");
  if (initial) searchInput.value = initial;

  function iconFor(product) {
    return product.icon || categoryIcons[product.category] || "🧺";
  }

  function matches(product) {
    const text = [product.name, product.category, product.location, product.seller,
      product.organic ? "organic" : ""].join(" ").toLowerCase();
    const query = searchInput.value.trim().toLowerCase();
    if (query && !text.includes(query)) return false;
    if (category === "All") return true;
    if (category === "Organic") return Boolean(product.organic) || product.category === "Organic";
    return product.category === category;
  }

  function render() {
    let products = getAllProducts().filter(matches);

    if (sortSelect.value === "low") products.sort((a, b) => a.price - b.price);
    if (sortSelect.value === "high") products.sort((a, b) => b.price - a.price);

    count.textContent = products.length + (products.length === 1 ? " product found" : " products found");
    grid.innerHTML = "";
    emptyState.hidden = products.length > 0;

    products.forEach((product) => {
      const unit = escapeHtml(product.unit || "kg");
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <a class="product-image" href="product.html?id=${encodeURIComponent(product.id)}"
           aria-label="View ${escapeHtml(product.name)}">${escapeHtml(iconFor(product))}</a>
        <div class="product-body">
          <div class="badge-row">
            <span class="category-badge">${escapeHtml(product.category)}</span>
            ${product.organic ? '<span class="organic-pill">🌿 Organic</span>' : ""}
          </div>
          <h3><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
          <div class="product-price">₹${Number(product.price).toLocaleString("en-IN")}<small> / ${unit}</small></div>
          <p class="product-meta">
            📦 ${Number(product.quantity).toLocaleString("en-IN")} ${unit} available<br>
            📍 ${escapeHtml(product.location)}<br>
            👨‍🌾 ${escapeHtml(product.seller)}
          </p>
          <div class="product-actions">
            <button type="button" data-contact="${escapeHtml(product.id)}">Contact</button>
            <button type="button" class="order-button" data-order="${escapeHtml(product.id)}">Order</button>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }

  searchInput.addEventListener("input", render);
  sortSelect.addEventListener("change", render);

  document.getElementById("categoryChips").addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    category = chip.dataset.category;
    render();
  });

  grid.addEventListener("click", (event) => {
    const contact = event.target.closest("[data-contact]");
    const order = event.target.closest("[data-order]");

    if (contact) {
      showToast("Seller chat will connect during the secure backend phase.");
      return;
    }

    if (order) {
      const product = getProduct(order.dataset.order);
      if (!product) return;
      const qty = Math.max(1, Number(product.minimumOrder) || 1);
      createOrder(product, qty);
      showToast(`Order placed: ${qty} ${product.unit || "kg"} of ${product.name}. See My Orders.`);
    }
  });

  render();
});