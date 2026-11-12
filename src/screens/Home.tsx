import { useState } from 'react';
import type { FormEvent } from 'react';
import { categories, services } from '../data';
import { Icon, Globe } from '../icons';
import { Section, ServiceRow } from '../ui';
import type { Nav } from '../types';

const pillars = [
  { icon: 'bulb', title: 'Unir les idées', text: 'Une porte d’entrée unique pour exprimer votre besoin.' },
  { icon: 'users', title: 'Révéler les talents', text: 'Des professionnels et prestataires mis en lumière.' },
  { icon: 'globe', title: 'Créer les opportunités', text: 'Des mises en relation utiles, vérifiées par l’équipe.' },
  { icon: 'spark', title: 'Bâtir l’avenir', text: 'Un accompagnement pensé pour durer et s’étendre.' },
];

export default function Home({ go }: Nav) {
  const [q, setQ] = useState('');
  const search = (e: FormEvent) => { e.preventDefault(); go({ name: 'explore', q: q.trim() }); };
  return (
    <>
      <form className="searchbar" onSubmit={search} role="search">
        <Icon name="search" size={20} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un service" aria-label="Rechercher un service" />
        <button className="gold sm" type="submit">Chercher</button>
      </form>

      <section className="hero">
        <Globe />
        <small>Diffusion Professionnelle Globale</small>
        <h1>L’Excellence Sans Frontières</h1>
        <p>DIFPROGLOBAL accompagne vos ambitions avec des services, des compétences et des opportunités pensés pour répondre à vos besoins.</p>
        <div className="row">
          <button className="gold" onClick={() => go({ name: 'explore' })}>Explorer nos services</button>
          <button className="ghost" onClick={() => go({ name: 'quote' })}>Demander un devis</button>
        </div>
      </section>

      <div className="quick">
        <button className="card quick-btn" onClick={() => go({ name: 'requests' })}><span className="tile-ic"><Icon name="doc" size={20} /></span>Mes demandes</button>
        <button className="card quick-btn" onClick={() => go({ name: 'opportunities' })}><span className="tile-ic"><Icon name="globe" size={20} /></span>Opportunités</button>
        <button className="card quick-btn" onClick={() => go({ name: 'about' })}><span className="tile-ic"><Icon name="users" size={20} /></span>Qui sommes-nous</button>
        <button className="card quick-btn" onClick={() => go({ name: 'contact' })}><span className="tile-ic"><Icon name="phone" size={20} /></span>Contact</button>
      </div>

      <Section title="Nos domaines">
        <div className="grid">
          {categories.map(c => (
            <button key={c.id} className="card cat" onClick={() => go({ name: 'explore', cat: c.id })}>
              <span className="tile-ic"><Icon name={c.icon} size={22} /></span>
              <b>{c.name}</b>
              <span className="muted">{c.blurb}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Services recommandés" action={<button className="link" onClick={() => go({ name: 'explore' })}>Tout voir</button>}>
        <p className="muted">Exemples de démonstration : offres et tarifs en cours de confirmation.</p>
        <div className="stack">
          {services.slice(0, 4).map(s => <ServiceRow key={s.id} s={s} onOpen={() => go({ name: 'service', id: s.id })} />)}
        </div>
      </Section>

      <Section title="Pourquoi choisir DIFPROGLOBAL">
        <div className="grid">
          {pillars.map(p => (
            <div key={p.title} className="card pillar">
              <span className="tile-ic"><Icon name={p.icon} size={22} /></span>
              <b>{p.title}</b>
              <span className="muted">{p.text}</span>
            </div>
          ))}
        </div>
      </Section>

      <section className="band">
        <h2>Opportunités professionnelles</h2>
        <p>Le pont entre les idées, les talents et les opportunités. Seules les annonces vérifiées par l’équipe sont publiées.</p>
        <button className="gold" onClick={() => go({ name: 'opportunities' })}>Découvrir</button>
      </section>

      <Section title="Une question ?">
        <div className="card contact-strip">
          <p>Notre équipe vous répond. Pour un devis, le formulaire est le moyen le plus rapide.</p>
          <div className="row">
            <button className="gold" onClick={() => go({ name: 'quote' })}>Demander un devis</button>
            <button className="outline" onClick={() => go({ name: 'contact' })}>Nous contacter</button>
          </div>
        </div>
      </Section>

      <footer className="foot">
        <b>DIFPROGLOBAL</b>
        <span>L’Excellence Sans Frontières · Siège : Cameroun</span>
        <div className="foot-links">
          <button className="link" onClick={() => go({ name: 'terms' })}>Conditions</button>
          <button className="link" onClick={() => go({ name: 'privacy' })}>Confidentialité</button>
          <button className="link" onClick={() => go({ name: 'faq' })}>FAQ</button>
        </div>
        <span className="muted">Application indépendante, non approuvée officiellement par Pi Network à ce jour.</span>
      </footer>
    </>
  );
}
