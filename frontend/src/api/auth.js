const API_ORIGIN = "http://127.0.0.1:8000";
const TOKEN_KEY = "idiotspov-admin-token";

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function saveAuthToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || "The request failed.");
  }

  return data;
}

export function getRegistrationStatus() {
  return request("/api/auth/registration-status");
}

export async function registerAdmin(form) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function loginAdmin(username, password) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  saveAuthToken(data.access_token);
  return data;
}

export async function verifyAdminSession() {
  const token = getAuthToken();

  if (!token) return false;

  try {
    await request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch {
    clearAuthToken();
    return false;
  }
}

export async function logoutAdmin() {
  const token = getAuthToken();

  try {
    if (token) {
      await request("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } finally {
    clearAuthToken();
  }
}
