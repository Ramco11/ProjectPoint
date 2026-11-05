document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("customerReportBody")) return;

    setDefaultReportDates();
    renderReports();

    document
        .getElementById("applyReportButton")
        .addEventListener("click", renderReports);

    document
        .getElementById("printReportButton")
        .addEventListener("click", () => window.print());
});

function setDefaultReportDates() {
    const now = new Date();

    const firstDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    document.getElementById("reportStart").value =
        dateToInput(firstDay);

    document.getElementById("reportEnd").value =
        getTodayString();
}

function dateToInput(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function renderReports() {
    const start = document.getElementById("reportStart").value;
    const end = document.getElementById("reportEnd").value;

    const deliveries = getStoredData(STORAGE_KEYS.deliveries).filter(
        delivery =>
            delivery.date >= start &&
            delivery.date <= end &&
            delivery.status !== "Cancelled"
    );

    const payments = getStoredData(STORAGE_KEYS.payments).filter(
        payment =>
            payment.date >= start &&
            payment.date <= end
    );

    const sales = deliveries.reduce(
        (total, delivery) => total + Number(delivery.amount || 0),
        0
    );

    const collected = payments.reduce(
        (total, payment) => total + Number(payment.amount || 0),
        0
    );

    const bottles = deliveries.reduce(
        (total, delivery) =>
            total + Number(delivery.bottlesDelivered || 0),
        0
    );

    const returned = deliveries.reduce(
        (total, delivery) =>
            total + Number(delivery.emptyBottlesCollected || 0),
        0
    );

    const business = getBusinessTotals();

    setText("reportSales", formatCurrency(sales));
    setText("reportPayments", formatCurrency(collected));
    setText("reportDeliveries", deliveries.length);
    setText("reportBottles", bottles);
    setText("reportReturns", returned);
    setText("reportOutstanding", formatCurrency(business.outstanding));

    renderCustomerBalanceReport();
}

function renderCustomerBalanceReport() {
    const customers = getStoredData(STORAGE_KEYS.customers);
    const body = document.getElementById("customerReportBody");

    const rows = customers.map(customer => ({
        customer,
        finance: getCustomerFinancials(customer.id)
    }));

    body.innerHTML = rows.length
        ? rows
            .sort(
                (a, b) =>
                    b.finance.outstanding -
                    a.finance.outstanding
            )
            .map(item => `
                <tr>
                    <td>${escapeHTML(item.customer.name)}</td>
                    <td>
                        ${formatCurrency(item.finance.totalDeliveryValue)}
                    </td>
                    <td>
                        ${formatCurrency(item.finance.totalPaid)}
                    </td>
                    <td class="${
                        item.finance.outstanding > 0
                            ? "amount-pending"
                            : "amount-positive"
                    }">
                        ${formatCurrency(item.finance.outstanding)}
                    </td>
                    <td>${item.finance.bottleBalance}</td>
                </tr>
            `)
            .join("")
        : `
            <tr>
                <td colspan="5" class="table-empty">
                    No customers available.
                </td>
            </tr>
        `;
}