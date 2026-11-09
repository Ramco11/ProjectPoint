"use strict";

const defaultProducts = [
    {
        id: 101,
        name: "Organic Tomatoes",
        category: "Organic",
        price: 42,
        quantity: 180,
        location: "Rajkot, Gujarat",
        seller: "Green Field Farm"
    },
    {
        id: 102,
        name: "Fresh Potatoes",
        category: "Vegetables",
        price: 28,
        quantity: 500,
        location: "Ahmedabad, Gujarat",
        seller: "Patel Family Farm"
    },
    {
        id: 103,
        name: "Premium Wheat",
        category: "Grains",
        price: 36,
        quantity: 1200,
        location: "Indore, Madhya Pradesh",
        seller: "Shakti Agriculture"
    },
    {
        id: 104,
        name: "Groundnut Seeds",
        category: "Seeds",
        price: 95,
        quantity: 220,
        location: "Junagadh, Gujarat",
        seller: "Kisan Seeds"
    },
    {
        id: 105,
        name: "Fresh Mangoes",
        category: "Fruits",
        price: 110,
        quantity: 350,
        location: "Gir Somnath, Gujarat",
        seller: "Madhav Orchard"
    },
    {
        id: 106,
        name: "Organic Spinach",
        category: "Organic",
        price: 32,
        quantity: 90,
        location: "Surat, Gujarat",
        seller: "Natural Harvest"
    }
];

const marketSearch = document.getElementById("marketSearch");
const categoryFilter = document.getElementById("categoryFilter");
const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const emptyState = document.getElementById("emptyState");

const listingModal = document.getElementById("listingModal");
const openListingForm = document.getElementById("openListingForm");
const closeListingForm = document.getElementById("closeListingForm");
const listingForm = document.getElementById("listingForm");
const listingMessage = document.getElementById("listingMessage");

function getSavedProducts() {
    const saved = localStorage.getItem("farmsetu-products");

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch (error) {
        return [];
    }
}

function getAllProducts() {
    return [...getSavedProducts(), ...defaultProducts];
}

function getProductIcon(category) {
    const icons = {
        Vegetables: "🥕",
        Fruits: "🥭",
        Grains: "🌾",
        Seeds: "🌱",
        Organic: "🥬"
    };

    return icons[category] || "🧺";
}

function renderProducts() {
    const searchValue = marketSearch.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = getAllProducts().filter(function (product) {
        const searchableText = [
            product.name,
            product.category,
            product.location,
            product.seller
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch =
            searchableText.includes(searchValue);

        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    productGrid.innerHTML = "";

    productCount.textContent =
        `${filteredProducts.length} products found`;

    if (filteredProducts.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    filteredProducts.forEach(function (product) {
        const productCard = document.createElement("article");

        productCard.className = "product-card";

        productCard.innerHTML = `
            <div class="product-image">
                ${getProductIcon(product.category)}
            </div>

            <div class="product-content">
                <span class="category-badge">
                    ${escapeHtml(product.category)}
                </span>

                <div class="product-topline">
                    <h3>${escapeHtml(product.name)}</h3>

                    <span class="product-price">
                        ₹${Number(product.price).toLocaleString()}/kg
                    </span>
                </div>

                <div class="product-details">
                    <span>
                        📦 ${Number(product.quantity).toLocaleString()} kg
                        available
                    </span>

                    <span>📍 ${escapeHtml(product.location)}</span>
                    <span>👨‍🌾 ${escapeHtml(product.seller)}</span>
                </div>

                <div class="product-actions">
                    <button
                        class="contact-button"
                        type="button"
                        data-contact="${product.id}"
                    >
                        Contact
                    </button>

                    <button
                        class="order-button"
                        type="button"
                        data-order="${product.id}"
                    >
                        Order
                    </button>
                </div>
            </div>
        `;

        productGrid.appendChild(productCard);
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

marketSearch.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);

openListingForm.addEventListener("click", function () {
    listingModal.classList.add("show");
    document.body.classList.add("modal-open");
});

closeListingForm.addEventListener("click", function () {
    listingModal.classList.remove("show");
    document.body.classList.remove("modal-open");
});

listingModal.addEventListener("click", function (event) {
    if (event.target === listingModal) {
        listingModal.classList.remove("show");
        document.body.classList.remove("modal-open");
    }
});

listingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const product = {
        id: Date.now(),
        name: document.getElementById("listingName").value.trim(),
        category: document.getElementById("listingCategory").value,
        price: Number(document.getElementById("listingPrice").value),
        quantity: Number(
            document.getElementById("listingQuantity").value
        ),
        location: document
            .getElementById("listingLocation")
            .value
            .trim(),
        seller: document.getElementById("listingSeller").value.trim()
    };

    if (
        !product.name ||
        !product.category ||
        product.price <= 0 ||
        product.quantity <= 0 ||
        !product.location ||
        !product.seller
    ) {
        listingMessage.textContent =
            "Please complete all fields correctly.";

        return;
    }

    const products = getSavedProducts();

    products.unshift(product);

    localStorage.setItem(
        "farmsetu-products",
        JSON.stringify(products)
    );

    listingMessage.textContent =
        "Product successfully added.";

    listingForm.reset();
    renderProducts();

    window.setTimeout(function () {
        listingModal.classList.remove("show");
        document.body.classList.remove("modal-open");
        listingMessage.textContent = "";
    }, 700);
});

productGrid.addEventListener("click", function (event) {
    const contactButton = event.target.closest("[data-contact]");
    const orderButton = event.target.closest("[data-order]");

    if (contactButton) {
        window.alert(
            "Seller contact and chat will be connected in Phase 2."
        );
    }

    if (orderButton) {
        const productId = Number(orderButton.dataset.order);

        const product = getAllProducts().find(
            (item) => item.id === productId
        );

        if (!product) {
            return;
        }

        const orders = JSON.parse(
            localStorage.getItem("farmsetu-orders") || "[]"
        );

        orders.unshift({
            id: Date.now(),
            productName: product.name,
            seller: product.seller,
            quantity: 10,
            total: product.price * 10,
            status: "Pending"
        });

        localStorage.setItem(
            "farmsetu-orders",
            JSON.stringify(orders)
        );

        window.alert(
            "Sample order created. Open My Orders to review it."
        );
    }
});

renderProducts();