import { randomBytes } from 'node:crypto';
import { db, json, verify } from './_lib';

export const handler = async (e: any) => {
  const uid = verify(e.headers.authorization || e.headers.Authorization);
  if (!uid) return json(401, { error: 'Connexion requise' });
  const sb = db();
  if (e.httpMethod === 'GET') {
    const { data, error } = await sb.from('requests').select('reference,service,status,created_at,amount_pi,payment_status')
      .eq('pi_uid', uid).order('created_at', { ascending: false });
    return error ? json(500, { error: 'Lecture impossible' }) : json(200, { requests: data });
  }
  if (e.httpMethod === 'POST') {
    let b: any;
    try { b = JSON.parse(e.body || '{}'); } catch { return json(400, { error: 'Données invalides' }); }
    const direct = typeof b.serviceId === 'string' && b.serviceId ? b.serviceId : '';
    const service = String(b.service || '').trim().slice(0, 120);
    const description = String(b.description || '').trim();
    const location = String(b.location || '').trim().slice(0, 120);
    const budget = String(b.budget || '').trim().slice(0, 60);
    if (!direct && (!service || description.length < 10 || description.length > 2000))
      return json(400, { error: 'Service et description (10 à 2000 caractères) requis' });
    // Plafond anti-abus : 10 demandes par utilisateur et par 24 h.
    const since = new Date(Date.now() - 86400000).toISOString();
    const { count } = await sb.from('requests').select('id', { count: 'exact', head: true }).eq('pi_uid', uid).gte('created_at', since);
    if ((count ?? 0) >= 10) return json(429, { error: 'Limite de 10 demandes par jour atteinte. Réessayez demain.' });
    const reference = 'DPG-' + randomBytes(4).toString('hex').toUpperCase();
    if (direct) {
      // Commande directe : le service et le prix viennent de la base, jamais du navigateur.
      const { data: price } = await sb.from('service_prices').select('service_name,price_pi').eq('service_id', direct).single();
      if (!price) return json(404, { error: 'Service introuvable' });
      const { error: e2 } = await sb.from('requests').insert({ reference, pi_uid: uid, service: price.service_name, description: 'Commande directe depuis la fiche du service.', amount_pi: price.price_pi });
      return e2 ? json(500, { error: 'Commande non enregistrée' }) : json(201, { reference, amount_pi: price.price_pi });
    }
    const { error } = await sb.from('requests').insert({ reference, pi_uid: uid, service, description, location, budget });
    return error ? json(500, { error: 'Demande non enregistrée' }) : json(201, { reference });
  }
  return json(405, { error: 'Méthode non autorisée' });
};
