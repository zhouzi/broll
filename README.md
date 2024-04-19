# broll.gabin.app

Cette application permet de récupérer les informations d'une vidéo YouTube afin d'en générer une vignette personnalisée.

Elle fait suite à une demande de [BastiUi](https://x.com/BastiUi/status/1779866139880755295) et un challenge de [BenjaminCode](https://x.com/benjamincode/status/1779876164296937928).

- [broll.gabin.app](https://broll.gabin.app)

## Installation

1. `npm install`
2. Créer le fichier `.env.local` en se basant sur le `.env.example`

## Déploiement

1. [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzhouzi%2Fbroll&env=YOUTUBE_API_KEY)
2. Ajouter les variables d'environnement en suivant les instructions d'installation (sauf celles ajoutées automatiquement par Vercel)
3. Activer les analytics sur Vercel (optionnel)
4. Créer et attacher un KV store sur Vercel
