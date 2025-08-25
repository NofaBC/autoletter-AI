AutoLetter AI: “Newsletter → Prospects from JudyVA list” (Frontend slice)
What James builds (UI only)

Mailing List Viewer & Segments

Table of prospects (name, email, source, tag, last activity).

Multi-select checkboxes + “Select All”.

Simple filters: Tag, Source, Has opened before (mocked).

Compose Newsletter

Fields: Subject, From Name, From Email (read-only), Preview Text.

Rich text area (basic toolbar: bold/italic/links/lists).

Personalization chips for variables: {{firstName}}, {{company}}, {{lastSeen}} (insert into body).

Preview & Test Send

Live preview panel (renders body + variables).

“Send test to me” (mock endpoint) → success/error toast.

Send Options

Send now or Schedule (date/time picker).

Confirmation modal shows recipient count and segment rules.

Delivery Status (mock)

After “Send”, show queued → sending → done with counts (sent, failed).

Link to “View campaign report” (stub page).

Mock API contract (what the UI calls)

Use a mock base URL in dev; backend is private to you.

Base (mock): https://mock.autol.ai/api

GET /prospects?tag=&source=&opened=

Response 200:

{
  "items": [
    {"id":"p1","firstName":"Ava","email":"ava@example.com","source":"JudyVA","tags":["beta"],"opened":true},
    {"id":"p2","firstName":"Liam","email":"liam@example.com","source":"PH","tags":["press"],"opened":false}
  ],
  "total": 2
}


POST /newsletter/test

Request:

{
  "subject":"string",
  "previewText":"string",
  "bodyHtml":"<p>...</p>",
  "variables":["firstName","company"]
}


Response 200: { "status":"ok" }

POST /newsletter/send

Request:

{
  "segment": {"tag":"beta","opened":true},
  "recipientIds":["p1","p2"],
  "subject":"string",
  "previewText":"string",
  "bodyHtml":"<p>...</p>",
  "schedule": {"when":"now"|"later","at":"2025-08-20T15:00:00Z"}
}


Response 200:

{ "campaignId":"cmp_123", "queued": 2 }


GET /newsletter/status?campaignId=cmp_123

Response 200:

{ "sent": 2, "failed": 0, "state":"done" }


Errors: return { "error":"message" } with 4xx/5xx → show inline alert + retry.

Minimal element IDs (for quick review)

#prospectTable #filterTag #filterSource #filterOpened
#subject #fromName #fromEmail #previewText
#editor #insertVarFirstName #insertVarCompany
#previewPanel #sendTestBtn #sendNowBtn #scheduleBtn
#schedulePicker #confirmSendModal #statusToast


AutoLetter AI – Newsletter Frontend (Handoff)

Owner: Farhad Nasserghodsi
Scope: Front-end only (no secrets, no real endpoints).
Goal: Compose and send a newsletter UI to prospects sourced from JudyVA’s mailing list (mocked APIs for now).

1) What to Build (UI only)
A. Mailing List Viewer & Segments

Table with: Name, Email, Source, Tags, Last Activity, Select (checkbox)

Filters: Tag, Source, Has Opened Before (mocked)

Multi-select with “Select All”

B. Compose Newsletter

Fields: Subject (required), From Name, From Email (read-only), Preview Text

Rich text area (basic toolbar: bold, italic, links, lists)

Personalization chips: insert {{firstName}}, {{company}}, {{lastSeen}} at cursor

C. Preview & Test

Live preview pane rendering the body (treat as HTML)

Send test to me → mock API → success/error toast

D. Send Options

Send now or Schedule (date/time picker)

Confirm modal shows recipient count + active filters

E. Delivery Status (mock)

After “Send,” show queued → sending → done with counts (sent, failed)

Link stub: View campaign report

2) Tech & Conventions

Stack: Vanilla JS or React + Tailwind (your call; prefer React if faster)

Accessibility: Labels, focus states, aria-live for async updates

Performance: Keep bundle lean; no heavy libs for the WYSIWYG—simple toolbar is enough

No secrets, no .env, no vendor SDKs in client

Suggested structure (React):

src/
  components/
    ProspectsTable.tsx
    Filters.tsx
    Editor.tsx
    Preview.tsx
    SendBar.tsx
  pages/
    index.tsx
  lib/
    api.ts   // wraps fetch to mock endpoints
    utils.ts
public/
  assets/*

3) Local Setup
# install deps (if using React)
npm i
# dev
npm run dev


If using plain HTML/JS, keep everything in index.html + /js + /css and run with a simple static server.

4) Mock API (use these only)

Base URL (mock): https://mock.autol.ai/api
(If you prefer local mocks, see “Local Mock Option” below.)

GET /prospects?tag=&source=&opened=

200 Response

{
  "items": [
    {"id":"p1","firstName":"Ava","email":"ava@example.com","source":"JudyVA","tags":["beta"],"opened":true},
    {"id":"p2","firstName":"Liam","email":"liam@example.com","source":"PH","tags":["press"],"opened":false}
  ],
  "total": 2
}

POST /newsletter/test

Request

{
  "subject":"string",
  "previewText":"string",
  "bodyHtml":"<p>...</p>",
  "variables":["firstName","company"]
}


200 Response

{ "status":"ok" }

POST /newsletter/send

Request

{
  "segment": {"tag":"beta","opened":true},
  "recipientIds": ["p1","p2"],
  "subject": "string",
  "previewText": "string",
  "bodyHtml": "<p>...</p>",
  "schedule": {"when": "now", "at": "2025-08-20T15:00:00Z"}
}


200 Response

{ "campaignId": "cmp_123", "queued": 2 }

GET /newsletter/status?campaignId=cmp_123

200 Response

{ "sent": 2, "failed": 0, "state": "done" }


Error shape (any 4xx/5xx)

{ "error": "message" }

5) Local Mock Option (if you prefer)

If you don’t want to call the remote mock, you can run a local mock with json-server:

npm i -D json-server


Create mock/db.json:

{
  "prospects": [
    {"id":"p1","firstName":"Ava","email":"ava@example.com","source":"JudyVA","tags":["beta"],"opened":true},
    {"id":"p2","firstName":"Liam","email":"liam@example.com","source":"PH","tags":["press"],"opened":false}
  ],
  "newsletterTest": [],
  "newsletterSend": [],
  "status": [{"campaignId":"cmp_123","sent":2,"failed":0,"state":"done"}]
}


Run:

npx json-server --watch mock/db.json --port 5050


Then set Base URL to http://localhost:5050 and map:

GET /prospects → http://localhost:5050/prospects

For POSTs, just return success in UI (no need to persist); or create routes with routes.json if desired.

6) Required Element IDs (for quick review)
#prospectTable  #filterTag  #filterSource  #filterOpened
#subject  #fromName  #fromEmail  #previewText
#editor  #insertVarFirstName  #insertVarCompany  #insertVarLastSeen
#previewPanel  #sendTestBtn  #sendNowBtn  #scheduleBtn
#schedulePicker  #confirmSendModal  #statusToast

7) UX/States to Implement

Loading (table + buttons)

Empty (“No prospects match your filters”)

Error banners with retry

Success toasts (aria-live="polite")

Disabled buttons while requests are in flight

Preview updates live as you type and when variables are inserted

8) Validation

Subject and Body are required to enable Send

If zero recipients selected → disable Send and show hint

For Schedule, require a valid future datetime

9) Acceptance Criteria (PR will be reviewed against this)

 Responsive table + filters; select some/all recipients

 Compose form validation (Subject + Body required)

 Personalization chips insert variables at cursor into editor

 Live preview reflects variables with placeholders

 Send test and Send flows call mock endpoints; show success/error toasts

 Status view shows progress and final counts (mock polling or timed transitions)

 No console warnings/errors; accessible labels & focus states

 No secrets, no real vendor calls; only mock base URL

10) Security & Boundaries

❌ No API keys, .env, or vendor SDKs in client

❌ No direct calls to OpenAI/SendGrid/etc. from browser

❌ Do not modify repo structure without a PR discussion

11) Branch & PR Workflow
git checkout -b feature/newsletter-ui
# commit early/often with clear messages
git push -u origin feature/newsletter-ui


Open PR into dev

Request reviewer: Farhad

Address comments → squash & merge (Farhad merges)

12) Timeline

Start: on assignment

Dev complete: 2–4 days

Review: within 24 hours after PR

13) Quick QA (attach to PR)

Screenshots: mobile / tablet / desktop

Short Loom/GIF of: filter → compose → test → send → status

Note any limitations/TODOs

14) Future (FYI only, not part of this task)

Real delivery, unsubscribe handling, rate limits, and JudyVA list sync happen server-side later. Keep {{unsubscribeUrl}} visible in preview.
