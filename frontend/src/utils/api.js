const BASE = 'http://localhost:5000/api'

const headers = (auth = false) => ({
  'Content-Type': 'application/json',
  ...(auth && { Authorization: `Bearer ${localStorage.getItem('bp_token')}` }),
})

export const api = {
  post: (path, body, auth = false) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: headers(auth),
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  get: (path) =>
    fetch(`${BASE}${path}`, { headers: headers(true) }).then((r) => r.json()),
}
