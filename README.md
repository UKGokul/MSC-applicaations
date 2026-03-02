# Admissions Operations Repository

This repository is the source of truth for your admissions support startup.

## What this repo now supports

- **Per-applicant folders** for source documents.
- **Standardized issue templates** for applications, missing documents, and deadlines.
- **A simple tracker file** for quick visibility.
- **A clear path to an interactive web portal** while still using GitHub as backend.

---

## Can GitHub be the backend for a website?

**Yes — absolutely.**

You can keep GitHub as your backend and build a separate frontend (website) for your team.

### What GitHub can store/manage
- Application records (as Issues + labels + milestones)
- Workflow state (Issue status / Project fields)
- Documents (uploaded files in applicant folders)
- Audit history (commits + issue timeline)

### What the frontend can provide
- Dashboard with filters (by applicant, deadline, status)
- Forms to create/update applications without opening GitHub manually
- One-click document upload into applicant folders
- Missing-document follow-up UI
- Reminder settings (later phase)

---

## Recommended Architecture (practical MVP)

Use this split:

1. **Frontend:** Next.js app (or React app) hosted on Vercel/Netlify.
2. **Backend service:** small API (Node/FastAPI) using GitHub App auth.
3. **Data store:** GitHub repository + Issues + Projects + file tree.

Why this works:
- Team keeps one source of truth in GitHub.
- Non-technical staff use a clean app UI.
- Every change is still auditable in GitHub.

See full plan: `docs/INTERACTIVE_PORTAL_PLAN.md`.

---

## Immediate team workflow (today)

1. Store all source files in each applicant's folder.
2. Track each target program as a GitHub Issue using the **Application Intake** template.
3. Create one issue per missing document using the **Missing Document** template.
4. Create deadline issues using the **Deadline Reminder** template and assign an owner.
5. Use labels and milestones to filter all work by applicant and intake season.
6. Update `APPLICATION_TRACKER.md` whenever issue status changes.

---

## Suggested labels to create in GitHub

- `applicant:arathi`
- `applicant:unnikrishnan`
- `type:application`
- `type:document`
- `type:deadline`
- `priority:high`
- `status:blocked`
- `status:submitted`
- `status:waiting-client`

## Suggested GitHub Project fields

- `Applicant` (single select)
- `University` (text)
- `Program` (text)
- `Deadline` (date)
- `Missing Docs` (text)
- `Owner` (people)
- `Stage` (Backlog, Preparing, Submitted, Follow-up, Closed)

---

## Next build step (if you want me to do it next)

I can create a **working MVP portal scaffold** in this repo with:
- login via GitHub
- dashboard table of applications
- update status form
- document upload endpoint
- sync to Issues/files in this repo

