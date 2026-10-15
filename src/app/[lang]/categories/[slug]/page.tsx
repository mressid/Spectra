import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GridSkeleton, ProductListing } from "@/components/ProductListing";
import { getCategories, getCategoryBySlug } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { alternates, localPath } from "@/lib/i18n";

export async function generateStaticParams() {
    const categories = await getCategories();
    // Cache Components needs at least one value to build the route
    return categories.length ? categories.map((category) => ({ slug: category.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/categories/[slug]">): Promise<Metadata> {
    const { lang, slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) return {};
    return {
        title: category.seoTitle ?? category.name,
        description: category.seoDescription ?? undefined,
        alternates: alternates(lang as Language, `/categories/${category.slug}`),
        openGraph: category.imageUrl ? { images: [category.imageUrl] } : undefined,
    };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/categories/[slug]">) {
    const { lang: code, slug } = await params;
    const lang = code as Language;
    const category = await getCategoryBySlug(slug);
    if (!category) notFound();
    const categories = await getCategories();
    const parent = categories.find((item) => item.id === category.parentId);
    const children = categories.filter((item) => item.parentId === category.id);
    return (
        <>
            <Breadcrumb
                lang={lang}
                crumbs={[...(parent ? [{ name: parent.name, path: `/categories/${parent.slug}` }] : []), { name: category.name, path: `/categories/${category.slug}` }]}
            />
            <h1 className="mb-5 font-display text-[2rem] font-semibold leading-tight tracking-tight [text-wrap:balance]">{category.name}</h1>
            {children.length > 0 && (
                <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                    {children.map((child) => (
                        <Link key={child.id} href={localPath(lang, `/categories/${child.slug}`)} className="inline-flex h-9 shrink-0 items-center rounded-control border border-line px-4 text-sm hover:border-ink">
                            {child.name}
                        </Link>
                    ))}
                </nav>
            )}
            <Suspense fallback={<GridSkeleton />}>
                <ProductListing lang={lang} basePath={localPath(lang, `/categories/${category.slug}`)} filter={{ categoryId: category.id }} searchParams={searchParams} />
            </Suspense>
        </>
    );
}
