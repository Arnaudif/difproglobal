const BASE = '/.netlify/functions';
let token: string | null = sessionStorage.getItem('dpg_token');
export const setSession = (t: string | null, u?: string, role?: string) => {
  token = t;
  if (t) { sessionStorage.setItem('dpg_token', t); sessionStorage.setItem('dpg_user', u || ''); sessionStorage.setItem('dpg_role', role || 'user'); }
  else { sessionStorage.removeItem('dpg_token'); sessionStorage.removeItem('dpg_user'); sessionStorage.removeItem('dpg_role'); }
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
