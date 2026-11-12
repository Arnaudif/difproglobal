# DIFPROGLOBAL — MVP (socle)
Frontend React + TypeScript + Vite · Backend Netlify Functions · Base Supabase (Postgres) · Connexion Pi uniquement.

## État réel
Fonctionne (à tester) : navigation 5 onglets, catalogue de DÉMONSTRATION, connexion Pi vérifiée serveur (/me), session signée, création et liste des demandes (enregistrées en base, référence renvoyée seulement après insertion).
Ajouté : alertes réelles (notifications créées quand un administrateur change le statut d'une demande) et espace administrateur (liste des demandes, changement de statut, journal). Le rôle est contrôlé côté serveur à chaque appel.
Pas encore fait : gestion des services/catégories en base, espace prestataire, favoris, bilingue, images, tests automatisés.
Ce code n'a PAS été exécuté ni compilé ici (pas de réseau) : lancez `npm install` puis `npm run build` et signalez-moi toute erreur.

## Mise en place
1. Supabase : créer un projet, exécuter `supabase/schema.sql` (SQL Editor). Copier l'URL et la clé « service_role ».
2. GitHub : envoyer ce dossier (le fichier `.env` n'est jamais envoyé).
3. Netlify : importer le dépôt (build `npm run build`, dossier `dist`). Variables d'environnement : `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Pi Developer Portal (dans Pi Browser) : créer l'app Testnet, mettre l'URL Netlify, générer la clé API serveur (à coller dans Netlify uniquement).
5. Tester dans Pi Browser : connexion, envoi d'une demande, vérification dans Supabase > Table editor > requests.

## Premier administrateur
Connectez-vous une fois avec Pi, puis dans Supabase > SQL Editor : `update profiles set role = 'admin' where lower(username) = lower('VOTRE_NOM_PI');`. Reconnectez-vous ensuite : « Espace administrateur » apparaît dans le Profil.

## Local
`npm install` puis `npx netlify dev` (fichier `.env` copié depuis `.env.example`).

## Déploiement sur Render (gratuit)
Le fichier `render.yaml` décrit le service. Le serveur `server/index.ts` sert le site et l'API sous `/api/*`.
Variables à saisir dans Render : `SUPABASE_SERVICE_ROLE_KEY`, `PI_API_KEY` (`SESSION_SECRET` est générée automatiquement). Build : `npm install --include=dev && npm run build`, démarrage : `npm start`.
Netlify reste possible (`netlify.toml` redirige /api/* vers les fonctions).
