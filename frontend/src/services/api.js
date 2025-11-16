// Use Vite proxy during development by using a relative base.
const IS_DEV = import.meta.env.DEV;
const API_BASE = IS_DEV ? '' : (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api');
// log at module load to help debugging when dev server starts
/* eslint-disable no-console */
console.log('[frontend] DEV=', IS_DEV, 'API_BASE =', API_BASE);
/* eslint-enable no-console */







async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = text || res.statusText || `HTTP ${res.status}`;
    throw new Error(err);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}
export const apiPatch = async (endpoint, data = {}) => {
  try {
    const response = await axiosInstance.patch(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export async function apiGet(path, opts = {}) {
  // In dev we run behind Vite proxy which forwards '/api' to the backend.
  // Ensure dev requests are prefixed with '/api' so the proxy picks them up.
  const url = API_BASE
    ? (path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`)
    : (path.startsWith('/') ? (path.startsWith('/api') ? path : `/api${path}`) : `/api/${path}`);
  // When using Vite proxy (dev), requests are same-origin so credentials are 'same-origin'.
  const credentials = IS_DEV ? 'same-origin' : 'include';
  const res = await fetch(url, { method: 'GET', credentials, ...opts });
  return handleResponse(res);
}

export async function apiPost(path, body = {}, opts = {}) {
  const url = API_BASE
    ? (path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`)
    : (path.startsWith('/') ? (path.startsWith('/api') ? path : `/api${path}`) : `/api/${path}`);
  const credentials = IS_DEV ? 'same-origin' : 'include';
  const res = await fetch(url, {
    method: 'POST',
    credentials,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opts,
  });
  return handleResponse(res);
}

export async function apiPut(path, body = {}, opts = {}) {
  const url = API_BASE
    ? (path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`)
    : (path.startsWith('/') ? (path.startsWith('/api') ? path : `/api${path}`) : `/api/${path}`);
  const credentials = IS_DEV ? 'same-origin' : 'include';
  const res = await fetch(url, {
    method: 'PUT',
    credentials,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...opts,
  });
  return handleResponse(res);
}

export async function apiDelete(path, opts = {}) {
  const url = API_BASE
    ? (path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`)
    : (path.startsWith('/') ? (path.startsWith('/api') ? path : `/api${path}`) : `/api/${path}`);
  const credentials = IS_DEV ? 'same-origin' : 'include';
  const res = await fetch(url, { method: 'DELETE', credentials, ...opts });
  return handleResponse(res);
}


/**
 * Upload file
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with file
 * @returns {Promise} Response data
 */
export const apiUpload = async (endpoint, formData) => {
  try {
    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default { apiGet, apiPost, apiPut, apiDelete, apiUpload ,apiPatch};

