# MapIntel

Carte mondiale interactive des cyberattaques, à partir de sources publiques :

- **Ransomware** : [ransomware.live](https://www.ransomware.live) (7 derniers jours)
- **Phishing** : [AlienVault OTX](https://otx.alienvault.com) (clé gratuite requise)
- **Groupes APT** : [MISP Galaxy](https://github.com/MISP/misp-galaxy) (groupes originaires d'un pays / qui l'ont ciblé)

Survol d'un pays : nombre d'attaques par type. Clic : panneau Entreprises / Gouvernement / Groupes APT.
Filtres par type d'attaque et par secteur, zoom à la molette ou au pincement.

## Lancer le projet

1. `npm install` (Node.js 22 ou plus)
2. Créer un fichier `.env.local` :
   ```
   OTX_API_KEY=votre_cle_otx
   ```
   Sans clé, la carte fonctionne : seul le phishing est désactivé.
3. `npm run dev`, puis http://localhost:3000

## Stack

Next.js (App Router), React, Tailwind CSS v4, d3-geo / d3-zoom, TopoJSON (world-atlas).
Les sources sont interrogées par des routes serveur (`src/app/api/`) : la clé OTX n'est jamais envoyée au navigateur.
