const BASE = '/api';
const mem: Record<string, string> = {};
export const storage = {
  get(k: string): string | null { try { return sessionStorage.getItem(k); } catch { return mem[k] ?? null; } },
  set(k: string, v: string) { try { sessionStorage.setItem(k, v); } catch { mem[k] = v; } },
  del(k: string) { try { sessionStorage.removeItem(k); } catch { delete mem[k]; } },
};
let token: string | null = storage.get('dpg_token');
export const storedUser = () => storage.get('dpg_user');
export const storedRole = () => storage.get('dpg_role') || 'user';
export const errMsg = (x: unknown) => (x instanceof Error ? x.message : 'Une erreur est survenue');

export const setSession = (t: string | null, u?: string, role?: string) => {
  token = t;
  if (t) { storage.set('dpg_token', t); storage.set('dpg_user', u || ''); storage.set('dpg_role', role || 'user'); }
  else { storage.del('dpg_token'); storage.del('dpg_user'); storage.del('dpg_role'); }
};

async function call(path: string, init: RequestInit = {}) {
  const r = await fetch(BASE + path, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Erreur réseau');
  return d;
}
export const login = (accessToken: string) => call('/auth', { method: 'POST', body: JSON.stringify({ accessToken }) });
export const listRequests = () => call('/requests');
export const createRequest = (b: object) => call('/requests', { method: 'POST', body: JSON.stringify(b) });
export const listNotifications = () => call('/notifications');
export const markRead = (id: string) => call('/notifications', { method: 'POST', body: JSON.stringify({ id }) });
export const adminList = () => call('/admin');
export const adminSetStatus = (reference: string, status: string) => call('/admin', { method: 'POST', body: JSON.stringify({ reference, status }) });
