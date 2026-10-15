import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HomeSection } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { richTextToHtml } from "@/lib/html";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { ProductCard } from "../ProductCard";
import { ProductGrid } from "../ProductGrid";
import { Carousel } from "./Carousel";
import { ScrollRow } from "./ScrollRow";

/** Every homepage section, in the order the owner arranged them in the admin. */
export function HomeSections({ lang, sections, afterFirst }: { lang: Language; sections: HomeSection[]; afterFirst?: React.ReactNode }) {
    return (
        <div className="space-y-20">
            {sections.map((section, index) => (
                <div key={section.id} className="space-y-20">
                    <Section lang={lang} section={section} first={index === 0} />
                    {index === 0 && afterFirst}
                </div>
            ))}
            {sections.length === 0 && afterFirst}
        </div>
    );
}

function Heading({ section }: { section: HomeSection }) {
    if (!section.title) return null;
    return (
        <div className="mb-7">
            <h2 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight [text-wrap:balance]">{section.title}</h2>
            {section.subtitle && <p className="mt-1 text-muted">{section.subtitle}</p>}
        </div>
    );
}

function Section({ lang, section, first }: { lang: Language; section: HomeSection; first: boolean }) {
    const words = getWords(lang);
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
                        <ScrollRow labels={{ previous: words.previous, next: words.next }}>
                            {products.map((product, index) => (
                                <div key={product.id} className="w-[44vw] shrink-0 snap-start sm:w-[calc((100%-2*1rem)/3)] lg:w-[calc((100%-3*1.5rem)/4)]">
                                    <ProductCard lang={lang} product={product} priority={first && index < 2} />
                                </div>
                            ))}
                        </ScrollRow>
                    ) : (
                        <ProductGrid lang={lang} products={products} priorityCount={first ? 2 : 0} />
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
                            <Link key={category.id} href={localPath(lang, `/categories/${category.slug}`)} className="group relative block overflow-hidden rounded-photo bg-surface">
                                <div className="relative aspect-[4/3]">
                                    {category.imageUrl && (
                                        <Image src={category.imageUrl} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                    )}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 text-white">
                                    <span className="text-sm font-semibold">{category.name}</span>
                                    <ArrowRight size={16} aria-hidden />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null;
        case "BRANDS":
            return section.brands?.length ? (
                <section>
                    <Heading section={section} />
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {section.brands.map((brand) => (
                            <div key={brand.id} className="flex aspect-[3/2] items-center justify-center rounded-photo border border-line bg-white p-4">
                                {brand.logoUrl ? (
                                    <Image src={brand.logoUrl} alt={brand.name} width={120} height={80} className="max-h-full w-auto object-contain" />
                                ) : (
                                    <span className="text-sm font-semibold text-black">{brand.name}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            ) : null;
        case "BUNDLES":
            return section.bundles?.length ? (
                <section>
                    <Heading section={section} />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {section.bundles.map((bundle) => (
                            <Link key={bundle.id} href={localPath(lang, `/bundles/${bundle.slug}`)} className="group flex gap-4 rounded-photo border border-line bg-raised p-3 transition-colors hover:border-field">
                                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-control bg-surface">
                                    {bundle.thumbnailUrl && <Image src={bundle.thumbnailUrl} alt="" fill sizes="96px" className="object-cover" />}
                                </div>
                                <div className="min-w-0 py-1">
                                    <p className="font-semibold leading-snug">{bundle.name}</p>
                                    <p className="mt-1.5 text-sm tabular-nums">
                                        {bundle.priceVaries && <span className="text-muted">{words.from} </span>}
                                        <span className="font-semibold">{formatMoney(bundle.bundlePrice, lang)}</span>{" "}
                                        <span className="text-faint line-through">{formatMoney(bundle.regularPrice, lang)}</span>
                                    </p>
                                    <p className="mt-1 text-xs font-medium text-stock">{words.bundleSaving(formatMoney(bundle.regularPrice - bundle.bundlePrice, lang))}</p>
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
