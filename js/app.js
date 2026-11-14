"use strict";

/*
 * FarmSetu shared helpers.
 * Loaded by every page BEFORE the page's own script.
 * Data lives in localStorage for this frontend demo; swap the
 * functions below for Supabase calls in the backend phase.
 */

window.FarmSetu = (function () {

  /* ---------- Utilities ---------- */

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatCurrency(amount) {
    const n = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency", currency: "INR", maximumFractionDigits: 0
    }).format(n);
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value === null || value === undefined ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false; // storage full or blocked — app still works
    }
  }

  let toastTimer;
  function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2400);
  }

  /* ---------- Products ---------- */

  const defaultProducts = [
    { id: 1, name: "Organic Tomatoes", category: "Vegetables", price: 30, unit: "kg", quantity: 500, minimumOrder: 10, organic: true, location: "Rajkot, Gujarat", seller: "Rameshbhai Patel", icon: "🍅", description: "Fresh organic tomatoes grown locally using sustainable farming methods. Harvested at the right stage for freshness and quality. Available directly from the farmer." },
    { id: 2, name: "Fresh Onions", category: "Vegetables", price: 22, unit: "kg", quantity: 900, minimumOrder: 25, organic: false, location: "Jamnagar, Gujarat", seller: "Rameshbhai Patel", icon: "🧅", description: "Fresh farm onions supplied directly by a local farmer. Suitable for household, retail and bulk purchasing." },
    { id: 3, name: "Organic Wheat", category: "Grains", price: 28, unit: "kg", quantity: 1200, minimumOrder: 50, organic: true, location: "Surendranagar, Gujarat", seller: "Rameshbhai Patel", icon: "🌾", description: "Farm-grown wheat available for direct purchase. The listing is marked by the seller as organically grown." },
    { id: 4, name: "Fresh Potatoes", category: "Vegetables", price: 28, unit: "kg", quantity: 500, minimumOrder: 20, organic: false, location: "Ahmedabad, Gujarat", seller: "Patel Family Farm", icon: "🥔", description: "Clean, firm potatoes suitable for retail and bulk orders." },
    { id: 5, name: "Premium Wheat", category: "Grains", price: 36, unit: "kg", quantity: 1200, minimumOrder: 100, organic: false, location: "Indore, Madhya Pradesh", seller: "Shakti Agriculture", icon: "🌾", description: "Premium graded wheat, cleaned and bagged." },
    { id: 6, name: "Groundnut Seeds", category: "Seeds", price: 95, unit: "kg", quantity: 220, minimumOrder: 5, organic: false, location: "Junagadh, Gujarat", seller: "Kisan Seeds", icon: "🥜", description: "Seed-grade groundnut with good germination. Confirm variety and treatment with the seller." },
    { id: 7, name: "Fresh Mangoes", category: "Fruits", price: 110, unit: "kg", quantity: 350, minimumOrder: 5, organic: false, location: "Gir Somnath, Gujarat", seller: "Madhav Orchard", icon: "🥭", description: "Tree-ripened mangoes from a family orchard." },
    { id: 8, name: "Organic Spinach", category: "Vegetables", price: 32, unit: "kg", quantity: 90, minimumOrder: 2, organic: true, location: "Surat, Gujarat", seller: "Natural Harvest", icon: "🥬", description: "Freshly cut organic spinach, best bought within two days." }
  ];

  const categoryIcons = {
    Vegetables: "🥕", Fruits: "🥭", Grains: "🌾", Seeds: "🌱",
    Pulses: "🫘", Spices: "🌶️", Organic: "🥬", Other: "🧺"
  };

  function getSavedProducts() {
    const list = readJson("farmsetu-products", []);
    return Array.isArray(list) ? list : [];
  }

  function getAllProducts() {
    return getSavedProducts().concat(defaultProducts);
  }

  function getProduct(id) {
    return getAllProducts().find(function (p) { return String(p.id) === String(id); }) || null;
  }

  function addProduct(product) {
    const list = getSavedProducts();
    list.unshift(product);
    return writeJson("farmsetu-products", list);
  }

  /* ---------- Orders ---------- */

  function getOrders() {
    const list = readJson("farmsetu-orders", []);
    return Array.isArray(list) ? list : [];
  }

  function saveOrders(orders) {
    return writeJson("farmsetu-orders", orders);
  }

  function createOrder(product, quantity) {
    const qty = Math.max(1, Number(quantity) || 1);
    const orders = getOrders();
    orders.unshift({
      id: Date.now(),
      productName: product.name,
      seller: product.seller,
      unit: product.unit || "kg",
      quantity: qty,
      total: Number(product.price) * qty,
      status: "Pending"
    });
    saveOrders(orders);
  }

  return {
    escapeHtml, formatCurrency, readJson, writeJson, showToast,
    defaultProducts, categoryIcons,
    getSavedProducts, getAllProducts, getProduct, addProduct,
    getOrders, saveOrders, createOrder
  };

})();

/* Global shortcut used by several pages */
window.showToast = window.FarmSetu.showToast;