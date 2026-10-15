import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GridSkeleton, ProductListing } from "@/components/ProductListing";
import { getCollectionBySlug, getSitemap } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { alternates, localPath } from "@/lib/i18n";

export async function generateStaticParams() {
    const { collections } = await getSitemap();
    return collections.length ? collections.map((collection) => ({ slug: collection.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/collections/[slug]">): Promise<Metadata> {
    const { lang, slug } = await params;
    const collection = await getCollectionBySlug(slug);
    if (!collection) return {};
    return { title: collection.name, description: collection.description ?? undefined, alternates: alternates(lang as Language, `/collections/${collection.slug}`) };
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/[lang]/collections/[slug]">) {
    const { lang: code, slug } = await params;
    const lang = code as Language;
    const collection = await getCollectionBySlug(slug);
    if (!collection) notFound();
    return (
        <>
            <Breadcrumb lang={lang} crumbs={[{ name: collection.name, path: `/collections/${collection.slug}` }]} />
            <h1 className="mb-2 font-display text-[2rem] font-semibold leading-tight tracking-tight [text-wrap:balance]">{collection.name}</h1>
            {collection.description && <p className="mb-6 max-w-2xl text-muted">{collection.description}</p>}
            <Suspense fallback={<GridSkeleton />}>
                <ProductListing lang={lang} basePath={localPath(lang, `/collections/${collection.slug}`)} filter={{ collectionId: collection.id }} searchParams={searchParams} />
            </Suspense>
        </>
    );
}
