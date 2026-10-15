import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GridSkeleton, ProductListing } from "@/components/ProductListing";
import { getTagBySlug } from "@/lib/api/catalog";

// tags are built on their first visit, then cached
export async function generateStaticParams() {
    return [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/tags/[slug]">): Promise<Metadata> {
    const tag = await getTagBySlug((await params).slug);
    return tag ? { title: tag.name, alternates: { canonical: `/tags/${tag.slug}` } } : {};
}

export default async function TagPage({ params, searchParams }: PageProps<"/tags/[slug]">) {
    const tag = await getTagBySlug((await params).slug);
    if (!tag) notFound();
    return (
        <>
            <Breadcrumb crumbs={[{ name: tag.name, href: `/tags/${tag.slug}` }]} />
            <h1 className="mb-6 text-2xl font-semibold">{tag.name}</h1>
            <Suspense fallback={<GridSkeleton />}>
                <ProductListing basePath={`/tags/${tag.slug}`} filter={{ tag: tag.slug }} searchParams={searchParams} />
            </Suspense>
        </>
    );
}
