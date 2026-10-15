import type { Language } from "./api/client";

/**
 * Languages of the storefront. Pages live under /fr/… and /en/…; the store settings say which ones the
 * shop offers (store-settings.languages) and which is the default. Product texts come from the admin as
 * written; only the website's own words are translated (src/lib/words.ts).
 */
export const LANGUAGES: Language[] = ["fr", "en"];
export const DEFAULT_LANGUAGE: Language = "fr";

export const isLanguage = (value: string): value is Language => (LANGUAGES as string[]).includes(value);

/** "/products/x" in a language: "/fr/products/x". */
export const localPath = (lang: Language, path: string) => `/${lang}${path === "/" ? "" : path}`;

export const LANGUAGE_NAMES: Record<Language, string> = { fr: "Français", en: "English" };

/** Canonical URL of a page and its other-language versions (hreflang), for generateMetadata. */
export const alternates = (lang: Language, path: string) => ({
    canonical: localPath(lang, path),
    languages: { ...Object.fromEntries(LANGUAGES.map((code) => [code, localPath(code, path)])), "x-default": localPath(DEFAULT_LANGUAGE, path) },
});
