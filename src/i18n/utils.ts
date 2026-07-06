import fr from './fr.json';
import en from './en.json';

export const languages = ['fr', 'en'] as const;
export type Lang = (typeof languages)[number];

export const dictionaries = { fr, en } satisfies Record<Lang, typeof fr>;

export function useTranslations(lang: Lang) {
  return dictionaries[lang];
}

export function alternateLang(lang: Lang): Lang {
  return lang === 'fr' ? 'en' : 'fr';
}

export function pathForLang(lang: Lang): string {
  return lang === 'fr' ? '/' : '/en';
}
