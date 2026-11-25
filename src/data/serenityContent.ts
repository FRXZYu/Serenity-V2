export type SerenitySymbolId = 'estrella' | 'silueta' | 'galaxia' | 'cometa';

export interface EmblemElement {
  id: SerenitySymbolId;
  title: string;
  shortMeaning: string;
  image: string;
  glowColor: string;
  layout: {
    left: string;
    top: string;
    width: string;
  };
  iconScale: number;
}

const assetUrl = (path: string) =>
  `${import.meta.env.BASE_URL.replace(/\/?$/, '/')}${path.replace(/^\/+/, '')}`;

export const SERENITY_WORDMARK = assetUrl('assets/aistudio/serenity_logo_9895c4c1.png');

export const SERENITY_SLOGAN = 'Find me in the future';

export const SERENITY_MOUNTAIN_IMAGE = assetUrl('assets/aistudio/monta_a_serenity_70b526cb.png');

export const NAME_MEANING_CONTENT = {
  pronunciation: '/səˈrɛnɪti/',
  whyThisName:
    'Significa el estado de calma o tranquilidad. Pero cuando lo elegí para nosotros, quise darle una sensación especial.',
  extraMeaning:
    'De estar subiendo una montaña, las nubes tapando la vista, luego ves cómo poco a poco el sol se asoma y ahí te das cuenta de que has llegado a la cima.',
  image: SERENITY_MOUNTAIN_IMAGE,
};

export const UNFORGETTABLE_CONTENT = {
  question: '¿Qué hace inolvidable a una promoción?',
  answer:
    'Para nosotros, son los estudiantes que la conforman, pero, sobre todo, el significado que se le da a todo lo que representan.',
  statements: [
    [
      {text: 'Esta promoción', bold: true},
      {
        text: ' se levanta como un espejo donde los estudiantes puedan verse reflejados y brillar a través de innovación y propósito.',
        bold: false,
      },
    ],
  ],
};

export const MISSION_VISION_CONTENT = {
  mission: {
    label: 'Misión',
    text: 'Que cada estudiante se sienta representado con su significado.',
  },
  vision: {
    label: 'Visión',
    text: 'Y que por su significado sea una promoción atemporal e inolvidable; de la mejor forma posible.',
  },
};

export const CREDITS_LIST = [
  {role: 'Idea', name: 'Kirenia Gutiérrez'},
  {role: 'Rediseño', name: 'Milagros González'},
  {role: 'UI/UX', name: 'Juan Burdick'},
];

export interface LogoAlternative {
  id: string;
  image: string;
  author: string;
  subtitle?: string;
}

export const LOGO_ALTERNATIVES: LogoAlternative[] = [
  {
    id: 'alt-milagros-0001',
    image: assetUrl('assets/aistudio/7_20261123_102415_0001_a47d70a5.png'),
    author: 'Milagros González',
    subtitle: 'Hecho a mano',
  },
  {
    id: 'alt-kirenia-0002',
    image: assetUrl('assets/aistudio/9_20261123_102415_0002_5b780fc6.png'),
    author: 'Kirenia Gutiérrez',
  },
  {
    id: 'alt-kirenia-00001',
    image: assetUrl('assets/aistudio/00001_2455e18d.png'),
    author: 'Kirenia Gutiérrez',
  },
  {
    id: 'alt-kirenia-00002',
    image: assetUrl('assets/aistudio/00002_4d55f9e9.png'),
    author: 'Kirenia Gutiérrez',
  },
  {
    id: 'alt-kirenia-00003',
    image: assetUrl('assets/aistudio/00003_84149276.png'),
    author: 'Kirenia Gutiérrez',
  },
];

export const EMBLEM_ELEMENTS: EmblemElement[] = [
  {
    id: 'cometa',
    title: 'El Cometa',
    shortMeaning: 'Representa esas metas y sueños.',
    image: assetUrl('assets/aistudio/cometa_logo_ac0dbce6.png'),
    glowColor: 'rgba(220, 238, 255, 0.34)',
    layout: {
      left: '0.9%',
      top: '-0.4%',
      width: '52.1%',
    },
    iconScale: 1.12,
  },
  {
    id: 'galaxia',
    title: 'La Galaxia',
    shortMeaning:
      'Donde todos, como estrellas diferentes y únicas, brillamos en unidad como una sola promoción.',
    image: assetUrl('assets/aistudio/galaxia_logo_bf2dbb39.png'),
    glowColor: 'rgba(142, 68, 236, 0.42)',
    layout: {
      left: '0%',
      top: '26.4%',
      width: '99.7%',
    },
    iconScale: 0.66,
  },
  {
    id: 'silueta',
    title: 'Mirar al Cielo',
    shortMeaning: 'Esa mirada fija en lo que deseas y soñar en grande.',
    image: assetUrl('assets/aistudio/silueta_logo_e302909d.png'),
    glowColor: 'rgba(233, 226, 245, 0.24)',
    layout: {
      left: '10.6%',
      top: '11.2%',
      width: '66.5%',
    },
    iconScale: 0.82,
  },
  {
    id: 'estrella',
    title: 'La Esencia',
    shortMeaning:
      'Representa esa luz interior que te guía a lo que verdaderamente te apasiona.',
    image: assetUrl('assets/aistudio/estrella_logo_2ab4667f.png'),
    glowColor: 'rgba(217, 0, 255, 0.44)',
    layout: {
      left: '20.2%',
      top: '54.4%',
      width: '47.4%',
    },
    iconScale: 1.18,
  },
];
