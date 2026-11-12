import * as api from './api';
declare global { interface Window { Pi?: any } }
let ready: Promise<void> | null = null;
async function init() {
  if (!window.Pi) throw new Error('Ouvrez DIFPROGLOBAL dans Pi Browser pour continuer.');
  // Le mode bac à sable est détecté automatiquement : on ne le passe pas.
  if (!ready) ready = Promise.resolve(window.Pi.init({ version: '2.0' }));
  await ready;
}
// Un paiement resté ouvert est repris par le serveur (terminé ou annulé).
const onIncomplete = (p: any) => { if (p?.identifier) api.payment('incomplete', p.identifier).catch(() => {}); };

export async function piLogin(): Promise<string> {
  await init();
  const auth = await window.Pi.authenticate(['username', 'payments'], onIncomplete);
  return auth.accessToken as string; // seul le jeton est utilisé ; uid et nom du navigateur sont ignorés
}

// Paiement en Pi d'une demande. Le montant est fixé et revérifié par le serveur.
export async function payRequest(reference: string, amount: number): Promise<void> {
  await init();
  await window.Pi.authenticate(['username', 'payments'], onIncomplete);
  await new Promise<void>((resolve, reject) => {
    window.Pi.createPayment(
      { amount, memo: `DIFPROGLOBAL ${reference}`, metadata: { reference } },
      {
        onReadyForServerApproval: (id: string) => { api.payment('approve', id).catch(reject); },
        onReadyForServerCompletion: (id: string) => { api.payment('complete', id).then(() => resolve(), reject); },
        onCancel: (id: string) => { api.payment('cancel', id).catch(() => {}); reject(new Error('Paiement annulé.')); },
        onError: (e: any) => reject(new Error(e?.message || 'Le paiement a échoué.')),
      },
    );
  });
}
