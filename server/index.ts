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
app.use(express.text({ type: '*/*', limit: '100kb' }));

app.get('/api/health', (_req, res) => { res.json({ ok: true }); });

app.all('/api/:name', async (req, res) => {
  const h = routes[req.params.name];
  if (!h) { res.status(404).json({ error: 'Route inconnue' }); return; }
  try {
    const r = await h({ httpMethod: req.method, headers: req.headers, body: typeof req.body === 'string' ? req.body : '' });
    res.status(r.statusCode).set(r.headers || {}).send(r.body);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' }); // aucun détail interne exposé
  }
});

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
app.use(express.static(dist));
app.get('*', (_req, res) => { res.sendFile(path.join(dist, 'index.html')); });

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`DIFPROGLOBAL à l'écoute sur le port ${port}`));
