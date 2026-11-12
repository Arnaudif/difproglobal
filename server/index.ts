import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handler as auth } from '../netlify/functions/auth';
import { handler as requests } from '../netlify/functions/requests';
import { handler as notifications } from '../netlify/functions/notifications';
import { handler as admin } from '../netlify/functions/admin';

// Même logique métier que les fonctions Netlify, exposée sous /api/* pour Render, Railway, etc.
const routes: Record<string, (e: any) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>> = {
  auth, requests, notifications, admin,
};

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Render place un proxy devant l'application

// En-têtes de sécurité. Pas de X-Frame-Options : Pi Browser peut afficher l'app dans un cadre.
// CSP explicite (aucun joker) : le SDK Pi appelle socialchain.app en interne ; l'échange du jeton se fait côté serveur.
const csp = [
  "script-src 'self' https://sdk.minepi.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "connect-src 'self' https://socialchain.app",
  "frame-ancestors 'self' https://*.pinet.com https://*.minepi.com",
  "object-src 'none'", "base-uri 'self'",
].join('; ');
app.use((_req, res, next) => {
  res.set({ 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()' });
  next();
});

// Limiteur simple en mémoire (par adresse IP) : suffit pour une seule instance.
const hits = new Map<string, { n: number; reset: number }>();
const limit = (key: string, max: number, windowMs: number) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const k = `${key}:${req.ip}`, now = Date.now(), h = hits.get(k);
  if (!h || h.reset < now) { hits.set(k, { n: 1, reset: now + windowMs }); return next(); }
  if (++h.n > max) { res.status(429).json({ error: 'Trop de requêtes, réessayez dans quelques minutes.' }); return; }
  next();
};
setInterval(() => { const now = Date.now(); for (const [k, h] of hits) if (h.reset < now) hits.delete(k); }, 60000).unref();
app.use(express.text({ type: '*/*', limit: '100kb' }));

app.get('/api/health', (_req, res) => { res.json({ ok: true }); });

app.use('/api/auth', limit('auth', 20, 10 * 60000));
app.use('/api', limit('api', 120, 60000));

app.all('/api/:name', async (req, res) => {
  const h = routes[req.params.name];
  if (!h) { res.status(404).json({ error: 'Route inconnue' }); return; }
  try {
    const r = await h({ httpMethod: req.method, headers: req.headers, body: typeof req.body === 'string' ? req.body : '' });
    res.status(r.statusCode).set(r.headers || {}).send(r.body);
  } catch (err) {
    console.error('api', req.params.name, err instanceof Error ? err.message : 'erreur');
    res.status(500).json({ error: 'Erreur serveur' }); // aucun détail interne exposé
  }
});

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
app.use(express.static(dist));
app.all('/api/*', (_req, res) => { res.status(404).json({ error: 'Route inconnue' }); });
app.get('*', (_req, res) => { res.sendFile(path.join(dist, 'index.html')); });

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`DIFPROGLOBAL à l'écoute sur le port ${port}`));
