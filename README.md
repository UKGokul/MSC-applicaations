# Admissions Operations Repository

This repository is the source of truth for your admissions support startup.

## What this repo now supports

- **Per-applicant folders** for source documents.
- **Standardized applicant profile files** for contact, emergency details, and progress.
- **Application tracker board in Markdown** for quick status at a glance.
- **Issue templates** to create repeatable workflows for:
  - new applications
  - missing documents
  - deadline reminders

## Recommended team workflow

1. Store all source files in each applicant's folder.
2. Track each target program as a GitHub Issue using the **Application Intake** template.
3. Create one issue per missing document using the **Missing Document** template.
4. Create deadline issues using the **Deadline Reminder** template and assign an owner.
5. Use labels and milestones to filter all work by applicant and intake season.
6. Update applicant profile markdown whenever contact, status, or document availability changes.

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

Create a Project with these custom fields:

- `Applicant` (single select)
- `University`
- `Program`
- `Deadline` (date)
- `Missing Docs` (text)
- `Owner` (people)
- `Stage` (Backlog, Preparing, Submitted, Follow-up, Closed)

