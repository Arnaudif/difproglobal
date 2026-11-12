import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as api from './api';
import { Icon } from './icons';
import { catIcon, catName } from './data';
import type { Service } from './data';

export const Empty = ({ title, text, action }: { title: string; text: string; action?: ReactNode }) => (
  <div className="card empty"><h2>{title}</h2><p>{text}</p>{action}</div>
);
export const ErrorBox = ({ text }: { text: string }) => <div className="card err" role="alert">{text}</div>;
export const Loading = () => <p className="muted" role="status">Chargement…</p>;
export const Section = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <section className="sec">
    <div className="sec-head"><h2>{title}</h2>{action}</div>
    {children}
  </section>
);

export type Price = { price_pi: number; is_test: boolean };
let priceCache: Promise<Record<string, Price>> | null = null;
export function usePrices(): Record<string, Price> {
  const [p, setP] = useState<Record<string, Price>>({});
  useEffect(() => {
    if (!priceCache) priceCache = api.catalog().then(d => Object.fromEntries((d.prices as any[]).map(x => [x.service_id, { price_pi: Number(x.price_pi), is_test: !!x.is_test }]))).catch(() => { priceCache = null; return {}; });
    priceCache.then(setP);
  }, []);
  return p;
}
export const priceLabel = (p?: Price) => (p ? `${p.price_pi} π${p.is_test ? ' · test' : ''}` : 'Sur devis');

export function ServiceRow({ s, onOpen }: { s: Service; onOpen: () => void }) {
  const price = usePrices()[s.id];
  return (
    <button className="card row-card" onClick={onOpen}>
      <span className="tile-ic"><Icon name={catIcon(s.cat)} size={22} /></span>
      <span className="grow">
        <b>{s.name}</b>
        <span className="muted block">{catName(s.cat)} · {priceLabel(price)}</span>
      </span>
      <span className="tag">Démo</span>
      <span className="chev"><Icon name="chevron" size={18} /></span>
    </button>
  );
}
