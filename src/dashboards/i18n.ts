// Dashboard languages: English, Urdu and Arabic (right-to-left). The shared components (menu, headers, cards,
// tables, form labels, empty states, sign-in) translate their text through t(); text without a translation
// stays English. Translations are drafts until a native speaker has reviewed them.
import { useSyncExternalStore } from 'react';
import { AR, UR } from './i18nStrings';

export type Lang = 'en' | 'ur' | 'ar';
export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ur', label: 'اردو' },
  { code: 'ar', label: 'العربية' },
];
const DICTS: Record<Lang, Record<string, string>> = { en: {}, ur: UR, ar: AR };
const KEY = 'rx-dashboard-lang';

function stored(): Lang | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'en' || v === 'ur' || v === 'ar' ? v : null;
  } catch {
    return null;
  }
}

let current: Lang = stored() || 'en';
const listeners = new Set<() => void>();

function apply() {
  document.documentElement.lang = current;
  document.documentElement.dir = current === 'en' ? 'ltr' : 'rtl';
}
apply();

function use(lang: Lang) {
  current = lang;
  apply();
  listeners.forEach((l) => l());
}

/** The viewer's choice; remembered in this browser. */
export function setLang(lang: Lang) {
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    /* private mode: the choice lasts for this visit */
  }
  use(lang);
}

/** The account's language from ERPNext, used when this browser has no choice saved yet. */
export function adoptAccountLanguage(language: string | undefined) {
  if (!stored() && (language === 'ur' || language === 'ar') && current !== language) use(language);
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

export function t<T>(text: T): T {
  if (current === 'en' || typeof text !== 'string') return text;
  return ((DICTS[current][text] as unknown as T) ?? text);
}

/** Translate a template, then fill {0}, {1}… (numbers and amounts stay as they are). */
export function tf(template: string, ...args: (string | number)[]): string {
  return args.reduce<string>((text, arg, i) => text.split(`{${i}}`).join(String(arg)), t(template));
}

/** English singular/plural template by count, e.g. tn(n, '{0} deal', '{0} deals'). */
export function tn(n: number, one: string, many: string): string {
  return tf(n === 1 ? one : many, n);
}
