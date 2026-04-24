import { removeToken, removeUser } from './auth'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('bp_token')}`,
});

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
});

const parseBody = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  try {
    const text = await response.text()
    return text ? { message: text } : null
  } catch {
    return null
  }
}

const handleResponse = async (response) => {
  const payload = await parseBody(response)

  if (!response.ok) {
    if (response.status === 401) {
      removeToken()
      removeUser()
    }

    const err = new Error(payload?.message || `Request failed with status ${response.status}`)
    err.status = response.status
    err.payload = payload
    throw err
  }

  return payload ?? {}
}

export const api = {
  post: (path, body, auth = false) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: auth ? authHeaders() : jsonHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  get: (path) =>
    fetch(`${BASE}${path}`, { headers: authHeaders() }).then(handleResponse),
};
