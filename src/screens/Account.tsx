import { useEffect, useState } from 'react';
import * as api from '../api';
import { piLogin } from '../pi';
import { statusLabel } from '../data';
import { Icon } from '../icons';
import { Empty, ErrorBox, Loading } from '../ui';
import type { Nav } from '../types';

type ProfileProps = Nav & { user: string | null; role: string; onSession: (u: string | null, r: string) => void };

export function Profile({ go, user, role, onSession }: ProfileProps) {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const connect = async () => {
    setBusy(true); setErr('');
    try {
      const d = await api.login(await piLogin());
      api.setSession(d.token, d.username, d.role);
      onSession(d.username, d.role || 'user');
    } catch (e) { setErr(api.errMsg(e) || 'Connexion impossible'); } finally { setBusy(false); }
  };
  const out = () => { api.setSession(null); onSession(null, 'user'); };
  const item = (icon: string, label: string, onClick: () => void) => (
    <button key={label} className="menu-item" onClick={onClick}><Icon name={icon} size={20} /><span className="grow">{label}</span><Icon name="chevron" size={16} /></button>
  );
  return (
    <>
      <div className="card profile-head">
        <span className="avatar">{user ? user.slice(0, 1).toUpperCase() : <Icon name="user" size={28} />}</span>
        <div>
          <b>{user ? user : 'Non connecté'}</b>
          <span className="muted block">{user ? (role === 'admin' ? 'Administrateur' : 'Identité vérifiée via Pi') : 'Connexion avec Pi uniquement'}</span>
        </div>
      </div>
      {err && <ErrorBox text={err} />}
      {!user && (
        <>
          <button className="gold wide" onClick={connect} disabled={busy}>{busy ? 'Connexion…' : 'Se connecter avec Pi'}</button>
          <p className="muted">La connexion s’effectue dans Pi Browser. DIFPROGLOBAL ne vous demandera jamais la phrase secrète de votre portefeuille.</p>
        </>
      )}
      <div className="card menu">
        {item('doc', 'Mes demandes', () => go({ name: 'requests' }))}
        {item('globe', 'Opportunités', () => go({ name: 'opportunities' }))}
        {role === 'admin' && user && item('admin', 'Espace administrateur', () => go({ name: 'admin' }))}
      </div>
      <div className="card menu">
        {item('users', 'À propos de DIFPROGLOBAL', () => go({ name: 'about' }))}
        {item('phone', 'Contact', () => go({ name: 'contact' }))}
        {item('help', 'Questions fréquentes', () => go({ name: 'faq' }))}
        {item('doc', 'Conditions d’utilisation', () => go({ name: 'terms' }))}
        {item('shield', 'Confidentialité', () => go({ name: 'privacy' }))}
      </div>
      {user && <button className="outline wide" onClick={out}><Icon name="logout" size={18} /> Déconnexion</button>}
    </>
  );
}

const STATUSES = Object.keys(statusLabel);

export function Admin() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('');
  useEffect(() => { api.adminList().then(d => setRows(d.requests)).catch(e => setErr(api.errMsg(e))); }, []);
  const change = async (reference: string, status: string) => {
    setErr('');
    try { await api.adminSetStatus(reference, status); setRows((rows || []).map(r => (r.reference === reference ? { ...r, status } : r))); }
    catch (e) { setErr(api.errMsg(e)); }
  };
  if (!rows && !err) return <Loading />;
  const shown = (rows || []).filter(r => !filter || r.status === filter);
  return (
    <>
      <p className="muted">Les droits sont vérifiés par le serveur à chaque action. Chaque changement est consigné et notifie le client.</p>
      <div className="chips" role="group" aria-label="Filtrer par statut">
        <button className={'chip' + (filter === '' ? ' on' : '')} onClick={() => setFilter('')}>Toutes ({(rows || []).length})</button>
        {STATUSES.map(s => <button key={s} className={'chip' + (filter === s ? ' on' : '')} onClick={() => setFilter(s)}>{statusLabel[s]}</button>)}
      </div>
      {err && <ErrorBox text={err} />}
      {rows && shown.length === 0 && <Empty title="Aucune demande" text="Les demandes des clients apparaîtront ici." />}
      <div className="stack">
        {shown.map(r => (
          <div key={r.reference} className="card form">
            <b>{r.service}</b>
            <span className="muted">{r.reference} · {r.profiles?.username || 'inconnu'} · {new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
            <p>{r.description}</p>
            {(r.location || r.budget) && <span className="muted">{[r.location, r.budget].filter(Boolean).join(' · ')}</span>}
            <label>Statut
              <select className="field" value={r.status} onChange={e => change(r.reference, e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
              </select>
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
