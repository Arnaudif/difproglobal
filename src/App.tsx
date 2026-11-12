import { FormEvent, useEffect, useState } from 'react';
import { categories, services } from './data';
import * as api from './api';
import { piLogin } from './pi';

type Tab = 'home' | 'explore' | 'requests' | 'alerts' | 'profile';
const tabs: { id: Tab; label: string; d: string }[] = [
  { id: 'home', label: 'Accueil', d: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' },
  { id: 'explore', label: 'Explorer', d: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' },
  { id: 'requests', label: 'Mes demandes', d: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7' },
  { id: 'alerts', label: 'Alertes', d: 'M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4' },
  { id: 'profile', label: 'Profil', d: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21a8 8 0 0 1 16 0' },
];
const statusLabel: Record<string, string> = { received: 'Reçue', in_review: 'En cours', quote_sent: 'Devis envoyé', accepted: 'Acceptée', done: 'Terminée', refused: 'Refusée' };

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [quote, setQuote] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(sessionStorage.getItem('dpg_user') || null);
  const go = (t: Tab) => { setQuote(null); setTab(t); };

  return (
    <div className="app">
      <header className="top"><span className="logo">D</span><b>DIFPROGLOBAL</b></header>
      <main>
        {quote !== null ? <Quote service={quote} user={user} onLogin={() => go('profile')} onDone={() => go('requests')} />
          : tab === 'home' ? <Home onExplore={() => go('explore')} onQuote={() => setQuote('')} />
          : tab === 'explore' ? <Explore onQuote={setQuote} />
          : tab === 'requests' ? <Requests user={user} onLogin={() => go('profile')} />
          : tab === 'alerts' ? <Empty title="Aucune alerte" text="Vos réponses et mises à jour apparaîtront ici." />
          : <Profile user={user} setUser={setUser} />}
      </main>
      <nav className="bar" aria-label="Navigation principale">
        {tabs.map(t => (
          <button key={t.id} className={tab === t.id && quote === null ? 'on' : ''} onClick={() => go(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={t.d} /></svg>{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

const Empty = ({ title, text }: { title: string; text: string }) => <div className="card empty"><h2>{title}</h2><p>{text}</p></div>;

function Home({ onExplore, onQuote }: { onExplore: () => void; onQuote: () => void }) {
  return (<>
    <section className="hero">
      <small>Diffusion Professionnelle Globale</small>
      <h1>L’Excellence Sans Frontières</h1>
      <p>Unir les idées, révéler les talents, créer les opportunités et bâtir l’avenir.</p>
      <div className="row"><button className="gold" onClick={onExplore}>Explorer nos services</button><button className="ghost" onClick={onQuote}>Demander un devis</button></div>
    </section>
    <h2>Catégories</h2>
    <div className="grid">{categories.map(c => <button key={c} className="card tile" onClick={onExplore}>{c}</button>)}</div>
  </>);
}

function Explore({ onQuote }: { onQuote: (s: string) => void }) {
  const [q, setQ] = useState('');
  const list = services.filter(s => (s.name + s.cat).toLowerCase().includes(q.toLowerCase()));
  return (<>
    <input className="field" placeholder="Rechercher un service" aria-label="Rechercher un service" value={q} onChange={e => setQ(e.target.value)} />
    <p className="muted">Exemples de démonstration : offres et tarifs non confirmés.</p>
    {list.length === 0 && <Empty title="Aucun résultat" text="Essayez un autre mot-clé." />}
    {list.map(s => (
      <div key={s.id} className="card svc"><div><b>{s.name}</b><div className="muted">{s.cat} · Sur devis</div></div>
        <button className="gold sm" onClick={() => onQuote(s.name)}>Demander</button></div>
    ))}
  </>);
}

function Requests({ user, onLogin }: { user: string | null; onLogin: () => void }) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { if (user) api.listRequests().then(d => setRows(d.requests)).catch(e => setErr(e.message)); }, [user]);
  if (!user) return <div className="card empty"><h2>Connexion requise</h2><p>Connectez-vous avec Pi pour suivre vos demandes.</p><button className="gold" onClick={onLogin}>Aller au profil</button></div>;
  if (err) return <div className="card err" role="alert">{err}</div>;
  if (!rows) return <p className="muted">Chargement…</p>;
  if (!rows.length) return <Empty title="Aucune demande" text="Vos demandes de devis apparaîtront ici." />;
  return <>{rows.map(r => <div key={r.reference} className="card svc"><div><b>{r.service}</b><div className="muted">{r.reference} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</div></div><span className={'st ' + r.status}>{statusLabel[r.status] || r.status}</span></div>)}</>;
}

function Quote({ service, user, onLogin, onDone }: { service: string; user: string | null; onLogin: () => void; onDone: () => void }) {
  const [f, setF] = useState({ service, description: '', location: '', budget: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ref, setRef] = useState('');
  if (!user) return <div className="card empty"><h2>Connexion requise</h2><p>Connectez-vous avec Pi pour envoyer une demande.</p><button className="gold" onClick={onLogin}>Aller au profil</button></div>;
  if (ref) return <div className="card empty"><h2>Demande enregistrée</h2><p>Référence : <b>{ref}</b></p><button className="gold" onClick={onDone}>Voir mes demandes</button></div>;
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { setRef((await api.createRequest(f)).reference); } catch (x: any) { setErr(x.message); } finally { setBusy(false); }
  };
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="form"><h2>Demande de devis</h2>
      <label>Service recherché<select className="field" value={f.service} onChange={set('service')} required><option value="">Choisir…</option>{services.map(s => <option key={s.id}>{s.name}</option>)}</select></label>
      <label>Description du besoin<textarea className="field" rows={5} minLength={10} maxLength={2000} value={f.description} onChange={set('description')} required /></label>
      <label>Pays ou ville<input className="field" value={f.location} onChange={set('location')} /></label>
      <label>Budget indicatif (facultatif)<input className="field" value={f.budget} onChange={set('budget')} /></label>
      {err && <div className="card err" role="alert">{err}</div>}
      <button className="gold" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer la demande'}</button>
    </form>
  );
}

function Profile({ user, setUser }: { user: string | null; setUser: (u: string | null) => void }) {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const connect = async () => {
    setBusy(true); setErr('');
    try { const d = await api.login(await piLogin()); api.setSession(d.token, d.username); setUser(d.username); }
    catch (e: any) { setErr(e.message || 'Connexion impossible'); } finally { setBusy(false); }
  };
  const out = () => { api.setSession(null); setUser(null); };
  return (<>
    <div className="card"><b>{user ? `Pionnier : ${user}` : 'Non connecté'}</b>
      <p className="muted">{user ? 'Identité vérifiée par le serveur via Pi.' : 'La connexion se fait uniquement avec Pi. Nous ne demandons jamais votre phrase secrète.'}</p></div>
    {err && <div className="card err" role="alert">{err}</div>}
    {user ? <button className="ghost dark" onClick={out}>Déconnexion</button> : <button className="gold" onClick={connect} disabled={busy}>{busy ? 'Connexion…' : 'Se connecter avec Pi'}</button>}
    <p className="muted">Favoris, langue, préférences : à venir.</p>
  </>);
}
