const STORAGE_KEY = "admissions_portal_data_v1";

const defaultData = [
  {
    id: crypto.randomUUID(),
    applicant: "Arathi",
    university: "University of Hamburg",
    program: "MSc Economics",
    deadline: "2026-04-01",
    status: "Submitted",
    missing: ["Study proof in Germany", "Current transcript"],
    emergency: "",
  },
  {
    id: crypto.randomUUID(),
    applicant: "Unnikrishnan",
    university: "University of Hamburg",
    program: "MSc Business Administration",
    deadline: "2026-06-15",
    status: "In Progress",
    missing: ["APS", "Language certificate", "Passport"],
    emergency: "",
  },
];

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
}

let applications = loadData();

const applicationForm = document.getElementById("applicationForm");
const applicationsBody = document.getElementById("applicationsBody");
const reminderList = document.getElementById("reminderList");
const issueSelect = document.getElementById("issueSelect");
const issueDraft = document.getElementById("issueDraft");

function daysUntil(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const ms = target - now;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function renderStats() {
  const total = applications.length;
  const submitted = applications.filter((a) => a.status === "Submitted").length;
  const blocked = applications.filter((a) => a.status === "Blocked").length;
  const dueSoon = applications.filter((a) => {
    const d = daysUntil(a.deadline);
    return d >= 0 && d <= 14;
  }).length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statSubmitted").textContent = submitted;
  document.getElementById("statBlocked").textContent = blocked;
  document.getElementById("statDueSoon").textContent = dueSoon;
}

function renderTable() {
  applicationsBody.innerHTML = "";
  applications.forEach((app) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${app.applicant}</td>
      <td>${app.university}</td>
      <td>${app.program}</td>
      <td>${app.deadline}</td>
      <td>
        <select data-action="status" data-id="${app.id}">
          ${["Planning", "In Progress", "Submitted", "Blocked"]
            .map((s) => `<option value="${s}" ${s === app.status ? "selected" : ""}>${s}</option>`)
            .join("")}
        </select>
        <span class="badge ${app.status.replace(" ", "\\ ")}">${app.status}</span>
      </td>
      <td>${app.missing.join(", ")}</td>
      <td>${app.emergency || "-"}</td>
      <td><button data-action="delete" data-id="${app.id}">Delete</button></td>
    `;
    applicationsBody.appendChild(tr);
  });
}

function renderReminders() {
  reminderList.innerHTML = "";
  const reminders = applications
    .map((app) => ({ ...app, days: daysUntil(app.deadline) }))
    .filter((app) => app.days <= 30)
    .sort((a, b) => a.days - b.days);

  if (!reminders.length) {
    reminderList.innerHTML = "<li>No upcoming deadlines in the next 30 days.</li>";
    return;
  }

  reminders.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = `${r.applicant} - ${r.university} (${r.program}) deadline in ${r.days} day(s).`;
    reminderList.appendChild(li);
  });
}

function renderIssueSelect() {
  issueSelect.innerHTML = "";
  applications.forEach((app) => {
    const option = document.createElement("option");
    option.value = app.id;
    option.textContent = `${app.applicant} | ${app.university} | ${app.program}`;
    issueSelect.appendChild(option);
  });
}

function renderAll() {
  saveData(applications);
  renderStats();
  renderTable();
  renderReminders();
  renderIssueSelect();
}

applicationForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(applicationForm);
  const newApp = {
    id: crypto.randomUUID(),
    applicant: fd.get("applicant").toString().trim(),
    university: fd.get("university").toString().trim(),
    program: fd.get("program").toString().trim(),
    deadline: fd.get("deadline").toString(),
    status: fd.get("status").toString(),
    missing: fd.get("missing").toString().split(",").map((x) => x.trim()).filter(Boolean),
    emergency: fd.get("emergency").toString().trim(),
  };
  applications.push(newApp);
  applicationForm.reset();
  renderAll();
});

applicationsBody.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.action === "delete") {
    const id = target.dataset.id;
    applications = applications.filter((a) => a.id !== id);
    renderAll();
  }
});

applicationsBody.addEventListener("change", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (target.dataset.action === "status") {
    const id = target.dataset.id;
    const app = applications.find((a) => a.id === id);
    if (!app) return;
    app.status = target.value;
    renderAll();
  }
});

document.getElementById("generateIssueBtn").addEventListener("click", () => {
  const id = issueSelect.value;
  const app = applications.find((a) => a.id === id);
  if (!app) return;
  issueDraft.value = `# [Application] ${app.applicant} - ${app.university} - ${app.program}\n\n## Applicant Details\n- Applicant name: ${app.applicant}\n- Emergency contact: ${app.emergency || "<add>"}\n\n## Program Details\n- University: ${app.university}\n- Program: ${app.program}\n- Application deadline: ${app.deadline}\n\n## Documents Missing\n${app.missing.length ? app.missing.map((d) => `- [ ] ${d}`).join("\\n") : "- [ ] None"}\n\n## Status\n- Current status: ${app.status}\n`;
});

document.getElementById("exportJsonBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(applications, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "admissions-data.json";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("importJsonInput").addEventListener("change", (e) => {
  const input = e.target;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!Array.isArray(parsed)) throw new Error("Invalid format");
      applications = parsed;
      renderAll();
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

renderAll();
