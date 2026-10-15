import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GridSkeleton, ProductListing } from "@/components/ProductListing";
import { getTagBySlug } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { alternates, localPath } from "@/lib/i18n";

// tags are built on their first visit, then cached
export async function generateStaticParams() {
    return [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tags/[slug]">): Promise<Metadata> {
    const { lang, slug } = await params;
    const tag = await getTagBySlug(slug);
    return tag ? { title: tag.name, alternates: alternates(lang as Language, `/tags/${tag.slug}`) } : {};
}

export default async function TagPage({ params, searchParams }: PageProps<"/[lang]/tags/[slug]">) {
    const { lang: code, slug } = await params;
    const lang = code as Language;
    const tag = await getTagBySlug(slug);
    if (!tag) notFound();
    return (
        <>
            <Breadcrumb lang={lang} crumbs={[{ name: tag.name, path: `/tags/${tag.slug}` }]} />
            <h1 className="mb-6 font-display text-[2rem] font-semibold leading-tight tracking-tight">{tag.name}</h1>
            <Suspense fallback={<GridSkeleton />}>
                <ProductListing lang={lang} basePath={localPath(lang, `/tags/${tag.slug}`)} filter={{ tag: tag.slug }} searchParams={searchParams} />
            </Suspense>
        </>
    );
}
