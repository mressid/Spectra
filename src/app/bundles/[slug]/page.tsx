import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BundleView } from "@/components/product/BundleView";
import { getBundleBySlug, getBundleVariants, getSitemap } from "@/lib/api/catalog";
import { formatMoney } from "@/lib/format";
import { words } from "@/lib/words";

export async function generateStaticParams() {
    const { bundles } = await getSitemap();
    return bundles.length ? bundles.map((bundle) => ({ slug: bundle.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/bundles/[slug]">): Promise<Metadata> {
    const bundle = await getBundleBySlug((await params).slug);
    if (!bundle) return {};
    return {
        title: bundle.name,
        description: bundle.description ?? undefined,
        alternates: { canonical: `/bundles/${bundle.slug}` },
        openGraph: bundle.thumbnailUrl ? { images: [bundle.thumbnailUrl] } : undefined,
    };
}

export default async function BundlePage({ params }: PageProps<"/bundles/[slug]">) {
    const bundle = await getBundleBySlug((await params).slug);
    if (!bundle) notFound();
    const variants = await getBundleVariants(bundle);
    return (
        <>
            <Breadcrumb crumbs={[{ name: bundle.name, href: `/bundles/${bundle.slug}` }]} />
            <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                    {bundle.thumbnailUrl && <Image src={bundle.thumbnailUrl} alt={bundle.name} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />}
                </div>
                <div>
                    <p className="text-sm text-muted">{words.bundle}</p>
                    <h1 className="text-2xl font-semibold lg:text-3xl">{bundle.name}</h1>
                    <p className="mt-3 flex flex-wrap items-baseline gap-2">
                        {bundle.priceVaries && <span className="text-sm text-muted">{words.from}</span>}
                        <span className="text-2xl font-bold">{formatMoney(bundle.bundlePrice)}</span>
                        <span className="text-faint line-through">{formatMoney(bundle.regularPrice)}</span>
                    </p>
                    <p className="mt-1 text-sm font-medium text-stock">{words.bundleSaving(formatMoney(bundle.regularPrice - bundle.bundlePrice))}</p>
                    {bundle.description && <p className="mt-4 text-muted">{bundle.description}</p>}
                    <div className="mt-6">
                        <BundleView bundle={bundle} variants={variants} />
                    </div>
                </div>
            </div>
        </>
    );
}
