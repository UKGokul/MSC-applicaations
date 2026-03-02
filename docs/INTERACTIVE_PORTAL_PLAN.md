# Interactive Portal Plan (GitHub as Backend)

## Goal
Create a simple internal website for your employees to manage:
- applicant details
- application statuses
- document uploads
- missing document follow-ups
- deadline visibility

while keeping GitHub as the primary storage and workflow backend.

## System Design

### 1) Frontend
- **Stack:** Next.js (recommended)
- **Pages:**
  - Dashboard (all applications)
  - Applicant profile page
  - Application detail page
  - Missing documents queue
  - Upload center

### 2) API Layer
- **Stack:** Node.js route handlers (or FastAPI)
- **Auth:** GitHub App (preferred) or PAT for initial prototype
- **Responsibilities:**
  - Read/write Issues
  - Read/write Project item fields
  - Commit uploaded files to applicant folders
  - Post comments/activity logs

### 3) GitHub Data Model
- **Issue type: Application** (one issue per program)
- **Issue type: Missing document** (one issue per missing file)
- **Issue type: Deadline** (one issue for critical deadline checkpoints)
- **Files:** raw documents in `/<Applicant>/...`

## Data Mapping

### Application record
- Title: `[Application] <Applicant> - <University> - <Program>`
- Labels: `type:application`, `applicant:<name>`, `status:<state>`
- Project fields:
  - Applicant
  - University
  - Program
  - Deadline
  - Stage
  - Owner

### Missing document record
- Title: `[Document] <Applicant> - <Document Name>`
- Labels: `type:document`, `status:waiting-client`
- Linked to Application issue by URL/reference.

### Deadline record
- Title: `[Deadline] <Applicant> - <University> - <Date>`
- Labels: `type:deadline`, `priority:high`

## Upload Workflow

1. Staff uploads file in portal.
2. API receives file and target path (e.g., `Arathi/UHH_Economics_MSC/`).
3. API commits file using GitHub Contents API.
4. API comments on related issue: "Document uploaded: <filename>".
5. Portal refreshes status.

## Security Recommendations

- Prefer **GitHub App** over long-lived PAT.
- Restrict app permissions to:
  - Contents (read/write)
  - Issues (read/write)
  - Pull Requests (optional)
  - Projects (if using Project sync)
- Store secrets in deployment provider (Vercel/Render), never in repo.

## Rollout Phases

### Phase 1 (1-2 weeks)
- Dashboard read-only from Issues + tracker
- Create/update application status
- Upload documents to applicant folders

### Phase 2
- Missing-doc queue with SLA indicators
- Deadline countdown and highlighting
- Applicant profile form with emergency contact

### Phase 3
- Automated reminders (email/WhatsApp integration)
- Weekly digest to team
- Client-facing portal (optional)

## KPIs to Track
- Applications submitted before deadline (%)
- Average days to collect missing documents
- Number of blocked applications per week
- Overdue deadlines count

