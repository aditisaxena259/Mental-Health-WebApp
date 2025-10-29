export const TOKEN_KEY = "token";
export const ROLE_KEY = "role";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY);
}

export function setAuth(token: string, role: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}
