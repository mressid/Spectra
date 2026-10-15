import type { Language } from "./api/client";

/**
 * French first. Until the bilingual decision is made (docs/ROADMAP.md), the site is French only and
 * pages use this constant; switching to /fr and /en routes later replaces it with a route parameter.
 */
export const LANGUAGE: Language = "fr";
