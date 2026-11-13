import { db, sign, json } from './_lib';

const PI_ME = 'https://api.minepi.com/v2/me';
const APP_STUDIO_LOGIN = 'https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com/pi/auth/v1/login';

// Échange le jeton d'accès Pi contre une identité vérifiée par Pi App Studio, puis ouvre notre propre session.
// Seuls le uid et le nom renvoyés par App Studio font foi : rien venant du navigateur n'est cru.
export const handler = async (e: any) => {
  if (e.httpMethod !== 'POST') return json(405, { error: 'Méthode non autorisée' });
  let accessToken: string | undefined;
  try { accessToken = JSON.parse(e.body || '{}').accessToken; } catch { /* ignore */ }
  if (!accessToken || typeof accessToken !== 'string') return json(400, { error: 'Jeton manquant' });

  // 1) Vérification directe auprès de Pi (méthode officielle pour une application auto-hébergée) :
  //    le jeton d'accès de l'utilisateur est présenté à la Platform API, qui renvoie son uid et son nom.
  let uid = '', username = '';
  try {
    const pr = await fetch(PI_ME, { headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(10000) });
    console.log('auth: Pi /v2/me a répondu', pr.status);
    if (pr.ok) { const m: any = await pr.json().catch(() => null); if (typeof m?.uid === 'string' && typeof m?.username === 'string') { uid = m.uid; username = m.username; } }
  } catch (err) { console.error('auth: Pi injoignable', err instanceof Error ? err.message : 'erreur'); }

  // 2) Sinon, repli sur la vérification de Pi App Studio (ouverture depuis l'adresse App Studio).
  if (!uid || !username) {
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
    if (typeof me?.user?.uid !== 'string' || typeof me?.user?.username !== 'string' || !me.user.uid || !me.user.username) return json(502, { error: 'Réponse de vérification invalide' });
    uid = me.user.uid; username = me.user.username;
  }

  const { error } = await db().from('profiles').upsert({ pi_uid: uid, username }, { onConflict: 'pi_uid' });
  if (error) return json(500, { error: 'Profil non enregistré' });
  const { data: prof } = await db().from('profiles').select('role').eq('pi_uid', uid).single();
  return json(200, { token: sign(uid), username, role: prof?.role || 'user' });
};
