import { Icon } from '../icons';
import type { Nav } from '../types';

const Doc = ({ children }: { children: React.ReactNode }) => <div className="doc">{children}</div>;

export function About({ go }: Nav) {
  const pillars = ['Unir les idées', 'Révéler les talents', 'Créer les opportunités', 'Bâtir l’avenir'];
  return (
    <Doc>
      <h1>DIFPROGLOBAL</h1>
      <p className="lead">L’Excellence Sans Frontières.</p>
      <p>DIFPROGLOBAL est un groupe polyvalent à vision mondiale, engagé dans la promotion du professionnalisme, de l’innovation et de l’excellence dans tous les domaines.</p>
      <p>Nous sommes le pont entre les idées, les talents et les opportunités. Notre mission est de transformer les ambitions en réalisations concrètes en proposant des solutions innovantes, fiables et accessibles à tous.</p>
      <p>Ouvert à tous les secteurs d’activité, DIFPROGLOBAL accompagne les initiatives qui contribuent au progrès économique, professionnel et social.</p>
      <div className="grid">{pillars.map(p => <div key={p} className="card pillar"><span className="tile-ic"><Icon name="check" size={20} /></span><b>{p}</b></div>)}</div>
      <div className="card info-rows">
        <div><span className="muted">Promoteur</span><b>Arneau Diffo</b></div>
        <div><span className="muted">Siège</span><b>Cameroun</b></div>
        <div><span className="muted">Positionnement</span><b>Entreprise polyvalente à vision internationale</b></div>
      </div>
      <button className="gold wide" onClick={() => go({ name: 'contact' })}>Nous contacter</button>
    </Doc>
  );
}

export function Contact({ go }: Nav) {
  return (
    <Doc>
      <p>Pour une demande de service, le formulaire de devis est le moyen le plus rapide : vous suivez la réponse dans l’application.</p>
      <button className="gold wide" onClick={() => go({ name: 'quote' })}>Demander un devis</button>
      <div className="card info-rows">
        <div><span className="muted">Téléphones</span><b>+237 697 462 617 · +237 675 101 944</b></div>
        <div><span className="muted">E-mail</span><b>difproglobal@gmail.com</b></div>
        <div><span className="muted">Siège</span><b>Cameroun</b></div>
        <div><span className="muted">Promoteur</span><b>Arneau Diffo</b></div>
      </div>
    </Doc>
  );
}

const faq: { q: string; a: string }[] = [
  { q: 'Comment demander un devis ?', a: 'Connectez-vous avec Pi, ouvrez un service puis appuyez sur « Demander ce service », ou utilisez « Demander un devis » depuis l’accueil. Un numéro de référence s’affiche une fois la demande enregistrée.' },
  { q: 'Dois-je payer dans l’application ?', a: 'Les services sont sur devis. Après votre demande, l’équipe fixe un montant en Pi ; un bouton « Payer » apparaît alors dans Mes demandes et vous confirmez le paiement dans Pi Browser. Rien n’est prélevé sans votre confirmation.' },
  { q: 'Pourquoi me connecter avec Pi ?', a: 'La connexion Pi permet de vérifier votre identité et de rattacher vos demandes à votre compte. Nous ne demandons jamais la phrase secrète de votre portefeuille.' },
  { q: 'Comment suivre ma demande ?', a: 'Dans « Mes demandes », chaque dossier affiche son statut : reçue, en cours, devis envoyé, acceptée, terminée ou refusée. Une alerte vous prévient à chaque changement.' },
  { q: 'Les services affichés sont-ils définitifs ?', a: 'Non. Les services et tarifs sont en cours de confirmation : les fiches actuelles sont des exemples marqués « Démo ».' },
  { q: 'Quelles données sont enregistrées ?', a: 'Votre nom d’utilisateur Pi et le contenu de vos demandes. Voir la page Confidentialité.' },
];

export function Faq() {
  return (
    <div className="stack">
      {faq.map(f => (
        <details key={f.q} className="card faq">
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Opportunities({ go }: Nav) {
  return (
    <Doc>
      <p>DIFPROGLOBAL met en relation idées, talents et opportunités. Les annonces seront publiées après vérification par l’équipe.</p>
      <div className="card empty">
        <h2>Aucune annonce publiée</h2>
        <p>Les opportunités vérifiées (partenariats, appels à prestataires, recherche de talents) apparaîtront ici.</p>
      </div>
      <button className="outline wide" onClick={() => go({ name: 'quote' })}>Présenter mon projet par une demande</button>
    </Doc>
  );
}

export function Legal({ kind }: { kind: 'terms' | 'privacy' }) {
  return kind === 'terms' ? (
    <Doc>
      <p className="note">Version provisoire, à faire valider avant la mise en production.</p>
      <h2>Objet</h2><p>DIFPROGLOBAL présente des services et permet d’envoyer des demandes de devis et de suivre leur traitement.</p>
      <h2>Compte</h2><p>La connexion s’effectue uniquement avec Pi. Vous êtes responsable de l’usage de votre compte. Personne ne peut se déclarer administrateur ou représentant de DIFPROGLOBAL sans autorisation de l’entreprise.</p>
      <h2>Services et tarifs</h2><p>Les offres affichées peuvent évoluer et certaines sont des exemples de démonstration. Un devis n’engage les parties qu’après acceptation.</p>
      <h2>Paiements</h2><p>Les paiements se font en Pi uniquement, pour un montant fixé dans le devis, et après votre confirmation dans Pi Browser. Un paiement validé est enregistré avec la référence de la demande.</p>
      <h2>Contenus</h2><p>Vous vous engagez à fournir des informations exactes et à ne pas utiliser l’application à des fins illicites.</p>
      <h2>Contact</h2><p>difproglobal@gmail.com</p>
    </Doc>
  ) : (
    <Doc>
      <p className="note">Version provisoire, à faire valider avant la mise en production.</p>
      <h2>Données enregistrées</h2><p>Votre identifiant et nom d’utilisateur Pi, ainsi que le contenu de vos demandes (service, description, lieu, budget indicatif) et vos notifications.</p>
      <h2>Données non demandées</h2><p>Nous ne demandons ni la phrase secrète, ni les clés de votre portefeuille Pi. Pour un paiement, nous enregistrons seulement son identifiant, son montant et l’identifiant de transaction.</p>
      <h2>Usage</h2><p>Ces données servent uniquement à traiter vos demandes et à vous informer de leur avancement.</p>
      <h2>Accès et protection</h2><p>Les données sont stockées dans une base protégée. Chaque utilisateur ne peut consulter que ses propres demandes ; seuls les administrateurs autorisés accèdent à l’ensemble.</p>
      <h2>Vos droits</h2><p>Pour consulter, corriger ou supprimer vos données, écrivez à difproglobal@gmail.com.</p>
    </Doc>
  );
}
