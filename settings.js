document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("settingsForm")) return;

    loadSettings();

    document
        .getElementById("settingsForm")
        .addEventListener("submit", saveSettings);

    document
        .getElementById("exportBackupButton")
        .addEventListener("click", exportBackup);

    document
        .getElementById("importBackupInput")
        .addEventListener("change", importBackup);

    document
        .getElementById("resetDataButton")
        .addEventListener("click", resetAllData);
});

function loadSettings() {
    const settings = getSettings();

    document.getElementById("businessName").value =
        settings.businessName || "";

    document.getElementById("businessPhone").value =
        settings.phone || "";

    document.getElementById("businessAddress").value =
        settings.address || "";

    document.getElementById("currency").value =
        settings.currency || "INR";

    document.getElementById("defaultBottleRate").value =
        settings.defaultBottleRate || 0;

    document.getElementById("bottleDeposit").value =
        settings.bottleDeposit || 0;
}

function saveSettings(event) {
    event.preventDefault();

    const currency = document.getElementById("currency").value;

    const symbols = {
        INR: "₹",
        CAD: "$",
        USD: "$"
    };

    const settings = {
        businessName:
            document.getElementById("businessName").value.trim() ||
            "AquaFlow",

        phone:
            document.getElementById("businessPhone").value.trim(),

        address:
            document.getElementById("businessAddress").value.trim(),

        currency,

        currencySymbol: symbols[currency] || "₹",

        defaultBottleRate:
            Number(
                document.getElementById("defaultBottleRate").value
            ) || 0,

        bottleDeposit:
            Number(
                document.getElementById("bottleDeposit").value
            ) || 0
    };

    saveStoredData(STORAGE_KEYS.settings, settings);

    initializeBusinessName();

    showToast("Settings saved.");
}

function exportBackup() {
    const backup = {
        app: "AquaFlow",
        version: 2,
        exportedAt: new Date().toISOString(),
        customers: getStoredData(STORAGE_KEYS.customers),
        deliveries: getStoredData(STORAGE_KEYS.deliveries),
        payments: getStoredData(STORAGE_KEYS.payments),
        settings: getSettings()
    };

    const blob = new Blob(
        [JSON.stringify(backup, null, 2)],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `aquaflow-backup-${getTodayString()}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    showToast("Backup exported.");
}

function importBackup(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const backup = JSON.parse(reader.result);

            if (
                !Array.isArray(backup.customers) ||
                !Array.isArray(backup.deliveries) ||
                !Array.isArray(backup.payments)
            ) {
                throw new Error("Invalid AquaFlow backup.");
            }

            if (
                !confirm(
                    "Importing will replace current AquaFlow data. Continue?"
                )
            ) {
                event.target.value = "";
                return;
            }

            saveStoredData(
                STORAGE_KEYS.customers,
                backup.customers
            );

            saveStoredData(
                STORAGE_KEYS.deliveries,
                backup.deliveries
            );

            saveStoredData(
                STORAGE_KEYS.payments,
                backup.payments
            );

            if (backup.settings) {
                saveStoredData(
                    STORAGE_KEYS.settings,
                    backup.settings
                );
            }

            showToast("Backup restored successfully.");

            setTimeout(() => location.reload(), 600);
        } catch (error) {
            console.error(error);
            showToast(
                "This does not appear to be a valid AquaFlow backup.",
                "error"
            );
        }

        event.target.value = "";
    };

    reader.readAsText(file);
}

function resetAllData() {
    const confirmation = confirm(
        "This will permanently delete all customers, deliveries, payments and settings from this browser. Continue?"
    );

    if (!confirmation) return;

    Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });

    showToast("All AquaFlow data was reset.");

    setTimeout(() => {
        location.href = "./index.html";
    }, 700);
}