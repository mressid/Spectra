import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Language } from "@/lib/api/client";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { JsonLd } from "./JsonLd";

export interface Crumb {
    name: string;
    // path without the language, e.g. "/categories/x"
    path: string;
}

/** Home › Category › Product, with the BreadcrumbList Google reads. */
export function Breadcrumb({ lang, crumbs }: { lang: Language; crumbs: Crumb[] }) {
    const words = getWords(lang);
    const all = [{ name: words.home, path: "/" }, ...crumbs];
    const site = process.env.SITE_URL ?? "http://localhost:3000";
    return (
        <nav aria-label={words.breadcrumb} className="mb-5 text-xs text-muted">
            <ol className="flex flex-wrap items-center gap-1">
                {all.map((crumb, index) => (
                    <li key={crumb.path} className="flex items-center gap-1">
                        {index > 0 && <ChevronRight size={13} aria-hidden className="text-faint" />}
                        {index < all.length - 1 ? (
                            <Link href={localPath(lang, crumb.path)} className="hover:text-ink">{crumb.name}</Link>
                        ) : (
                            <span aria-current="page" className="line-clamp-1 text-ink">{crumb.name}</span>
                        )}
                    </li>
                ))}
            </ol>
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: all.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: `${site}${localPath(lang, crumb.path)}` })),
                }}
            />
        </nav>
    );
}
