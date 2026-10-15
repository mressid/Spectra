import Image from "next/image";
import Link from "next/link";
import type { HomeSection } from "@/lib/api/catalog";
import { richTextToHtml } from "@/lib/html";
import { formatMoney } from "@/lib/format";
import { words } from "@/lib/words";
import { ProductCard } from "../ProductCard";
import { ProductGrid } from "../ProductGrid";
import { Carousel } from "./Carousel";

/** Every homepage section, in the order the owner arranged them in the admin. */
export function HomeSections({ sections }: { sections: HomeSection[] }) {
    return (
        <div className="space-y-14">
            {sections.map((section, index) => (
                <Section key={section.id} section={section} first={index === 0} />
            ))}
        </div>
    );
}

function Heading({ section }: { section: HomeSection }) {
    if (!section.title) return null;
    return (
        <div className="mb-5">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            {section.subtitle && <p className="mt-1 text-sm text-muted">{section.subtitle}</p>}
        </div>
    );
}

function Section({ section, first }: { section: HomeSection; first: boolean }) {
    switch (section.type) {
        case "CAROUSEL":
            return section.slides?.length ? <Carousel slides={section.slides} /> : null;
        case "PRODUCTS": {
            const products = section.products ?? [];
            if (products.length === 0) return null;
            return (
                <section>
                    <Heading section={section} />
                    {section.layout === "ROW" ? (
                        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
                            {products.map((product, index) => (
                                <div key={product.id} className="w-40 shrink-0 snap-start sm:w-56">
                                    <ProductCard product={product} priority={first && index < 2} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ProductGrid products={products} priorityCount={first ? 2 : 0} />
                    )}
                </section>
            );
        }
        case "CATEGORIES":
            return section.categories?.length ? (
                <section>
                    <Heading section={section} />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {section.categories.map((category) => (
                            <Link key={category.id} href={`/categories/${category.slug}`} className="group block">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-photo bg-surface">
                                    {category.imageUrl && (
                                        <Image src={category.imageUrl} alt={category.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover group-hover:opacity-90" />
                                    )}
                                </div>
                                <p className="mt-2 text-sm font-medium">{category.name}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null;
        case "BRANDS":
            return section.brands?.length ? (
                <section>
                    <Heading section={section} />
                    <div className="flex flex-wrap items-center gap-6">
                        {section.brands.map((brand) =>
                            brand.logoUrl ? (
                                <Image key={brand.id} src={brand.logoUrl} alt={brand.name} width={96} height={96} className="h-16 w-16 object-contain" />
                            ) : (
                                <span key={brand.id} className="text-sm font-semibold">{brand.name}</span>
                            ),
                        )}
                    </div>
                </section>
            ) : null;
        case "BUNDLES":
            return section.bundles?.length ? (
                <section>
                    <Heading section={section} />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {section.bundles.map((bundle) => (
                            <Link key={bundle.id} href={`/bundles/${bundle.slug}`} className="group flex gap-4 rounded-photo border border-line p-3">
                                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-control bg-surface">
                                    {bundle.thumbnailUrl && <Image src={bundle.thumbnailUrl} alt={bundle.name} fill sizes="96px" className="object-cover" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium">{bundle.name}</p>
                                    <p className="mt-1 text-sm">
                                        {bundle.priceVaries && <span className="text-muted">{words.from} </span>}
                                        <span className="font-semibold">{formatMoney(bundle.bundlePrice)}</span>{" "}
                                        <span className="text-faint line-through">{formatMoney(bundle.regularPrice)}</span>
                                    </p>
                                    <p className="mt-1 text-xs text-stock">{words.bundleSaving(formatMoney(bundle.regularPrice - bundle.bundlePrice))}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null;
        case "TEXT":
            return section.body ? (
                <section className="mx-auto max-w-2xl">
                    <Heading section={section} />
                    <div className="prose-store" dangerouslySetInnerHTML={{ __html: richTextToHtml(section.body, "MARKDOWN") }} />
                </section>
            ) : null;
        default:
            return null;
    }
}
