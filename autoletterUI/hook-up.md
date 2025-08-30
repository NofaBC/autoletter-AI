# Backend Integration Guide

## Overview

This frontend connects to your backend API at the base URL configured in `src/lib/api.ts`. 

Currently set to mock: `https://mock.autol.ai/api`

## Required Endpoints

Your backend must implement these 4 endpoints exactly as specified:

### GET /prospects
Query parameters: `tag`, `source`, `opened` (all optional)

Returns:
```json
{
  "items": [
    {
      "id": "p1",
      "firstName": "Ava",
      "email": "ava@example.com",
      "source": "JudyVA",
      "tags": ["beta"],
      "opened": true
    }
  ],
  "total": 2
}
```

### POST /newsletter/test
Request body:
```json
{
  "subject": "string",
  "previewText": "string",
  "bodyHtml": "<p>...</p>",
  "variables": ["firstName", "company"]
}
```

Returns:
```json
{ "status": "ok" }
```

### POST /newsletter/send
Request body:
```json
{
  "segment": {"tag": "beta", "opened": true},
  "recipientIds": ["p1", "p2"],
  "subject": "string",
  "previewText": "string",
  "bodyHtml": "<p>...</p>",
  "schedule": {"when": "now" | "later", "at": "2025-08-20T15:00:00Z"}
}
```

Returns:
```json
{ "campaignId": "cmp_123", "queued": 2 }
```

### GET /newsletter/status
Query parameter: `campaignId`

Returns:
```json
{ "sent": 2, "failed": 0, "state": "done" }
```

States: `queued`, `sending`, `done`

## Error Format

All errors should return:
```json
{ "error": "message" }
```

## Configuration

### Production
Change the base URL in `src/lib/api.ts`:
```typescript
const BASE_URL = 'https://your-api.com/api';
```

### Development
Toggle mock API via localStorage:
- Enable: `localStorage.setItem('USE_MOCK_API', '1')`
- Disable: `localStorage.removeItem('USE_MOCK_API')`

## Variables

The frontend inserts these placeholders that your backend must replace:
- `{{firstName}}`
- `{{company}}`
- `{{lastSeen}}`

## Implementation Notes

1. The `schedule.at` field uses ISO 8601 format with timezone
2. The UI polls `/newsletter/status` every 2 seconds while state is not "done"
3. All HTML content is sanitized; your backend should preserve `href`, `target`, and `rel` attributes for links
4. The From Email field is read-only; populate it from your backend based on the authenticated user

## File Overview

### Core Files

**`src/lib/api.ts`**
- Where to change the API base URL
- All HTTP calls to your backend
- Handles errors and returns typed responses

**`src/lib/types.ts`**
- TypeScript definitions for all data structures
- If your backend uses different field names, update these interfaces

**`src/lib/mockApi.ts`**
- Fake backend for development
- Returns sample data without hitting real endpoints

### Components

**`src/components/ProspectsTable.tsx`**
- Displays the email list in a table
- Handles row selection and "Select All"
- Shows loading and empty states

**`src/components/Filters.tsx`**
- The three dropdown filters above the table
- Gets unique tags/sources from the prospects data
- The filter values come from your backend's prospect data - no hardcoding

**`src/components/Editor.tsx`**
- Newsletter composition area
- Rich text editor with bold/italic/link/list buttons
- Variable insertion buttons (firstName, company, lastSeen)
- To add new variables: add a new button that calls `insertVariable('yourVariable')`

**`src/components/Preview.tsx`**
- Shows how the newsletter will look
- Replaces variables with placeholder text
- Updates live as you type

**`src/components/SendBar.tsx`**
- Send/Schedule buttons
- Date/time picker for scheduling
- Confirmation modal
- Test send functionality

**`src/components/StatusView.tsx`**
- Shows after sending
- Displays queued → sending → done progression
- Shows sent/failed counts

### Hooks (Data Management)

**`src/hooks/useProspects.ts`**
- Fetches and filters the prospects list
- Handles loading/error states
- Updates when filters change

**`src/hooks/useNewsletterStatus.ts`**
- Polls for campaign status after sending
- Updates every 2 seconds
- Stops polling when state is "done"

### Common Modifications

**To add a new variable:**
1. In `Editor.tsx`, add a button in the "Insert Variables" section
2. Call `insertVariable('yourNewVariable')` on click
3. Update your backend to replace `{{yourNewVariable}}` when sending

**To add a new filter:**
1. Your backend needs to accept it as a query parameter
2. Add it to `ProspectFilters` interface in `types.ts`
3. Add the UI control in `Filters.tsx`
4. The `useProspects` hook will automatically include it

**To change what columns show in the table:**
1. Edit `ProspectsTable.tsx` headers (around line 105)
2. Edit `ProspectRow.tsx` to display the data (around line 27)
3. Ensure your backend returns the needed fields

**To modify the rich text editor:**
1. The toolbar buttons are in `Editor.tsx` (around line 218)
2. Text formatting uses browser's native `execCommand` via `src/lib/rte.ts`
3. Supported formats: bold, italic, links, bullet lists, numbered lists

**To change status polling frequency:**
1. In `useNewsletterStatus.ts`, change the interval (currently 2000ms on line 35)