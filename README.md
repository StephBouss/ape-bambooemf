# EO BAMBOO EMF 7,25% Brut 2026-2029 — Site vitrine

Site vitrine statique (Astro) de l'Appel Public à l'Épargne de Bamboo Microfinance.
Aucune fonction transactionnelle, aucun formulaire, aucun backend.

## Stack

Astro (statique) · TypeScript · Tailwind CSS · GSAP + ScrollTrigger · Lenis (smooth scroll) · astro-icon (Tabler) · Fontsource (Poppins, Inter).

## Installation & développement

```bash
npm install
npm run dev       # http://localhost:4321  (FR: /, EN: /en)
npm run build      # génère dist/ (statique)
npm run preview    # sert dist/ localement
```

## Structure

```
src/
  layouts/BaseLayout.astro   — <head>, SEO/OG, hreflang, imports fonts/tokens
  components/                — Nav, ScrollProgress, Hero, CountdownBar, FactsRow,
                                IssuerSection, SpecTable, FluxChart, SyndicateTable,
                                DocumentsGrid, ContactSection, Disclaimer, Footer
  data/operation.ts           — TOUTES les valeurs de l'opération, centralisées
  i18n/fr.json, en.json       — dictionnaires complets (FR = référence)
  pages/index.astro           — page FR (/)
  pages/en/index.astro        — page EN (/en)
  scripts/animations.ts       — GSAP/ScrollTrigger/Lenis, respecte prefers-reduced-motion
  scripts/countdown.ts        — logique du compte à rebours
public/
  documents/                  — PDF officiels déjà fournis (bulletin, dépliant), liés en téléchargement
  video/spot-ape.mp4          — vidéo de présentation, lue dans la section #video (VideoSection.astro)
  img/flags/                  — drapeaux du syndicat de placement
  favicon.svg                 — placeholder, à remplacer par le logo définitif
```

## ⚠️ Placeholders à remplacer avant mise en ligne

1. **Documents officiels manquants** (`src/data/operation.ts` → `documents[].href`) :
   Note d'information, Résumé exécutif.
   Actuellement `href: null` → le site affiche "Bientôt disponible". Déposer les PDF dans
   `public/documents/` et renseigner le chemin dès qu'ils sont visés/disponibles.
   (États financiers retiré de la grille documents à la demande du client ; le Bulletin de
   souscription et le Dépliant de présentation sont déjà téléchargeables.)

2. **Date de jouissance / date d'échéance** (`src/data/operation.ts` → `operation.valueDate`,
   `operation.maturityDate`) : actuellement `null` → le site affiche "voir le Document
   d'Information". À figer sur le Document d'Information visé par la COSUMAF.

3. ~~Photo du hero~~ — fournie (`public/img/hero-photo.jpg`), déjà en place.

4. **Image de partage Open Graph** : `public/img/og-cover.jpg` (1200×630) — pas encore fournie.

5. ~~Logo définitif~~ — fourni (`public/img/logo.png`), déjà branché dans `Nav.astro`.
   ~~Favicon~~ — fourni (`public/favicon.png`), déjà branché dans `BaseLayout.astro`.

6. **Modalités d'amortissement exactes** (`src/data/operation.ts` → `fluxAnnuels`) : le
   panneau "Flux annuels" utilise une répartition qualitative par année (intérêts seuls
   2026-2027, puis intérêts + capital 2028, remboursement total 2029), cohérente avec le
   différé d'1 an annoncé — à confirmer précisément sur le Document d'Information visé.

7. **Domaine de déploiement** : `astro.config.mjs` (`site:`) est réglé sur
   `https://ape-bambooemf.com` — à ajuster si le domaine final diffère.

8. **Poids des fichiers média** — `public/documents/depliant-presentation.pdf` fait ~26 Mo et
   `public/video/spot-ape.mp4` ~210 Mo : envisager des versions compressées avant mise en
   ligne pour un temps de chargement raisonnable (la vidéo notamment gagnerait à être
   ré-encodée ou servie depuis un CDN/service de streaming plutôt qu'en fichier statique brut).

## Accessibilité & animations

Toutes les animations (GSAP/ScrollTrigger, Lenis, count-up, feuilles flottantes) sont
désactivées si `prefers-reduced-motion: reduce` est actif côté utilisateur — le contenu
reste alors visible immédiatement, sans dégradation.

## Déploiement

Sortie 100% statique (`output: 'static'`), déployable telle quelle sur Vercel, Cloudflare
Pages ou tout hébergeur statique. `npm run build` produit `dist/`.
