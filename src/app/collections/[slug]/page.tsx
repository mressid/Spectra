import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GridSkeleton, ProductListing } from "@/components/ProductListing";
import { getCollectionBySlug, getSitemap } from "@/lib/api/catalog";

export async function generateStaticParams() {
    const { collections } = await getSitemap();
    return collections.length ? collections.map((collection) => ({ slug: collection.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
    const collection = await getCollectionBySlug((await params).slug);
    if (!collection) return {};
    return {
        title: collection.name,
        description: collection.description ?? undefined,
        alternates: { canonical: `/collections/${collection.slug}` },
    };
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/collections/[slug]">) {
    const collection = await getCollectionBySlug((await params).slug);
    if (!collection) notFound();
    return (
        <>
            <Breadcrumb crumbs={[{ name: collection.name, href: `/collections/${collection.slug}` }]} />
            <h1 className="mb-2 text-2xl font-semibold">{collection.name}</h1>
            {collection.description && <p className="mb-6 max-w-2xl text-muted">{collection.description}</p>}
            <Suspense fallback={<GridSkeleton />}>
                <ProductListing basePath={`/collections/${collection.slug}`} filter={{ collectionId: collection.id }} searchParams={searchParams} />
            </Suspense>
        </>
    );
}
