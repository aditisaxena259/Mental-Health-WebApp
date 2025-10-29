# Mental Health Backend – Next.js Integration Guide

This guide documents how to integrate the Go/Fiber backend with a Next.js frontend.

## Base URL and CORS

- Local backend base URL: `http://localhost:8080/api`
- CORS is configured to allow `http://localhost:3000`

## Authentication

- Public endpoints: no token required.
- Protected endpoints: send `Authorization: Bearer <JWT>` header.
- Obtain the token from `POST /api/login` (response JSON includes `token`).
- The server also sets an HTTP-only cookie, but the middleware expects the Bearer token header for auth.

Recommended in Next.js:

- Store the token in memory/state or secure storage (avoid localStorage if possible, or scope it carefully).
- Attach the token to each protected request in the `Authorization` header.

## Environment variables (Next.js)

Create `.env.local` in your Next.js app:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Use it via `process.env.NEXT_PUBLIC_API_BASE_URL`.

## Enums and Types

Complaint type values (exact, case-sensitive):

- `roommate` | `plumbing` | `cleanliness` | `electricity` | `Lost and Found` | `Other Issues`

Complaint status values:

- `open` | `inprogress` | `resolved`

Apology type values:

- `outing` | `misconduct` | `miscellaneous`

Apology status values:

- `submitted` | `reviewed` | `accepted` | `rejected`

### Suggested TypeScript types (frontend)

```ts
export type Role = "student" | "admin" | "counselor";

export type ComplaintType =
  | "roommate"
  | "plumbing"
  | "cleanliness"
  | "electricity"
  | "Lost and Found"
  | "Other Issues";

export type ComplaintStatus = "open" | "inprogress" | "resolved";

export type ApologyType = "outing" | "misconduct" | "miscellaneous";
export type ApologyStatus = "submitted" | "reviewed" | "accepted" | "rejected";

export interface LoginResponse {
  message: string;
  token: string;
  role: Role;
}
```

## API Endpoints

Base URL for all below: `${NEXT_PUBLIC_API_BASE_URL}` (defaults to `http://localhost:8080/api`).

Each endpoint lists: method, path, auth requirements, parameters/body, and a minimal fetch example.

---

### 1) Signup (Public)

- Method: POST
- Path: `/signup`
- Auth: none
- Body (JSON):
  - `name`: string
  - `email`: string
  - `password`: string
  - `role`: `student` | `admin` | `counselor`
- Response: `{ message: "User created successfully" }`

Example:

```ts
await fetch(`${API}/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, password, role }),
});
```

### 2) Login (Public)

- Method: POST
- Path: `/login`
- Auth: none
- Body (JSON):
  - `email`: string
  - `password`: string
- Response (JSON): `{ message, token, role }`

Example:

```ts
const res = await fetch(`${API}/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data: LoginResponse = await res.json();
// Save data.token for subsequent requests
```

### 3) Logout (Public)

- Method: POST
- Path: `/logout`
- Auth: none
- Body: none
- Response: `{ message: "Logged out successfully" }`

---

## Protected routes (JWT required)

For all routes below, include header:

```
Authorization: Bearer <token>
```

### Student routes

#### 4) Create Complaint

- Method: POST
- Path: `/student/complaints`
- Role: `student`
- Body (JSON):
  - `title`: string
  - `type`: ComplaintType
  - `description`: string
- Response: `{ message: "Complaint submitted successfully" }`

Example:

```ts
await fetch(`${API}/student/complaints`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ title, type, description }),
});
```

#### 5) List My Complaints

- Method: GET
- Path: `/student/complaints`
- Role: `student`
- Response (JSON): `{ count: number, data: Complaint[] }`

Example:

```ts
const res = await fetch(`${API}/student/complaints`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
```

#### 6) Submit Apology

- Method: POST
- Path: `/student/apologies`
- Role: `student`
- Body (JSON):
  - `student_id`: string (UUID) ← required by current backend
  - `type`: ApologyType
  - `message`: string
  - `description`?: string
- Response: `{ message: "Apology letter submitted successfully" }`

Example:

```ts
await fetch(`${API}/student/apologies`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ student_id, type, message, description }),
});
```

#### 7) List My Apologies

- Method: GET
- Path: `/student/apologies`
- Role: `student`
- Query: `?student_id=<UUID>`
- Response: `Apology[]`

Example:

```ts
const res = await fetch(`${API}/student/apologies?student_id=${studentId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await res.json();
```

### Admin routes

#### 8) Update Complaint Status

- Method: PUT
- Path: `/admin/complaints/:id/status`
- Role: `admin`
- Params: `id` (complaint UUID)
- Body (JSON):
  - `status`: ComplaintStatus
- Response: `{ message: "Status updated" }`

Example:

```ts
await fetch(`${API}/admin/complaints/${complaintId}/status`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ status: "inprogress" }),
});
```

#### 9) Delete Complaint

- Method: DELETE
- Path: `/admin/complaints/:id`
- Role: `admin`
- Params: `id` (complaint UUID)
- Response: `{ message: "Complaint deleted successfully" }`

Example:

```ts
await fetch(`${API}/admin/complaints/${complaintId}`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${token}` },
});
```

#### 10) Review Apology

- Method: PUT
- Path: `/admin/apologies/:id/review`
- Role: `admin`
- Params: `id` (apology UUID)
- Body (JSON):
  - `comment`: string
  - `status`: ApologyStatus
- Response: `Apology` (updated)

Example:

```ts
await fetch(`${API}/admin/apologies/${apologyId}/review`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ comment, status: "accepted" }),
});
```

### Shared routes (any authenticated role)

#### 11) Status Summary

- Method: GET
- Path: `/metrics/status-summary`
- Response (JSON): `{ open, inprogress, resolved, total }`

```ts
const res = await fetch(`${API}/metrics/status-summary`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

#### 12) Resolution Rate

- Method: GET
- Path: `/metrics/resolution-rate`
- Response (JSON): `{ resolution_rate: number }` (percentage)

```ts
const res = await fetch(`${API}/metrics/resolution-rate`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

#### 13) Pending Count

- Method: GET
- Path: `/metrics/pending-count`
- Response (JSON): `{ pending_count: number }` (counts `open` complaints)

```ts
const res = await fetch(`${API}/metrics/pending-count`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

#### 14) Add Timeline Entry

- Method: POST
- Path: `/complaints/:id/timeline`
- Params: `id` (complaint UUID)
- Body (JSON):
  - `message`: string
- Response: `TimelineEntry` (created)

```ts
await fetch(`${API}/complaints/${complaintId}/timeline`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ message }),
});
```

#### 15) Get Timeline

- Method: GET
- Path: `/complaints/:id/timeline`
- Params: `id` (complaint UUID)
- Response: `TimelineEntry[]` (ascending by timestamp)

```ts
const res = await fetch(`${API}/complaints/${complaintId}/timeline`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

## Suggested API helper (frontend)

```ts
const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export async function api<T>(
  path: string,
  opts: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`HTTP ${res.status}: ${msg}`);
  }
  return res.status === 204 ? (undefined as unknown as T) : res.json();
}
```

## Error handling

Common status codes:

- 400: invalid input
- 401: missing/invalid token
- 403: insufficient role
- 404: not found
- 500: server error

Parse error JSON when present: `{ error: string, details?: string }`.

## Notes & gotchas

- For student apology endpoints, `student_id` must be provided explicitly even though the user is authenticated as a student (current backend behavior).
- Complaint types include values with spaces; ensure UI uses exact strings.
- Some controller utilities exist but are not routed (e.g., get single complaint by ID); only the endpoints listed here are exposed.
- Cookies are set on login, but the middleware authorizes via Bearer token header—make sure to include it on protected calls.

## Quick integration checklist

- [ ] Add `NEXT_PUBLIC_API_BASE_URL` to your Next.js `.env.local`.
- [ ] Build a login form that saves `token` + `role` from `/login`.
- [ ] Create a request helper that sets `Authorization: Bearer <token>`.
- [ ] Implement student flows: create/list complaints, submit/list apologies.
- [ ] Implement admin flows: update/delete complaints, review apologies.
- [ ] Read metrics for dashboard cards.
- [ ] Wire timeline add/view in complaint detail.
