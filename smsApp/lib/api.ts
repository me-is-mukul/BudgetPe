import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

function hostFromUri(value?: string | null): string | null {
  if (!value) return null;
  const withoutProtocol = value.replace(/^https?:\/\//, '');
  const host = withoutProtocol.split(':')[0];
  return host || null;
}

function normalizeHost(host: string): string {
  const trimmed = host.trim();
  const isAndroidEmulator = Platform.OS === 'android' && Constants.isDevice === false;
  if (isAndroidEmulator && (trimmed === 'localhost' || trimmed === '127.0.0.1')) {
    return '10.0.2.2';
  }
  return trimmed;
}

function getHostFromExpo(): string | null {
  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  const metroHost = hostFromUri(scriptURL);
  if (metroHost) return normalizeHost(metroHost);

  const debuggerHost = hostFromUri(Constants.expoGoConfig?.debuggerHost);
  if (debuggerHost) return normalizeHost(debuggerHost);

  const hostUri = hostFromUri(Constants.expoConfig?.hostUri);
  if (hostUri) return normalizeHost(hostUri);

  const manifestHost = hostFromUri((Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost);
  if (manifestHost) return normalizeHost(manifestHost);

  return null;
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function getBaseUrl(): string {
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBase) return trimSlash(envBase);

  if (!__DEV__) return 'https://your-production-url.com/api';

  const host = getHostFromExpo();
  if (host) return `http://${host}:5000/api`;

  return 'http://127.0.0.1:5000/api';
}

function getMlUrl(): string {
  const envMl = process.env.EXPO_PUBLIC_ML_URL;
  if (envMl) return trimSlash(envMl);

  if (!__DEV__) return 'https://your-production-url.com/ml';

  const host = getHostFromExpo();
  if (host) return `http://${host}:5001`;

  return 'http://127.0.0.1:5001';
}

export const BASE_URL = getBaseUrl();
export const ML_URL = getMlUrl();

if (__DEV__) {
  console.log('[API] Resolved endpoints:', { host: getHostFromExpo(), BASE_URL, ML_URL });
}

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
    throw new Error(`Cannot reach server at ${BASE_URL}. Set EXPO_PUBLIC_API_BASE_URL if needed.`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data, 'Login failed'));
  return data as { token: string; user: { id: string; name: string; email: string; phoneNumber: string } };
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
    throw new Error(`Cannot reach server at ${BASE_URL}. Set EXPO_PUBLIC_API_BASE_URL if needed.`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data, 'Registration failed'));
  return data as { token: string; user: { id: string; name: string; email: string; phoneNumber: string } };
}

export type ClassifyResult = { category: string; amount: number; date: string; receiver?: string };

export async function classifyMessage(body: string): Promise<ClassifyResult | null> {
  let res: Response;
  try {
    console.log('[API] Calling ML Model at:', ML_URL, 'with message:', body.substring(0, 100));
    res = await fetch(`${ML_URL}/model/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg: body }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[API] ML Model unreachable:', msg);
    throw new Error(`Cannot reach ML model at ${ML_URL}. Set EXPO_PUBLIC_ML_URL if needed.`);
  }
  
  if (res.status === 400) {
    console.log('[API] ML Model returned 400: Not a valid bank debit message');
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    console.error('[API] ML Model error:', res.status, text);
    throw new Error('ML model returned an unexpected error.');
  }
  
  const data = await res.json() as ClassifyResult;
  console.log('[API] ML Model classification:', data);
  return data;
}

export async function postMessage(
  token: string,
  payload: { category: string; amount: number; date?: string; originalText?: string; receiver?: string }
) {
  console.log('[API] Posting message to Backend:', {
    url: `${BASE_URL}/messages`,
    category: payload.category,
    amount: payload.amount,
    originalText: payload.originalText?.substring(0, 50),
    receiver: payload.receiver,
  });
  
  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      category: payload.category,
      amount: payload.amount,
      date: payload.date,
      originalText: payload.originalText || "",
      receiver: payload.receiver || "",
    }),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    console.error('[API] Backend error:', res.status, data);
    throw new Error(data.message || 'Failed to save message');
  }
  
  console.log('[API] Backend response:', data);
  return data;
}
