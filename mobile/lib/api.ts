// Emulator: 10.0.2.2  |  Physical device: your machine's local IP e.g. 192.168.1.x
export const BASE_URL = 'http://192.168.1.12:5000/api';

function extractError(data: any, fallback: string): string {
  if (data?.message) return data.message;
  if (Array.isArray(data?.errors) && data.errors.length > 0) return data.errors[0].msg;
  return fallback;
}

export async function login(email: string, password: string) {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error('Cannot reach server — check BASE_URL and that the backend is running');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data, 'Login failed'));
  return data;
}

export async function register(
  name: string,
  email: string,
  phoneNumber: string,
  password: string
) {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phoneNumber, password }),
    });
  } catch {
    throw new Error('Cannot reach server — check BASE_URL and that the backend is running');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data, 'Registration failed'));
  return data;
}

export async function postMessage(
  token: string,
  payload: {
    sender: string;
    amount: number;
    date?: string;
    additionalMessage?: string;
  }
) {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to post message');
  return data;
}
