"use strict";

const productModal = document.getElementById("productModal");
const assistantModal = document.getElementById("assistantModal");

const sellProductButton = document.getElementById("sellProductButton");
const mobileSellButton = document.getElementById("mobileSellButton");
const closeProductModal = document.getElementById("closeProductModal");

const assistantButton = document.getElementById("assistantButton");
const closeAssistantModal = document.getElementById("closeAssistantModal");

const productForm = document.getElementById("productForm");
const productFormMessage = document.getElementById("productFormMessage");
const assistantResponse = document.getElementById("assistantResponse");
const languageButton = document.getElementById("languageButton");

function openModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.add("show");
    document.body.classList.add("modal-open");
}

function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    const openModalExists = document.querySelector(".modal.show");

    if (!openModalExists) {
        document.body.classList.remove("modal-open");
    }
}

sellProductButton?.addEventListener("click", function () {
    openModal(productModal);
});

mobileSellButton?.addEventListener("click", function () {
    openModal(productModal);
});

closeProductModal?.addEventListener("click", function () {
    closeModal(productModal);
});

assistantButton?.addEventListener("click", function () {
    openModal(assistantModal);
});

closeAssistantModal?.addEventListener("click", function () {
    closeModal(assistantModal);
});

document.querySelectorAll(".modal").forEach(function (modal) {
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal(productModal);
        closeModal(assistantModal);
    }
});

function getSavedProducts() {
    const savedProducts = localStorage.getItem("farmsetu-products");

    if (!savedProducts) {
        return [];
    }

    try {
        return JSON.parse(savedProducts);
    } catch (error) {
        return [];
    }
}

productForm?.addEventListener("submit", function (event) {
    event.preventDefault();

    const product = {
        id: Date.now(),
        name: document.getElementById("productName").value.trim(),
        category: document.getElementById("productCategory").value,
        price: Number(document.getElementById("productPrice").value),
        quantity: Number(
            document.getElementById("productQuantity").value
        ),
        location: document
            .getElementById("productLocation")
            .value
            .trim(),
        seller: document.getElementById("sellerName").value.trim(),
        createdAt: new Date().toISOString()
    };

    if (
        !product.name ||
        !product.category ||
        product.price <= 0 ||
        product.quantity <= 0 ||
        !product.location ||
        !product.seller
    ) {
        productFormMessage.textContent =
            "Please complete all product details correctly.";

        return;
    }

    const products = getSavedProducts();

    products.unshift(product);

    localStorage.setItem(
        "farmsetu-products",
        JSON.stringify(products)
    );

    productFormMessage.textContent =
        "Product published successfully.";

    productForm.reset();

    window.setTimeout(function () {
        window.location.href = "marketplace/marketplace.html";
    }, 800);
});

const assistantAnswers = {
    crop:
        "Record the crop name, planting date, soil condition and recent symptoms. Check leaves, stems and roots separately before selecting any treatment.",

    pest:
        "Remove heavily affected leaves, keep the field clean and identify the pest before applying a treatment. Use traps or approved biological controls where suitable.",

    water:
        "Check soil moisture below the surface before irrigation. Water early in the morning and avoid keeping roots continuously saturated unless the crop requires it.",

    organic:
        "Start with healthy soil, mature compost, crop rotation and biological pest controls. Do not apply an unknown mixture directly to the entire crop."
};

document
    .querySelectorAll(".assistant-options button")
    .forEach(function (button) {
        button.addEventListener("click", function () {
            const topic = button.dataset.topic;

            assistantResponse.textContent =
                assistantAnswers[topic] ??
                "Select a valid farming topic.";
        });
    });

let currentLanguage = "EN";

languageButton?.addEventListener("click", function () {
    currentLanguage = currentLanguage === "EN" ? "हि" : "EN";
    languageButton.textContent = currentLanguage;
});