import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

export const db = () =>
  createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

export const json = (statusCode: number, body: unknown) => ({
  statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

const mac = (p: string) => createHmac('sha256', process.env.SESSION_SECRET!).update(p).digest();

export function sign(uid: string): string {
  const p = Buffer.from(JSON.stringify({ uid, exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
  return `${p}.${mac(p).toString('base64url')}`;
}

export function verify(header?: string): string | null {
  try {
    const [p, s] = (header || '').replace('Bearer ', '').split('.');
    if (!p || !s) return null;
    const given = Buffer.from(s, 'base64url'), want = mac(p);
    if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
    const d = JSON.parse(Buffer.from(p, 'base64url').toString());
    return d.exp > Date.now() / 1000 ? String(d.uid) : null;
  } catch { return null; }
}
