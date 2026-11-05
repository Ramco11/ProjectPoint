document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("routeCards")) return;

    renderTodayRoute();

    document
        .getElementById("routeCards")
        .addEventListener("click", handleRouteAction);
});

function renderTodayRoute() {
    const customers = getStoredData(STORAGE_KEYS.customers);
    const deliveries = getStoredData(STORAGE_KEYS.deliveries);

    const today = getTodayString();

    const weekday = new Intl.DateTimeFormat(
        "en-US",
        { weekday: "long" }
    ).format(new Date());

    const scheduledCustomers = customers.filter(customer => {
        if (customer.status !== "Active") return false;

        if (customer.nextDeliveryDate === today) return true;

        if (customer.deliveryFrequency === "Daily") return true;

        if (
            customer.deliveryFrequency === "Weekly" &&
            customer.deliveryDay === weekday
        ) {
            return true;
        }

        return false;
    });

    const todaysExisting = deliveries.filter(
        delivery => delivery.date === today
    );

    const allCustomerIds = new Set([
        ...scheduledCustomers.map(customer => customer.id),
        ...todaysExisting.map(delivery => delivery.customerId)
    ]);

    const cards = [...allCustomerIds]
        .map(customerId => {
            const customer = customers.find(
                item => item.id === customerId
            );

            if (!customer) return null;

            const delivery = todaysExisting.find(
                item => item.customerId === customerId
            );

            return {
                customer,
                delivery
            };
        })
        .filter(Boolean);

    const completed = cards.filter(
        item => item.delivery?.status === "Completed"
    );

    const bottles = cards.reduce(
        (total, item) =>
            total + Number(item.delivery?.bottlesDelivered || 0),
        0
    );

    setText("routeStops", cards.length);
    setText("routeCompleted", completed.length);
    setText("routePending", cards.length - completed.length);
    setText("routeBottles", bottles);

    const container = document.getElementById("routeCards");

    container.innerHTML = cards.length
        ? cards.map(item => {
            const finance = getCustomerFinancials(item.customer.id);

            const status = item.delivery?.status || "Pending";

            return `
                <article class="route-card">
                    <div class="route-card-header">
                        <div>
                            <h3>${escapeHTML(item.customer.name)}</h3>
                            <p>${escapeHTML(item.customer.phone)}</p>
                        </div>

                        <span class="badge ${statusClass(status)}">
                            ${escapeHTML(status)}
                        </span>
                    </div>

                    <div class="route-address">
                        📍 ${escapeHTML(item.customer.address)}
                    </div>

                    <div class="route-details">
                        <div>
                            <span>Frequency</span>
                            <strong>
                                ${escapeHTML(
                                    item.customer.deliveryFrequency ||
                                    "On Demand"
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Bottles Out</span>
                            <strong>${finance.bottleBalance}</strong>
                        </div>

                        <div>
                            <span>Outstanding</span>
                            <strong>
                                ${formatCurrency(finance.outstanding)}
                            </strong>
                        </div>
                    </div>

                    <div class="route-actions">
                        ${
                            item.delivery
                                ? `
                                    ${
                                        item.delivery.status !== "Completed"
                                            ? `
                                                <button
                                                    class="primary-button"
                                                    data-action="complete"
                                                    data-delivery="${item.delivery.id}"
                                                >
                                                    Complete
                                                </button>
                                            `
                                            : ""
                                    }

                                    ${
                                        item.delivery.status !== "Completed"
                                            ? `
                                                <button
                                                    class="secondary-button"
                                                    data-action="skip"
                                                    data-delivery="${item.delivery.id}"
                                                >
                                                    Skip
                                                </button>
                                            `
                                            : ""
                                    }
                                `
                                : `
                                    <a
                                        href="./delivery.html?action=new&customer=${encodeURIComponent(item.customer.id)}"
                                        class="primary-button"
                                    >
                                        Create Delivery
                                    </a>
                                `
                        }

                        <a
                            href="./payments.html?action=new&customer=${encodeURIComponent(item.customer.id)}"
                            class="secondary-button"
                        >
                            Payment
                        </a>
                    </div>
                </article>
            `;
        }).join("")
        : `
            <div class="content-card empty-state">
                <div class="empty-icon">🚚</div>
                <h3>No scheduled deliveries today</h3>
                <p>
                    Add a customer's next delivery date or create a
                    delivery manually.
                </p>
            </div>
        `;
}

function handleRouteAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    let deliveries = getStoredData(STORAGE_KEYS.deliveries);

    if (button.dataset.action === "complete") {
        deliveries = deliveries.map(delivery =>
            delivery.id === button.dataset.delivery
                ? {
                    ...delivery,
                    status: "Completed",
                    updatedAt: new Date().toISOString()
                }
                : delivery
        );

        showToast("Delivery completed.");
    }

    if (button.dataset.action === "skip") {
        deliveries = deliveries.map(delivery =>
            delivery.id === button.dataset.delivery
                ? {
                    ...delivery,
                    status: "Skipped",
                    updatedAt: new Date().toISOString()
                }
                : delivery
        );

        showToast("Delivery marked as skipped.");
    }

    saveStoredData(STORAGE_KEYS.deliveries, deliveries);

    renderTodayRoute();
}