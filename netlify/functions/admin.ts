import { db, json, verify } from './_lib';

const STATUSES = ['received', 'in_review', 'quote_sent', 'accepted', 'done', 'refused'];
const LABELS: Record<string, string> = { received: 'reçue', in_review: 'en cours d’examen', quote_sent: 'devis envoyé', accepted: 'acceptée', done: 'terminée', refused: 'refusée' };

// Le rôle est relu en base à chaque appel : rien venant du navigateur ne donne de droits.
export const handler = async (e: any) => {
  const uid = verify(e.headers.authorization || e.headers.Authorization);
  if (!uid) return json(401, { error: 'Connexion requise' });
  const sb = db();
  const { data: me } = await sb.from('profiles').select('role').eq('pi_uid', uid).single();
  if (me?.role !== 'admin') return json(403, { error: 'Accès réservé aux administrateurs' });

  if (e.httpMethod === 'GET') {
    const { data, error } = await sb.from('requests')
      .select('reference,service,description,location,budget,status,created_at,profiles(username)')
      .order('created_at', { ascending: false }).limit(100);
    return error ? json(500, { error: 'Lecture impossible' }) : json(200, { requests: data });
  }
  if (e.httpMethod === 'POST') {
    let b: any;
    try { b = JSON.parse(e.body || '{}'); } catch { return json(400, { error: 'Données invalides' }); }
    if (!STATUSES.includes(b.status) || typeof b.reference !== 'string') return json(400, { error: 'Statut ou référence invalide' });
    const { data: reqRow, error } = await sb.from('requests').update({ status: b.status })
      .eq('reference', b.reference).select('pi_uid,reference').single();
    if (error || !reqRow) return json(404, { error: 'Demande introuvable' });
    await sb.from('notifications').insert({ pi_uid: reqRow.pi_uid, title: `Votre demande ${reqRow.reference} est ${LABELS[b.status]}` });
    await sb.from('admin_logs').insert({ admin_uid: uid, action: `status:${b.status}`, target: reqRow.reference });
    return json(200, { ok: true });
  }
  return json(405, { error: 'Méthode non autorisée' });
};
