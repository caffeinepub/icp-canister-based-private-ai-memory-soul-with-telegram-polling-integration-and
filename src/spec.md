# Specification

## Summary
**Goal:** Build a private ICP canister-backed “AI memory” system that persistently stores conversation threads, ingests Telegram bot messages via canister polling, and provides a secured web admin console to manage threads and Telegram settings.

**Planned changes:**
- Implement a single Motoko canister that stores persistent conversation threads (metadata + ordered message/events) with CRUD operations and stable upgrade persistence.
- Add Internet Identity-based access control with an admin allowlist; enforce authorization on all protected canister methods and admin UI routes.
- Implement Telegram Bot API polling via HTTPS outcalls (getUpdates) with offset tracking, admin start/stop and interval controls, per-chat thread storage, and optional sendMessage support (including an admin test action).
- Add secure Telegram token handling: admin-only runtime set/rotate workflow, token masking in UI, no token returned by queries, and no stable persistence by default (re-entry required after upgrade/redeploy).
- Build a private web admin UI to list/search threads, view a thread timeline, append admin notes, rename threads, delete/soft-delete messages/events, delete threads, and export thread data as JSON.
- Add an admin-only Telegram control panel UI for polling controls, integration status (last poll time, last processed update id), token set/rotate, and sendMessage testing to a specified chat id.
- Apply a consistent privacy/security-focused visual theme across the admin UI (non-blue/non-purple primary palette).
- Add privacy/security hardening: minimize sensitive logging, provide redaction/delete controls, avoid storing secrets beyond the current session, and include in-app guidance for private operation (token rotation, obtaining chat id, polling behavior, stored data).

**User-visible outcome:** Admins can sign in with Internet Identity to securely manage stored conversation threads, ingest and review Telegram messages in per-chat threads, control Telegram polling and token rotation, redact/delete sensitive events, and export thread data from a themed private admin console.
