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

export const NAME_MEANING_CONTENT = {
  pronunciation: '/səˈrɛnɪti/',
  whyThisName:
    'En su sentido más puro representa calma y tranquilidad. Pero cuando elegí este nombre para nosotros solo pude pensar en esto: describe esa sensación de subir una montaña, las nubes tapando la vista hasta que ves la luz del sol asomándose, y en ese silencio te das cuenta de que llegaste a la cima.',
};

export const UNFORGETTABLE_CONTENT = {
  question: '¿Qué hace inolvidable a una promoción?',
  answer:
    'Para nosotros, son los estudiantes que la conforman, pero, sobre todo, el significado que se le da a todo lo que representan.',
  statements: [
    [
      {text: 'Serenity', bold: true},
      {
        text: ' se levanta como un espejo donde cada estudiante, con sus sueños y su propia esencia pueden verse reflejados y brillar a través de innovación y propósito.',
        bold: false,
      },
    ],
    [
      {text: 'Con un enfoque atemporal ', bold: false},
      {text: 'Serenity', bold: true},
      {
        text: ' cobrará un significado eterno plasmado en una promoción de cambio.',
        bold: false,
      },
    ],
    [
      {
        text: 'Lo que deseaba transmitir con este logo era el significado por encima de los diseños para enfocarnos en lo que verdaderamente importa: la culminación de un camino y muchos más que vendrán, la experiencia individual y compartida de cada estudiante entre momentos que no olvidarán.',
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
    text: 'Que por su significado, sea una promoción atemporal e inolvidable; de la mejor forma posible.',
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
    id: 'alt-kirenia-0000',
    image: assetUrl('assets/aistudio/3_20261123_102415_0000_fc664d56.png'),
    author: 'Kirenia Gutiérrez',
  },
  {
    id: 'alt-kirenia-0002',
    image: assetUrl('assets/aistudio/9_20261123_102415_0002_5b780fc6.png'),
    author: 'Kirenia Gutiérrez',
  },
];

export const EMBLEM_ELEMENTS: EmblemElement[] = [
  {
    id: 'cometa',
    title: 'La Pasión',
    shortMeaning:
      'Entregarse con ilusión a aquello que nos hace sentir vivos y perseguir lo que soñamos.',
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
      'Una promoción unida por el significado de cada estudiante. Un brillo irrepetible en un mismo universo.',
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
    shortMeaning:
      'Un reflejo de quien eres: atreverse a mirar arriba y soñar en grande sin dejar de aspirar a más.',
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
    title: 'La Luz Interior',
    shortMeaning:
      'Ese brillo único que te define y que, aunque intentes ocultarlo, siempre termina saliendo.',
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
