"use strict";

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "projectpoint-complete-v1";

const STATUSES = [
  "Draft",
  "Open",
  "Submitted",
  "Under Review",
  "Pending",
  "Ready to Issue",
  "Answered",
  "Responded",
  "Closed",
  "Void",
  "Cancelled"
];

let state = loadState();
let session = null;
let activeProjectId = state.projects[0].id;
let pendingComments = [];
let selectedAttachmentNames = [];
let toastTimer;

/* =========================================================
   BASIC HELPERS
========================================================= */

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function timestamp() {
  return new Date().toISOString();
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

function normalizeHeading(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeRfiNumber(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

function showToast(message, isError = false) {
  clearTimeout(toastTimer);

  $("toast").textContent = message;
  $("toast").className = isError ? "toast show error" : "toast show";

  toastTimer = setTimeout(() => {
    $("toast").className = "toast";
  }, 3200);
}

function openModal(id) {
  $(id).classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal(id) {
  $(id).classList.add("hidden");

  if (!document.querySelector(".modal:not(.hidden)")) {
    document.body.classList.remove("modal-open");
  }
}

function currentProject() {
  return state.projects.find((project) => project.id === activeProjectId);
}

function projectRfis() {
  return state.rfis.filter((rfi) => rfi.projectId === activeProjectId);
}

function projectDailyReports() {
  return state.dailyReports.filter(
    (report) => report.projectId === activeProjectId
  );
}

function projectSubmittals() {
  return state.submittals.filter(
    (submittal) => submittal.projectId === activeProjectId
  );
}

function statusClass(status) {
  const value = String(status ?? "").toLowerCase();

  if (value.includes("closed")) return "closed";
  if (value.includes("responded")) return "responded";
  if (value.includes("answered")) return "answered";
  if (value.includes("approved")) return "approved";
  if (value.includes("urgent")) return "urgent";
  if (value.includes("cancel")) return "cancelled";
  if (value.includes("void")) return "void";
  if (value.includes("pending")) return "pending";
  if (value.includes("review")) return "review";
  if (value.includes("ready")) return "ready";

  return "";
}

function statusPill(status) {
  return `
    <span class="status-pill ${statusClass(status)}">
      ${escapeHtml(status || "Draft")}
    </span>
  `;
}

function emptyRow(message, colspan) {
  return `
    <tr>
      <td class="empty-row" colspan="${colspan}">
        ${escapeHtml(message)}
      </td>
    </tr>
  `;
}

/* =========================================================
   DATABASE
========================================================= */

function defaultState() {
  const projectId = createId();

  return {
    version: 1,

    projects: [
      {
        id: projectId,
        name: "My First Project",
        number: "PP-001",
        client: "",
        createdAt: timestamp()
      }
    ],

    rfis: [],
    dailyReports: [],
    submittals: []
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

    if (
      saved &&
      Array.isArray(saved.projects) &&
      saved.projects.length &&
      Array.isArray(saved.rfis) &&
      Array.isArray(saved.dailyReports) &&
      Array.isArray(saved.submittals)
    ) {
      return saved;
    }
  } catch (error) {
    console.error("ProjectPoint storage could not be read.", error);
  }

  return defaultState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error(error);
    showToast("Save failed. Browser storage may be unavailable.", true);
    return false;
  }
}

/* =========================================================
   LOGIN
========================================================= */

$("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;
  const role =
    document.querySelector('input[name="loginRole"]:checked')?.value ||
    "Consultant";

  if (!email || !password) {
    showToast("Enter an email address and password.", true);
    return;
  }

  if (password !== "Project123") {
    showToast("For this demo, use password Project123.", true);
    return;
  }

  session = {
    email,
    role
  };

  $("loginScreen").classList.add("hidden");
  $("appShell").classList.remove("hidden");

  $("userEmail").textContent = email;
  $("userRole").textContent = role;
  $("userInitials").textContent = email
    .split("@")[0]
    .split(/[._-]/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PP";

  initializeWorkspace();
  showToast(`Signed in as ${role}.`);
});

$("logoutButton").addEventListener("click", () => {
  session = null;

  $("appShell").classList.add("hidden");
  $("loginScreen").classList.remove("hidden");

  showPage("dashboard");
});

/* =========================================================
   NAVIGATION
========================================================= */

function showPage(pageName) {
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active-page");
  });

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });

  const pageMap = {
    dashboard: "dashboardPage",
    rfi: "rfiPage",
    daily: "dailyPage",
    submittals: "submittalsPage"
  };

  $(pageMap[pageName] || "dashboardPage").classList.add("active-page");

  renderAll();
}

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal.id);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal:not(.hidden)").forEach((modal) => {
      closeModal(modal.id);
    });
  }
});

/* =========================================================
   PROJECTS
========================================================= */

function initializeWorkspace() {
  if (!state.projects.some((project) => project.id === activeProjectId)) {
    activeProjectId = state.projects[0].id;
  }

  renderProjectSelector();
  newDailyReport();
  renderAll();
}

function renderProjectSelector() {
  $("projectSelector").innerHTML = state.projects
    .map(
      (project) => `
        <option value="${escapeHtml(project.id)}">
          ${escapeHtml(project.name)}
        </option>
      `
    )
    .join("");

  $("projectSelector").value = activeProjectId;
}

$("projectSelector").addEventListener("change", (event) => {
  activeProjectId = event.target.value;
  newDailyReport();
  renderAll();
});

$("addProjectButton").addEventListener("click", () => {
  $("projectForm").reset();
  openModal("projectModal");
  setTimeout(() => $("projectName").focus(), 50);
});

$("projectForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("projectName").value.trim();

  if (!name) {
    showToast("Enter a project name.", true);
    return;
  }

  const project = {
    id: createId(),
    name,
    number: $("projectNumber").value.trim(),
    client: $("projectClient").value.trim(),
    createdAt: timestamp()
  };

  state.projects.push(project);
  activeProjectId = project.id;

  if (!saveState()) return;

  renderProjectSelector();
  newDailyReport();
  renderAll();
  closeModal("projectModal");

  showToast("Project added.");
});

/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {
  const project = currentProject();
  const rfis = projectRfis();
  const reports = projectDailyReports();
  const submittals = projectSubmittals();

  const openRfis = rfis.filter(
    (rfi) => !["closed", "void", "cancelled"].includes(
      String(rfi.status).toLowerCase()
    )
  );

  const respondedRfis = rfis.filter((rfi) =>
    ["answered", "responded", "closed"].includes(
      String(rfi.status).toLowerCase()
    )
  );

  $("dashboardProjectName").textContent = project
    ? `${project.name}${project.number ? ` · ${project.number}` : ""}`
    : "";

  $("totalRfis").textContent = rfis.length;
  $("openRfis").textContent = openRfis.length;
  $("respondedRfis").textContent = respondedRfis.length;
  $("dailyReportCount").textContent = reports.length;
  $("submittalCount").textContent = submittals.length;
  $("navRfiCount").textContent = openRfis.length;

  const recent = [...rfis]
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, 8);

  $("recentRfiBody").innerHTML = recent.length
    ? recent
        .map(
          (rfi) => `
            <tr>
              <td><strong>${escapeHtml(rfi.number)}</strong></td>
              <td>${escapeHtml(rfi.subject)}</td>
              <td>${escapeHtml(rfi.discipline || "-")}</td>
              <td>${statusPill(rfi.status)}</td>
              <td>${escapeHtml(formatDate(rfi.dueDate))}</td>
              <td>${escapeHtml(formatDateTime(rfi.updatedAt))}</td>
            </tr>
          `
        )
        .join("")
    : emptyRow("No RFIs have been created for this project.", 6);
}

$("dashboardNewRfi").addEventListener("click", () => {
  showPage("rfi");
  openRfi();
});

/* =========================================================
   RFI REGISTER
========================================================= */

function visibleComments(rfi) {
  if (!session) return [];

  return (rfi.comments || []).filter(
    (comment) => comment.role === session.role
  );
}

function renderRfis() {
  const query = $("rfiSearch").value.trim().toLowerCase();
  const statusFilter = $("rfiStatusFilter").value;

  const records = projectRfis()
    .filter((rfi) => {
      const searchable = [
        rfi.number,
        rfi.subject,
        rfi.raisedBy,
        rfi.discipline,
        rfi.contractor,
        rfi.consultant,
        rfi.responsible
      ]
        .join(" ")
        .toLowerCase();

      return !query || searchable.includes(query);
    })
    .filter((rfi) => !statusFilter || rfi.status === statusFilter)
    .sort((a, b) =>
      String(a.number).localeCompare(String(b.number), undefined, {
        numeric: true
      })
    );

  $("rfiTableBody").innerHTML = records.length
    ? records
        .map(
          (rfi) => `
            <tr>
              <td><strong>${escapeHtml(rfi.number)}</strong></td>
              <td>${escapeHtml(rfi.subject)}</td>
              <td>${escapeHtml(rfi.raisedBy || "-")}</td>
              <td>${escapeHtml(rfi.discipline || "-")}</td>
              <td>${escapeHtml(formatDate(rfi.submittedDate))}</td>
              <td>${escapeHtml(formatDate(rfi.dueDate))}</td>
              <td>${escapeHtml(formatDate(rfi.responseDate))}</td>
              <td>${escapeHtml(formatDate(rfi.closingDate))}</td>
              <td>${statusPill(rfi.status)}</td>
              <td>${escapeHtml(rfi.priority || "Normal")}</td>
              <td>${escapeHtml(rfi.responsible || "-")}</td>
              <td>${escapeHtml(formatDateTime(rfi.updatedAt))}</td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    data-rfi-edit="${escapeHtml(rfi.id)}"
                  >
                    Open
                  </button>
                </div>
              </td>
            </tr>
          `
        )
        .join("")
    : emptyRow("No matching RFIs were found.", 13);

  document.querySelectorAll("[data-rfi-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      openRfi(button.dataset.rfiEdit);
    });
  });
}

$("rfiSearch").addEventListener("input", renderRfis);
$("rfiStatusFilter").addEventListener("change", renderRfis);
$("newRfiButton").addEventListener("click", () => openRfi());

function resetRfiForm() {
  $("rfiForm").reset();
  $("rfiId").value = "";
  $("rfiStatus").value = "Draft";
  $("rfiPriority").value = "Normal";
  $("rfiDiscipline").value = "Civil";
  $("rfiSubmittedDate").value = localDate();
  $("rfiModalTitle").textContent = "Create RFI";
  $("deleteRfiButton").classList.add("hidden");

  pendingComments = [];
  selectedAttachmentNames = [];

  $("attachmentList").textContent = "No attachments selected.";
  $("rfiIssuedResponse").readOnly = true;
  $("newRfiComment").value = "";

  configureRfiRoleControls();
  renderCommentList();
}

function configureRfiRoleControls() {
  const consultant = session?.role === "Consultant";

  $("commentPrivacyMessage").textContent = session
    ? `Visible only to ${session.role} users`
    : "";

  $("rfiDraftResponse").readOnly = !consultant;
  $("rfiIssuedResponse").readOnly = true;
  $("issueResponseButton").classList.toggle("hidden", !consultant);
}

function openRfi(id = null) {
  resetRfiForm();

  if (id) {
    const rfi = state.rfis.find((item) => item.id === id);

    if (!rfi) {
      showToast("RFI could not be found.", true);
      return;
    }

    $("rfiId").value = rfi.id;
    $("rfiNumber").value = rfi.number || "";
    $("rfiStatus").value = STATUSES.includes(rfi.status)
      ? rfi.status
      : "Open";
    $("rfiPriority").value = rfi.priority || "Normal";
    $("rfiSubject").value = rfi.subject || "";
    $("rfiRaisedBy").value = rfi.raisedBy || "";
    $("rfiDiscipline").value = rfi.discipline || "Civil";
    $("rfiResponsible").value = rfi.responsible || "";
    $("rfiContractor").value = rfi.contractor || "";
    $("rfiConsultant").value = rfi.consultant || "";
    $("rfiLocation").value = rfi.location || "";
    $("rfiReference").value = rfi.reference || "";
    $("rfiSubmittedDate").value = rfi.submittedDate || "";
    $("rfiDueDate").value = rfi.dueDate || "";
    $("rfiResponseDate").value = rfi.responseDate || "";
    $("rfiClosingDate").value = rfi.closingDate || "";
    $("rfiQuestion").value = rfi.question || "";
    $("rfiDraftResponse").value = rfi.draftResponse || "";
    $("rfiIssuedResponse").value = rfi.issuedResponse || "";

    selectedAttachmentNames = [...(rfi.attachments || [])];
    pendingComments = [...(rfi.comments || [])];

    $("attachmentList").textContent = selectedAttachmentNames.length
      ? selectedAttachmentNames.join(", ")
      : "No attachments selected.";

    $("rfiModalTitle").textContent = `${rfi.number} · ${rfi.subject}`;
    $("deleteRfiButton").classList.remove("hidden");

    renderCommentList();
  }

  openModal("rfiModal");
  setTimeout(() => $("rfiNumber").focus(), 50);
}

$("rfiAttachments").addEventListener("change", (event) => {
  const newNames = Array.from(event.target.files).map((file) => file.name);

  selectedAttachmentNames = [
    ...new Set([...selectedAttachmentNames, ...newNames])
  ];

  $("attachmentList").textContent = selectedAttachmentNames.length
    ? selectedAttachmentNames.join(", ")
    : "No attachments selected.";
});

function renderCommentList() {
  const availableComments = pendingComments.filter(
    (comment) => comment.role === session?.role
  );

  $("rfiCommentList").innerHTML = availableComments.length
    ? availableComments
        .map(
          (comment) => `
            <article class="comment">
              <div class="comment-meta">
                <strong>${escapeHtml(comment.author)}</strong>
                <span>${escapeHtml(formatDateTime(comment.createdAt))}</span>
              </div>

              <p>${escapeHtml(comment.text)}</p>
            </article>
          `
        )
        .join("")
    : `
      <p class="muted">
        No ${escapeHtml(session?.role || "")} internal comments.
      </p>
    `;
}

$("addRfiComment").addEventListener("click", () => {
  const text = $("newRfiComment").value.trim();

  if (!text) {
    showToast("Enter a comment first.", true);
    return;
  }

  pendingComments.push({
    id: createId(),
    role: session.role,
    author: session.email,
    text,
    createdAt: timestamp()
  });

  $("newRfiComment").value = "";
  renderCommentList();

  showToast(`${session.role} private comment added.`);
});

function buildRfiFromForm(existing = {}) {
  return {
    ...existing,
    id: existing.id || createId(),
    projectId: activeProjectId,

    number: $("rfiNumber").value.trim(),
    subject: $("rfiSubject").value.trim(),
    status: $("rfiStatus").value,
    priority: $("rfiPriority").value,
    raisedBy: $("rfiRaisedBy").value.trim(),
    discipline: $("rfiDiscipline").value,
    responsible: $("rfiResponsible").value.trim(),
    contractor: $("rfiContractor").value.trim(),
    consultant: $("rfiConsultant").value.trim(),
    location: $("rfiLocation").value.trim(),
    reference: $("rfiReference").value.trim(),
    submittedDate: $("rfiSubmittedDate").value,
    dueDate: $("rfiDueDate").value,
    responseDate: $("rfiResponseDate").value,
    closingDate: $("rfiClosingDate").value,
    question: $("rfiQuestion").value.trim(),
    attachments: [...selectedAttachmentNames],
    comments: [...pendingComments],
    draftResponse: $("rfiDraftResponse").value.trim(),
    issuedResponse: $("rfiIssuedResponse").value.trim(),

    createdAt: existing.createdAt || timestamp(),
    updatedAt: timestamp()
  };
}

function findDuplicateRfi(number, excludeId = "") {
  const normalized = normalizeRfiNumber(number);

  return state.rfis.find(
    (rfi) =>
      rfi.projectId === activeProjectId &&
      rfi.id !== excludeId &&
      normalizeRfiNumber(rfi.number) === normalized
  );
}

$("rfiForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const id = $("rfiId").value;
  const number = $("rfiNumber").value.trim();
  const subject = $("rfiSubject").value.trim();

  if (!number || !subject) {
    showToast("RFI number and subject are required.", true);
    return;
  }

  if (findDuplicateRfi(number, id)) {
    showToast(
      `RFI ${number} already exists in the selected project.`,
      true
    );
    return;
  }

  const existing = state.rfis.find((rfi) => rfi.id === id);
  const record = buildRfiFromForm(existing || {});

  if (existing) {
    const index = state.rfis.findIndex((rfi) => rfi.id === id);
    state.rfis[index] = record;
  } else {
    state.rfis.push(record);
  }

  if (!saveState()) return;

  renderAll();
  closeModal("rfiModal");

  showToast(existing ? "RFI updated." : "RFI created.");
});

$("deleteRfiButton").addEventListener("click", () => {
  const id = $("rfiId").value;

  if (!id) return;

  const rfi = state.rfis.find((item) => item.id === id);

  if (!rfi) return;

  const confirmed = window.confirm(
    `Delete ${rfi.number}? This cannot be undone.`
  );

  if (!confirmed) return;

  state.rfis = state.rfis.filter((item) => item.id !== id);

  if (!saveState()) return;

  renderAll();
  closeModal("rfiModal");
  showToast("RFI deleted.");
});

$("issueResponseButton").addEventListener("click", () => {
  if (session?.role !== "Consultant") {
    showToast("Only the Consultant role can issue a response.", true);
    return;
  }

  const draft = $("rfiDraftResponse").value.trim();

  if (!draft) {
    showToast("Enter a draft response before issuing.", true);
    return;
  }

  const confirmed = window.confirm(
    "Issue this response officially? The status will change to Responded."
  );

  if (!confirmed) return;

  $("rfiIssuedResponse").value = draft;
  $("rfiResponseDate").value = localDate();
  $("rfiStatus").value = "Responded";

  $("rfiForm").requestSubmit();
});

/* =========================================================
   CSV IMPORT AND EXPORT
========================================================= */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  const source = String(text).replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }

      continue;
    }

    if (character === "," && !quoted) {
      row.push(value);
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") {
        index += 1;
      }

      row.push(value);

      if (row.some((cell) => String(cell).trim() !== "")) {
        rows.push(row);
      }

      row = [];
      value = "";
      continue;
    }

    value += character;
  }

  row.push(value);

  if (row.some((cell) => String(cell).trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function findColumn(headers, aliases) {
  const normalizedHeaders = headers.map(normalizeHeading);
  const normalizedAliases = aliases.map(normalizeHeading);

  return normalizedHeaders.findIndex((header) =>
    normalizedAliases.includes(header)
  );
}

function getCell(row, columnIndex) {
  return columnIndex >= 0 ? String(row[columnIndex] ?? "").trim() : "";
}

function mappedStatus(value) {
  const status = String(value ?? "").trim();

  if (!status) return "Open";

  const match = STATUSES.find(
    (item) => item.toLowerCase() === status.toLowerCase()
  );

  return match || status;
}

$("rfiCsvInput").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  event.target.value = "";

  if (!file) return;

  try {
    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length < 2) {
      throw new Error("The CSV does not contain sufficient rows.");
    }

    const headers = rows[0];

    const columns = {
      number: findColumn(headers, [
        "RFI No",
        "RFI Number",
        "RFINumber",
        "Number",
        "RFI #"
      ]),

      subject: findColumn(headers, [
        "Subject",
        "Title",
        "Description",
        "RFI Subject"
      ]),

      raisedBy: findColumn(headers, [
        "Raised By",
        "Submitted By",
        "Originator",
        "From"
      ]),

      discipline: findColumn(headers, [
        "Discipline",
        "Category",
        "Trade"
      ]),

      submittedDate: findColumn(headers, [
        "Submitted Date",
        "Date Submitted",
        "Issued Date"
      ]),

      dueDate: findColumn(headers, [
        "Due Date",
        "Required Date",
        "Response Due Date"
      ]),

      responseDate: findColumn(headers, [
        "Response Date",
        "Answered Date",
        "Date Responded"
      ]),

      closingDate: findColumn(headers, [
        "Closing Date",
        "Closed Date",
        "Date Closed"
      ]),

      status: findColumn(headers, [
        "Status",
        "RFI Status"
      ]),

      priority: findColumn(headers, [
        "Priority"
      ]),

      responsible: findColumn(headers, [
        "Responsible",
        "Assigned To",
        "Ball In Court"
      ]),

      contractor: findColumn(headers, [
        "Contractor",
        "Responsible Contractor"
      ]),

      consultant: findColumn(headers, [
        "Consultant",
        "Reviewer"
      ]),

      location: findColumn(headers, [
        "Location"
      ]),

      reference: findColumn(headers, [
        "Reference",
        "Drawing Reference",
        "Specification Reference",
        "Spec Reference"
      ]),

      question: findColumn(headers, [
        "Question",
        "Description",
        "Details",
        "Request"
      ]),

      response: findColumn(headers, [
        "Response",
        "Answer",
        "Official Response"
      ])
    };

    if (columns.number < 0) {
      throw new Error(
        "RFI number column was not found. Use a header such as RFI No or RFI Number."
      );
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    rows.slice(1).forEach((row) => {
      const number = getCell(row, columns.number);

      if (!number) {
        skipped += 1;
        return;
      }

      const existing = state.rfis.find(
        (rfi) =>
          rfi.projectId === activeProjectId &&
          normalizeRfiNumber(rfi.number) === normalizeRfiNumber(number)
      );

      const imported = {
        ...(existing || {}),
        id: existing?.id || createId(),
        projectId: activeProjectId,

        number,
        subject:
          getCell(row, columns.subject) ||
          existing?.subject ||
          "Imported RFI",

        raisedBy:
          getCell(row, columns.raisedBy) ||
          existing?.raisedBy ||
          "",

        discipline:
          getCell(row, columns.discipline) ||
          existing?.discipline ||
          "General",

        submittedDate:
          getCell(row, columns.submittedDate) ||
          existing?.submittedDate ||
          "",

        dueDate:
          getCell(row, columns.dueDate) ||
          existing?.dueDate ||
          "",

        responseDate:
          getCell(row, columns.responseDate) ||
          existing?.responseDate ||
          "",

        closingDate:
          getCell(row, columns.closingDate) ||
          existing?.closingDate ||
          "",

        status: mappedStatus(
          getCell(row, columns.status) ||
          existing?.status ||
          "Open"
        ),

        priority:
          getCell(row, columns.priority) ||
          existing?.priority ||
          "Normal",

        responsible:
          getCell(row, columns.responsible) ||
          existing?.responsible ||
          "",

        contractor:
          getCell(row, columns.contractor) ||
          existing?.contractor ||
          "",

        consultant:
          getCell(row, columns.consultant) ||
          existing?.consultant ||
          "",

        location:
          getCell(row, columns.location) ||
          existing?.location ||
          "",

        reference:
          getCell(row, columns.reference) ||
          existing?.reference ||
          "",

        question:
          getCell(row, columns.question) ||
          existing?.question ||
          "",

        issuedResponse:
          getCell(row, columns.response) ||
          existing?.issuedResponse ||
          "",

        draftResponse: existing?.draftResponse || "",
        attachments: existing?.attachments || [],
        comments: existing?.comments || [],
        createdAt: existing?.createdAt || timestamp(),
        updatedAt: timestamp()
      };

      if (existing) {
        const index = state.rfis.findIndex(
          (rfi) => rfi.id === existing.id
        );

        state.rfis[index] = imported;
        updated += 1;
      } else {
        state.rfis.push(imported);
        created += 1;
      }
    });

    if (!saveState()) return;

    renderAll();

    showToast(
      `CSV complete: ${created} created, ${updated} updated, ${skipped} skipped.`
    );
  } catch (error) {
    console.error(error);
    showToast(`CSV import failed: ${error.message}`, true);
  }
});

function csvEscape(value) {
  const text = String(value ?? "").replace(/\r?\n/g, "\n");
  return `"${text.replace(/"/g, '""')}"`;
}

$("exportRfiCsv").addEventListener("click", () => {
  const headers = [
    "RFI No",
    "Subject",
    "Raised By",
    "Discipline",
    "Submitted Date",
    "Due Date",
    "Response Date",
    "Closing Date",
    "Status",
    "Priority",
    "Responsible",
    "Contractor",
    "Consultant",
    "Location",
    "Reference",
    "Question",
    "Official Response",
    "Attachments",
    "Updated"
  ];

  const rows = projectRfis().map((rfi) => [
    rfi.number,
    rfi.subject,
    rfi.raisedBy,
    rfi.discipline,
    rfi.submittedDate,
    rfi.dueDate,
    rfi.responseDate,
    rfi.closingDate,
    rfi.status,
    rfi.priority,
    rfi.responsible,
    rfi.contractor,
    rfi.consultant,
    rfi.location,
    rfi.reference,
    rfi.question,
    rfi.issuedResponse,
    (rfi.attachments || []).join("; "),
    rfi.updatedAt
  ]);

  const csv = [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(","))
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${currentProject().name.replace(/[^a-z0-9]+/gi, "-")}-RFI-Register.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("RFI register exported.");
});

/* =========================================================
   DAILY REPORTS
========================================================= */

const dailyPreviewMap = {
  dailyDate: "previewDate",
  dailyInspector: "previewInspector",
  dailyWeather: "previewWeather",
  dailyTemperature: "previewTemperature",
  dailyContractor: "previewContractor",
  dailyWork: "previewWork",
  dailyLabour: "previewLabour",
  dailyEquipment: "previewEquipment",
  dailyMaterials: "previewMaterials",
  dailyIssues: "previewIssues",
  dailySafety: "previewSafety",
  dailyComments: "previewComments"
};

Object.entries(dailyPreviewMap).forEach(([inputId]) => {
  $(inputId).addEventListener("input", updateDailyPreview);
});

function updateDailyPreview() {
  $("previewProject").textContent = currentProject()?.name || "-";

  Object.entries(dailyPreviewMap).forEach(([inputId, previewId]) => {
    const value = $(inputId).value.trim();

    $(previewId).textContent =
      inputId === "dailyDate"
        ? formatDate(value)
        : value || "-";
  });
}

function newDailyReport() {
  $("dailyForm").reset();
  $("dailyId").value = "";
  $("dailyDate").value = localDate();
  $("dailyInspector").value = session?.email || "";
  $("dailySaveStatus").textContent = "New report";

  updateDailyPreview();
}

$("newDailyButton").addEventListener("click", () => {
  newDailyReport();
  $("dailyDate").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

$("clearDailyButton").addEventListener("click", () => {
  newDailyReport();
});

$("dailyForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const id = $("dailyId").value;
  const existing = state.dailyReports.find((report) => report.id === id);

  const report = {
    ...(existing || {}),
    id: existing?.id || createId(),
    projectId: activeProjectId,
    date: $("dailyDate").value,
    inspector: $("dailyInspector").value.trim(),
    weather: $("dailyWeather").value.trim(),
    temperature: $("dailyTemperature").value.trim(),
    contractor: $("dailyContractor").value.trim(),
    work: $("dailyWork").value.trim(),
    labour: $("dailyLabour").value.trim(),
    equipment: $("dailyEquipment").value.trim(),
    materials: $("dailyMaterials").value.trim(),
    issues: $("dailyIssues").value.trim(),
    safety: $("dailySafety").value.trim(),
    comments: $("dailyComments").value.trim(),
    createdAt: existing?.createdAt || timestamp(),
    updatedAt: timestamp()
  };

  if (!report.date) {
    showToast("Report date is required.", true);
    return;
  }

  if (existing) {
    const index = state.dailyReports.findIndex(
      (item) => item.id === existing.id
    );

    state.dailyReports[index] = report;
  } else {
    state.dailyReports.push(report);
  }

  if (!saveState()) return;

  $("dailyId").value = report.id;
  $("dailySaveStatus").textContent =
    `Saved ${formatDateTime(report.updatedAt)}`;

  renderAll();
  showToast(existing ? "Daily report updated." : "Daily report saved.");
});

function renderDailyReports() {
  const reports = projectDailyReports().sort((a, b) =>
    String(b.date).localeCompare(String(a.date))
  );

  $("dailyTableBody").innerHTML = reports.length
    ? reports
        .map(
          (report) => `
            <tr>
              <td>${escapeHtml(formatDate(report.date))}</td>
              <td>${escapeHtml(report.inspector || "-")}</td>
              <td>${escapeHtml(report.contractor || "-")}</td>
              <td>${escapeHtml(report.weather || "-")}</td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    data-daily-edit="${escapeHtml(report.id)}"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    data-daily-delete="${escapeHtml(report.id)}"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          `
        )
        .join("")
    : emptyRow("No daily reports have been saved.", 5);

  document.querySelectorAll("[data-daily-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      editDailyReport(button.dataset.dailyEdit);
    });
  });

  document.querySelectorAll("[data-daily-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteDailyReport(button.dataset.dailyDelete);
    });
  });
}

function editDailyReport(id) {
  const report = state.dailyReports.find((item) => item.id === id);

  if (!report) return;

  $("dailyId").value = report.id;
  $("dailyDate").value = report.date || "";
  $("dailyInspector").value = report.inspector || "";
  $("dailyWeather").value = report.weather || "";
  $("dailyTemperature").value = report.temperature || "";
  $("dailyContractor").value = report.contractor || "";
  $("dailyWork").value = report.work || "";
  $("dailyLabour").value = report.labour || "";
  $("dailyEquipment").value = report.equipment || "";
  $("dailyMaterials").value = report.materials || "";
  $("dailyIssues").value = report.issues || "";
  $("dailySafety").value = report.safety || "";
  $("dailyComments").value = report.comments || "";

  $("dailySaveStatus").textContent =
    `Editing report from ${formatDate(report.date)}`;

  updateDailyPreview();

  $("dailyForm").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function deleteDailyReport(id) {
  const report = state.dailyReports.find((item) => item.id === id);

  if (!report) return;

  if (!window.confirm(`Delete the report from ${formatDate(report.date)}?`)) {
    return;
  }

  state.dailyReports = state.dailyReports.filter(
    (item) => item.id !== id
  );

  if (!saveState()) return;

  if ($("dailyId").value === id) {
    newDailyReport();
  }

  renderAll();
  showToast("Daily report deleted.");
}

$("printDailyButton").addEventListener("click", () => {
  updateDailyPreview();
  window.print();
});

/* =========================================================
   SUBMITTALS
========================================================= */

function resetSubmittalForm() {
  $("submittalForm").reset();
  $("submittalId").value = "";
  $("submittalStatus").value = "Draft";
  $("submittalSubmittedDate").value = localDate();
  $("submittalModalTitle").textContent = "New Submittal";
  $("deleteSubmittalButton").classList.add("hidden");
}

$("newSubmittalButton").addEventListener("click", () => {
  resetSubmittalForm();
  openModal("submittalModal");
  setTimeout(() => $("submittalNumber").focus(), 50);
});

function openSubmittal(id) {
  const submittal = state.submittals.find((item) => item.id === id);

  if (!submittal) return;

  resetSubmittalForm();

  $("submittalId").value = submittal.id;
  $("submittalNumber").value = submittal.number || "";
  $("submittalTitle").value = submittal.title || "";
  $("submittalSpec").value = submittal.specSection || "";
  $("submittalContractor").value = submittal.contractor || "";
  $("submittalSubmittedDate").value = submittal.submittedDate || "";
  $("submittalDueDate").value = submittal.dueDate || "";
  $("submittalStatus").value = submittal.status || "Draft";
  $("submittalComments").value = submittal.comments || "";

  $("submittalModalTitle").textContent =
    `${submittal.number} · ${submittal.title}`;

  $("deleteSubmittalButton").classList.remove("hidden");

  openModal("submittalModal");
}

$("submittalForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const id = $("submittalId").value;
  const number = $("submittalNumber").value.trim();
  const title = $("submittalTitle").value.trim();

  if (!number || !title) {
    showToast("Submittal number and title are required.", true);
    return;
  }

  const duplicate = state.submittals.find(
    (item) =>
      item.projectId === activeProjectId &&
      item.id !== id &&
      normalizeRfiNumber(item.number) === normalizeRfiNumber(number)
  );

  if (duplicate) {
    showToast(
      `Submittal ${number} already exists in this project.`,
      true
    );
    return;
  }

  const existing = state.submittals.find((item) => item.id === id);

  const record = {
    ...(existing || {}),
    id: existing?.id || createId(),
    projectId: activeProjectId,
    number,
    title,
    specSection: $("submittalSpec").value.trim(),
    contractor: $("submittalContractor").value.trim(),
    submittedDate: $("submittalSubmittedDate").value,
    dueDate: $("submittalDueDate").value,
    status: $("submittalStatus").value,
    comments: $("submittalComments").value.trim(),
    createdAt: existing?.createdAt || timestamp(),
    updatedAt: timestamp()
  };

  if (existing) {
    const index = state.submittals.findIndex(
      (item) => item.id === existing.id
    );

    state.submittals[index] = record;
  } else {
    state.submittals.push(record);
  }

  if (!saveState()) return;

  renderAll();
  closeModal("submittalModal");

  showToast(existing ? "Submittal updated." : "Submittal created.");
});

function renderSubmittals() {
  const submittals = projectSubmittals().sort((a, b) =>
    String(a.number).localeCompare(String(b.number), undefined, {
      numeric: true
    })
  );

  $("submittalTableBody").innerHTML = submittals.length
    ? submittals
        .map(
          (submittal) => `
            <tr>
              <td><strong>${escapeHtml(submittal.number)}</strong></td>
              <td>${escapeHtml(submittal.title)}</td>
              <td>${escapeHtml(submittal.specSection || "-")}</td>
              <td>${escapeHtml(submittal.contractor || "-")}</td>
              <td>${escapeHtml(formatDate(submittal.submittedDate))}</td>
              <td>${escapeHtml(formatDate(submittal.dueDate))}</td>
              <td>${statusPill(submittal.status)}</td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    data-submittal-edit="${escapeHtml(submittal.id)}"
                  >
                    Open
                  </button>
                </div>
              </td>
            </tr>
          `
        )
        .join("")
    : emptyRow("No submittals have been created.", 8);

  document.querySelectorAll("[data-submittal-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      openSubmittal(button.dataset.submittalEdit);
    });
  });
}

$("deleteSubmittalButton").addEventListener("click", () => {
  const id = $("submittalId").value;

  if (!id) return;

  const record = state.submittals.find((item) => item.id === id);

  if (!record) return;

  if (!window.confirm(`Delete submittal ${record.number}?`)) {
    return;
  }

  state.submittals = state.submittals.filter(
    (item) => item.id !== id
  );

  if (!saveState()) return;

  renderAll();
  closeModal("submittalModal");

  showToast("Submittal deleted.");
});

/* =========================================================
   GLOBAL RENDER
========================================================= */

function renderAll() {
  const project = currentProject();

  if (!project) return;

  $("projectSelector").value = activeProjectId;
  $("previewProject").textContent = project.name;

  renderDashboard();
  renderRfis();
  renderDailyReports();
  renderSubmittals();
  updateDailyPreview();
}

/* =========================================================
   INITIAL SCREEN
========================================================= */

renderProjectSelector();