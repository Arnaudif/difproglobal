declare global { interface Window { Pi?: any } }
let ready: Promise<void> | null = null;
export async function piLogin(): Promise<string> {
  if (!window.Pi) throw new Error('Ouvrez DIFPROGLOBAL dans Pi Browser pour vous connecter.');
  // Le mode bac à sable est détecté automatiquement : on ne le passe pas.
  if (!ready) ready = Promise.resolve(window.Pi.init({ version: '2.0' }));
  await ready;
  const auth = await window.Pi.authenticate(['username'], () => {});
  return auth.accessToken as string; // seul le jeton est utilisé ; uid et nom du navigateur sont ignorés
}
