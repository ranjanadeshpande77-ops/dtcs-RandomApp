```markdown
# Christmas Eve Sender

What this provides:
- UI (index.html) — a simple browser UI that can trigger the GitHub Actions workflow or call a local server.
- send_emails.js — Node script that reads recipients.json and sends email using SMTP (nodemailer).
- recipients.json — where team recipient emails are stored.
- GitHub Action workflow (see .github/workflows/) to run on schedule (Dec 24) and on manual dispatch.

Quick setup (recommended for GitHub Actions):
1. Commit these files to the repository.
2. Add the following repository secrets (Settings → Secrets → Actions):
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_USER
   - SMTP_PASS
   - FROM_EMAIL (optional; defaults to SMTP_USER)
3. The workflow is scheduled to run on Dec 24 (UTC) every year. It also supports manual runs (workflow_dispatch).
4. To manually trigger from the UI: open index.html in your browser, select "Trigger GitHub Actions", paste a Personal Access Token (with repo + workflow permissions), and click Send. Alternatively trigger the workflow from Actions → your workflow → Run workflow.

Local run (developer/test):
1. npm ci
2. export SMTP_HOST=... SMTP_USER=... SMTP_PASS=... FROM_EMAIL=...
3. node send_emails.js

Security note:
- Storing recipients in the repo is fine for non-sensitive emails, but do NOT store SMTP credentials in the repo. Use GitHub Actions secrets.
- The UI’s dispatch option requires a PAT. For production, prefer triggering via a server that holds the token securely or using Actions manual runs.
```