import { db, json, verify } from './_lib';

const PI = 'https://api.minepi.com/v2/payments';
const key = () => process.env.PI_API_KEY || process.env.PI_NETWORK_API_KEY || '';

// Appels serveur vers l'API Pi (clé d'application, jamais exposée au navigateur).
async function pi(path: string, method: 'GET' | 'POST' = 'GET', body?: object) {
  const r = await fetch(PI + path, {
    method, signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Key ${key()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data: any = await r.json().catch(() => null);
  if (!r.ok) {
    // Message d'erreur de Pi (sans secret) pour le diagnostic.
    console.error('payments: API Pi', method, path.replace(/^\/[^/]+/, '/{id}'), r.status, String(data?.error || ''), String(data?.error_message || data?.message || '').slice(0, 200));
    throw new Error('pi_' + r.status);
  }
  return data;
}

// Le montant, le client et la demande viennent de la base et de Pi, jamais du navigateur.
async function check(sb: ReturnType<typeof db>, uid: string, payment: any) {
  const reference = String(payment?.metadata?.reference || '');
  const { data: reqRow } = await sb.from('requests').select('reference,pi_uid,amount_pi,payment_status,status').eq('reference', reference).single();
  if (!reqRow || reqRow.pi_uid !== uid) throw new Error('Demande introuvable');
  if (payment.user_uid && payment.user_uid !== uid) throw new Error('Paiement d’un autre compte');
  if (reqRow.payment_status === 'paid') throw new Error('Cette demande est déjà payée');
  if (!reqRow.amount_pi || Math.abs(Number(payment.amount) - Number(reqRow.amount_pi)) > 1e-7) throw new Error('Montant incorrect');
  return reqRow;
}

async function finish(sb: ReturnType<typeof db>, uid: string, paymentId: string) {
  const payment = await pi('/' + encodeURIComponent(paymentId));
  const reqRow = await check(sb, uid, payment);
  const txid = payment?.transaction?.txid;
  if (!txid) throw new Error('Transaction non trouvée');
  if (!payment?.status?.developer_completed) await pi(`/${encodeURIComponent(paymentId)}/complete`, 'POST', { txid });
  const now = new Date().toISOString();
  await sb.from('payments').update({ status: 'completed', txid, updated_at: now }).eq('payment_id', paymentId);
  await sb.from('requests').update({ payment_status: 'paid', paid_at: now }).eq('reference', reqRow.reference);
  await sb.from('notifications').insert({ pi_uid: uid, title: `Paiement reçu pour la demande ${reqRow.reference}. Merci !` });
}

export const handler = async (e: any) => {
  const uid = verify(e.headers.authorization || e.headers.Authorization);
  if (!uid) return json(401, { error: 'Connexion requise' });
  if (e.httpMethod !== 'POST') return json(405, { error: 'Méthode non autorisée' });
  if (!key()) return json(503, { error: 'Paiements non configurés sur le serveur' });
  let b: any;
  try { b = JSON.parse(e.body || '{}'); } catch { return json(400, { error: 'Données invalides' }); }
  const paymentId = String(b.paymentId || '');
  if (!/^[\w-]{6,100}$/.test(paymentId)) return json(400, { error: 'Paiement invalide' });
  const sb = db();
  try {
    if (b.action === 'approve') {
      const payment = await pi('/' + encodeURIComponent(paymentId));
      const reqRow = await check(sb, uid, payment);
      await sb.from('payments').upsert({ payment_id: paymentId, reference: reqRow.reference, pi_uid: uid, amount: reqRow.amount_pi, status: 'approved', updated_at: new Date().toISOString() }, { onConflict: 'payment_id' });
      await sb.from('requests').update({ payment_status: 'pending' }).eq('reference', reqRow.reference);
      await pi(`/${encodeURIComponent(paymentId)}/approve`, 'POST');
      return json(200, { ok: true });
    }
    if (b.action === 'complete') { await finish(sb, uid, paymentId); return json(200, { ok: true }); }
    if (b.action === 'incomplete') {
      // Paiement resté ouvert : on le termine s'il a une transaction, sinon on l'annule.
      const payment = await pi('/' + encodeURIComponent(paymentId));
      if (payment?.transaction?.txid) { await finish(sb, uid, paymentId); return json(200, { ok: true, completed: true }); }
      const reference = String(payment?.metadata?.reference || '');
      const { data: mine } = await sb.from('requests').select('reference').eq('reference', reference).eq('pi_uid', uid).single();
      if (!mine) return json(404, { error: 'Demande introuvable' });
      await pi(`/${encodeURIComponent(paymentId)}/cancel`, 'POST');
      await sb.from('payments').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('payment_id', paymentId);
      await sb.from('requests').update({ payment_status: 'none' }).eq('reference', reference).eq('payment_status', 'pending');
      return json(200, { ok: true, cancelled: true });
    }
    if (b.action === 'cancel') {
      const { data: p } = await sb.from('payments').select('reference,status').eq('payment_id', paymentId).eq('pi_uid', uid).single();
      if (p && p.status === 'approved') {
        await sb.from('payments').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('payment_id', paymentId);
        await sb.from('requests').update({ payment_status: 'none' }).eq('reference', p.reference).eq('payment_status', 'pending');
      }
      return json(200, { ok: true });
    }
    return json(400, { error: 'Action inconnue' });
  } catch (err) {
    const m = err instanceof Error ? err.message : '';
    console.error('payments:', b.action, m);
    if (m.startsWith('pi_')) return json(502, { error: 'Le service Pi a refusé l’opération (' + m.slice(3) + '). Réessayez.' });
    return json(400, { error: m || 'Paiement impossible' });
  }
};
