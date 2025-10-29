const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

// Helper: Convert PascalCase (incl. acronyms like ID, URL) to camelCase
function toCamel(key: string): string {
  // If fully uppercase (e.g., "ID"), just lowercase it
  if (/^[A-Z0-9_]+$/.test(key)) {
    return key.toLowerCase();
  }
  // Split into words: handles PascalCase with acronym segments
  const parts = key.match(/[A-Z]+(?=[A-Z][a-z]|$)|[A-Z]?[a-z]+|\d+/g);
  if (!parts) return key;
  return parts
    .map((part, idx) => {
      if (idx === 0) return part.toLowerCase();
      // Make acronym parts like "ID" -> "Id"
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("");
}

// Helper to recursively normalize backend response keys to camelCase
function normalizeKeys(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj as null | undefined;

  if (Array.isArray(obj)) {
    return (obj as unknown[]).map((item) => normalizeKeys(item));
  }

  if (typeof obj === "object") {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      // Convert keys like ID -> id, UserID -> userId, CreatedAt -> createdAt
      const normalizedKey = toCamel(key);
      normalized[normalizedKey] = normalizeKeys(value);
    }
    return normalized;
  }

  return obj;
}

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

  const method = (opts.method || "GET").toString().toUpperCase();
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    let msg: string;
    try {
      const err = await res.json();
      msg = err?.error ?? res.statusText;
    } catch {
      msg = await res.text().catch(() => res.statusText);
    }
    throw new Error(`HTTP ${res.status} on ${method} ${path}: ${msg}`);
  }
  // 204 no content
  if (res.status === 204) {
    // @ts-expect-error - allow undefined for T when no content
    return undefined;
  }

  const data = await res.json();
  return normalizeKeys(data) as T;
}

export { API_BASE };

// Optional attachment upload helper (multipart/form-data)
// Uses NEXT_PUBLIC_UPLOAD_PATH_TEMPLATE if provided, e.g. "/complaints/{id}/attachments"
// Falls back to "/complaints/{id}/attachments" when not set.
export async function uploadAttachment(
  complaintId: string,
  file: File,
  token?: string
): Promise<unknown> {
  const template =
    process.env.NEXT_PUBLIC_UPLOAD_PATH_TEMPLATE ||
    "/complaints/{id}/attachments";
  const path = template.replace("{id}", complaintId);

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API_BASE}${path}`;
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    headers, // do NOT set Content-Type; the browser will set multipart boundary
    body: form,
  });

  if (!res.ok) {
    let msg: string;
    try {
      const err = await res.json();
      msg = err?.error ?? res.statusText;
    } catch {
      msg = await res.text().catch(() => res.statusText);
    }
    throw new Error(`HTTP ${res.status} on POST ${path}: ${msg}`);
  }

  // Some APIs may return metadata about the uploaded attachment
  // Normalize keys if JSON; otherwise return text
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = await res.json();
    return normalizeKeys(data);
  }
  return res.text();
}
