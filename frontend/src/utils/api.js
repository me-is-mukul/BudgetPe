const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('bp_token')}`,
});

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
});

export const api = {
  post: (path, body, auth = false) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: auth ? authHeaders() : jsonHeaders(),
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  get: (path) =>
    fetch(`${BASE}${path}`, { headers: authHeaders() }).then((r) => r.json()),
};
