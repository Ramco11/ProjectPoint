let deliveries = [];
let deliveryCustomers = [];

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("deliveriesTableBody")) return;

    refreshDeliveryData();
    bindDeliveryEvents();
    populateDeliveryCustomers();
    renderDeliveries();

    const query = new URLSearchParams(location.search);

    if (query.get("action") === "new") {
        openDeliveryModal(query.get("customer") || "");
    }
});

function refreshDeliveryData() {
    deliveries = getStoredData(STORAGE_KEYS.deliveries);
    deliveryCustomers = getStoredData(STORAGE_KEYS.customers);
}

function bindDeliveryEvents() {
    document
        .getElementById("addDeliveryButton")
        .addEventListener("click", () => openDeliveryModal());

    document
        .getElementById("closeDeliveryModal")
        .addEventListener("click", closeDeliveryModal);

    document
        .getElementById("cancelDeliveryButton")
        .addEventListener("click", closeDeliveryModal);

    document
        .getElementById("deliveryForm")
        .addEventListener("submit", saveDelivery);

    document
        .getElementById("deliverySearch")
        .addEventListener("input", renderDeliveries);

    document
        .getElementById("deliveryStatusFilter")
        .addEventListener("change", renderDeliveries);

    document
        .getElementById("deliveryCustomer")
        .addEventListener("change", applyCustomerDeliveryRate);

    document
        .getElementById("bottlesDelivered")
        .addEventListener("input", calculateDeliveryAmount);

    document
        .getElementById("deliveryRate")
        .addEventListener("input", calculateDeliveryAmount);

    document
        .getElementById("deliveriesTableBody")
        .addEventListener("click", handleDeliveryActions);
}

function populateDeliveryCustomers() {
    const select = document.getElementById("deliveryCustomer");

    const active = deliveryCustomers.filter(
        customer => customer.status === "Active"
    );

    select.innerHTML =
        `<option value="">Select customer</option>` +
        active.map(customer => `
            <option value="${customer.id}">
                ${escapeHTML(customer.name)}
            </option>
        `).join("");
}

function renderDeliveries() {
    const search = document
        .getElementById("deliverySearch")
        .value
        .trim()
        .toLowerCase();

    const status = document.getElementById("deliveryStatusFilter").value;

    const filtered = deliveries
        .filter(delivery => {
            const customer = getCustomerById(delivery.customerId);

            const text = [
                delivery.id,
                customer?.name,
                customer?.phone
            ].join(" ").toLowerCase();

            return (
                text.includes(search) &&
                (status === "All" || delivery.status === status)
            );
        })
        .sort((a, b) => localDate(b.date) - localDate(a.date));

    const body = document.getElementById("deliveriesTableBody");

    body.innerHTML = filtered.length
        ? filtered.map(delivery => {
            const customer = getCustomerById(delivery.customerId);

            return `
                <tr>
                    <td>
                        <div class="customer-cell">
                            <strong>
                                ${escapeHTML(customer?.name || "Unknown")}
                            </strong>
                            <span>${escapeHTML(delivery.id)}</span>
                        </div>
                    </td>

                    <td>${formatDate(delivery.date)}</td>
                    <td>${Number(delivery.bottlesDelivered || 0)}</td>
                    <td>${Number(delivery.emptyBottlesCollected || 0)}</td>
                    <td>${formatCurrency(delivery.amount)}</td>

                    <td>
                        <span class="badge ${statusClass(delivery.status)}">
                            ${escapeHTML(delivery.status)}
                        </span>
                    </td>

                    <td>
                        <div class="action-group">
                            <button
                                class="icon-button edit"
                                data-action="edit"
                                data-id="${delivery.id}"
                            >
                                Edit
                            </button>

                            ${
                                delivery.status !== "Completed"
                                    ? `
                                        <button
                                            class="icon-button success-button"
                                            data-action="complete"
                                            data-id="${delivery.id}"
                                        >
                                            Complete
                                        </button>
                                    `
                                    : ""
                            }

                            <button
                                class="icon-button delete"
                                data-action="delete"
                                data-id="${delivery.id}"
                            >
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("")
        : `
            <tr>
                <td colspan="7" class="table-empty">
                    No deliveries found.
                </td>
            </tr>
        `;

    updateDeliveryStatistics();
}

function updateDeliveryStatistics() {
    const active = deliveries.filter(
        delivery => delivery.status !== "Cancelled"
    );

    setText("totalDeliveries", active.length);

    setText(
        "completedDeliveries",
        active.filter(delivery => delivery.status === "Completed").length
    );

    setText(
        "totalBottles",
        active.reduce(
            (total, delivery) =>
                total + Number(delivery.bottlesDelivered || 0),
            0
        )
    );

    setText(
        "returnedBottles",
        active.reduce(
            (total, delivery) =>
                total + Number(delivery.emptyBottlesCollected || 0),
            0
        )
    );
}

function openDeliveryModal(customerId = "", deliveryId = "") {
    const form = document.getElementById("deliveryForm");

    form.reset();

    document.getElementById("deliveryId").value = "";
    document.getElementById("deliveryDate").value = getTodayString();
    document.getElementById("deliveryStatus").value = "Scheduled";
    document.getElementById("bottlesDelivered").value = 1;
    document.getElementById("emptyBottlesCollected").value = 0;
    document.getElementById("damagedBottles").value = 0;
    document.getElementById("deliveryRate").value =
        getSettings().defaultBottleRate || 0;

    document.getElementById("deliveryModalTitle").textContent =
        "New Delivery";

    if (customerId) {
        document.getElementById("deliveryCustomer").value = customerId;
        applyCustomerDeliveryRate();
    }

    if (deliveryId) {
        const delivery = deliveries.find(item => item.id === deliveryId);

        if (!delivery) return;

        document.getElementById("deliveryModalTitle").textContent =
            "Edit Delivery";

        document.getElementById("deliveryId").value = delivery.id;
        document.getElementById("deliveryCustomer").value =
            delivery.customerId;
        document.getElementById("deliveryDate").value = delivery.date;
        document.getElementById("deliveryStatus").value = delivery.status;
        document.getElementById("bottlesDelivered").value =
            delivery.bottlesDelivered || 0;
        document.getElementById("emptyBottlesCollected").value =
            delivery.emptyBottlesCollected || 0;
        document.getElementById("damagedBottles").value =
            delivery.damagedBottles || 0;
        document.getElementById("deliveryRate").value =
            delivery.rate || 0;
        document.getElementById("deliveryNotes").value =
            delivery.notes || "";
    }

    calculateDeliveryAmount();

    document.getElementById("deliveryModal").classList.add("open");
}

function closeDeliveryModal() {
    document.getElementById("deliveryModal").classList.remove("open");
}

function applyCustomerDeliveryRate() {
    const customer = getCustomerById(
        document.getElementById("deliveryCustomer").value
    );

    if (customer) {
        document.getElementById("deliveryRate").value =
            Number(customer.bottleRate || 0);
    }

    calculateDeliveryAmount();
}

function calculateDeliveryAmount() {
    const bottles =
        Number(document.getElementById("bottlesDelivered").value) || 0;

    const rate =
        Number(document.getElementById("deliveryRate").value) || 0;

    document.getElementById("deliveryAmount").value =
        bottles * rate;
}

function saveDelivery(event) {
    event.preventDefault();

    const id = document.getElementById("deliveryId").value;

    const customerId =
        document.getElementById("deliveryCustomer").value;

    if (!customerId) {
        showToast("Select a customer.", "error");
        return;
    }

    const bottles =
        Math.max(
            Number(document.getElementById("bottlesDelivered").value) || 0,
            0
        );

    const returned =
        Math.max(
            Number(
                document.getElementById("emptyBottlesCollected").value
            ) || 0,
            0
        );

    const damaged =
        Math.max(
            Number(document.getElementById("damagedBottles").value) || 0,
            0
        );

    const rate =
        Math.max(
            Number(document.getElementById("deliveryRate").value) || 0,
            0
        );

    const data = {
        customerId,
        date: document.getElementById("deliveryDate").value,
        status: document.getElementById("deliveryStatus").value,
        bottlesDelivered: bottles,
        emptyBottlesCollected: returned,
        damagedBottles: damaged,
        rate,
        amount: bottles * rate,
        notes: document.getElementById("deliveryNotes").value.trim()
    };

    if (id) {
        deliveries = deliveries.map(delivery =>
            delivery.id === id
                ? {
                    ...delivery,
                    ...data,
                    updatedAt: new Date().toISOString()
                }
                : delivery
        );

        showToast("Delivery updated.");
    } else {
        deliveries.push({
            id: createId("DEL"),
            ...data,
            createdAt: new Date().toISOString()
        });

        showToast("Delivery created.");
    }

    saveStoredData(STORAGE_KEYS.deliveries, deliveries);

    closeDeliveryModal();
    renderDeliveries();
}

function handleDeliveryActions(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        openDeliveryModal("", id);
    }

    if (button.dataset.action === "complete") {
        deliveries = deliveries.map(delivery =>
            delivery.id === id
                ? {
                    ...delivery,
                    status: "Completed",
                    updatedAt: new Date().toISOString()
                }
                : delivery
        );

        saveStoredData(STORAGE_KEYS.deliveries, deliveries);
        renderDeliveries();

        showToast("Delivery completed.");
    }

    if (button.dataset.action === "delete") {
        if (!confirm("Delete this delivery?")) return;

        deliveries = deliveries.filter(delivery => delivery.id !== id);

        saveStoredData(STORAGE_KEYS.deliveries, deliveries);
        renderDeliveries();

        showToast("Delivery deleted.");
    }
}