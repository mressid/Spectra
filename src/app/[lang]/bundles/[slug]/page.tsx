import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BundleView } from "@/components/product/BundleView";
import { getBundleBySlug, getBundleVariants, getSitemap } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { alternates } from "@/lib/i18n";
import { getWords } from "@/lib/words";

export async function generateStaticParams() {
    const { bundles } = await getSitemap();
    return bundles.length ? bundles.map((bundle) => ({ slug: bundle.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/bundles/[slug]">): Promise<Metadata> {
    const { lang, slug } = await params;
    const bundle = await getBundleBySlug(slug);
    if (!bundle) return {};
    return {
        title: bundle.name,
        description: bundle.description ?? undefined,
        alternates: alternates(lang as Language, `/bundles/${bundle.slug}`),
        openGraph: bundle.thumbnailUrl ? { images: [bundle.thumbnailUrl] } : undefined,
    };
}

export default async function BundlePage({ params }: PageProps<"/[lang]/bundles/[slug]">) {
    const { lang: code, slug } = await params;
    const lang = code as Language;
    const words = getWords(lang);
    const bundle = await getBundleBySlug(slug);
    if (!bundle) notFound();
    const variants = await getBundleVariants(bundle);
    return (
        <>
            <Breadcrumb lang={lang} crumbs={[{ name: bundle.name, path: `/bundles/${bundle.slug}` }]} />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
                <div className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                    {bundle.thumbnailUrl && <Image src={bundle.thumbnailUrl} alt={bundle.name} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />}
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-stock">{words.bundle}</p>
                    <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight [text-wrap:balance] lg:text-[2.1rem]">{bundle.name}</h1>
                    <p className="mt-4 flex flex-wrap items-baseline gap-2 tabular-nums">
                        {bundle.priceVaries && <span className="text-sm text-muted">{words.from}</span>}
                        <span className="text-[1.75rem] font-bold leading-none">{formatMoney(bundle.bundlePrice, lang)}</span>
                        <span className="text-faint line-through">{formatMoney(bundle.regularPrice, lang)}</span>
                    </p>
                    <p className="mt-1 text-sm font-medium text-stock">{words.bundleSaving(formatMoney(bundle.regularPrice - bundle.bundlePrice, lang))}</p>
                    {bundle.description && <p className="mt-4 text-muted">{bundle.description}</p>}
                    <div className="mt-6">
                        <BundleView lang={lang} bundle={bundle} variants={variants} />
                    </div>
                </div>
            </div>
        </>
    );
}
