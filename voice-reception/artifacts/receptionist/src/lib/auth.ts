import { setAuthTokenGetter } from "@workspace/api-client-react";

const STORAGE_KEY = "mia_admin_token";

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEY, token);
  setAuthTokenGetter(() => token);
}

export function clearToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  setAuthTokenGetter(null);
}

export function initAuth(): void {
  const token = getStoredToken();
  if (token) {
    setAuthTokenGetter(() => token);
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: number }).status === 401
  );
}
