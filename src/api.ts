const BASE = '/.netlify/functions';
let token: string | null = sessionStorage.getItem('dpg_token');
export const setSession = (t: string | null, u?: string) => {
  token = t;
  if (t) { sessionStorage.setItem('dpg_token', t); sessionStorage.setItem('dpg_user', u || ''); }
  else { sessionStorage.removeItem('dpg_token'); sessionStorage.removeItem('dpg_user'); }
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
