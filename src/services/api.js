const API_URL = (
  import.meta.env.VITE_API_URL || '/api'
).replace(/\/$/, '');

const SAFE_METHODS = new Set([
  'GET',
  'HEAD',
  'OPTIONS',
]);

let csrfToken = null;

async function request(path, options = {}) {
  const {
    headers: customHeaders = {},
    ...fetchOptions
  } = options;

  const method = String(
    fetchOptions.method || 'GET',
  ).toUpperCase();

  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...fetchOptions,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(
        csrfToken && !SAFE_METHODS.has(method)
          ? { 'X-CSRF-Token': csrfToken }
          : {}
      ),
      ...customHeaders,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(
      data.message || 'Error en la petición',
    );
  }

  return data;
}

export async function getSlots() {
  const res = await request('/slots');
  return res.data || [];
}

export async function updateSlotById(slotId, payload) {
  const res = await request(`/slots/${slotId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function getEntries(filters = {}) {
  const params = new URLSearchParams();

  if (filters.day) params.append('day', filters.day);
  if (filters.slotId) params.append('slotId', filters.slotId);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await request(`/entries${query}`);
  return res.data || [];
}

export async function createEntry(payload) {
  const res = await request('/entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function updateEntryById(entryId, payload) {
  const res = await request(`/entries/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function deleteEntryById(entryId) {
  const res = await request(`/entries/${entryId}`, {
    method: 'DELETE',
  });

  return res.data;
}

export async function deleteAllEntries() {
  const res = await request('/entries', {
    method: 'DELETE',
  });

  return res.data;
}

export async function getNovaRushSlots() {
  const res = await request('/novarush/slots');
  return res.data || [];
}

export async function updateNovaRushSlotById(slotId, payload) {
  const res = await request(`/novarush/slots/${slotId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function getNovaRushEntries(filters = {}) {
  const params = new URLSearchParams();

  if (filters.day) params.append('day', filters.day);
  if (filters.slotId) params.append('slotId', filters.slotId);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await request(`/novarush/entries${query}`);
  return res.data || [];
}

export async function createNovaRushEntry(payload) {
  const res = await request('/novarush/entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function updateNovaRushEntryById(entryId, payload) {
  const res = await request(`/novarush/entries/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function deleteNovaRushEntryById(entryId) {
  const res = await request(`/novarush/entries/${entryId}`, {
    method: 'DELETE',
  });

  return res.data;
}

export async function deleteAllNovaRushEntries() {
  const res = await request('/novarush/entries', {
    method: 'DELETE',
  });

  return res.data;
}

export async function getNovaEclipseSlots() {
  const res = await request('/novaeclipse/slots');
  return res.data || [];
}

export async function updateNovaEclipseSlotById(slotId, payload) {
  const res = await request(`/novaeclipse/slots/${slotId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function getNovaEclipseEntries(filters = {}) {
  const params = new URLSearchParams();

  if (filters.day) params.append('day', filters.day);
  if (filters.slotId) params.append('slotId', filters.slotId);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await request(`/novaeclipse/entries${query}`);
  return res.data || [];
}

export async function createNovaEclipseEntry(payload) {
  const res = await request('/novaeclipse/entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function updateNovaEclipseEntryById(entryId, payload) {
  const res = await request(`/novaeclipse/entries/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return res.data;
}

export async function deleteNovaEclipseEntryById(entryId) {
  const res = await request(`/novaeclipse/entries/${entryId}`, {
    method: 'DELETE',
  });

  return res.data;
}

export async function deleteAllNovaEclipseEntries() {
  const res = await request('/novaeclipse/entries', {
    method: 'DELETE',
  });

  return res.data;
}

export async function loginAdmin(payload) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  csrfToken = res.csrfToken || null;

  return res.user;
}

export async function logoutAdmin() {
  try {
    await request('/auth/logout', {
      method: 'POST',
    });
  } finally {
    csrfToken = null;
  }
}

export async function getCurrentUser() {
  try {
    const res = await request('/auth/me');

    csrfToken = res.csrfToken || null;

    return res.user;
  } catch {
    csrfToken = null;
    return null;
  }
}



