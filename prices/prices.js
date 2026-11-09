"use strict";

const priceData = [
    {
        crop: "Tomato",
        market: "Rajkot",
        minimum: 24,
        average: 32,
        maximum: 42,
        trend: "Up"
    },
    {
        crop: "Potato",
        market: "Ahmedabad",
        minimum: 18,
        average: 25,
        maximum: 31,
        trend: "Stable"
    },
    {
        crop: "Wheat",
        market: "Jamnagar",
        minimum: 25,
        average: 29,
        maximum: 34,
        trend: "Up"
    },
    {
        crop: "Groundnut",
        market: "Junagadh",
        minimum: 58,
        average: 67,
        maximum: 76,
        trend: "Up"
    },
    {
        crop: "Onion",
        market: "Bhavnagar",
        minimum: 21,
        average: 27,
        maximum: 35,
        trend: "Down"
    },
    {
        crop: "Cotton",
        market: "Surendranagar",
        minimum: 68,
        average: 74,
        maximum: 81,
        trend: "Stable"
    }
];

const priceSearch = document.getElementById("priceSearch");
const priceTableBody = document.getElementById(
    "priceTableBody"
);

function renderPrices() {
    const searchValue = priceSearch.value.trim().toLowerCase();

    const filteredPrices = priceData.filter(function (item) {
        return `${item.crop} ${item.market}`
            .toLowerCase()
            .includes(searchValue);
    });

    priceTableBody.innerHTML = "";

    filteredPrices.forEach(function (item) {
        const row = document.createElement("tr");

        let trendClass = "";

        if (item.trend === "Up") {
            trendClass = "price-up";
        }

        if (item.trend === "Down") {
            trendClass = "price-down";
        }

        row.innerHTML = `
            <td><strong>${item.crop}</strong></td>
            <td>${item.market}</td>
            <td>₹${item.minimum}/kg</td>
            <td>₹${item.average}/kg</td>
            <td>₹${item.maximum}/kg</td>
            <td class="${trendClass}">
                ${
                    item.trend === "Up"
                        ? "↑ Up"
                        : item.trend === "Down"
                            ? "↓ Down"
                            : "→ Stable"
                }
            </td>
        `;

        priceTableBody.appendChild(row);
    });
}

priceSearch.addEventListener("input", renderPrices);

renderPrices();