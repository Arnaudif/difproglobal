import { db, sign, json } from './_lib';

// Vérifie le jeton Pi côté serveur (Platform API /me), puis ouvre une session applicative.
export const handler = async (e: any) => {
  if (e.httpMethod !== 'POST') return json(405, { error: 'Méthode non autorisée' });
  let accessToken: string | undefined;
  try { accessToken = JSON.parse(e.body || '{}').accessToken; } catch { /* ignore */ }
  if (!accessToken) return json(400, { error: 'Jeton manquant' });
  const r = await fetch('https://api.minepi.com/v2/me', { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) return json(401, { error: 'Identité Pi non vérifiée' });
  const me = await r.json();
  const { error } = await db().from('profiles').upsert({ pi_uid: me.uid, username: me.username }, { onConflict: 'pi_uid' });
  if (error) return json(500, { error: 'Profil non enregistré' });
  const { data: prof } = await db().from('profiles').select('role').eq('pi_uid', me.uid).single();
  return json(200, { token: sign(me.uid), username: me.username, role: prof?.role || 'user' });
};
