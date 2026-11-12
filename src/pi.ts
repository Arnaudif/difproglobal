declare global { interface Window { Pi?: any } }
let ready = false;
export async function piLogin(): Promise<string> {
  if (!window.Pi) throw new Error('Ouvrez DIFPROGLOBAL dans Pi Browser pour vous connecter.');
  if (!ready) { window.Pi.init({ version: '2.0', sandbox: import.meta.env.VITE_PI_SANDBOX !== 'false' }); ready = true; }
  const auth = await window.Pi.authenticate(['username'], () => {});
  return auth.accessToken as string;
}
