# Fiche technique — Site EO BAMBOO EMF 7,25% Brut 2026-2029

Document de passation à destination de l'équipe technique qui reprendra le site.
Dernière mise à jour : 16 juillet 2026.

## 1. Résumé du projet

Site vitrine bilingue (FR/EN) présentant l'Appel Public à l'Épargne (APE) de
Bamboo Microfinance. 100% statique — aucun backend, aucune base de données.
Le seul point d'interaction dynamique est le formulaire "Je veux investir",
qui envoie un email via un service tiers (Web3Forms, voir §6).

- **Dépôt Git** : https://github.com/StephBouss/ape-bambooemf
- **Domaine** : ape-bambooemf.com (voir §7 pour la configuration DNS)
- **Hébergement** : Vercel, déploiement automatique sur push vers `main`

## 2. Stack technique

| Élément | Choix |
|---|---|
| Framework | [Astro](https://astro.build) 4.x (`output: 'static'`, aucun adapter) |
| Langage | TypeScript |
| Styles | Tailwind CSS 3.x |
| Animations | GSAP + ScrollTrigger, Lenis (smooth scroll) |
| Icônes | astro-icon (set Tabler + circle-flags) |
| Polices | Fontsource (Poppins = display, Inter = texte courant) |
| Formulaire | Web3Forms (API REST, aucune clé privée côté serveur) |
| Hébergement | Vercel (build statique déployé tel quel) |

Aucune base de données, aucune API custom, aucun CMS. Tout le contenu vit
dans le code (voir §4).

## 3. Installation & commandes

```bash
npm install
npm run dev       # http://localhost:4321  (FR: /, EN: /en)
npm run build      # génère dist/ (site statique complet)
npm run preview    # sert dist/ localement, pour valider un build avant déploiement
```

Node.js ≥ 18 recommandé (testé avec Node 24). Pas de variables d'environnement
requises pour builder — voir §6 sur la clé Web3Forms, actuellement en dur dans
le code source (point d'attention, pas un `.env`).

## 4. Architecture des dossiers

```
src/
  layouts/BaseLayout.astro    <head> : SEO, Open Graph, hreflang FR/EN,
                                JSON-LD (schema.org FinancialProduct), favicon
  components/                 Un composant Astro par section de la page :
    Nav, ScrollProgress, Hero, CountdownBar, IssuerSection, VideoSection,
    SpecTable, FluxChart, SimulatorSection, SyndicateTable, SubscribersTable,
    DocumentsGrid, ContactSection, Disclaimer, Footer
  data/
    operation.ts               Données centralisées de l'opération : montant,
                                taux, dates, émetteur, arrangeur, syndicat de
                                placement, documents téléchargeables, flux
                                annuels. C'est LE fichier à modifier pour
                                toute mise à jour de contenu chiffré.
    countries.ts                Liste des pays (sélecteur du formulaire modal)
  i18n/
    fr.json                     Dictionnaire français — langue de référence
    en.json                     Dictionnaire anglais — doit avoir exactement
                                 les mêmes clés que fr.json (vérifié par le
                                 typage TypeScript, voir utils.ts)
    utils.ts                    Chargement des dictionnaires, helpers de langue
  pages/
    index.astro                 Page FR (/)
    en/index.astro               Page EN (/en) — structure identique à index.astro,
                                  toute nouvelle section doit être ajoutée aux DEUX
  scripts/
    animations.ts                GSAP/ScrollTrigger/Lenis — respecte
                                  prefers-reduced-motion (désactivation propre)
    countdown.ts                 Compte à rebours de la période de souscription
    simulator.ts                 Logique du simulateur + soumission du formulaire
                                  modal "Je veux investir" (voir §6)
  styles/tokens.css              Variables CSS (couleurs, etc.) complémentaires
                                  à tailwind.config.mjs
public/
  documents/                     PDF officiels téléchargeables (préfixés
                                  EO_Bamboo_ pour le référencement)
  img/syndicate/                 Logos des agents placeurs
  img/flags/                     Drapeaux pays (syndicat + sélecteur modal)
  video/spot-ape.mp4              Vidéo de présentation
  favicon.png, robots.txt
```

Tailwind : couleurs de marque, polices et ombres personnalisées dans
`tailwind.config.mjs` (`vert-marque`, `vert-foret`, `navy`, `jaune-taux`, etc.).
Toujours réutiliser ces tokens plutôt que des couleurs en dur, pour rester
cohérent avec la charte graphique.

## 5. Mettre à jour le contenu

Presque tout le contenu texte passe par les dictionnaires i18n
(`src/i18n/fr.json` / `en.json`) — les deux fichiers doivent rester
structurellement identiques (mêmes clés). Les données chiffrées/structurées
(montants, dates, listes d'agents placeurs, documents) sont dans
`src/data/operation.ts`, typé strictement :

- `operation` — caractéristiques de l'émission (montant, taux, dates, etc.)
- `issuer` — coordonnées de l'émetteur (Bamboo Microfinance)
- `arrangerContact` — coordonnées de l'arrangeur (Africa Bright Securities)
- `syndicate` — agents placeurs groupés par pays, type `SyndicateMember` avec
  `phones?: string[]` (plusieurs numéros possibles par agent)
- `documents` — les 4 documents téléchargeables (voir `href` = chemin dans
  `public/documents/`, `null` = affiche "Bientôt disponible")
- `fluxAnnuels` — données du graphique de flux (`FluxChart.astro`)

**Convention de nommage des PDF** : préfixe `EO_Bamboo_` pour un meilleur
référencement (SEO), déjà appliqué aux 4 documents en place.

## 6. Formulaire "Je veux investir"

Le bouton du simulateur ouvre une modale (`SimulatorSection.astro`) dont la
soumission est gérée par `src/scripts/simulator.ts`. Elle envoie les données
en `POST` JSON directement à l'API **Web3Forms**
(`https://api.web3forms.com/submit`), qui relaie l'email vers
`info@bamboo-securities.com` — aucun client mail ne s'ouvre côté utilisateur.

```ts
// src/scripts/simulator.ts — extrait
await fetch('https://api.web3forms.com/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({
    access_key: cfg.web3FormsAccessKey,
    subject: cfg.ctaSubject,
    from_name: `${nom} ${prenom}`,
    email,
    message: body,
  }),
});
```

**⚠️ Point d'attention sécurité/maintenance** : la clé d'accès Web3Forms
(`web3FormsAccessKey`) est actuellement écrite en clair dans
`src/data/operation.ts` et committée dans le dépôt Git. C'est une clé
*publique* côté Web3Forms (conçue pour un usage client-side, pas un secret
serveur), donc pas un risque de sécurité critique — mais toute personne
avec accès au dépôt peut l'utiliser pour envoyer des emails via ce compte.
Si le client souhaite une meilleure hygiène, migrer vers une variable
d'environnement (`import.meta.env.PUBLIC_WEB3FORMS_KEY`) est une amélioration
simple à faire lors de la reprise.

Le compte Web3Forms est enregistré avec l'adresse `info@bamboo-securities.com`
— voir §8 pour les accès à transmettre.

## 7. Déploiement & domaine

- **Build** : 100% statique (`output: 'static'`), `npm run build` → `dist/`.
  Déployable sur Vercel, Cloudflare Pages, ou tout hébergeur de fichiers
  statiques.
- **Vercel** : le projet est connecté au dépôt GitHub `StephBouss/ape-bambooemf`,
  déploiement automatique sur chaque push vers `main`. Pas d'adapter Vercel
  installé (`@astrojs/vercel`) — le build Astro statique est servi tel quel.
- **Domaine `ape-bambooemf.com`** : pointé vers le déploiement Vercel via de
  vrais enregistrements DNS (A/CNAME) configurés chez le registrar — **ne
  pas** repasser par un système de redirection/masquage par frame (`<frameset>`)
  comme c'était le cas avant correction : cela cassait le favicon, le SEO et
  empêchait un certificat HTTPS propre sur le domaine.
- `astro.config.mjs` → `site: 'https://ape-bambooemf.com'` : à mettre à jour
  si le domaine final change un jour.

## 8. Accès à transmettre au client / à la nouvelle équipe

- **Dépôt GitHub** : `StephBouss/ape-bambooemf` — accès en tant que
  collaborateur ou transfert de propriété.
- **Projet Vercel** : accès à l'organisation/au projet Vercel lié au dépôt.
- **Compte Web3Forms** : créé avec `info@bamboo-securities.com` — nécessaire
  pour retrouver/régénérer la clé d'accès (`web3FormsAccessKey`) si besoin.
- **Registrar du domaine `ape-bambooemf.com`** : accès pour gérer les
  enregistrements DNS.
- **Google Search Console** (si créé) : propriété `ape-bambooemf.com`.

## 9. Points d'attention / dette technique connue

1. **Dates non confirmées** : `operation.valueDate` et `operation.maturityDate`
   sont à `null` dans `operation.ts` → le site affiche "voir le Document
   d'Information" tant qu'elles ne sont pas figées.
2. **Agent placeur sans téléphone** : Elite Capital Securities Central Africa
   n'a pas de champ `phones` renseigné dans `syndicate` (jamais communiqué) —
   à ajouter si le client fournit le numéro.
3. **Clé Web3Forms en dur** dans le code (voir §6) — acceptable en l'état,
   amélioration possible via variable d'environnement.
4. **Modalités d'amortissement** (`fluxAnnuels`) : répartition qualitative
   par année, à confirmer précisément sur le Document d'Information visé
   par la COSUMAF si des changements interviennent.
5. **Accessibilité** : toutes les animations (GSAP/ScrollTrigger, Lenis,
   feuilles flottantes) respectent déjà `prefers-reduced-motion` — à
   conserver pour toute nouvelle animation ajoutée.
6. **SEO** : sitemap auto-généré (`@astrojs/sitemap`), `robots.txt`, meta
   tags complets, JSON-LD `FinancialProduct` déjà en place dans
   `BaseLayout.astro`. Reste à faire manuellement si pas déjà fait : vérifier
   la propriété dans Google Search Console et soumettre le sitemap.

## 10. Historique / contexte

Le site a été développé et maintenu par itérations successives avec un
assistant IA (Claude Code) — l'historique complet des changements est
consultable via `git log` sur le dépôt. Chaque commit correspond à une
demande fonctionnelle précise (ajout de documents, numéros de téléphone du
syndicat, formulaire d'envoi direct, etc.), avec des messages de commit
descriptifs.
