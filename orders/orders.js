"use strict";

const ordersList = document.getElementById("ordersList");
const noOrders = document.getElementById("noOrders");
const totalOrders = document.getElementById("totalOrders");
const pendingOrders = document.getElementById("pendingOrders");
const deliveredOrders = document.getElementById(
    "deliveredOrders"
);

function getOrders() {
    try {
        return JSON.parse(
            localStorage.getItem("farmsetu-orders") || "[]"
        );
    } catch (error) {
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem(
        "farmsetu-orders",
        JSON.stringify(orders)
    );
}

function updateSummary(orders) {
    totalOrders.textContent = orders.length;

    pendingOrders.textContent = orders.filter(
        (order) => order.status === "Pending"
    ).length;

    deliveredOrders.textContent = orders.filter(
        (order) => order.status === "Delivered"
    ).length;
}

function renderOrders() {
    const orders = getOrders();

    ordersList.innerHTML = "";
    updateSummary(orders);

    if (orders.length === 0) {
        noOrders.style.display = "block";
        return;
    }

    noOrders.style.display = "none";

    orders.forEach(function (order) {
        const card = document.createElement("article");

        card.className = "order-card";

        card.innerHTML = `
            <div>
                <h2>${order.productName}</h2>
                <p>Seller: ${order.seller}</p>
                <p>Quantity: ${order.quantity} kg</p>
                <p>Total: ₹${Number(order.total).toLocaleString()}</p>
                <p>Order ID: FS-${order.id}</p>
            </div>

            <div class="order-status">
                <label for="status-${order.id}">
                    Order status
                </label>

                <select id="status-${order.id}">
                    <option
                        value="Pending"
                        ${order.status === "Pending" ? "selected" : ""}
                    >
                        Pending
                    </option>

                    <option
                        value="Confirmed"
                        ${order.status === "Confirmed" ? "selected" : ""}
                    >
                        Confirmed
                    </option>

                    <option
                        value="Shipped"
                        ${order.status === "Shipped" ? "selected" : ""}
                    >
                        Shipped
                    </option>

                    <option
                        value="Delivered"
                        ${order.status === "Delivered" ? "selected" : ""}
                    >
                        Delivered
                    </option>
                </select>
            </div>
        `;

        card
            .querySelector("select")
            .addEventListener("change", function (event) {
                const currentOrders = getOrders();

                const selectedOrder = currentOrders.find(
                    (currentOrder) =>
                        currentOrder.id === order.id
                );

                if (selectedOrder) {
                    selectedOrder.status = event.target.value;
                    saveOrders(currentOrders);
                    renderOrders();
                }
            });

        ordersList.appendChild(card);
    });
}

renderOrders();