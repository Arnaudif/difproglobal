import { randomBytes } from 'node:crypto';
import { db, json, verify } from './_lib';

export const handler = async (e: any) => {
  const uid = verify(e.headers.authorization || e.headers.Authorization);
  if (!uid) return json(401, { error: 'Connexion requise' });
  const sb = db();
  if (e.httpMethod === 'GET') {
    const { data, error } = await sb.from('requests').select('reference,service,status,created_at')
      .eq('pi_uid', uid).order('created_at', { ascending: false });
    return error ? json(500, { error: 'Lecture impossible' }) : json(200, { requests: data });
  }
  if (e.httpMethod === 'POST') {
    let b: any;
    try { b = JSON.parse(e.body || '{}'); } catch { return json(400, { error: 'Données invalides' }); }
    const service = String(b.service || '').trim().slice(0, 120);
    const description = String(b.description || '').trim();
    const location = String(b.location || '').trim().slice(0, 120);
    const budget = String(b.budget || '').trim().slice(0, 60);
    if (!service || description.length < 10 || description.length > 2000)
      return json(400, { error: 'Service et description (10 à 2000 caractères) requis' });
    const reference = 'DPG-' + randomBytes(4).toString('hex').toUpperCase();
    const { error } = await sb.from('requests').insert({ reference, pi_uid: uid, service, description, location, budget });
    return error ? json(500, { error: 'Demande non enregistrée' }) : json(201, { reference });
  }
  return json(405, { error: 'Méthode non autorisée' });
};
