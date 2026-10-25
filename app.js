"use strict";

const config = window.APP_CONFIG;

if (
  !config ||
  !config.SUPABASE_URL ||
  !config.SUPABASE_ANON_KEY ||
  config.SUPABASE_URL.startsWith("PASTE_") ||
  config.SUPABASE_ANON_KEY.startsWith("PASTE_")
) {
  document.body.innerHTML = `
    <main style="padding:30px;font-family:system-ui">
      <h1>Configuration required</h1>
      <p>
        Open config.js and add your Supabase project URL
        and publishable key.
      </p>
    </main>
  `;

  throw new Error("Missing Supabase configuration");
}

if (typeof supabase === "undefined") {
  document.body.innerHTML = `
    <main style="padding:30px;font-family:system-ui">
      <h1>Supabase library not loaded</h1>
      <p>
        Check the Supabase script tag in index.html.
      </p>
    </main>
  `;

  throw new Error("Supabase library not loaded");
}

const database = supabase.createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY
);

const navigationPages = [
  "Dashboard",
  "Change Orders",
  "Payment Applications",
  "RFIs",
  "Site Instructions",
  "Submittals",
  "Contract Documents",
  "Claims & Notices",
  "Closeout",
  "Team"
];

const recordPrefixes = {
  "Change Orders": "CO",
  "Payment Applications": "PA",
  "RFIs": "RFI",
  "Site Instructions": "SI",
  "Submittals": "SUB",
  "Contract Documents": "DOC",
  "Claims & Notices": "CLM",
  "Closeout": "CLS"
};

const recordStatuses = [
  "Pending",
  "Open",
  "Under review",
  "Approved",
  "Paid",
  "Issued",
  "Answered",
  "Received",
  "Resolved",
  "Rejected",
  "Revise & resubmit",
  "Superseded",
  "Closed"
];

let currentUser = null;
let projects = [];
let currentProject = null;
let currentRole = "viewer";
let activePage = "Dashboard";
let editingRecord = null;
let modalMode = null;

const select = function (selector) {
  return document.querySelector(selector);
};

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    function (character) {
      const characters = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      };

      return characters[character];
    }
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  }).format(date);
}

function generateUuid() {
  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/[xy]/g, function (character) {
      const random = Math.random() * 16 | 0;

      const value =
        character === "x"
          ? random
          : random & 0x3 | 0x8;

      return value.toString(16);
    });
}

function showToast(message) {
  const toast = select("#toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);
}

function setAuthMessage(message, isError = false) {
  const messageElement = select("#authMessage");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;

  messageElement.style.color =
    isError
      ? "#be123c"
      : "#047857";
}

function hasPermission(action) {
  if (
    currentRole === "owner" ||
    currentRole === "admin"
  ) {
    return true;
  }

  if (currentRole === "manager") {
    return action !== "delete";
  }

  if (currentRole === "reviewer") {
    return [
      "read",
      "update",
      "export"
    ].includes(action);
  }

  return action === "read";
}

function getStatusClass(status) {
  if (
    [
      "Approved",
      "Paid",
      "Answered",
      "Received",
      "Resolved",
      "Closed"
    ].includes(status)
  ) {
    return "green";
  }

  if (
    [
      "Pending",
      "Under review",
      "Revise & resubmit"
    ].includes(status)
  ) {
    return "amber";
  }

  if (status === "Rejected") {
    return "red";
  }

  if (status === "Superseded") {
    return "gray";
  }

  return "blue";
}

function statusBadge(status) {
  const safeStatus = status || "Pending";
  const colourClass = getStatusClass(safeStatus);

  return `
    <span class="badge ${colourClass}">
      ${escapeHtml(safeStatus)}
    </span>
  `;
}

function pageHeader(title, subtitle, actions = "") {
  return `
    <div class="page-head">
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
      </div>

      <div class="page-actions">
        ${actions}
      </div>
    </div>
  `;
}

function metric(label, value, note) {
  return `
    <div class="metric">
      <small>${escapeHtml(label)}</small>
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(note)}</span>
    </div>
  `;
}

function openModal() {
  const modal = select("#modal");

  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeModal() {
  const modal = select("#modal");
  const form = select("#modalForm");
  const fields = select("#modalFields");

  if (modal) {
    modal.classList.add("hidden");
  }

  if (form) {
    form.reset();
  }

  if (fields) {
    fields.innerHTML = "";
  }

  editingRecord = null;
  modalMode = null;
}

async function bootApplication() {
  try {
    const {
      data: {
        session
      },
      error
    } = await database.auth.getSession();

    if (error) {
      setAuthMessage(error.message, true);
    }

    if (session && session.user) {
      await enterApplication(session.user);
    }

    database.auth.onAuthStateChange(
      async function (event, session) {
        if (session && session.user) {
          if (
            !currentUser ||
            currentUser.id !== session.user.id
          ) {
            await enterApplication(session.user);
          }
        } else {
          leaveApplication();
        }
      }
    );
  } catch (error) {
    console.error(error);

    setAuthMessage(
      "Unable to connect to Supabase.",
      true
    );
  }
}

async function enterApplication(user) {
  currentUser = user;

  select("#authView").classList.add("hidden");
  select("#appView").classList.remove("hidden");

  select("#userEmail").textContent =
    user.email || "Signed-in user";

  await loadProjects();

  renderNavigation();

  await renderPage();
}

function leaveApplication() {
  currentUser = null;
  projects = [];
  currentProject = null;
  currentRole = "viewer";
  activePage = "Dashboard";

  select("#appView").classList.add("hidden");
  select("#authView").classList.remove("hidden");

  select("#projectSelect").innerHTML = "";
  select("#nav").innerHTML = "";
  select("#content").innerHTML = "";

  setAuthMessage("");
}

async function loadProjects() {
  if (!currentUser) {
    return;
  }

  const {
    data,
    error
  } = await database
    .from("project_members")
    .select("role,projects(*)")
    .eq("user_id", currentUser.id);

  if (error) {
    console.error(error);
    showToast(error.message);
    return;
  }

  projects = (data || [])
    .filter(function (membership) {
      return Boolean(membership.projects);
    })
    .map(function (membership) {
      return {
        ...membership.projects,
        member_role: membership.role
      };
    });

  if (currentProject) {
    const updatedProject = projects.find(
      function (project) {
        return project.id === currentProject.id;
      }
    );

    currentProject = updatedProject || null;
  }

  if (
    !currentProject &&
    projects.length > 0
  ) {
    currentProject = projects[0];
  }

  currentRole =
    currentProject
      ? currentProject.member_role || "viewer"
      : "viewer";

  select("#userRole").textContent =
    currentRole;

  syncProjectControls();
}

function syncProjectControls() {
  const projectSelect =
    select("#projectSelect");

  if (!projects.length) {
    projectSelect.innerHTML = `
      <option value="">
        No projects available
      </option>
    `;

    select("#projectBtn").textContent =
      "No project selected";

    select("#oneDriveBtn").href =
      config.DEFAULT_ONEDRIVE_FOLDER;

    return;
  }

  projectSelect.innerHTML = projects
    .map(function (project) {
      const selected =
        currentProject &&
        currentProject.id === project.id
          ? "selected"
          : "";

      return `
        <option
          value="${escapeHtml(project.id)}"
          ${selected}
        >
          ${escapeHtml(project.name)}
        </option>
      `;
    })
    .join("");

  select("#projectBtn").textContent =
    currentProject
      ? currentProject.name
      : "Select project";

  select("#oneDriveBtn").href =
    currentProject &&
    currentProject.onedrive_url
      ? currentProject.onedrive_url
      : config.DEFAULT_ONEDRIVE_FOLDER;
}

function renderNavigation() {
  const navigation = select("#nav");

  navigation.innerHTML = navigationPages
    .map(function (page) {
      const activeClass =
        page === activePage
          ? "active"
          : "";

      return `
        <button
          type="button"
          class="nav-button ${activeClass}"
          data-page="${escapeHtml(page)}"
        >
          ${escapeHtml(page)}
        </button>
      `;
    })
    .join("");

  navigation
    .querySelectorAll("[data-page]")
    .forEach(function (button) {
      button.addEventListener(
        "click",
        async function () {
          activePage =
            button.dataset.page;

          renderNavigation();

          await renderPage();

          document.body.classList.remove("menu");
        }
      );
    });
}

async function renderPage() {
  if (!currentProject) {
    renderEmptyProjectsPage();
    return;
  }

  if (activePage === "Dashboard") {
    await renderDashboard();
    return;
  }

  if (activePage === "Team") {
    await renderTeamPage();
    return;
  }

  await renderRecordsPage();
}

function renderEmptyProjectsPage() {
  select("#content").innerHTML =
    pageHeader(
      "Projects",
      "Create your first construction project.",
      `
        <button
          type="button"
          class="primary"
          id="createFirstProject"
        >
          + Create project
        </button>
      `
    ) +
    `
      <div class="card empty">
        <h2>No projects yet</h2>

        <p>
          Create a project to begin managing
          contract administration records.
        </p>
      </div>
    `;

  select("#createFirstProject").addEventListener(
    "click",
    openProjectForm
  );
}

async function getProjectRecords() {
  if (!currentProject) {
    return [];
  }

  const {
    data,
    error
  } = await database
    .from("records")
    .select("*")
    .eq("project_id", currentProject.id)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(error);
    showToast(error.message);
    return [];
  }

  return data || [];
}

async function renderDashboard() {
  const records = await getProjectRecords();

  const approvedChanges = records
    .filter(function (record) {
      return (
        record.type === "Change Orders" &&
        record.status === "Approved"
      );
    })
    .reduce(function (total, record) {
      return total + Number(record.amount || 0);
    }, 0);

  const pendingChanges = records
    .filter(function (record) {
      return (
        record.type === "Change Orders" &&
        [
          "Pending",
          "Under review"
        ].includes(record.status)
      );
    })
    .reduce(function (total, record) {
      return total + Number(record.amount || 0);
    }, 0);

  const certifiedAmount = records
    .filter(function (record) {
      return (
        record.type === "Payment Applications" &&
        [
          "Approved",
          "Paid"
        ].includes(record.status)
      );
    })
    .reduce(function (total, record) {
      return total + Number(record.amount || 0);
    }, 0);

  const paidAmount = records
    .filter(function (record) {
      return (
        record.type === "Payment Applications" &&
        record.status === "Paid"
      );
    })
    .reduce(function (total, record) {
      return total + Number(record.amount || 0);
    }, 0);

  const openRfis = records.filter(
    function (record) {
      return (
        record.type === "RFIs" &&
        ![
          "Answered",
          "Resolved",
          "Closed"
        ].includes(record.status)
      );
    }
  ).length;

  const originalValue =
    Number(currentProject.contract_value) || 0;

  const revisedValue =
    originalValue + approvedChanges;

  const upcomingDeadlines = records
    .filter(function (record) {
      return Boolean(record.due_date);
    })
    .sort(function (first, second) {
      return first.due_date.localeCompare(
        second.due_date
      );
    })
    .slice(0, 6);

  select("#content").innerHTML =
    pageHeader(
      "Contract Dashboard",
      [
        currentProject.name,
        currentProject.contract_number
      ]
        .filter(Boolean)
        .join(" · "),
      `
        ${
          hasPermission("create")
            ? `
                <button
                  type="button"
                  class="primary"
                  id="dashboardNewChange"
                >
                  + New change
                </button>
              `
            : ""
        }
      `
    ) +
    `
      <div class="metrics">
        ${metric(
          "Original contract",
          formatMoney(originalValue),
          "Base contract value"
        )}

        ${metric(
          "Revised contract",
          formatMoney(revisedValue),
          "Approved changes included"
        )}

        ${metric(
          "Certified to date",
          formatMoney(certifiedAmount),
          "Approved and paid applications"
        )}

        ${metric(
          "Paid to date",
          formatMoney(paidAmount),
          "Payment applications paid"
        )}
      </div>

      <div class="grid">
        <div class="card">
          <h3>Project information</h3>

          <p>
            <strong>Project:</strong>
            ${escapeHtml(currentProject.name)}
          </p>

          <p>
            <strong>Contract number:</strong>
            ${escapeHtml(
              currentProject.contract_number || "—"
            )}
          </p>

          <p>
            <strong>Location:</strong>
            ${escapeHtml(
              currentProject.location || "—"
            )}
          </p>

          <p>
            <strong>Start date:</strong>
            ${escapeHtml(
              formatDate(currentProject.start_date)
            )}
          </p>

          <p>
            <strong>Completion date:</strong>
            ${escapeHtml(
              formatDate(
                currentProject.completion_date
              )
            )}
          </p>

          <p>
            <strong>Your role:</strong>
            ${escapeHtml(currentRole)}
          </p>

          <p>
            <strong>Pending changes:</strong>
            ${escapeHtml(
              formatMoney(pendingChanges)
            )}
          </p>

          <p>
            <strong>Open RFIs:</strong>
            ${escapeHtml(openRfis)}
          </p>
        </div>

        <div class="card">
          <h3>Upcoming deadlines</h3>

          ${
            upcomingDeadlines.length
              ? upcomingDeadlines
                  .map(function (record) {
                    return `
                      <div class="deadline-item">
                        <div>
                          <strong>
                            ${escapeHtml(record.reference)}
                          </strong>

                          <span>
                            ${escapeHtml(record.title)}
                          </span>
                        </div>

                        <time>
                          ${escapeHtml(
                            formatDate(record.due_date)
                          )}
                        </time>
                      </div>
                    `;
                  })
                  .join("")
              : `
                  <p class="empty">
                    No deadlines have been added.
                  </p>
                `
          }
        </div>
      </div>
    `;

  const newChangeButton =
    select("#dashboardNewChange");

  if (newChangeButton) {
    newChangeButton.addEventListener(
      "click",
      function () {
        activePage = "Change Orders";

        renderNavigation();

        openRecordForm();
      }
    );
  }
}

async function renderRecordsPage() {
  const {
    data,
    error
  } = await database
    .from("records")
    .select("*")
    .eq("project_id", currentProject.id)
    .eq("type", activePage)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(error);
    showToast(error.message);
    return;
  }

  const records = data || [];

  const addButton = hasPermission("create")
    ? `
        <button
          type="button"
          class="primary"
          id="addRecord"
        >
          + New record
        </button>
      `
    : "";

  const exportButton = hasPermission("export")
    ? `
        <button
          type="button"
          class="secondary"
          id="exportCsv"
        >
          Export CSV
        </button>
      `
    : "";

  const rows = records
    .map(function (record) {
      const editButton =
        hasPermission("update")
          ? `
              <button
                type="button"
                class="secondary edit-record"
                data-id="${escapeHtml(record.id)}"
              >
                Edit
              </button>
            `
          : "";

      const deleteButton =
        hasPermission("delete")
          ? `
              <button
                type="button"
                class="danger delete-record"
                data-id="${escapeHtml(record.id)}"
              >
                Delete
              </button>
            `
          : "";

      return `
        <tr>
          <td class="record-reference">
            ${escapeHtml(record.reference)}
          </td>

          <td>
            ${escapeHtml(record.title)}
          </td>

          <td>
            ${
              Number(record.amount)
                ? escapeHtml(
                    formatMoney(record.amount)
                  )
                : "—"
            }
          </td>

          <td>
            ${escapeHtml(
              record.responsible_party || "—"
            )}
          </td>

          <td>
            ${statusBadge(record.status)}
          </td>

          <td>
            ${escapeHtml(
              formatDate(record.due_date)
            )}
          </td>

          <td class="row-actions">
            ${editButton}
            ${deleteButton}

            ${
              !editButton && !deleteButton
                ? "View only"
                : ""
            }
          </td>
        </tr>
      `;
    })
    .join("");

  select("#content").innerHTML =
    pageHeader(
      activePage,
      `Records for ${currentProject.name}`,
      addButton
    ) +
    `
      <div class="toolbar">
        <input
          id="search"
          type="search"
          placeholder="Search register"
        >

        ${exportButton}
      </div>

      <div class="card table-card">
        <table id="recordsTable">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Party</th>
              <th>Status</th>
              <th>Due</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            ${
              rows ||
              `
                <tr>
                  <td
                    colspan="7"
                    class="empty"
                  >
                    No records found.
                  </td>
                </tr>
              `
            }
          </tbody>
        </table>
      </div>
    `;

  const addRecordButton =
    select("#addRecord");

  if (addRecordButton) {
    addRecordButton.addEventListener(
      "click",
      function () {
        openRecordForm();
      }
    );
  }

  const searchInput =
    select("#search");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      function (event) {
        filterRecords(event.target.value);
      }
    );
  }

  document
    .querySelectorAll(".edit-record")
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          const record = records.find(
            function (item) {
              return item.id === button.dataset.id;
            }
          );

          if (record) {
            openRecordForm(record);
          }
        }
      );
    });

  document
    .querySelectorAll(".delete-record")
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          deleteRecord(button.dataset.id);
        }
      );
    });

  const exportCsvButton =
    select("#exportCsv");

  if (exportCsvButton) {
    exportCsvButton.addEventListener(
      "click",
      function () {
        exportCsv(records);
      }
    );
  }
}

function filterRecords(query) {
  document
    .querySelectorAll(
      "#recordsTable tbody tr"
    )
    .forEach(function (row) {
      const matches = row.innerText
        .toLowerCase()
        .includes(query.toLowerCase());

      row.style.display =
        matches
          ? ""
          : "none";
    });
}

function openRecordForm(record = null) {
  const requiredPermission =
    record
      ? "update"
      : "create";

  if (!hasPermission(requiredPermission)) {
    showToast(
      "Your project role does not allow this action."
    );

    return;
  }

  editingRecord = record;
  modalMode = "record";

  select("#modalTitle").textContent =
    record
      ? `Edit ${activePage} record`
      : `New ${activePage} record`;

  select("#modalFields").innerHTML = `
    <label class="field">
      Title

      <input
        name="title"
        required
        maxlength="250"
        value="${escapeHtml(
          record ? record.title : ""
        )}"
      >
    </label>

    <label class="field">
      Amount in CAD

      <input
        name="amount"
        type="number"
        step="0.01"
        value="${
          record
            ? Number(record.amount || 0)
            : 0
        }"
      >
    </label>

    <label class="field">
      Responsible party

      <input
        name="responsible_party"
        maxlength="150"
        value="${escapeHtml(
          record
            ? record.responsible_party || ""
            : ""
        )}"
      >
    </label>

    <label class="field">
      Status

      <select name="status">
        ${recordStatuses
          .map(function (status) {
            const selected =
              record &&
              record.status === status
                ? "selected"
                : "";

            return `
              <option
                value="${escapeHtml(status)}"
                ${selected}
              >
                ${escapeHtml(status)}
              </option>
            `;
          })
          .join("")}
      </select>
    </label>

    <label class="field">
      Due date

      <input
        name="due_date"
        type="date"
        value="${escapeHtml(
          record
            ? record.due_date || ""
            : ""
        )}"
      >
    </label>

    <label class="field">
      Notes

      <textarea
        name="notes"
        rows="5"
        maxlength="5000"
      >${escapeHtml(
        record
          ? record.notes || ""
          : ""
      )}</textarea>
    </label>
  `;

  openModal();

  const titleInput =
    select('#modalForm [name="title"]');

  if (titleInput) {
    titleInput.focus();
  }
}

async function saveRecord(event) {
  event.preventDefault();

  const requiredPermission =
    editingRecord
      ? "update"
      : "create";

  if (!hasPermission(requiredPermission)) {
    showToast(
      "Your project role does not allow this action."
    );

    return;
  }

  if (!currentProject) {
    showToast("Select a project first.");
    return;
  }

  const formData =
    new FormData(event.currentTarget);

  const recordData =
    Object.fromEntries(formData.entries());

  recordData.title =
    recordData.title.trim();

  recordData.amount =
    Number(recordData.amount) || 0;

  recordData.responsible_party =
    recordData.responsible_party.trim();

  recordData.notes =
    recordData.notes.trim();

  if (!recordData.title) {
    showToast("A record title is required.");
    return;
  }

  if (editingRecord) {
    const {
      error
    } = await database
      .from("records")
      .update({
        title: recordData.title,
        amount: recordData.amount,
        responsible_party:
          recordData.responsible_party,
        status: recordData.status,
        due_date:
          recordData.due_date || null,
        notes: recordData.notes,
        updated_at:
          new Date().toISOString()
      })
      .eq("id", editingRecord.id)
      .eq("project_id", currentProject.id);

    if (error) {
      console.error(error);
      showToast(error.message);
      return;
    }
  } else {
    const prefix =
      recordPrefixes[activePage] || "REC";

    const {
      data: reference,
      error: referenceError
    } = await database.rpc(
      "next_project_reference",
      {
        p_project_id:
          currentProject.id,
        p_record_type:
          activePage,
        p_prefix:
          prefix
      }
    );

    if (referenceError) {
      console.error(referenceError);
      showToast(referenceError.message);
      return;
    }

    const {
      error
    } = await database
      .from("records")
      .insert({
        project_id:
          currentProject.id,
        type:
          activePage,
        reference:
          reference,
        title:
          recordData.title,
        amount:
          recordData.amount,
        responsible_party:
          recordData.responsible_party,
        status:
          recordData.status,
        due_date:
          recordData.due_date || null,
        notes:
          recordData.notes,
        created_by:
          currentUser.id
      });

    if (error) {
      console.error(error);
      showToast(error.message);
      return;
    }
  }

  const wasEditing =
    Boolean(editingRecord);

  closeModal();

  await renderPage();

  showToast(
    wasEditing
      ? "Record updated"
      : "Record created"
  );
}

async function deleteRecord(recordId) {
  if (!hasPermission("delete")) {
    showToast(
      "Your project role cannot delete records."
    );

    return;
  }

  const confirmed = window.confirm(
    "Delete this record permanently?"
  );

  if (!confirmed) {
    return;
  }

  const {
    error
  } = await database
    .from("records")
    .delete()
    .eq("id", recordId)
    .eq("project_id", currentProject.id);

  if (error) {
    console.error(error);
    showToast(error.message);
    return;
  }

  await renderPage();

  showToast("Record deleted");
}

function openProjectForm() {
  if (!currentUser) {
    showToast("Sign in before creating a project.");
    return;
  }

  modalMode = "project";
  editingRecord = null;

  select("#modalTitle").textContent =
    "Create project";

  select("#modalFields").innerHTML = `
    <label class="field">
      Project name

      <input
        name="name"
        required
        maxlength="200"
      >
    </label>

    <label class="field">
      Contract number

      <input
        name="contract_number"
        maxlength="100"
      >
    </label>

    <label class="field">
      Location

      <input
        name="location"
        maxlength="250"
      >
    </label>

    <label class="field">
      Original contract value in CAD

      <input
        name="contract_value"
        type="number"
        step="0.01"
        value="0"
      >
    </label>

    <label class="field">
      Start date

      <input
        name="start_date"
        type="date"
      >
    </label>

    <label class="field">
      Completion date

      <input
        name="completion_date"
        type="date"
      >
    </label>

    <label class="field">
      OneDrive project folder

      <input
        name="onedrive_url"
        type="url"
        value="${escapeHtml(
          config.DEFAULT_ONEDRIVE_FOLDER
        )}"
      >
    </label>
  `;

  openModal();

  const nameInput =
    select('#modalForm [name="name"]');

  if (nameInput) {
    nameInput.focus();
  }
}

async function saveProject(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast("Sign in before creating a project.");
    return;
  }

  const formData =
    new FormData(event.currentTarget);

  const projectData =
    Object.fromEntries(formData.entries());

  projectData.name =
    projectData.name.trim();

  projectData.contract_number =
    projectData.contract_number.trim();

  projectData.location =
    projectData.location.trim();

  projectData.contract_value =
    Number(projectData.contract_value) || 0;

  projectData.onedrive_url =
    projectData.onedrive_url.trim() ||
    config.DEFAULT_ONEDRIVE_FOLDER;

  if (!projectData.name) {
    showToast("Project name is required.");
    return;
  }

  if (
    projectData.start_date &&
    projectData.completion_date &&
    projectData.completion_date <
      projectData.start_date
  ) {
    showToast(
      "Completion date cannot be earlier than the start date."
    );

    return;
  }

  const projectId = generateUuid();

  const {
    error: projectError
  } = await database
    .from("projects")
    .insert({
      id:
        projectId,
      name:
        projectData.name,
      contract_number:
        projectData.contract_number,
      location:
        projectData.location,
      contract_value:
        projectData.contract_value,
      start_date:
        projectData.start_date || null,
      completion_date:
        projectData.completion_date || null,
      onedrive_url:
        projectData.onedrive_url,
      created_by:
        currentUser.id
    });

  if (projectError) {
    console.error(projectError);
    showToast(projectError.message);
    return;
  }

  const {
    error: membershipError
  } = await database
    .from("project_members")
    .insert({
      project_id:
        projectId,
      user_id:
        currentUser.id,
      role:
        "owner"
    });

  if (membershipError) {
    console.error(membershipError);
    showToast(membershipError.message);
    return;
  }

  closeModal();

  currentProject = null;

  await loadProjects();

  activePage = "Dashboard";

  renderNavigation();

  await renderPage();

  showToast("Project created");
}

async function renderTeamPage() {
  const {
    data: memberships,
    error: membershipError
  } = await database
    .from("project_members")
    .select("user_id,role")
    .eq("project_id", currentProject.id);

  if (membershipError) {
    console.error(membershipError);
    showToast(membershipError.message);
    return;
  }

  const userIds = (memberships || [])
    .map(function (membership) {
      return membership.user_id;
    });

  let profiles = [];

  if (userIds.length > 0) {
    const {
      data: profileData,
      error: profileError
    } = await database
      .from("profiles")
      .select("id,email,full_name")
      .in("id", userIds);

    if (profileError) {
      console.error(profileError);
    } else {
      profiles = profileData || [];
    }
  }

  const rows = (memberships || [])
    .map(function (membership) {
      const profile = profiles.find(
        function (item) {
          return item.id === membership.user_id;
        }
      );

      return `
        <tr>
          <td>
            ${escapeHtml(
              profile
                ? profile.full_name || "—"
                : "—"
            )}
          </td>

          <td>
            ${escapeHtml(
              profile
                ? profile.email || "—"
                : membership.user_id
            )}
          </td>

          <td>
            ${escapeHtml(membership.role)}
          </td>
        </tr>
      `;
    })
    .join("");

  select("#content").innerHTML =
    pageHeader(
      "Team",
      `Members of ${currentProject.name}`
    ) +
    `
      <div class="card table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email or User ID</th>
              <th>Project role</th>
            </tr>
          </thead>

          <tbody>
            ${
              rows ||
              `
                <tr>
                  <td
                    colspan="3"
                    class="empty"
                  >
                    No project members found.
                  </td>
                </tr>
              `
            }
          </tbody>
        </table>
      </div>
    `;
}

function exportCsv(records) {
  if (!hasPermission("export")) {
    showToast(
      "Your project role cannot export records."
    );

    return;
  }

  function quoteCsv(value) {
    return (
      '"' +
      String(value ?? "")
        .replaceAll('"', '""') +
      '"'
    );
  }

  const headings = [
    "Reference",
    "Title",
    "Amount",
    "Responsible Party",
    "Status",
    "Due Date",
    "Notes"
  ];

  const rows = records.map(
    function (record) {
      return [
        record.reference,
        record.title,
        record.amount,
        record.responsible_party,
        record.status,
        record.due_date,
        record.notes
      ]
        .map(quoteCsv)
        .join(",");
    }
  );

  const csv = [
    headings.join(","),
    ...rows
  ].join("\n");

  const blob = new Blob(
    [csv],
    {
      type:
        "text/csv;charset=utf-8"
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `${activePage
      .toLowerCase()
      .replaceAll(" ", "-")
      .replaceAll("&", "and")}.csv`;

  document.body.appendChild(link);

  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("CSV exported");
}

const authForm = select("#authForm");

authForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    setAuthMessage("");

    const email =
      select("#email").value.trim();

    const password =
      select("#password").value;

    if (!email || !password) {
      setAuthMessage(
        "Enter your email and password.",
        true
      );

      return;
    }

    const {
      error
    } = await database.auth
      .signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      setAuthMessage(error.message, true);
      return;
    }

    setAuthMessage(
      "Signed in successfully."
    );
  }
);

select("#signupBtn").addEventListener(
  "click",
  async function () {
    setAuthMessage("");

    const email =
      select("#email").value.trim();

    const password =
      select("#password").value;

    if (!email || !password) {
      setAuthMessage(
        "Enter an email and password first.",
        true
      );

      return;
    }

    if (password.length < 8) {
      setAuthMessage(
        "Password must contain at least 8 characters.",
        true
      );

      return;
    }

    const {
      error
    } = await database.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      setAuthMessage(error.message, true);
      return;
    }

    setAuthMessage(
      "Account created. Check your email if confirmation is required."
    );
  }
);

select("#signoutBtn").addEventListener(
  "click",
  async function () {
    const {
      error
    } = await database.auth.signOut();

    if (error) {
      showToast(error.message);
    }
  }
);

select("#newProjectBtn").addEventListener(
  "click",
  openProjectForm
);

select("#projectBtn").addEventListener(
  "click",
  function () {
    select("#projectSelect").focus();
  }
);

select("#projectSelect").addEventListener(
  "change",
  async function () {
    const selectedProject =
      projects.find(
        function (project) {
          return (
            project.id ===
            select("#projectSelect").value
          );
        }
      );

    if (!selectedProject) {
      return;
    }

    currentProject =
      selectedProject;

    currentRole =
      selectedProject.member_role ||
      "viewer";

    select("#userRole").textContent =
      currentRole;

    activePage = "Dashboard";

    syncProjectControls();
    renderNavigation();

    await renderPage();
  }
);

select("#menuBtn").addEventListener(
  "click",
  function () {
    document.body.classList.toggle("menu");
  }
);

select("#modalClose").addEventListener(
  "click",
  closeModal
);

select("#modalCancel").addEventListener(
  "click",
  closeModal
);

select("#modal").addEventListener(
  "click",
  function (event) {
    if (event.target.id === "modal") {
      closeModal();
    }
  }
);

select("#modalForm").addEventListener(
  "submit",
  async function (event) {
    if (modalMode === "project") {
      await saveProject(event);
      return;
    }

    await saveRecord(event);
  }
);

document.addEventListener(
  "keydown",
  function (event) {
    if (event.key === "Escape") {
      closeModal();
      document.body.classList.remove("menu");
    }
  }
);

bootApplication();