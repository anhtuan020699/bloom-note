import { CATEGORIES, TEMPLATES, MUSIC_LIBRARY } from '@shared/templates.js';

const LS_KEY = 'tiemhoa:cards';
let offline = null;
const listeners = new Set();

const setOffline = (value) => {
  if (offline === value) return;
  offline = value;
  listeners.forEach((fn) => fn(value));
};

export const onOfflineChange = (fn) => {
  listeners.add(fn);
  if (offline !== null) fn(offline);
  return () => listeners.delete(fn);
};
export const isOffline = () => offline === true;

class ApiError extends Error {}

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const env = process.env.NEXT_PUBLIC_API_URL;
  if (env) return `${String(env).replace(/\/$/, '')}${p}`;
  return p;
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(apiUrl(path), {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });
  } catch {
    setOffline(true);
    throw new ApiError('Không kết nối được máy chủ.');
  }
  const isJson = res.headers.get('content-type')?.includes('application/json');
  if (!isJson) {
    // Static demo hosting (no backend) returns index.html for /api/*.
    setOffline(true);
    throw new ApiError('Không kết nối được máy chủ.');
  }
  setOffline(false);
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || 'Có lỗi xảy ra.');
  return data;
}

async function withFallback(online, local) {
  if (offline === true) return local();
  try {
    return await online();
  } catch (err) {
    if (err instanceof TypeError) return local();
    throw err;
  }
}

// ---------- localStorage fallback ----------
const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
};
const writeLocal = (cards) => localStorage.setItem(LS_KEY, JSON.stringify(cards));

const slugify = (s) =>
  (s || 'thiep').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'thiep';
const rand = () => Math.random().toString(16).slice(2, 8);

const local = {
  list: () => readLocal().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  get(key) {
    const card = readLocal().find((c) => c.id === key || c.slug === key);
    if (!card) throw new ApiError('Không tìm thấy thiệp (bản demo chỉ lưu trên trình duyệt này).');
    return card;
  },
  create(data) {
    if (!data.recipientName?.trim()) throw new ApiError('Vui lòng nhập tên người nhận.');
    const now = new Date().toISOString();
    const card = { ...data, id: crypto.randomUUID(), slug: `${slugify(data.recipientName)}-${rand()}`, views: 0, createdAt: now, updatedAt: now };
    writeLocal([...readLocal(), card]);
    return card;
  },
  update(id, data) {
    const cards = readLocal();
    const i = cards.findIndex((c) => c.id === id);
    if (i < 0) throw new ApiError('Không tìm thấy thiệp.');
    cards[i] = { ...cards[i], ...data, id, updatedAt: new Date().toISOString() };
    writeLocal(cards);
    return cards[i];
  },
  remove(id) {
    writeLocal(readLocal().filter((c) => c.id !== id));
    return { ok: true };
  },
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export async function resizeImage(file, max = 1200, quality = 0.85) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- public API ----------
export const api = {
  catalog: () => withFallback(
    () => request('/api/catalog'),
    () => ({ categories: CATEGORIES, templates: TEMPLATES, music: MUSIC_LIBRARY, db: 'localStorage' }),
  ),
  categories: () => withFallback(() => request('/api/categories'), () => CATEGORIES),
  templates: () => withFallback(() => request('/api/templates'), () => TEMPLATES),
  music: () => withFallback(() => request('/api/music'), () => MUSIC_LIBRARY),
  meta: () => withFallback(() => request('/api/meta'), () => ({ db: 'localStorage', lanAddresses: [] })),

  listCards: () => withFallback(() => request('/api/cards'), () => local.list()),
  getCard: (key, { countView = false } = {}) =>
    withFallback(() => request(`/api/cards/${encodeURIComponent(key)}${countView ? '?view=1' : ''}`), () => local.get(key)),
  createCard: (data) =>
    withFallback(() => request('/api/cards', { method: 'POST', body: JSON.stringify(data) }), () => local.create(data)),
  updateCard: (id, data) =>
    withFallback(() => request(`/api/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }), () => local.update(id, data)),
  deleteCard: (id) =>
    withFallback(() => request(`/api/cards/${id}`, { method: 'DELETE' }), () => local.remove(id)),

  async uploadPhoto(file) {
    return withFallback(
      () => {
        const fd = new FormData();
        fd.append('file', file);
        return request('/api/upload/photo', { method: 'POST', body: fd });
      },
      async () => ({ url: await resizeImage(file), name: file.name }),
    );
  },
  adminLogin: (username, password) =>
    request('/api/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  adminLogout: () =>
    request('/api/admin/logout', { method: 'POST', headers: adminHeaders() }),
  adminSession: () => request('/api/admin/session', { headers: adminHeaders() }),
  health: () => request('/api/health'),

  createCategory: (data) =>
    request('/api/categories', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(data) }),
  updateCategory: (id, data) =>
    request(`/api/categories/${encodeURIComponent(id)}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(data) }),
  deleteCategory: (id) =>
    request(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE', headers: adminHeaders() }),

  createTemplate: (data) =>
    request('/api/templates', { method: 'POST', headers: adminHeaders(), body: JSON.stringify(data) }),
  updateTemplate: (id, data) =>
    request(`/api/templates/${encodeURIComponent(id)}`, { method: 'PUT', headers: adminHeaders(), body: JSON.stringify(data) }),
  deleteTemplate: (id) =>
    request(`/api/templates/${encodeURIComponent(id)}`, { method: 'DELETE', headers: adminHeaders() }),

  async uploadMusic(file) {
    return withFallback(
      () => {
        const fd = new FormData();
        fd.append('file', file);
        return request('/api/upload/music', { method: 'POST', body: fd });
      },
      async () => {
        if (file.size > 3 * 1024 * 1024) {
          throw new ApiError('Chế độ demo (không có server) chỉ nhận file nhạc dưới 3MB. Hãy chạy backend hoặc dán link nhạc.');
        }
        return { url: await fileToDataUrl(file), name: file.name };
      },
    );
  },
};

export async function shareBaseUrl() {
  const { protocol, hostname, port, origin } = window.location;
  if (!['localhost', '127.0.0.1'].includes(hostname)) return origin;
  try {
    const meta = await api.meta();
    if (meta.publicBaseUrl) return meta.publicBaseUrl.replace(/\/$/, '');
    const ip = meta.lanAddresses?.[0];
    if (ip) return `${protocol}//${ip}${port ? `:${port}` : ''}`;
  } catch { /* ignore */ }
  return origin;
}

export const cardUrl = (base, card) => `${base}/card/${card.slug}`;

const ADMIN_KEY = 'bloomnote:admin-token';
const ADMIN_COOKIE = 'bloomnote-admin';

const readCookie = () => {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(/(?:^|; )bloomnote-admin=([^;]*)/);
  return m ? decodeURIComponent(m[1]) : '';
};

export const adminToken = {
  get: () => {
    try { return sessionStorage.getItem(ADMIN_KEY) || readCookie() || ''; } catch { return readCookie(); }
  },
  set: (token) => {
    try {
      if (token) sessionStorage.setItem(ADMIN_KEY, token);
      else sessionStorage.removeItem(ADMIN_KEY);
    } catch { /* ignore */ }
    if (typeof document === 'undefined') return;
    document.cookie = token
      ? `${ADMIN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${12 * 60 * 60}; samesite=lax`
      : `${ADMIN_COOKIE}=; path=/; max-age=0`;
  },
};
const adminHeaders = () => {
  const token = adminToken.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
