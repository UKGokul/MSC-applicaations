const STORAGE_KEY = "admissions_portal_data_v2";
const GITHUB_KEY = "admissions_github_settings_v1";

const defaultData = [
  { id: crypto.randomUUID(), applicant: "Arathi", university: "University of Hamburg", program: "MSc Economics", deadline: "2026-04-01", status: "Submitted", missing: ["Study proof in Germany"], emergency: "" },
  { id: crypto.randomUUID(), applicant: "Unnikrishnan", university: "University of Hamburg", program: "MSc Business Administration", deadline: "2026-06-15", status: "In Progress", missing: ["APS", "Language certificate"], emergency: "" },
];

const el = (id) => document.getElementById(id);
const statusLine = el("statusLine");

function setStatus(msg) { statusLine.textContent = msg; }
function loadData() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData; } catch { return defaultData; } }
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2)); }
function loadGitHub() { try { return JSON.parse(localStorage.getItem(GITHUB_KEY)) || {}; } catch { return {}; } }
function saveGitHub(cfg) { localStorage.setItem(GITHUB_KEY, JSON.stringify(cfg)); }

let applications = loadData();
let github = loadGitHub();

function githubApiBase() {
  const { owner, repo } = github;
  return `https://api.github.com/repos/${owner}/${repo}/contents`;
}

async function getExistingSha(path) {
  const url = `${githubApiBase()}/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(github.branch)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${github.token}`, Accept: "application/vnd.github+json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const json = await res.json();
  return json.sha;
}

async function putFile(path, contentBase64, message) {
  const sha = await getExistingSha(path);
  const body = { message, content: contentBase64, branch: github.branch };
  if (sha) body.sha = sha;
  const url = `${githubApiBase()}/${encodeURIComponent(path).replace(/%2F/g, "/")}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: `Bearer ${github.token}`, Accept: "application/vnd.github+json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub upload failed (${res.status}): ${err}`);
  }
  return res.json();
}

function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function renderStats() {
  el("statTotal").textContent = applications.length;
  el("statSubmitted").textContent = applications.filter((a) => a.status === "Submitted").length;
  el("statBlocked").textContent = applications.filter((a) => a.status === "Blocked").length;
  el("statDueSoon").textContent = applications.filter((a) => { const d = daysUntil(a.deadline); return d >= 0 && d <= 14; }).length;
}

function renderTable() {
  const body = el("applicationsBody");
  body.innerHTML = "";
  for (const app of applications) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${app.applicant}</td><td>${app.university}</td><td>${app.program}</td><td>${app.deadline}</td>
    <td><select data-action="status" data-id="${app.id}">${["Planning","In Progress","Submitted","Blocked"].map((s) => `<option value="${s}" ${s===app.status?"selected":""}>${s}</option>`).join("")}</select></td>
    <td>${app.missing.join(", ")}</td><td>${app.emergency || "-"}</td><td><button data-action="delete" data-id="${app.id}">Delete</button></td>`;
    body.appendChild(tr);
  }
}

function renderReminders() {
  const list = el("reminderList");
  list.innerHTML = "";
  const reminders = applications.map((a) => ({ ...a, d: daysUntil(a.deadline) })).filter((a) => a.d <= 30).sort((a, b) => a.d - b.d);
  if (!reminders.length) list.innerHTML = "<li>No upcoming deadlines in the next 30 days.</li>";
  reminders.forEach((r) => { const li = document.createElement("li"); li.textContent = `${r.applicant} - ${r.program}: ${r.d} day(s) left`; list.appendChild(li); });
}

function renderIssueSelect() {
  const s = el("issueSelect");
  s.innerHTML = "";
  applications.forEach((app) => { const o = document.createElement("option"); o.value = app.id; o.textContent = `${app.applicant} | ${app.university} | ${app.program}`; s.appendChild(o); });
}

function renderAll() { saveData(applications); renderStats(); renderTable(); renderReminders(); renderIssueSelect(); }

function fillGitHubForm() {
  const f = el("githubForm");
  ["owner", "repo", "branch", "token", "dataPath"].forEach((k) => { if (github[k]) f.elements[k].value = github[k]; });
}

el("githubForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  github = Object.fromEntries(fd.entries());
  saveGitHub(github);
  setStatus("GitHub settings saved.");
});

el("applicationForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  applications.push({
    id: crypto.randomUUID(),
    applicant: String(fd.get("applicant")).trim(),
    university: String(fd.get("university")).trim(),
    program: String(fd.get("program")).trim(),
    deadline: String(fd.get("deadline")),
    status: String(fd.get("status")),
    missing: String(fd.get("missing")).split(",").map((s) => s.trim()).filter(Boolean),
    emergency: String(fd.get("emergency")).trim(),
  });
  e.target.reset();
  renderAll();
  setStatus("Application added locally. Click 'Push Applications JSON to GitHub' to commit it to repo.");
});

el("applicationsBody").addEventListener("click", (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.dataset.action === "delete") {
    applications = applications.filter((a) => a.id !== t.dataset.id);
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

el("applicationsBody").addEventListener("change", (e) => {
  const t = e.target;
  if (!(t instanceof HTMLSelectElement)) return;
  if (t.dataset.action === "status") {
    const row = applications.find((a) => a.id === t.dataset.id);
    if (row) row.status = t.value;
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

el("generateIssueBtn").addEventListener("click", () => {
  const app = applications.find((a) => a.id === el("issueSelect").value);
  if (!app) return;
  el("issueDraft").value = `# [Application] ${app.applicant} - ${app.university} - ${app.program}\n\n- Deadline: ${app.deadline}\n- Status: ${app.status}\n\n## Missing Docs\n${app.missing.map((m) => `- [ ] ${m}`).join("\n") || "- [ ] None"}`;
});

el("exportJsonBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(applications, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "applications.json";
  a.click();
});

el("importJsonInput").addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try { const parsed = JSON.parse(String(r.result)); if (!Array.isArray(parsed)) throw new Error(); applications = parsed; renderAll(); }
    catch { alert("Invalid JSON"); }
  };
  r.readAsText(file);
});

el("syncNowBtn").addEventListener("click", async () => {
  try {
    if (!github.owner || !github.repo || !github.branch || !github.token || !github.dataPath) throw new Error("Fill GitHub settings first.");
    setStatus("Pushing applications JSON to GitHub...");
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(applications, null, 2))));
    await putFile(github.dataPath, content, "Update applications data from portal");
    setStatus(`Synced successfully to ${github.dataPath} on ${github.branch}.`);
  } catch (err) {
    setStatus(String(err.message || err));
  }
});

el("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    if (!github.owner || !github.repo || !github.branch || !github.token) throw new Error("Fill GitHub settings first.");
    const fd = new FormData(e.target);
    const applicant = String(fd.get("docApplicant")).trim();
    const subfolder = String(fd.get("docSubfolder")).trim();
    const message = String(fd.get("docMessage")).trim();
    const file = fd.get("docFile");
    if (!(file instanceof File)) throw new Error("Select a file.");

    const path = [applicant, subfolder, file.name].filter(Boolean).join("/");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = String(reader.result).split(",")[1];
        setStatus(`Uploading ${path} ...`);
        await putFile(path, base64, message);
        setStatus(`Uploaded to ${path} on ${github.branch}.`);
      } catch (err) {
        setStatus(String(err.message || err));
      }
    };
    reader.readAsDataURL(file);
  } catch (err) {
    setStatus(String(err.message || err));
  }
});

fillGitHubForm();
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
