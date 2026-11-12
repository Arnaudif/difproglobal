import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import * as api from '../api';
import { services, statusLabel } from '../data';
import { Empty, ErrorBox, Loading } from '../ui';
import type { Nav } from '../types';

type Props = Nav & { user: string | null };

const LoginNeeded = ({ go, text }: { go: Nav['go']; text: string }) => (
  <Empty title="Connexion requise" text={text} action={<button className="gold" onClick={() => go({ name: 'profile' })}>Aller au profil</button>} />
);

export function Requests({ user, go }: Props) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!user) return;
    api.listRequests().then(d => setRows(d.requests)).catch(e => setErr(api.errMsg(e)));
  }, [user]);
  if (!user) return <LoginNeeded go={go} text="Connectez-vous avec Pi pour suivre vos demandes." />;
  if (err) return <ErrorBox text={err} />;
  if (!rows) return <Loading />;
  if (!rows.length) return <Empty title="Aucune demande" text="Vos demandes de devis apparaîtront ici avec leur statut." action={<button className="gold" onClick={() => go({ name: 'quote' })}>Demander un devis</button>} />;
  return (
    <div className="stack">
      {rows.map(r => (
        <div key={r.reference} className="card req">
          <div className="req-top"><b>{r.service}</b><span className={'st ' + r.status}>{statusLabel[r.status] || r.status}</span></div>
          <span className="muted">Réf. {r.reference} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
      ))}
    </div>
  );
}

export function Alerts({ user, go }: Props) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!user) return;
    api.listNotifications().then(d => setRows(d.notifications)).catch(e => setErr(api.errMsg(e)));
  }, [user]);
  if (!user) return <LoginNeeded go={go} text="Connectez-vous avec Pi pour voir vos alertes." />;
  if (err) return <ErrorBox text={err} />;
  if (!rows) return <Loading />;
  if (!rows.length) return <Empty title="Aucune alerte" text="Les mises à jour de vos demandes apparaîtront ici." />;
  const read = async (n: any) => {
    if (n.read) return;
    try { await api.markRead(n.id); setRows(rows.map(r => (r.id === n.id ? { ...r, read: true } : r))); } catch (e) { setErr(api.errMsg(e)); }
  };
  return (
    <div className="stack">
      {rows.map(n => (
        <button key={n.id} className={'card alert' + (n.read ? ' read' : '')} onClick={() => read(n)}>
          <span className={'dot' + (n.read ? '' : ' new')} aria-hidden="true" />
          <span className="grow"><b>{n.title}</b><span className="muted block">{new Date(n.created_at).toLocaleString('fr-FR')} · {n.read ? 'Lue' : 'Non lue'}</span></span>
        </button>
      ))}
    </div>
  );
}

export function Quote({ user, go, service }: Props & { service?: string }) {
  const first = services.find(s => s.id === service)?.name || '';
  const [f, setF] = useState({ service: first, description: '', location: '', budget: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ref, setRef] = useState('');
  if (!user) return <LoginNeeded go={go} text="Connectez-vous avec Pi pour envoyer une demande de devis." />;
  if (ref) return <Empty title="Demande enregistrée" text={'Votre numéro de référence : ' + ref + '. Suivez la réponse dans Mes demandes et Alertes.'} action={<button className="gold" onClick={() => go({ name: 'requests' })}>Voir mes demandes</button>} />;
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const d = await api.createRequest(f); setRef(d.reference); } catch (x) { setErr(api.errMsg(x)); } finally { setBusy(false); }
  };
  const on = (k: 'service' | 'description' | 'location' | 'budget') => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="form">
      <p className="muted">Seules les informations utiles à votre demande sont demandées.</p>
      <label>Service recherché
        <select className="field" value={f.service} onChange={on('service')} required>
          <option value="">Choisir un service…</option>
          {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </label>
      <label>Description du besoin
        <textarea className="field" rows={5} minLength={10} maxLength={2000} value={f.description} onChange={on('description')} required placeholder="Décrivez votre projet en quelques lignes" />
      </label>
      <label>Pays ou ville
        <input className="field" value={f.location} onChange={on('location')} maxLength={120} placeholder="Ex. Cameroun, Douala" />
      </label>
      <label>Budget indicatif (facultatif)
        <input className="field" value={f.budget} onChange={on('budget')} maxLength={60} />
      </label>
      {err && <ErrorBox text={err} />}
      <button className="gold wide" disabled={busy}>{busy ? 'Envoi…' : 'Envoyer la demande'}</button>
    </form>
  );
}
