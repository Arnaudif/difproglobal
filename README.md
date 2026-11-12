# DIFPROGLOBAL — MVP (socle)
Frontend React + TypeScript + Vite · Backend Netlify Functions · Base Supabase (Postgres) · Connexion Pi uniquement.

## État réel
Fonctionne (à tester) : navigation 5 onglets, catalogue de DÉMONSTRATION, connexion Pi vérifiée serveur (/me), session signée, création et liste des demandes (enregistrées en base, référence renvoyée seulement après insertion).
Pas encore fait : administration, espace prestataire, alertes réelles (table prête), favoris, paiements Pi, bilingue, images, tests automatisés.
Ce code n'a PAS été exécuté ni compilé ici (pas de réseau) : lancez `npm install` puis `npm run build` et signalez-moi toute erreur.

## Mise en place
1. Supabase : créer un projet, exécuter `supabase/schema.sql` (SQL Editor). Copier l'URL et la clé « service_role ».
2. GitHub : envoyer ce dossier (le fichier `.env` n'est jamais envoyé).
3. Netlify : importer le dépôt (build `npm run build`, dossier `dist`). Variables d'environnement : `PI_API_KEY`, `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_PI_SANDBOX=true`.
4. Pi Developer Portal (dans Pi Browser) : créer l'app Testnet, mettre l'URL Netlify, générer la clé API serveur (à coller dans Netlify uniquement).
5. Tester dans Pi Browser : connexion, envoi d'une demande, vérification dans Supabase > Table editor > requests.

## Local
`npm install` puis `npx netlify dev` (fichier `.env` copié depuis `.env.example`).
