let customers = [];

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("customersTableBody")) return;

    customers = getStoredData(STORAGE_KEYS.customers);

    bindCustomerEvents();
    renderCustomers();

    const parameters = new URLSearchParams(location.search);

    if (parameters.get("action") === "new") {
        openCustomerModal();
    }
});

function bindCustomerEvents() {
    document
        .getElementById("addCustomerButton")
        .addEventListener("click", () => openCustomerModal());

    document
        .getElementById("closeCustomerModal")
        .addEventListener("click", closeCustomerModal);

    document
        .getElementById("cancelCustomerButton")
        .addEventListener("click", closeCustomerModal);

    document
        .getElementById("customerForm")
        .addEventListener("submit", saveCustomer);

    document
        .getElementById("customerSearch")
        .addEventListener("input", renderCustomers);

    document
        .getElementById("customerStatusFilter")
        .addEventListener("change", renderCustomers);

    document
        .getElementById("customersTableBody")
        .addEventListener("click", handleCustomerAction);
}

function renderCustomers() {
    const search = document
        .getElementById("customerSearch")
        .value
        .trim()
        .toLowerCase();

    const status = document.getElementById("customerStatusFilter").value;

    const rows = customers.filter(customer => {
        const searchText = [
            customer.name,
            customer.phone,
            customer.address
        ].join(" ").toLowerCase();

        return (
            searchText.includes(search) &&
            (status === "All" || customer.status === status)
        );
    });

    const body = document.getElementById("customersTableBody");
    const empty = document.getElementById("customerEmptyState");

    empty.hidden = rows.length > 0;

    body.innerHTML = rows.map(customer => {
        const finance = getCustomerFinancials(customer.id);

        return `
            <tr>
                <td>
                    <div class="customer-cell">
                        <strong>${escapeHTML(customer.name)}</strong>
                        <span>${escapeHTML(customer.phone)}</span>
                        <span>${escapeHTML(customer.address)}</span>
                    </div>
                </td>

                <td>
                    ${escapeHTML(customer.deliveryFrequency || "On Demand")}
                    <br>
                    <small>
                        ${escapeHTML(customer.deliveryDay || "")}
                    </small>
                </td>

                <td>${formatCurrency(customer.bottleRate)}</td>

                <td>
                    <strong>${finance.bottleBalance}</strong>
                </td>

                <td class="${finance.outstanding > 0 ? "amount-pending" : "amount-positive"}">
                    ${formatCurrency(finance.outstanding)}
                </td>

                <td>
                    <span class="badge ${statusClass(customer.status)}">
                        ${escapeHTML(customer.status)}
                    </span>
                </td>

                <td>
                    <div class="action-group">
                        <button
                            class="icon-button edit"
                            data-action="edit"
                            data-id="${customer.id}"
                        >
                            Edit
                        </button>

                        <a
                            class="icon-button"
                            href="./payments.html?action=new&customer=${encodeURIComponent(customer.id)}"
                        >
                            Pay
                        </a>

                        <button
                            class="icon-button delete"
                            data-action="delete"
                            data-id="${customer.id}"
                        >
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function handleCustomerAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    if (button.dataset.action === "edit") {
        openCustomerModal(button.dataset.id);
    }

    if (button.dataset.action === "delete") {
        deleteCustomer(button.dataset.id);
    }
}

function openCustomerModal(id = "") {
    const form = document.getElementById("customerForm");
    const modal = document.getElementById("customerModal");
    const settings = getSettings();

    form.reset();

    document.getElementById("customerId").value = "";
    document.getElementById("customerStatus").value = "Active";
    document.getElementById("deliveryFrequency").value = "Weekly";
    document.getElementById("bottleRate").value =
        settings.defaultBottleRate || 80;
    document.getElementById("customerDeposit").value =
        settings.bottleDeposit || 0;
    document.getElementById("nextDeliveryDate").value =
        getTodayString();

    document.getElementById("customerModalTitle").textContent =
        "Add Customer";

    if (id) {
        const customer = customers.find(item => item.id === id);
        if (!customer) return;

        document.getElementById("customerModalTitle").textContent =
            "Edit Customer";

        document.getElementById("customerId").value = customer.id;
        document.getElementById("customerName").value = customer.name;
        document.getElementById("customerPhone").value = customer.phone;
        document.getElementById("customerEmail").value =
            customer.email || "";
        document.getElementById("customerStatus").value =
            customer.status || "Active";
        document.getElementById("deliveryFrequency").value =
            customer.deliveryFrequency || "Weekly";
        document.getElementById("deliveryDay").value =
            customer.deliveryDay || "";
        document.getElementById("nextDeliveryDate").value =
            customer.nextDeliveryDate || "";
        document.getElementById("bottleRate").value =
            Number(customer.bottleRate || 0);
        document.getElementById("customerDeposit").value =
            Number(customer.customerDeposit || 0);
        document.getElementById("customerAddress").value =
            customer.address || "";
        document.getElementById("customerNotes").value =
            customer.notes || "";
    }

    modal.classList.add("open");
}

function closeCustomerModal() {
    document.getElementById("customerModal").classList.remove("open");
}

function saveCustomer(event) {
    event.preventDefault();

    const id = document.getElementById("customerId").value;

    const data = {
        name: document.getElementById("customerName").value.trim(),
        phone: document.getElementById("customerPhone").value.trim(),
        email: document.getElementById("customerEmail").value.trim(),
        status: document.getElementById("customerStatus").value,
        deliveryFrequency:
            document.getElementById("deliveryFrequency").value,
        deliveryDay: document.getElementById("deliveryDay").value,
        nextDeliveryDate:
            document.getElementById("nextDeliveryDate").value,
        bottleRate:
            Number(document.getElementById("bottleRate").value) || 0,
        customerDeposit:
            Number(document.getElementById("customerDeposit").value) || 0,
        address:
            document.getElementById("customerAddress").value.trim(),
        notes: document.getElementById("customerNotes").value.trim()
    };

    if (!data.name || !data.phone || !data.address) {
        showToast("Complete all required fields.", "error");
        return;
    }

    if (id) {
        customers = customers.map(customer =>
            customer.id === id
                ? {
                    ...customer,
                    ...data,
                    updatedAt: new Date().toISOString()
                }
                : customer
        );

        showToast("Customer updated.");
    } else {
        customers.push({
            id: createId("CUS"),
            ...data,
            createdAt: new Date().toISOString()
        });

        showToast("Customer added.");
    }

    saveStoredData(STORAGE_KEYS.customers, customers);

    closeCustomerModal();
    renderCustomers();
}

function deleteCustomer(id) {
    const hasDelivery = getStoredData(STORAGE_KEYS.deliveries).some(
        delivery => delivery.customerId === id
    );

    const hasPayment = getStoredData(STORAGE_KEYS.payments).some(
        payment => payment.customerId === id
    );

    if (hasDelivery || hasPayment) {
        showToast(
            "Customer has transactions. Set the customer to Inactive instead.",
            "error"
        );
        return;
    }

    if (!confirm("Delete this customer?")) return;

    customers = customers.filter(customer => customer.id !== id);

    saveStoredData(STORAGE_KEYS.customers, customers);
    renderCustomers();

    showToast("Customer deleted.");
}