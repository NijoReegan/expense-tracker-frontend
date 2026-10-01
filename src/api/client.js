const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'et_token';
const USER_KEY = 'et_user';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function storeSession({ token, user }) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // storage unavailable; session survives for this page load only
  }
}

export function clearSession() {
  storeSession({ token: null, user: null });
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const user = JSON.parse(raw);
      if (user && user.id) return user;
    }
  } catch {
    // corrupted or unavailable storage
  }
  return null;
}

export function updateStoredUser(data) {
  if (!data || !data.id) return null;
  const current = getCurrentUser() || {};
  const merged = { ...current, ...data };
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
  } catch {
    // storage unavailable
  }
  return merged;
}

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Unable to reach the server. Please make sure the backend is running.', 0, null);
  }

  const json = await readJson(res);

  if (res.status === 401 && token) {
    clearSession();
    window.dispatchEvent(new Event('et:unauthorized'));
  }

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) || `Request failed with status ${res.status}.`;
    throw new ApiError(message, res.status, json);
  }

  return { data: json };
}

export function relativeTime(iso) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};