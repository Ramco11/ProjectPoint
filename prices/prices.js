"use strict";

/* Demonstration market price data (₹ per quintal). Replace with a verified mandi API. */

document.addEventListener("DOMContentLoaded", () => {

  const { escapeHtml, formatCurrency } = FarmSetu;

  const prices = [
    { crop: "Wheat", icon: "🌾", market: "Rajkot APMC", min: 2350, avg: 2480, max: 2620, change: 1.8 },
    { crop: "Groundnut", icon: "🥜", market: "Junagadh APMC", min: 5900, avg: 6350, max: 6800, change: 2.4 },
    { crop: "Cotton", icon: "☁️", market: "Surendranagar APMC", min: 6700, avg: 7050, max: 7400, change: -1.2 },
    { crop: "Onion", icon: "🧅", market: "Mahuva APMC", min: 900, avg: 1350, max: 1800, change: -3.5 },
    { crop: "Potato", icon: "🥔", market: "Deesa APMC", min: 850, avg: 1100, max: 1400, change: 0.0 },
    { crop: "Tomato", icon: "🍅", market: "Ahmedabad APMC", min: 1200, avg: 1900, max: 2600, change: 4.1 },
    { crop: "Chickpea (Chana)", icon: "🫘", market: "Rajkot APMC", min: 5400, avg: 5700, max: 5950, change: 0.9 },
    { crop: "Cumin (Jeera)", icon: "🌿", market: "Unjha APMC", min: 24500, avg: 26200, max: 28000, change: -0.6 },
    { crop: "Castor Seed", icon: "🌱", market: "Patan APMC", min: 5700, avg: 5950, max: 6150, change: 1.1 },
    { crop: "Mango (Kesar)", icon: "🥭", market: "Talala APMC", min: 3500, avg: 5200, max: 7500, change: 3.2 }
  ];

  const list = document.getElementById("priceList");
  const search = document.getElementById("priceSearch");
  const empty = document.getElementById("noPrices");
  let trend = "all";

  function trendOf(item) {
    return item.change > 0 ? "up" : item.change < 0 ? "down" : "flat";
  }

  function render() {
    const query = search.value.trim().toLowerCase();

    const rows = prices.filter((item) =>
      (item.crop + " " + item.market).toLowerCase().includes(query) &&
      (trend === "all" || trendOf(item) === trend));

    list.innerHTML = "";
    empty.hidden = rows.length > 0;

    rows.forEach((item) => {
      const t = trendOf(item);
      const label = t === "up" ? "▲ " + item.change.toFixed(1) + "%"
        : t === "down" ? "▼ " + Math.abs(item.change).toFixed(1) + "%"
        : "● Stable";

      const card = document.createElement("article");
      card.className = "price-card";
      card.innerHTML = `
        <div class="price-top">
          <div class="price-icon">${item.icon}</div>
          <div><b>${escapeHtml(item.crop)}</b><small>📍 ${escapeHtml(item.market)}</small></div>
          <span class="trend price-${t}">${label}</span>
        </div>
        <div class="price-range">
          <div><small>Minimum</small><strong>${formatCurrency(item.min)}</strong></div>
          <div class="avg"><small>Average</small><strong>${formatCurrency(item.avg)}</strong></div>
          <div><small>Maximum</small><strong>${formatCurrency(item.max)}</strong></div>
        </div>`;
      list.appendChild(card);
    });
  }

  search.addEventListener("input", render);

  document.getElementById("trendChips").addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    trend = chip.dataset.trend;
    render();
  });

  render();
});