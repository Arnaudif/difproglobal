import { db, json } from './_lib';

// Prix publics des services (lecture seule). Le serveur relit toujours le prix en base au moment de la commande.
export const handler = async (e: any) => {
  if (e.httpMethod !== 'GET') return json(405, { error: 'Méthode non autorisée' });
  const { data, error } = await db().from('service_prices').select('service_id,price_pi,is_test');
  return error ? json(500, { error: 'Lecture impossible' }) : json(200, { prices: data });
};
