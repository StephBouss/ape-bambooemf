/**
 * Données centralisées de l'opération EO BAMBOO EMF 7,25% Brut 2026-2029.
 * Toute valeur non confirmée par le Document d'Information visé est `null` —
 * les composants doivent alors afficher "voir le Document d'Information",
 * jamais une valeur inventée. Voir README.md § Placeholders.
 */

export const operation = {
  issuerName: 'BAMBOO EMF SA',
  issuerLegalForm: 'Société Anonyme (S.A.)',
  title: 'EO BAMBOO EMF 7,25% Brut 2026-2029',
  nature: "Emprunt obligataire par Appel Public à l'Épargne (APE)",
  cosumafVisa: 'COSUMAF-APE-03/26',
  amount: 5_000_000_000,
  amountLabel: '5 000 000 000 FCFA',
  amountShort: '5 Mds FCFA',
  titlesCount: 5_000_000,
  nominalValue: 1_000,
  subscriptionPrice: 1_000,
  subscriptionPricePct: '100% au pair',
  subscriptionStart: '2026-07-15',
  subscriptionEnd: '2026-10-12',
  subscriptionEndDisplay: '12 octobre 2026',
  /** 23:59:59 Afrique de l'Ouest (UTC+1) le jour de clôture, en UTC. */
  subscriptionEndISO: '2026-10-12T22:59:59Z',
  minUnits: 50,
  minAmount: 50_000,
  eligibility: 'Toute personne physique ou morale',
  durationYears: 3,
  interestRate: 7.25,
  interestPayment: 'Semestriellement, à partir de la date de jouissance',
  capitalRepayment: '1 an de différé, puis chaque semestre pendant les 2 dernières années',
  listingVenue: "Bourse des Valeurs Mobilières de l'Afrique Centrale (BVMAC)",
  arranger: 'Africa Bright Securities',

  /** Non confirmées par le DI au moment de la mise en ligne — laisser null tant que non figées. */
  valueDate: null as string | null,
  maturityDate: null as string | null,
} as const;

export const issuer = {
  name: 'Bamboo Microfinance',
  legalName: 'Bamboo Microfinance S.A.',
  status: 'Établissement de Microfinance (EMF) de 2ème catégorie',
  legalForm: 'Société Anonyme (S.A.)',
  regulator: "Commission Bancaire de l'Afrique Centrale (COBAC)",
  hqAddress: 'Avenue Boulevard Triomphal, Libreville, Gabon',
  phones: ['+241 060 41 21 21', '+241 77 41 21 21'],
  email: 'service.client@bamboo-emf.com',
  website: 'www.bamboo-emf.com',
  agenciesSummary: '14 agences réparties dans le pays',
  objectives: [
    'Financer le développement du portefeuille de crédit auprès de la clientèle cible',
    'Renforcer la structure bilancielle et les fonds propres',
    'Diversifier les sources de financement à moyen terme',
    "Accompagner la croissance du réseau d'agences en zone CEMAC",
  ],
} as const;

/** Arrangeur & Chef de file — coordonnées de contact officielles (section Contact). */
export const arrangerContact = {
  name: 'Africa Bright Securities',
  role: 'Arrangeur & Chef de file',
  address: '316 Rue Victoria, Bonanjo, Immeuble Victoria, 5ème étage, BP 15451, Douala, Cameroun',
  phone: '+237 652 85 10 10',
  email: 'info@gtlinvestments.com',
  website: 'www.africabright.com',
  cosumafApproval: 'COSUMAF SDB-02-2020',
} as const;

export type SyndicateMember = {
  name: string;
  role?: 'chef-de-file' | 'membre';
  address: string;
  phone?: string;
  website?: string;
  logo?: string; // /img/syndicate/<logo> — omis si non fourni (repli sur initiales)
};

export type SyndicateCountryGroup = {
  country: string;
  flag: string; // /img/flags/<flag>.png
  members: SyndicateMember[];
};

/**
 * Syndicat de placement, groupé par pays. Les coordonnées d'Africa Bright Securities
 * ici reprennent volontairement celles de `arrangerContact` (source retenue par le client),
 * et non celles d'une version antérieure de ce tableau.
 */
export const syndicate: SyndicateCountryGroup[] = [
  {
    country: 'Cameroun',
    flag: 'cameroun',
    members: [
      {
        name: 'Africa Bright Securities',
        role: 'chef-de-file',
        address: arrangerContact.address,
        phone: arrangerContact.phone,
        website: arrangerContact.website,
        logo: 'africa-bright.png',
      },
      {
        name: 'Attijari Securities Central Africa (ASCA)',
        address: 'Rue Njoh Njoh, Carrefour Soppo, Immeuble du Phare 3ème étage, Bonapriso — B.P. 255 Douala',
        logo: 'asca.webp',
      },
      {
        name: 'Beko Capital Advisory',
        address: 'Bonanjo, 620 Rue du Gouverneur Carras, Immeuble Grassfields — B.P. 2684 Douala',
        logo: 'beko-capital.jpg',
      },
      {
        name: 'Elite Capital Securities Central Africa',
        address: 'Bastos — Yaoundé — B.P. 35303',
        logo: 'elite-capital.jpg',
      },
      {
        name: 'Fedhen Capital',
        address: 'Immeuble Indigo, Bonapriso, 5ème étage, Douala',
        logo: 'fedhen-capital.jpg',
      },
    ],
  },
  {
    country: 'Gabon',
    flag: 'gabon',
    members: [
      {
        name: 'Bamboo Securities Central Africa (BAMS)',
        address: 'Boulevard Triomphal Omar Bongo — BP 9687 Libreville',
        logo: 'bams.png',
      },
      {
        name: 'BGFI Bourse',
        address: 'Boulevard du Bord de Mer, 3ème étage, Immeuble Odyssée — BP 2253 Libreville',
        website: 'www.bgfibourse.com',
        logo: 'bgfi-bourse.png',
      },
    ],
  },
  {
    country: 'Congo',
    flag: 'congo',
    members: [
      {
        name: "L'Archer Securities",
        address: 'Brazzaville, Mpila, 20ème étage bureau 2002, Bloc A, Business Center, Tour Jumelles',
        logo: 'larcher-securities.png',
      },
    ],
  },
  {
    country: 'Guinée Équatoriale',
    flag: 'guinee-equatoriale',
    members: [
      {
        name: 'Bange Sociedad De Valores',
        address: 'Avenida De Las Naciones Unidas, N°28 Apdo 430 — Malabo',
        logo: 'bange.png',
      },
    ],
  },
  {
    country: 'Tchad',
    flag: 'tchad',
    members: [
      {
        name: 'Commercial Bank Tchad - Bourse (CBT)',
        address: 'BP 19 Ndjaména',
        logo: 'cbt-bourse.png',
      },
    ],
  },
];

export type FluxYear = {
  year: number;
  kind: 'interets' | 'interets-capital' | 'remboursement';
  label: string;
};

/**
 * Flux annuels schématiques pour le graphe SVG. Modalités précises d'amortissement
 * à figer sur le Document d'Information visé — voir §3 Caractéristiques pour le
 * détail contractuel (différé 1 an, puis capital + intérêts chaque semestre).
 */
export const fluxAnnuels: FluxYear[] = [
  { year: 2026, kind: 'interets', label: 'Intérêts seuls' },
  { year: 2027, kind: 'interets', label: 'Intérêts seuls' },
  { year: 2028, kind: 'interets-capital', label: 'Intérêts + Capital' },
  { year: 2029, kind: 'remboursement', label: 'Remboursement total' },
];

export type DocumentItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string | null; // null => pas encore disponible
};

export const documents: DocumentItem[] = [
  {
    id: 'note-information',
    title: "Note d'information",
    subtitle: "Prospectus complet de l'émission",
    href: null,
  },
  {
    id: 'bulletin-souscription',
    title: 'Bulletin de souscription',
    subtitle: 'Formulaire officiel de souscription',
    href: '/documents/bulletin-souscription.pdf',
  },
  {
    id: 'resume-executif',
    title: 'Résumé exécutif',
    subtitle: 'Synthèse des caractéristiques clés',
    href: null,
  },
  {
    id: 'depliant-presentation',
    title: 'Dépliant de présentation',
    subtitle: "Aperçu synthétique de l'opération",
    href: '/documents/depliant-presentation.pdf',
  },
];

/** Vidéo de présentation de l'opération, lue directement depuis la landing page. */
export const promoVideo = {
  src: '/video/spot-ape.mp4',
} as const;

export const regulatory = {
  cosumafVisa: 'COSUMAF-APE-03/26',
  warningFr:
    "L'attention des investisseurs potentiels est attirée sur le fait qu'un investissement financier comporte des risques et que la valeur des titres est susceptible d'évoluer à la hausse comme à la baisse, sous l'influence de facteurs internes ou externes à l'Émetteur. L'octroi par la COSUMAF d'un visa n'implique ni approbation de l'opportunité de l'opération, ni authentification des informations contenues dans le document d'information ; il a été attribué après examen de la pertinence et de la cohérence de l'information.",
  legalNoticeFr:
    "Les informations contenues sur ce site sont fournies à titre informatif uniquement et ne constituent ni une offre de vente ni une sollicitation d'achat de titres. Toute décision d'investissement doit être fondée exclusivement sur le Document d'Information relatif à l'opération, enregistré sous le numéro COSUMAF-APE-03/26.",
} as const;

export const siteMeta = {
  domain: 'ape-bambooemf.com',
  activeFrom: '2026-07-15',
  activeTo: '2026-10-12',
} as const;
