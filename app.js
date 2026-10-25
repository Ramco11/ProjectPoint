"use strict";

const config = window.APP_CONFIG;

if (
  !config ||
  !config.SUPABASE_URL ||
  !config.SUPABASE_ANON_KEY ||
  config.SUPABASE_URL.includes("PASTE_") ||
  config.SUPABASE_ANON_KEY.includes("PASTE_")
) {
  document.body.innerHTML = `
    <main style="padding:30px;font-family:system-ui">
      <h1>Configuration required</h1>
      <p>
        Open config.js and add your Supabase project URL
        and browser-safe publishable key.
      </p>
    </main>
  `;

  throw new Error("Missing Supabase configuration");
}

if (typeof window.supabase === "undefined") {
  document.body.innerHTML = `
    <main style="padding:30px;font-family:system-ui">
      <h1>Supabase library not loaded</h1>
      <p>Check the Supabase CDN script in index.html.</p>
    </main>
  `;

  throw new Error("Supabase library not loaded");
}

const database = window.supabase.createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
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
  RFIs: "RFI",
  "Site Instructions": "SI",
  Submittals: "SUB",
  "Contract Documents": "DOC",
  "Claims & Notices": "CLM",
  Closeout: "CLS"
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

const teamRoles = [
  "owner",
  "admin",
  "manager",
  "reviewer",
  "viewer"
];

let currentUser = null;
let projects = [];
let currentProject = null;
let currentRole = "viewer";
let activePage = "Dashboard";
let editingRecord = null;
let modalMode = null;

const $ = function (selector) {
  return document.querySelector(selector);
};

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    function (character) {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      };

      return replacements[character];
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

function roleLabel(role) {
  return (
    role.charAt(0).toUpperCase() +
    role.slice(1)
  );
}

function showToast(message) {
  const toast = $("#toast");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(function () {
    toast.classList.remove("show");
  }, 2800);
}

function setAuthMessage(
  message,
  isError = false
) {
  const element = $("#authMessage");

  if (!element) {
    return;
  }

  element.textContent = message;

  element.style.color = isError
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

function canManageTeam() {
  return [
    "owner",
    "admin"
  ].includes(currentRole);
}

function pageHeader(
  title,
  subtitle,
  actions = ""
) {
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

function metric(
  label,
  value,
  note
) {
  return `
    <div class="metric">
      <small>${escapeHtml(label)}</small>
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(note)}</span>
    </div>
  `;
}

function statusBadge(status) {
  return `
    <span class="badge">
      ${escapeHtml(status || "Pending")}
    </span>
  `;
}

function openModal() {
  $("#modal")?.classList.remove("hidden");
}

function closeModal() {
  $("#modal")?.classList.add("hidden");

  $("#modalForm")?.reset();

  if ($("#modalFields")) {
    $("#modalFields").innerHTML = "";
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
      setAuthMessage(
        error.message,
        true
      );
    }

    if (session?.user) {
      await enterApplication(
        session.user
      );
    }

    database.auth.onAuthStateChange(
      async function (
        event,
        session
      ) {
        if (session?.user) {
          if (
            !currentUser ||
            currentUser.id !==
              session.user.id
          ) {
            await enterApplication(
              session.user
            );
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

  $("#authView")?.classList.add(
    "hidden"
  );

  $("#appView")?.classList.remove(
    "hidden"
  );

  if ($("#userEmail")) {
    $("#userEmail").textContent =
      user.email || "Signed-in user";
  }

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

  $("#appView")?.classList.add(
    "hidden"
  );

  $("#authView")?.classList.remove(
    "hidden"
  );

  if ($("#projectSelect")) {
    $("#projectSelect").innerHTML = "";
  }

  if ($("#nav")) {
    $("#nav").innerHTML = "";
  }

  if ($("#content")) {
    $("#content").innerHTML = "";
  }
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
    .eq(
      "user_id",
      currentUser.id
    );

  if (error) {
    console.error(
      "Project loading error:",
      error
    );

    showToast(error.message);

    projects = [];
    currentProject = null;
    currentRole = "viewer";

    syncProjectControls();

    return;
  }

  projects = (data || [])
    .filter(function (membership) {
      return Boolean(
        membership.projects
      );
    })
    .map(function (membership) {
      return {
        ...membership.projects,
        member_role:
          membership.role
      };
    });

  if (currentProject) {
    currentProject =
      projects.find(function (item) {
        return (
          item.id ===
          currentProject.id
        );
      }) || null;
  }

  if (
    !currentProject &&
    projects.length
  ) {
    currentProject = projects[0];
  }

  currentRole =
    currentProject?.member_role ||
    "viewer";

  if ($("#userRole")) {
    $("#userRole").textContent =
      currentRole;
  }

  syncProjectControls();
}

function syncProjectControls() {
  const projectSelect =
    $("#projectSelect");

  if (!projectSelect) {
    return;
  }

  if (!projects.length) {
    projectSelect.innerHTML = `
      <option value="">
        No projects available
      </option>
    `;

    if ($("#projectBtn")) {
      $("#projectBtn").textContent =
        "No project selected";
    }

    if ($("#oneDriveBtn")) {
      $("#oneDriveBtn").href =
        config.DEFAULT_ONEDRIVE_FOLDER ||
        "#";
    }

    return;
  }

  projectSelect.innerHTML =
    projects
      .map(function (item) {
        const selected =
          currentProject?.id === item.id
            ? "selected"
            : "";

        return `
          <option
            value="${escapeHtml(item.id)}"
            ${selected}
          >
            ${escapeHtml(item.name)}
          </option>
        `;
      })
      .join("");

  if ($("#projectBtn")) {
    $("#projectBtn").textContent =
      currentProject?.name ||
      "Select project";
  }

  if ($("#oneDriveBtn")) {
    $("#oneDriveBtn").href =
      currentProject?.onedrive_url ||
      config.DEFAULT_ONEDRIVE_FOLDER ||
      "#";
  }
}

function renderNavigation() {
  const navigation =
    $("#nav");

  if (!navigation) {
    return;
  }

  navigation.innerHTML =
    navigationPages
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

          document.body
            .classList
            .remove("menu");
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
  $("#content").innerHTML =
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
          Create a project to begin
          managing contract
          administration records.
        </p>
      </div>
    `;

  $("#createFirstProject")
    ?.addEventListener(
      "click",
      openProjectForm
    );
}

async function getProjectRecords() {
  const {
    data,
    error
  } = await database
    .from("records")
    .select("*")
    .eq(
      "project_id",
      currentProject.id
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {
    console.error(error);
    showToast(error.message);

    return [];
  }

  return data || [];
}

async function renderDashboard() {
  const records =
    await getProjectRecords();

  const originalValue =
    Number(
      currentProject.contract_value
    ) || 0;

  const approvedChanges =
    records
      .filter(function (item) {
        return (
          item.type ===
            "Change Orders" &&
          item.status === "Approved"
        );
      })
      .reduce(function (
        sum,
        item
      ) {
        return (
          sum +
          Number(item.amount || 0)
        );
      }, 0);

  const pendingChanges =
    records
      .filter(function (item) {
        return (
          item.type ===
            "Change Orders" &&
          [
            "Pending",
            "Under review"
          ].includes(item.status)
        );
      })
      .reduce(function (
        sum,
        item
      ) {
        return (
          sum +
          Number(item.amount || 0)
        );
      }, 0);

  const paidAmount =
    records
      .filter(function (item) {
        return (
          item.type ===
            "Payment Applications" &&
          item.status === "Paid"
        );
      })
      .reduce(function (
        sum,
        item
      ) {
        return (
          sum +
          Number(item.amount || 0)
        );
      }, 0);

  const deadlines =
    records
      .filter(function (item) {
        return Boolean(
          item.due_date
        );
      })
      .sort(function (
        first,
        second
      ) {
        return first.due_date
          .localeCompare(
            second.due_date
          );
      })
      .slice(0, 6);

  $("#content").innerHTML =
    pageHeader(
      "Contract Dashboard",
      [
        currentProject.name,
        currentProject.contract_number
      ]
        .filter(Boolean)
        .join(" · ")
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
          formatMoney(
            originalValue +
            approvedChanges
          ),
          "Approved changes included"
        )}

        ${metric(
          "Paid to date",
          formatMoney(paidAmount),
          "Paid applications"
        )}

        ${metric(
          "Pending changes",
          formatMoney(pendingChanges),
          "Awaiting approval"
        )}

      </div>

      <div class="grid">

        <div class="card">

          <h3>Project information</h3>

          <p>
            <strong>Location:</strong>
            ${escapeHtml(
              currentProject.location ||
              "—"
            )}
          </p>

          <p>
            <strong>Start:</strong>
            ${escapeHtml(
              formatDate(
                currentProject.start_date
              )
            )}
          </p>

          <p>
            <strong>Completion:</strong>
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

        </div>

        <div class="card">

          <h3>Upcoming deadlines</h3>

          ${
            deadlines.length
              ? deadlines
                  .map(function (item) {
                    return `
                      <p>
                        <strong>
                          ${escapeHtml(
                            item.reference
                          )}
                        </strong>

                        ·
                        ${escapeHtml(
                          item.title
                        )}
                        ·
                        ${escapeHtml(
                          formatDate(
                            item.due_date
                          )
                        )}
                      </p>
                    `;
                  })
                  .join("")
              : `
                  <p class="empty">
                    No deadlines
                  </p>
                `
          }

        </div>

      </div>
    `;
}

async function renderRecordsPage() {
  const {
    data,
    error
  } = await database
    .from("records")
    .select("*")
    .eq(
      "project_id",
      currentProject.id
    )
    .eq(
      "type",
      activePage
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

  if (error) {
    console.error(error);
    showToast(error.message);

    return;
  }

  const records = data || [];

  const addButton =
    hasPermission("create")
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

  const exportButton =
    hasPermission("export")
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

  const rows =
    records.length
      ? records
          .map(function (record) {
            const editButton =
              hasPermission("update")
                ? `
                    <button
                      type="button"
                      class="secondary edit-record"
                      data-id="${escapeHtml(
                        record.id
                      )}"
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
                      data-id="${escapeHtml(
                        record.id
                      )}"
                    >
                      Delete
                    </button>
                  `
                : "";

            return `
              <tr>

                <td>
                  ${escapeHtml(
                    record.reference
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    record.title
                  )}
                </td>

                <td>
                  ${
                    record.amount
                      ? escapeHtml(
                          formatMoney(
                            record.amount
                          )
                        )
                      : "—"
                  }
                </td>

                <td>
                  ${escapeHtml(
                    record.responsible_party ||
                    "—"
                  )}
                </td>

                <td>
                  ${statusBadge(
                    record.status
                  )}
                </td>

                <td>
                  ${escapeHtml(
                    formatDate(
                      record.due_date
                    )
                  )}
                </td>

                <td class="row-actions">
                  ${editButton}
                  ${deleteButton}
                </td>

              </tr>
            `;
          })
          .join("")
      : `
          <tr>
            <td
              colspan="7"
              class="empty"
            >
              No records found.
            </td>
          </tr>
        `;

  $("#content").innerHTML =
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
            ${rows}
          </tbody>

        </table>

      </div>
    `;

  $("#addRecord")
    ?.addEventListener(
      "click",
      function () {
        openRecordForm();
      }
    );

  $("#search")
    ?.addEventListener(
      "input",
      function (event) {
        filterRecords(
          event.target.value
        );
      }
    );

  $("#exportCsv")
    ?.addEventListener(
      "click",
      function () {
        exportCsv(records);
      }
    );

  document
    .querySelectorAll(
      ".edit-record"
    )
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          const record =
            records.find(
              function (item) {
                return (
                  item.id ===
                  button.dataset.id
                );
              }
            );

          if (record) {
            openRecordForm(record);
          }
        }
      );
    });

  document
    .querySelectorAll(
      ".delete-record"
    )
    .forEach(function (button) {
      button.addEventListener(
        "click",
        function () {
          deleteRecord(
            button.dataset.id
          );
        }
      );
    });
}

function filterRecords(query) {
  document
    .querySelectorAll(
      "#recordsTable tbody tr"
    )
    .forEach(function (row) {
      const matches =
        row.innerText
          .toLowerCase()
          .includes(
            query.toLowerCase()
          );

      row.style.display =
        matches
          ? ""
          : "none";
    });
}

function openRecordForm(
  record = null
) {
  const permission =
    record
      ? "update"
      : "create";

  if (!hasPermission(permission)) {
    showToast(
      "Your role does not allow this action."
    );

    return;
  }

  editingRecord = record;
  modalMode = "record";

  $("#modalTitle").textContent =
    record
      ? `Edit ${activePage}`
      : `New ${activePage}`;

  $("#modalFields").innerHTML = `
    <label class="field">
      Title

      <input
        name="title"
        required
        maxlength="250"
        value="${escapeHtml(
          record?.title || ""
        )}"
      >
    </label>

    <label class="field">
      Amount in CAD

      <input
        name="amount"
        type="number"
        step="0.01"
        value="${Number(
          record?.amount || 0
        )}"
      >
    </label>

    <label class="field">
      Responsible party

      <input
        name="responsible_party"
        maxlength="150"
        value="${escapeHtml(
          record?.responsible_party ||
          ""
        )}"
      >
    </label>

    <label class="field">
      Status

      <select name="status">
        ${recordStatuses
          .map(function (status) {
            const selected =
              record?.status === status
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
          record?.due_date || ""
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
        record?.notes || ""
      )}</textarea>
    </label>
  `;

  openModal();

  $(
    "#modalForm [name='title']"
  )?.focus();
}

async function saveRecord(event) {
  event.preventDefault();

  if (!currentProject) {
    showToast(
      "Select a project first."
    );

    return;
  }

  const values =
    Object.fromEntries(
      new FormData(
        event.currentTarget
      ).entries()
    );

  values.title =
    String(
      values.title || ""
    ).trim();

  values.amount =
    Number(values.amount) || 0;

  values.responsible_party =
    String(
      values.responsible_party ||
      ""
    ).trim();

  values.notes =
    String(
      values.notes || ""
    ).trim();

  if (!values.title) {
    showToast(
      "A title is required."
    );

    return;
  }

  if (editingRecord) {
    const {
      error
    } = await database
      .from("records")
      .update({
        title:
          values.title,

        amount:
          values.amount,

        responsible_party:
          values.responsible_party,

        status:
          values.status,

        due_date:
          values.due_date || null,

        notes:
          values.notes,

        updated_at:
          new Date().toISOString()
      })
      .eq(
        "id",
        editingRecord.id
      )
      .eq(
        "project_id",
        currentProject.id
      );

    if (error) {
      showToast(error.message);
      return;
    }
  } else {
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
          recordPrefixes[
            activePage
          ] || "REC"
      }
    );

    if (referenceError) {
      showToast(
        referenceError.message
      );

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
          values.title,

        amount:
          values.amount,

        responsible_party:
          values.responsible_party,

        status:
          values.status,

        due_date:
          values.due_date || null,

        notes:
          values.notes,

        created_by:
          currentUser.id
      });

    if (error) {
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

async function deleteRecord(
  recordId
) {
  if (!hasPermission("delete")) {
    showToast(
      "Your role cannot delete records."
    );

    return;
  }

  const confirmed =
    window.confirm(
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
    .eq(
      "project_id",
      currentProject.id
    );

  if (error) {
    showToast(error.message);
    return;
  }

  await renderPage();

  showToast("Record deleted");
}

function openProjectForm() {
  if (!currentUser) {
    showToast(
      "Sign in before creating a project."
    );

    return;
  }

  modalMode = "project";
  editingRecord = null;

  $("#modalTitle").textContent =
    "Create project";

  $("#modalFields").innerHTML = `
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
          config.DEFAULT_ONEDRIVE_FOLDER ||
          ""
        )}"
      >
    </label>
  `;

  openModal();

  $(
    "#modalForm [name='name']"
  )?.focus();
}

async function saveProject(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast(
      "Sign in before creating a project."
    );

    return;
  }

  const submitButton =
    event.currentTarget
      .querySelector(
        'button[type="submit"]'
      );

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.textContent =
      "Saving...";
  }

  try {
    const values =
      Object.fromEntries(
        new FormData(
          event.currentTarget
        ).entries()
      );

    const name =
      String(
        values.name || ""
      ).trim();

    const contractNumber =
      String(
        values.contract_number ||
        ""
      ).trim();

    const location =
      String(
        values.location || ""
      ).trim();

    const contractValue =
      Number(
        values.contract_value
      ) || 0;

    const oneDriveUrl =
      String(
        values.onedrive_url ||
        ""
      ).trim() ||
      config.DEFAULT_ONEDRIVE_FOLDER ||
      null;

    if (!name) {
      showToast(
        "Project name is required."
      );

      return;
    }

    if (
      values.start_date &&
      values.completion_date &&
      values.completion_date <
        values.start_date
    ) {
      showToast(
        "Completion date cannot be earlier than the start date."
      );

      return;
    }

    const {
      data: projectId,
      error
    } = await database.rpc(
      "create_project_with_owner",
      {
        p_name:
          name,

        p_contract_number:
          contractNumber || null,

        p_location:
          location || null,

        p_contract_value:
          contractValue,

        p_start_date:
          values.start_date ||
          null,

        p_completion_date:
          values.completion_date ||
          null,

        p_onedrive_url:
          oneDriveUrl
      }
    );

    if (error) {
      console.error(
        "Project creation error:",
        error
      );

      showToast(error.message);

      return;
    }

    if (!projectId) {
      showToast(
        "The database did not return a project ID."
      );

      return;
    }

    closeModal();

    currentProject = null;

    await loadProjects();

    currentProject =
      projects.find(function (item) {
        return (
          item.id === projectId
        );
      }) ||
      projects[0] ||
      null;

    currentRole =
      currentProject?.member_role ||
      "viewer";

    if ($("#userRole")) {
      $("#userRole").textContent =
        currentRole;
    }

    activePage = "Dashboard";

    syncProjectControls();
    renderNavigation();

    await renderPage();

    showToast(
      "Project created successfully."
    );
  } catch (error) {
    console.error(error);

    showToast(
      error.message ||
      "Unable to create project."
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent =
        "Save";
    }
  }
}

async function changeTeamMemberRole(
  userId,
  newRole
) {
  if (!currentProject) {
    showToast(
      "Select a project first."
    );

    return false;
  }

  if (!canManageTeam()) {
    showToast(
      "Only owners and admins can change roles."
    );

    return false;
  }

  const {
    error
  } = await database.rpc(
    "change_project_member_role",
    {
      p_project_id:
        currentProject.id,

      p_user_id:
        userId,

      p_new_role:
        newRole
    }
  );

  if (error) {
    console.error(
      "Role change error:",
      error
    );

    showToast(error.message);

    return false;
  }

  if (
    userId === currentUser.id
  ) {
    currentRole =
      newRole;

    if ($("#userRole")) {
      $("#userRole").textContent =
        currentRole;
    }
  }

  showToast(
    "Team role updated."
  );

  await loadProjects();

  return true;
}

async function renderTeamPage() {
  if (!currentProject) {
    return;
  }

  const {
    data: memberships,
    error
  } = await database
    .from("project_members")
    .select("user_id,role")
    .eq(
      "project_id",
      currentProject.id
    );

  if (error) {
    console.error(
      "Team loading error:",
      error
    );

    showToast(error.message);

    return;
  }

  const memberRows =
    memberships || [];

  const userIds =
    memberRows.map(
      function (membership) {
        return membership.user_id;
      }
    );

  let profiles = [];

  if (userIds.length) {
    const {
      data,
      error: profileError
    } = await database
      .from("profiles")
      .select(
        "id,email,full_name"
      )
      .in(
        "id",
        userIds
      );

    if (profileError) {
      console.error(
        "Profile loading error:",
        profileError
      );
    } else {
      profiles = data || [];
    }
  }

  const ownerCount =
    memberRows.filter(
      function (membership) {
        return (
          membership.role === "owner"
        );
      }
    ).length;

  const managementAllowed =
    canManageTeam();

  const rows =
    memberRows.length
      ? memberRows
          .map(function (membership) {
            const profile =
              profiles.find(
                function (item) {
                  return (
                    item.id ===
                    membership.user_id
                  );
                }
              );

            const name =
              profile?.full_name ||
              "—";

            const email =
              profile?.email ||
              membership.user_id;

            const isCurrentUser =
              membership.user_id ===
              currentUser.id;

            const isLastOwner =
              membership.role === "owner" &&
              ownerCount === 1;

            let roleControl;

            if (
              managementAllowed &&
              !isLastOwner
            ) {
              roleControl = `
                <select
                  class="team-role-select"
                  data-user-id="${escapeHtml(
                    membership.user_id
                  )}"
                  data-original-role="${escapeHtml(
                    membership.role
                  )}"
                  aria-label="Project role for ${escapeHtml(
                    email
                  )}"
                >
                  ${teamRoles
                    .map(function (role) {
                      const selected =
                        role ===
                        membership.role
                          ? "selected"
                          : "";

                      const ownerDisabled =
                        currentRole === "admin" &&
                        (
                          role === "owner" ||
                          membership.role ===
                            "owner"
                        )
                          ? "disabled"
                          : "";

                      return `
                        <option
                          value="${role}"
                          ${selected}
                          ${ownerDisabled}
                        >
                          ${roleLabel(role)}
                        </option>
                      `;
                    })
                    .join("")}
                </select>
              `;
            } else {
              roleControl = `
                <span class="badge">
                  ${escapeHtml(
                    roleLabel(
                      membership.role
                    )
                  )}
                </span>

                ${
                  isLastOwner
                    ? `
                        <small
                          style="
                            display:block;
                            margin-top:6px;
                            color:#64748b;
                          "
                        >
                          Last project owner
                        </small>
                      `
                    : ""
                }
              `;
            }

            return `
              <tr>
                <td>
                  ${escapeHtml(name)}

                  ${
                    isCurrentUser
                      ? `
                          <span class="badge">
                            You
                          </span>
                        `
                      : ""
                  }
                </td>

                <td>
                  ${escapeHtml(email)}
                </td>

                <td>
                  ${roleControl}
                </td>
              </tr>
            `;
          })
          .join("")
      : `
          <tr>
            <td
              colspan="3"
              class="empty"
            >
              No project members found.
            </td>
          </tr>
        `;

  $("#content").innerHTML =
    pageHeader(
      "Team",
      `Members of ${currentProject.name}`
    ) +
    `
      <div class="card">

        <div class="team-heading">

          <div>
            <h3>Project Team</h3>

            <p>
              Manage project access
              and assigned roles.
            </p>
          </div>

          <span class="badge">
            Your role:
            ${escapeHtml(
              roleLabel(currentRole)
            )}
          </span>

        </div>

      </div>

      <div class="card table-card">

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>

        </table>

      </div>

      <div class="card">

        <h3>Role permissions</h3>

        <p>
          <strong>Owner:</strong>
          Full project and team control.
        </p>

        <p>
          <strong>Admin:</strong>
          Administrative control,
          except owner-role management.
        </p>

        <p>
          <strong>Manager:</strong>
          Create and update project records.
        </p>

        <p>
          <strong>Reviewer:</strong>
          Review and update records.
        </p>

        <p>
          <strong>Viewer:</strong>
          Read-only project access.
        </p>

      </div>
    `;

  document
    .querySelectorAll(
      ".team-role-select"
    )
    .forEach(function (selector) {
      selector.addEventListener(
        "change",
        async function () {
          const userId =
            selector.dataset.userId;

          const newRole =
            selector.value;

          const oldRole =
            selector.dataset
              .originalRole;

          const confirmed =
            window.confirm(
              `Change this team member from ${oldRole} to ${newRole}?`
            );

          if (!confirmed) {
            selector.value =
              oldRole;

            return;
          }

          selector.disabled = true;

          const changed =
            await changeTeamMemberRole(
              userId,
              newRole
            );

          if (!changed) {
            selector.value =
              oldRole;

            selector.disabled =
              false;

            return;
          }

          await renderTeamPage();
        }
      );
    });
}

function exportCsv(records) {
  const quote = function (value) {
    return (
      '"' +
      String(value ?? "")
        .replaceAll(
          '"',
          '""'
        ) +
      '"'
    );
  };

  const rows =
    records.map(function (item) {
      return [
        item.reference,
        item.title,
        item.amount,
        item.responsible_party,
        item.status,
        item.due_date,
        item.notes
      ]
        .map(quote)
        .join(",");
    });

  const csv = [
    "Reference,Title,Amount,Responsible Party,Status,Due Date,Notes",
    ...rows
  ].join("\n");

  const blob =
    new Blob(
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

$("#authForm")
  ?.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      setAuthMessage("");

      const email =
        $("#email").value.trim();

      const password =
        $("#password").value;

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
          email,
          password
        });

      if (error) {
        setAuthMessage(
          error.message,
          true
        );

        return;
      }

      setAuthMessage(
        "Signed in successfully."
      );
    }
  );

$("#signupBtn")
  ?.addEventListener(
    "click",
    async function () {
      setAuthMessage("");

      const email =
        $("#email").value.trim();

      const password =
        $("#password").value;

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
      } = await database.auth
        .signUp({
          email,
          password
        });

      if (error) {
        setAuthMessage(
          error.message,
          true
        );

        return;
      }

      setAuthMessage(
        "Account created. Check your email if confirmation is required."
      );
    }
  );

$("#signoutBtn")
  ?.addEventListener(
    "click",
    async function () {
      const {
        error
      } = await database.auth
        .signOut();

      if (error) {
        showToast(error.message);
      }
    }
  );

$("#newProjectBtn")
  ?.addEventListener(
    "click",
    openProjectForm
  );

$("#projectBtn")
  ?.addEventListener(
    "click",
    function () {
      $("#projectSelect")?.focus();
    }
  );

$("#projectSelect")
  ?.addEventListener(
    "change",
    async function () {
      const selected =
        projects.find(
          function (item) {
            return (
              item.id ===
              $("#projectSelect").value
            );
          }
        );

      if (!selected) {
        return;
      }

      currentProject = selected;

      currentRole =
        selected.member_role ||
        "viewer";

      if ($("#userRole")) {
        $("#userRole").textContent =
          currentRole;
      }

      activePage = "Dashboard";

      syncProjectControls();
      renderNavigation();

      await renderPage();
    }
  );

$("#menuBtn")
  ?.addEventListener(
    "click",
    function () {
      document.body.classList.toggle(
        "menu"
      );
    }
  );

$("#modalClose")
  ?.addEventListener(
    "click",
    closeModal
  );

$("#modalCancel")
  ?.addEventListener(
    "click",
    closeModal
  );

$("#modal")
  ?.addEventListener(
    "click",
    function (event) {
      if (
        event.target.id === "modal"
      ) {
        closeModal();
      }
    }
  );

$("#modalForm")
  ?.addEventListener(
    "submit",
    async function (event) {
      if (
        modalMode === "project"
      ) {
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

      document.body
        .classList
        .remove("menu");
    }
  }
);

bootApplication();