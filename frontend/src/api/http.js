export const API_BASE = "http://127.0.0.1:8000";

// get token from localStorage
export function getToken() {
  return localStorage.getItem("token");
}

// save token to localStorage
export function setToken(token) {
  if (token) localStorage.setItem("token", token);
}

// remove token
export function clearToken() {
  localStorage.removeItem("token");
}

export async function httpJson(path, options = {}) {
  const token = options.token || getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.error || data?.message || "Request Failed",
      payload: data,
    };
  }

  return data;
}
