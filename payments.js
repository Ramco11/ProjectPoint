let payments = [];
let paymentCustomers = [];

document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("paymentsTableBody")) return;

    payments = getStoredData(STORAGE_KEYS.payments);
    paymentCustomers = getStoredData(STORAGE_KEYS.customers);

    bindPaymentEvents();
    populatePaymentCustomers();
    renderPayments();

    const query = new URLSearchParams(location.search);

    if (query.get("action") === "new") {
        openPaymentModal(query.get("customer") || "");
    }
});

function bindPaymentEvents() {
    document
        .getElementById("addPaymentButton")
        .addEventListener("click", () => openPaymentModal());

    document
        .getElementById("closePaymentModal")
        .addEventListener("click", closePaymentModal);

    document
        .getElementById("cancelPaymentButton")
        .addEventListener("click", closePaymentModal);

    document
        .getElementById("paymentForm")
        .addEventListener("submit", savePayment);

    document
        .getElementById("paymentCustomer")
        .addEventListener("change", updateSelectedCustomerBalance);

    document
        .getElementById("paymentSearch")
        .addEventListener("input", renderPayments);

    document
        .getElementById("paymentMethodFilter")
        .addEventListener("change", renderPayments);

    document
        .getElementById("paymentsTableBody")
        .addEventListener("click", handlePaymentAction);
}

function populatePaymentCustomers() {
    const select = document.getElementById("paymentCustomer");

    select.innerHTML =
        `<option value="">Select customer</option>` +
        paymentCustomers.map(customer => `
            <option value="${customer.id}">
                ${escapeHTML(customer.name)}
            </option>
        `).join("");
}

function updateSelectedCustomerBalance() {
    const id = document.getElementById("paymentCustomer").value;

    const balance = id
        ? getCustomerFinancials(id).outstanding
        : 0;

    setText("selectedCustomerBalance", formatCurrency(balance));
}

function renderPayments() {
    const search = document
        .getElementById("paymentSearch")
        .value
        .trim()
        .toLowerCase();

    const method = document.getElementById("paymentMethodFilter").value;

    const filtered = payments.filter(payment => {
        const customer = getCustomerById(payment.customerId);

        const text = [
            customer?.name,
            payment.reference,
            payment.id
        ].join(" ").toLowerCase();

        return (
            text.includes(search) &&
            (method === "All" || payment.method === method)
        );
    });

    const body = document.getElementById("paymentsTableBody");

    body.innerHTML = filtered.length
        ? filtered.map(payment => {
            const customer = getCustomerById(payment.customerId);

            return `
                <tr>
                    <td>
                        <strong>
                            ${escapeHTML(customer?.name || "Unknown")}
                        </strong>
                    </td>

                    <td>${formatDate(payment.date)}</td>

                    <td class="amount-positive">
                        ${formatCurrency(payment.amount)}
                    </td>

                    <td>${escapeHTML(payment.method)}</td>

                    <td>
                        ${escapeHTML(payment.reference || "-")}
                    </td>

                    <td>
                        <button
                            class="icon-button delete"
                            data-action="delete"
                            data-id="${payment.id}"
                        >
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join("")
        : `
            <tr>
                <td colspan="6" class="table-empty">
                    No payment records.
                </td>
            </tr>
        `;

    updatePaymentStatistics();
}

function updatePaymentStatistics() {
    const totals = getBusinessTotals();

    setText("paymentsReceived", formatCurrency(totals.paid));
    setText("paymentDeliveryValue", formatCurrency(totals.deliveryValue));
    setText("paymentsOutstanding", formatCurrency(totals.outstanding));
    setText("paymentRecordCount", totals.payments.length);
}

function openPaymentModal(customerId = "") {
    document.getElementById("paymentForm").reset();
    document.getElementById("paymentId").value = "";
    document.getElementById("paymentDate").value = getTodayString();
    document.getElementById("paymentMethod").value = "Cash";

    if (customerId) {
        document.getElementById("paymentCustomer").value = customerId;
    }

    updateSelectedCustomerBalance();

    document.getElementById("paymentModal").classList.add("open");
}

function closePaymentModal() {
    document.getElementById("paymentModal").classList.remove("open");
}

function savePayment(event) {
    event.preventDefault();

    const customerId =
        document.getElementById("paymentCustomer").value;

    const amount =
        Number(document.getElementById("paymentAmount").value);

    if (!customerId || !Number.isFinite(amount) || amount <= 0) {
        showToast("Select a customer and enter a valid amount.", "error");
        return;
    }

    payments.push({
        id: createId("PAY"),
        customerId,
        date: document.getElementById("paymentDate").value,
        amount,
        method: document.getElementById("paymentMethod").value,
        reference:
            document.getElementById("paymentReference").value.trim(),
        notes:
            document.getElementById("paymentNotes").value.trim(),
        createdAt: new Date().toISOString()
    });

    saveStoredData(STORAGE_KEYS.payments, payments);

    closePaymentModal();
    renderPayments();

    showToast("Payment recorded.");
}

function handlePaymentAction(event) {
    const button = event.target.closest("button[data-action]");

    if (!button || button.dataset.action !== "delete") return;

    if (!confirm("Delete this payment record?")) return;

    payments = payments.filter(
        payment => payment.id !== button.dataset.id
    );

    saveStoredData(STORAGE_KEYS.payments, payments);
    renderPayments();

    showToast("Payment deleted.");
}