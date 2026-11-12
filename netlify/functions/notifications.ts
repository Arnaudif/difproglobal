import { db, json, verify } from './_lib';

export const handler = async (e: any) => {
  const uid = verify(e.headers.authorization || e.headers.Authorization);
  if (!uid) return json(401, { error: 'Connexion requise' });
  const sb = db();
  if (e.httpMethod === 'GET') {
    const { data, error } = await sb.from('notifications').select('id,title,read,created_at')
      .eq('pi_uid', uid).order('created_at', { ascending: false }).limit(50);
    return error ? json(500, { error: 'Lecture impossible' }) : json(200, { notifications: data });
  }
  if (e.httpMethod === 'POST') {
    let id: string | undefined;
    try { id = JSON.parse(e.body || '{}').id; } catch { /* ignore */ }
    if (!id) return json(400, { error: 'Identifiant manquant' });
    // Le filtre pi_uid empêche de modifier la notification d'un autre utilisateur.
    const { error } = await sb.from('notifications').update({ read: true }).eq('id', id).eq('pi_uid', uid);
    return error ? json(500, { error: 'Mise à jour impossible' }) : json(200, { ok: true });
  }
  return json(405, { error: 'Méthode non autorisée' });
};
