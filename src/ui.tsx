import type { ReactNode } from 'react';
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

export function ServiceRow({ s, onOpen }: { s: Service; onOpen: () => void }) {
  return (
    <button className="card row-card" onClick={onOpen}>
      <span className="tile-ic"><Icon name={catIcon(s.cat)} size={22} /></span>
      <span className="grow">
        <b>{s.name}</b>
        <span className="muted block">{catName(s.cat)} · Sur devis</span>
      </span>
      <span className="tag">Démo</span>
      <span className="chev"><Icon name="chevron" size={18} /></span>
    </button>
  );
}
