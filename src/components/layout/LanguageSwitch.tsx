"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Language } from "@/lib/api/client";
import { LANGUAGE_NAMES } from "@/lib/i18n";

/** FR · EN: the same page in the other language; the choice is remembered for the next visit to "/". */
export function LanguageSwitch({ lang, languages, block = false }: { lang: Language; languages: Language[]; block?: boolean }) {
    const pathname = usePathname();
    if (languages.length < 2) return null;
    const rest = pathname.replace(/^\/(fr|en)(?=\/|$)/, "");
    return (
        <nav aria-label="Language" className={block ? "flex gap-2 py-2" : "flex items-center"}>
            {languages.map((code) => (
                <Link
                    key={code}
                    href={`/${code}${rest}`}
                    hrefLang={code}
                    lang={code}
                    aria-current={code === lang ? "true" : undefined}
                    title={LANGUAGE_NAMES[code]}
                    onClick={() => {
                        document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
                    }}
                    className={`rounded-chip px-2 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                        code === lang ? "text-ink" : "text-faint hover:text-ink"
                    } ${block ? "border border-field px-3 py-2 text-sm" : ""}`}
                >
                    {code}
                </Link>
            ))}
        </nav>
    );
}
