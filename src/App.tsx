import { useEffect, useState } from 'react';
import type { View } from './types';
import * as api from './api';
import { Icon, Logo } from './icons';
import Home from './screens/Home';
import { Explore, ServiceDetail } from './screens/Explore';
import { Requests, Alerts, Quote } from './screens/Requests';
import { Profile, Admin } from './screens/Account';
import { About, Contact, Faq, Opportunities, Legal } from './screens/Info';

type Tab = 'home' | 'explore' | 'requests' | 'alerts' | 'profile';
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: 'home' },
  { id: 'explore', label: 'Explorer', icon: 'grid' },
  { id: 'requests', label: 'Mes demandes', icon: 'doc' },
  { id: 'alerts', label: 'Alertes', icon: 'bell' },
  { id: 'profile', label: 'Profil', icon: 'user' },
];

const tabOf = (v: View): Tab => {
  switch (v.name) {
    case 'home': case 'opportunities': return 'home';
    case 'explore': case 'service': return 'explore';
    case 'requests': case 'quote': return 'requests';
    case 'alerts': return 'alerts';
    default: return 'profile';
  }
};

const titles: Partial<Record<View['name'], string>> = {
  service: 'Service', quote: 'Demande de devis', about: 'À propos', contact: 'Contact', faq: 'Questions fréquentes',
  terms: 'Conditions d’utilisation', privacy: 'Confidentialité', opportunities: 'Opportunités', admin: 'Administration',
  explore: 'Explorer', requests: 'Mes demandes', alerts: 'Alertes', profile: 'Profil',
};

export default function App() {
  const [stack, setStack] = useState<View[]>([{ name: 'home' }]);
  const [splash, setSplash] = useState(() => api.storage.get('dpg_splash') !== '1');
  const [user, setUser] = useState<string | null>(api.storedUser());
  const [role, setRole] = useState<string>(api.storedRole());
  const view = stack[stack.length - 1];
  const tab = tabOf(view);

  useEffect(() => {
    if (!splash) return;
    const t = window.setTimeout(() => { api.storage.set('dpg_splash', '1'); setSplash(false); }, 1600);
    return () => window.clearTimeout(t);
  }, [splash]);

  useEffect(() => {
    const onPop = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const go = (v: View) => { window.history.pushState({}, ''); setStack(s => [...s, v]); };
  const back = () => { if (stack.length > 1) window.history.back(); };
  const selectTab = (t: Tab) => setStack([{ name: t }]);
  const onSession = (u: string | null, r: string) => { setUser(u); setRole(r); };
  const nav = { go, back };

  if (splash) {
    return (
      <div className="splash" onClick={() => { api.storage.set('dpg_splash', '1'); setSplash(false); }}>
        <Logo size={84} />
        <h1>DIFPROGLOBAL</h1>
        <p>L’Excellence Sans Frontières</p>
      </div>
    );
  }

  let screen;
  switch (view.name) {
    case 'home': screen = <Home {...nav} />; break;
    case 'explore': screen = <Explore key={(view.q || '') + '|' + (view.cat || '')} {...nav} q={view.q} cat={view.cat} />; break;
    case 'service': screen = <ServiceDetail {...nav} id={view.id} />; break;
    case 'quote': screen = <Quote {...nav} user={user} service={view.service} />; break;
    case 'requests': screen = <Requests {...nav} user={user} />; break;
    case 'alerts': screen = <Alerts {...nav} user={user} />; break;
    case 'profile': screen = <Profile {...nav} user={user} role={role} onSession={onSession} />; break;
    case 'about': screen = <About {...nav} />; break;
    case 'contact': screen = <Contact {...nav} />; break;
    case 'faq': screen = <Faq />; break;
    case 'terms': screen = <Legal kind="terms" />; break;
    case 'privacy': screen = <Legal kind="privacy" />; break;
    case 'opportunities': screen = <Opportunities {...nav} />; break;
    case 'admin': screen = role === 'admin' ? <Admin /> : <div className="card err" role="alert">Accès réservé aux administrateurs.</div>; break;
    default: screen = null;
  }

  const sub = stack.length > 1;
  return (
    <div className="app">
      <header className="top">
        {sub ? (
          <button className="icon-btn" onClick={back} aria-label="Retour"><Icon name="back" size={22} /></button>
        ) : (
          <Logo size={34} />
        )}
        <b className="brand">{sub ? titles[view.name] || 'DIFPROGLOBAL' : 'DIFPROGLOBAL'}</b>
        <button className="icon-btn" onClick={() => selectTab('profile')} aria-label="Profil"><Icon name="user" size={22} /></button>
      </header>
      <main>{screen}</main>
      <nav className="bar" aria-label="Navigation principale">
        {tabs.map(t => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => selectTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
            <Icon name={t.icon} size={22} />{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
