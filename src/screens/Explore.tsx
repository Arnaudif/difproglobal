import { useState } from 'react';
import { categories, services, catName, catIcon } from '../data';
import { Icon } from '../icons';
import * as api from '../api';
import { payRequest } from '../pi';
import { Empty, ErrorBox, ServiceRow, usePrices, priceLabel } from '../ui';
import type { Nav } from '../types';

export function Explore({ go, q: q0, cat: cat0 }: Nav & { q?: string; cat?: string }) {
  const [q, setQ] = useState(q0 || '');
  const [cat, setCat] = useState(cat0 || '');
  const needle = q.trim().toLowerCase();
  const list = services.filter(s =>
    (!cat || s.cat === cat) &&
    (!needle || (s.name + ' ' + s.summary + ' ' + catName(s.cat)).toLowerCase().includes(needle)));
  return (
    <>
      <div className="searchbar">
        <Icon name="search" size={20} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un service" aria-label="Rechercher un service" />
      </div>
      <div className="chips" role="group" aria-label="Filtrer par domaine">
        <button className={'chip' + (cat === '' ? ' on' : '')} onClick={() => setCat('')}>Tous</button>
        {categories.map(c => (
          <button key={c.id} className={'chip' + (cat === c.id ? ' on' : '')} onClick={() => setCat(c.id)}>{c.name}</button>
        ))}
      </div>
      <p className="muted">{list.length} service{list.length > 1 ? 's' : ''} · exemples de démonstration · prix de test en π, à remplacer par les tarifs réels.</p>
      {list.length === 0 ? (
        <Empty title="Aucun résultat" text="Essayez un autre mot-clé ou un autre domaine." action={<button className="outline" onClick={() => { setQ(''); setCat(''); }}>Réinitialiser</button>} />
      ) : (
        <div className="stack">{list.map(s => <ServiceRow key={s.id} s={s} onOpen={() => go({ name: 'service', id: s.id })} />)}</div>
      )}
    </>
  );
}

export function ServiceDetail({ go, id }: Nav & { id: string }) {
  const s = services.find(x => x.id === id);
  if (!s) return <Empty title="Service introuvable" text="Ce service n’existe pas ou n’est plus publié." action={<button className="gold" onClick={() => go({ name: 'explore' })}>Voir le catalogue</button>} />;
  const price = usePrices()[s.id];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const buy = async () => {
    if (!api.storedUser()) { go({ name: 'profile' }); return; }
    setBusy(true); setErr('');
    try {
      const o = await api.order(s.id);
      try { await payRequest(o.reference, Number(o.amount_pi)); go({ name: 'requests' }); }
      catch (x) { setErr(api.errMsg(x) + ' Votre commande ' + o.reference + ' est enregistrée : vous pouvez payer plus tard dans Mes demandes.'); }
    } catch (x) { setErr(api.errMsg(x)); } finally { setBusy(false); }
  };
  const similar = services.filter(x => x.cat === s.cat && x.id !== s.id).slice(0, 3);
  return (
    <>
      <div className="detail-head">
        <span className="tile-ic big"><Icon name={catIcon(s.cat)} size={30} /></span>
        <div>
          <h1>{s.name}</h1>
          <span className="muted">{catName(s.cat)}</span>
          <div className="tags"><span className="tag">Démonstration</span><span className="tag plain">{priceLabel(price)}</span></div>
        </div>
      </div>
      <p>{s.summary}</p>
      <div className="card">
        <h2>Avantages</h2>
        <ul className="checks">{s.benefits.map(b => <li key={b}><Icon name="check" size={18} />{b}</li>)}</ul>
      </div>
      <div className="card info-rows">
        <div><span className="muted">Zone desservie</span><b>{s.zone}</b></div>
        <div><span className="muted">Paiement</span><b>{price ? `${price.price_pi} π${price.is_test ? ' (prix de test)' : ''}, payable en Pi` : 'Sur devis, paiement en Pi après accord'}</b></div>
        <div><span className="muted">Contact</span><b>Échanges dans l’application</b></div>
        <div><span className="muted">Statut</span><b>Publié (démonstration)</b></div>
      </div>
      {err && <ErrorBox text={err} />}
      {price && <button className="gold wide" disabled={busy} onClick={buy}>{busy ? 'Paiement en cours…' : api.storedUser() ? `Payer maintenant · ${price.price_pi} π` : 'Se connecter pour payer'}</button>}
      <button className={price ? 'outline wide' : 'gold wide'} onClick={() => go({ name: 'quote', service: s.id })}>Demander un devis</button>
      {price?.is_test && <p className="muted">Prix de test pour vérifier le paiement Pi : ils seront remplacés par les tarifs réels.</p>}
      {similar.length > 0 && (
        <section className="sec">
          <div className="sec-head"><h2>Dans le même domaine</h2></div>
          <div className="stack">{similar.map(x => <ServiceRow key={x.id} s={x} onOpen={() => go({ name: 'service', id: x.id })} />)}</div>
        </section>
      )}
    </>
  );
}
