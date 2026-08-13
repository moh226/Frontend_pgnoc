# PGNOC-TI — Frontend

Interface web de la plateforme de gestion numérique des ordres de cession.

## Stack

- Vue 3 (`<script setup>`) + TypeScript strict
- Vite 8 + vue-tsc
- Vuetify 4 (+ @mdi/font)
- Vue Router 5 + Pinia 4
- Axios (client JWT avec rafraîchissement automatique)
- Vee-Validate + Yup (formulaires, à venir)

## Démarrage

```bash
npm install
npm run dev        # http://localhost:5173
```

Le serveur Vite relaie `/api` et `/media` vers le backend
(`http://127.0.0.1:8000`, voir `vite.config.ts`). Le backend Django doit
donc tourner sur le port 8000 :

```bash
# côté backend
./env/bin/python manage.py runserver
```

## Scripts

| Commande          | Rôle                                        |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Serveur de développement                    |
| `npm run build`   | Vérification de types puis build de prod    |
| `npm run typecheck` | Vérification de types uniquement          |

## Structure

```
src/
  api/          client axios (Bearer + refresh) et modules par domaine
  components/   composants réutilisables
  config/       navigation et libellés par rôle
  layouts/      coquille applicative (barre, tiroir, zone de contenu)
  router/       routes + gardes d'accès par rôle (4 rôles + public)
  stores/       stores Pinia (session JWT persistée)
  types/        types partagés alignés sur l'API Django
  utils/        décodeur JWT
  views/        écrans par espace
```

## Rôles

| Code            | Espace                    |
| --------------- | ------------------------- |
| `INVESTISSEUR`  | `/espace-investisseur`    |
| `AGENT_SGI`     | `/espace-agent`           |
| `ADMIN_SGI`     | `/admin-sgi`              |
| `ADMIN_GENERAL` | `/admin-general`          |

## Comptes de démonstration (backlog)

`./env/bin/python manage.py seed_demo` (côté backend) crée un compte par
rôle — voir le guide de test du backend.