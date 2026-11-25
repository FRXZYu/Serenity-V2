import {
  EMBLEM_ELEMENTS,
  GARMENT_DESIGNS,
  LOGO_ALTERNATIVES,
  SERENITY_MOUNTAIN_IMAGE,
  SERENITY_WORDMARK,
} from '../data/serenityContent';

export const ALL_SERENITY_ASSET_URLS: readonly string[] = [
  SERENITY_WORDMARK,
  SERENITY_MOUNTAIN_IMAGE,
  ...EMBLEM_ELEMENTS.map((el) => el.image),
  ...LOGO_ALTERNATIVES.map((alt) => alt.image),
  ...GARMENT_DESIGNS.map((garment) => garment.image),
];

// Keep references in memory so mobile browsers never evict decoded bitmaps
const retainedImageCache = new Map<string, HTMLImageElement>();
let started = false;

export function preloadAllSerenityAssets(): void {
  if (typeof window === 'undefined' || started) return;
  started = true;

  const head = document.head;

  ALL_SERENITY_ASSET_URLS.forEach((src, index) => {
    if (head && !head.querySelector(`link[rel="preload"][href="${src}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      if (index < 5 && 'fetchPriority' in link) {
        (link as HTMLLinkElement & {fetchPriority?: string}).fetchPriority = 'high';
      }
      head.appendChild(link);
    }

    if (!retainedImageCache.has(src)) {
      const img = new Image();
      img.decoding = 'sync';
      if (index < 5 && 'fetchPriority' in img) {
        (img as HTMLImageElement & {fetchPriority?: string}).fetchPriority = 'high';
      }
      img.src = src;
      retainedImageCache.set(src, img);

      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    }
  });
}

// Execute immediately upon module evaluation (before first screen transition)
preloadAllSerenityAssets();
