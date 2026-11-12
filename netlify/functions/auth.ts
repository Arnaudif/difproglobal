import { db, sign, json } from './_lib';

const APP_STUDIO_LOGIN = 'https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login';

// Échange le jeton d'accès Pi contre une identité vérifiée par Pi App Studio, puis ouvre notre propre session.
// Seuls le uid et le nom renvoyés par App Studio font foi : rien venant du navigateur n'est cru.
export const handler = async (e: any) => {
  if (e.httpMethod !== 'POST') return json(405, { error: 'Méthode non autorisée' });
  let accessToken: string | undefined;
  try { accessToken = JSON.parse(e.body || '{}').accessToken; } catch { /* ignore */ }
  if (!accessToken || typeof accessToken !== 'string') return json(400, { error: 'Jeton manquant' });

  let r: Response;
  try {
    r = await fetch(APP_STUDIO_LOGIN, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken }), signal: AbortSignal.timeout(10000),
    });
  } catch (err) { console.error('auth: App Studio injoignable', err instanceof Error ? err.message : 'erreur'); return json(502, { error: 'Service de vérification Pi indisponible, réessayez.' }); }
  console.log('auth: App Studio a répondu', r.status);
  if (r.status === 401 || r.status === 403) return json(401, { error: 'Identité Pi non vérifiée' });
  if (!r.ok) return json(502, { error: 'Vérification Pi impossible, réessayez.' });

  const me: any = await r.json().catch(() => null);
  const uid = me?.user?.uid, username = me?.user?.username;
  if (typeof uid !== 'string' || typeof username !== 'string' || !uid || !username) return json(502, { error: 'Réponse de vérification invalide' });

  const { error } = await db().from('profiles').upsert({ pi_uid: uid, username }, { onConflict: 'pi_uid' });
  if (error) return json(500, { error: 'Profil non enregistré' });
  const { data: prof } = await db().from('profiles').select('role').eq('pi_uid', uid).single();
  return json(200, { token: sign(uid), username, role: prof?.role || 'user' });
};
