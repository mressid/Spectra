import Link from "next/link";
import { words } from "@/lib/words";
import { JsonLd } from "./JsonLd";

export interface Crumb {
    name: string;
    href: string;
}

/** Accueil › Catégorie › Produit, with the BreadcrumbList Google reads. */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
    const all = [{ name: words.home, href: "/" }, ...crumbs];
    const site = process.env.SITE_URL ?? "http://localhost:3000";
    return (
        <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-muted">
            <ol className="flex flex-wrap gap-1">
                {all.map((crumb, index) => (
                    <li key={crumb.href} className="flex gap-1">
                        {index > 0 && <span aria-hidden>›</span>}
                        {index < all.length - 1 ? (
                            <Link href={crumb.href} className="hover:text-ink">{crumb.name}</Link>
                        ) : (
                            <span aria-current="page" className="text-ink">{crumb.name}</span>
                        )}
                    </li>
                ))}
            </ol>
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    itemListElement: all.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: `${site}${crumb.href}` })),
                }}
            />
        </nav>
    );
}
