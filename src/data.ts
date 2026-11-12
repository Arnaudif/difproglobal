// DÉMONSTRATION : les offres ci-dessous ne sont pas confirmées et n'ont aucun tarif.
// À remplacer par un catalogue géré depuis l'administration (base de données).
export type Category = { id: string; name: string; icon: string; blurb: string };
export type Service = { id: string; name: string; cat: string; summary: string; benefits: string[]; zone: string };

export const categories: Category[] = [
  { id: 'pro', name: 'Services professionnels', icon: 'briefcase', blurb: 'Conseil, assistance et accompagnement de projets' },
  { id: 'num', name: 'Numérique et technologie', icon: 'code', blurb: 'Sites web, applications et solutions informatiques' },
  { id: 'form', name: 'Formation', icon: 'book', blurb: 'Compétences professionnelles et numériques' },
  { id: 'com', name: 'Commerce et produits', icon: 'bag', blurb: 'Offres commerciales et demandes de devis' },
  { id: 'immo', name: 'Immobilier et construction', icon: 'home', blurb: 'Mise en relation et rénovation' },
  { id: 'crea', name: 'Communication et création', icon: 'palette', blurb: 'Identité visuelle, contenus et publicité' },
  { id: 'ent', name: 'Entrepreneuriat', icon: 'spark', blurb: 'Projets, partenaires et opportunités' },
];

export const services: Service[] = [
  { id: 'conseil', name: 'Conseil aux entreprises', cat: 'pro', summary: 'Analyse de votre besoin et recommandations adaptées à votre activité.', benefits: ['Écoute et cadrage de votre besoin', 'Recommandations claires et priorisées', 'Suivi des échanges dans l’application'], zone: 'À définir' },
  { id: 'projets', name: 'Accompagnement de projets', cat: 'pro', summary: 'Un appui du cadrage à la réalisation de votre projet.', benefits: ['Plan de projet structuré', 'Mise en relation avec des professionnels', 'Points d’étape réguliers'], zone: 'À définir' },
  { id: 'web', name: 'Création de site web', cat: 'num', summary: 'Un site professionnel adapté aux téléphones et aux ordinateurs.', benefits: ['Design sur mesure', 'Lisible sur mobile', 'Mise en ligne accompagnée'], zone: 'À définir' },
  { id: 'app', name: 'Développement d’application', cat: 'num', summary: 'Conception et réalisation d’applications web ou mobiles.', benefits: ['Cahier des charges partagé', 'Livraison par étapes', 'Sécurité des données prise en compte'], zone: 'À définir' },
  { id: 'it', name: 'Solutions informatiques', cat: 'num', summary: 'Outils numériques et appui technique pour votre organisation.', benefits: ['Diagnostic de l’existant', 'Solutions adaptées à vos moyens', 'Assistance après mise en place'], zone: 'À définir' },
  { id: 'entre', name: 'Formation en entrepreneuriat', cat: 'form', summary: 'Les bases pour lancer et développer une activité.', benefits: ['Contenus pratiques', 'Exemples concrets', 'Accompagnement des participants'], zone: 'À définir' },
  { id: 'numform', name: 'Compétences numériques', cat: 'form', summary: 'Prise en main des outils numériques utiles au travail.', benefits: ['Niveaux débutant à intermédiaire', 'Exercices guidés', 'Ressources à conserver'], zone: 'À définir' },
  { id: 'catalogue', name: 'Offres et catalogue commerciaux', cat: 'com', summary: 'Présentation de produits et d’offres, avec demande de devis.', benefits: ['Fiches claires', 'Demande de devis directe', 'Réponse suivie dans l’application'], zone: 'À définir' },
  { id: 'vendeurs', name: 'Mise en relation avec des vendeurs', cat: 'com', summary: 'Accès à des vendeurs autorisés selon votre recherche.', benefits: ['Vendeurs vérifiés par l’équipe', 'Comparaison facilitée', 'Échanges centralisés'], zone: 'À définir' },
  { id: 'immo', name: 'Services immobiliers', cat: 'immo', summary: 'Renseignements et mise en relation avec des professionnels.', benefits: ['Demande de renseignements simple', 'Interlocuteurs identifiés', 'Suivi de votre dossier'], zone: 'À définir' },
  { id: 'reno', name: 'Rénovation et construction', cat: 'immo', summary: 'Mise en relation pour vos travaux et projets de construction.', benefits: ['Description détaillée du projet', 'Devis comparables', 'Suivi des échanges'], zone: 'À définir' },
  { id: 'brand', name: 'Identité visuelle', cat: 'crea', summary: 'Logo, couleurs et supports pour une image cohérente.', benefits: ['Univers de marque défini', 'Déclinaisons utiles', 'Fichiers livrés'], zone: 'À définir' },
  { id: 'photo', name: 'Photographie et vidéo', cat: 'crea', summary: 'Contenus visuels pour présenter votre activité.', benefits: ['Prises de vue professionnelles', 'Montage soigné', 'Formats adaptés aux réseaux'], zone: 'À définir' },
  { id: 'digital', name: 'Communication digitale', cat: 'crea', summary: 'Contenus et visibilité en ligne pour votre organisation.', benefits: ['Plan de communication', 'Création de contenus', 'Suivi des résultats'], zone: 'À définir' },
  { id: 'partenaires', name: 'Recherche de partenaires', cat: 'ent', summary: 'Présentez votre projet et trouvez des partenaires.', benefits: ['Mise en valeur de votre projet', 'Opportunités vérifiées', 'Mise en relation encadrée'], zone: 'À définir' },
];

export const statusLabel: Record<string, string> = {
  received: 'Reçue', in_review: 'En cours', quote_sent: 'Devis envoyé', accepted: 'Acceptée', done: 'Terminée', refused: 'Refusée',
};
export const catName = (id: string) => categories.find(c => c.id === id)?.name ?? id;
export const catIcon = (id: string) => categories.find(c => c.id === id)?.icon ?? 'spark';
