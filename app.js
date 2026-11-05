const STORAGE_KEYS = {
    customers: "aquaflow_customers",
    deliveries: "aquaflow_deliveries",
    payments: "aquaflow_payments",
    settings: "aquaflow_settings"
};

function getStoredData(key, fallback = []) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return fallback;
    }
}

function saveStoredData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new Event("aquaflow-data-changed"));
        return true;
    } catch (error) {
        console.error(`Unable to save ${key}:`, error);
        showToast("Unable to save data.", "error");
        return false;
    }
}

function getDefaultSettings() {
    return {
        businessName: "AquaFlow",
        phone: "",
        address: "",
        currency: "INR",
        currencySymbol: "₹",
        defaultBottleRate: 80,
        bottleDeposit: 200
    };
}

function getSettings() {
    return {
        ...getDefaultSettings(),
        ...getStoredData(STORAGE_KEYS.settings, {})
    };
}

function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function getTodayString() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function localDate(dateString) {
    return new Date(`${dateString}T00:00:00`);
}

function formatDate(value) {
    if (!value) return "-";

    const date = localDate(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(date);
}

function formatCurrency(value) {
    const settings = getSettings();
    const amount = Number(value) || 0;

    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: settings.currency || "INR",
            maximumFractionDigits: 0
        }).format(amount);
    } catch {
        return `${settings.currencySymbol || "₹"}${amount.toFixed(0)}`;
    }
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function statusClass(status) {
    return String(status || "")
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function getCustomerById(customerId) {
    return getStoredData(STORAGE_KEYS.customers).find(
        customer => customer.id === customerId
    );
}

function getCustomerFinancials(customerId) {
    const deliveries = getStoredData(STORAGE_KEYS.deliveries).filter(
        delivery => delivery.customerId === customerId &&
            delivery.status !== "Cancelled"
    );

    const payments = getStoredData(STORAGE_KEYS.payments).filter(
        payment => payment.customerId === customerId
    );

    const totalDeliveryValue = deliveries.reduce(
        (total, delivery) => total + Number(delivery.amount || 0),
        0
    );

    const totalPaid = payments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
    );

    const bottlesDelivered = deliveries.reduce(
        (total, delivery) =>
            total + Number(delivery.bottlesDelivered || 0),
        0
    );

    const emptiesReturned = deliveries.reduce(
        (total, delivery) =>
            total + Number(delivery.emptyBottlesCollected || 0),
        0
    );

    return {
        totalDeliveryValue,
        totalPaid,
        outstanding: Math.max(totalDeliveryValue - totalPaid, 0),
        credit: Math.max(totalPaid - totalDeliveryValue, 0),
        bottlesDelivered,
        emptiesReturned,
        bottleBalance: Math.max(bottlesDelivered - emptiesReturned, 0)
    };
}

function getBusinessTotals() {
    const customers = getStoredData(STORAGE_KEYS.customers);
    const deliveries = getStoredData(STORAGE_KEYS.deliveries);
    const payments = getStoredData(STORAGE_KEYS.payments);

    const activeDeliveries = deliveries.filter(
        delivery => delivery.status !== "Cancelled"
    );

    const deliveryValue = activeDeliveries.reduce(
        (total, delivery) => total + Number(delivery.amount || 0),
        0
    );

    const paid = payments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
    );

    const bottlesDelivered = activeDeliveries.reduce(
        (total, delivery) =>
            total + Number(delivery.bottlesDelivered || 0),
        0
    );

    const bottlesReturned = activeDeliveries.reduce(
        (total, delivery) =>
            total + Number(delivery.emptyBottlesCollected || 0),
        0
    );

    return {
        customers,
        deliveries,
        payments,
        activeDeliveries,
        deliveryValue,
        paid,
        outstanding: Math.max(deliveryValue - paid, 0),
        bottlesDelivered,
        bottlesReturned,
        bottleBalance: Math.max(bottlesDelivered - bottlesReturned, 0)
    };
}

function showToast(message, type = "success") {
    let container = document.getElementById("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        container.id = "toastContainer";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const text = document.createElement("span");
    text.textContent = message;

    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.addEventListener("click", () => toast.remove());

    toast.append(text, close);
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
}

function initializeSidebar() {
    const menu = document.getElementById("menuButton");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    if (!menu || !sidebar || !overlay) return;

    menu.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("open");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("open");
    });
}

function initializeConnection() {
    const update = () => {
        const text = document.getElementById("connectionText");
        const dot = document.querySelector(".status-dot");

        if (!text || !dot) return;

        text.textContent = navigator.onLine ? "Online" : "Offline";
        dot.classList.toggle("offline", !navigator.onLine);
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    update();
}

function initializeBusinessName() {
    const settings = getSettings();

    document.querySelectorAll("[data-business-name]").forEach(element => {
        element.textContent = settings.businessName || "AquaFlow";
    });
}

function initializeDashboard() {
    if (!document.getElementById("dashboardPage")) return;

    const totals = getBusinessTotals();
    const today = getTodayString();

    const todaysDeliveries = totals.deliveries.filter(
        delivery => delivery.date === today
    );

    const completedToday = todaysDeliveries.filter(
        delivery => delivery.status === "Completed"
    );

    const todaysPayments = totals.payments.filter(
        payment => payment.date === today
    );

    const todaysCollection = todaysPayments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
    );

    const todaySales = todaysDeliveries
        .filter(delivery => delivery.status !== "Cancelled")
        .reduce(
            (total, delivery) => total + Number(delivery.amount || 0),
            0
        );

    setText("customerCount", totals.customers.length);
    setText("todayDeliveryCount", todaysDeliveries.length);
    setText("completedDeliveryCount", completedToday.length);
    setText("outstandingAmount", formatCurrency(totals.outstanding));
    setText("todaySales", formatCurrency(todaySales));
    setText("todayCollection", formatCurrency(todaysCollection));
    setText("bottleBalance", totals.bottleBalance);

    renderRecentDashboardDeliveries(totals.deliveries, totals.customers);
    renderOutstandingCustomers(totals.customers);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function renderRecentDashboardDeliveries(deliveries, customers) {
    const body = document.getElementById("recentDeliveriesBody");
    if (!body) return;

    const rows = [...deliveries]
        .sort((a, b) => localDate(b.date) - localDate(a.date))
        .slice(0, 6);

    body.innerHTML = rows.length
        ? rows.map(delivery => {
            const customer = customers.find(
                item => item.id === delivery.customerId
            );

            return `
                <tr>
                    <td>${escapeHTML(customer?.name || "Unknown")}</td>
                    <td>${formatDate(delivery.date)}</td>
                    <td>${Number(delivery.bottlesDelivered || 0)}</td>
                    <td>${formatCurrency(delivery.amount)}</td>
                    <td>
                        <span class="badge ${statusClass(delivery.status)}">
                            ${escapeHTML(delivery.status)}
                        </span>
                    </td>
                </tr>
            `;
        }).join("")
        : `
            <tr>
                <td colspan="5" class="table-empty">
                    No delivery records yet.
                </td>
            </tr>
        `;
}

function renderOutstandingCustomers(customers) {
    const body = document.getElementById("outstandingCustomersBody");
    if (!body) return;

    const rows = customers
        .map(customer => ({
            customer,
            financials: getCustomerFinancials(customer.id)
        }))
        .filter(item => item.financials.outstanding > 0)
        .sort(
            (a, b) =>
                b.financials.outstanding - a.financials.outstanding
        )
        .slice(0, 6);

    body.innerHTML = rows.length
        ? rows.map(item => `
            <tr>
                <td>${escapeHTML(item.customer.name)}</td>
                <td>${item.financials.bottleBalance}</td>
                <td class="amount-pending">
                    ${formatCurrency(item.financials.outstanding)}
                </td>
                <td>
                    <a
                        href="./payments.html?action=new&customer=${encodeURIComponent(item.customer.id)}"
                        class="text-link"
                    >
                        Record Payment
                    </a>
                </td>
            </tr>
        `).join("")
        : `
            <tr>
                <td colspan="4" class="table-empty">
                    No outstanding customer balances.
                </td>
            </tr>
        `;
}

document.addEventListener("DOMContentLoaded", () => {
    initializeSidebar();
    initializeConnection();
    initializeBusinessName();
    initializeDashboard();

    const today = document.getElementById("todayDate");

    if (today) {
        today.textContent = new Intl.DateTimeFormat("en-CA", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date());
    }
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .catch(error => console.error(error));
    });
}