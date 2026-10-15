import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GridSkeleton, ProductListing } from "@/components/ProductListing";
import { getCategories, getCategoryBySlug } from "@/lib/api/catalog";

export async function generateStaticParams() {
    const categories = await getCategories();
    // Cache Components needs at least one value to build the route
    return categories.length ? categories.map((category) => ({ slug: category.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
    const category = await getCategoryBySlug((await params).slug);
    if (!category) return {};
    return {
        title: category.seoTitle ?? category.name,
        description: category.seoDescription ?? undefined,
        alternates: { canonical: `/categories/${category.slug}` },
        openGraph: category.imageUrl ? { images: [category.imageUrl] } : undefined,
    };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/categories/[slug]">) {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) notFound();
    const categories = await getCategories();
    const parent = categories.find((item) => item.id === category.parentId);
    const children = categories.filter((item) => item.parentId === category.id);
    return (
        <>
            <Breadcrumb
                crumbs={[...(parent ? [{ name: parent.name, href: `/categories/${parent.slug}` }] : []), { name: category.name, href: `/categories/${category.slug}` }]}
            />
            <h1 className="mb-4 text-2xl font-semibold">{category.name}</h1>
            {children.length > 0 && (
                <nav className="mb-6 flex flex-wrap gap-2">
                    {children.map((child) => (
                        <Link key={child.id} href={`/categories/${child.slug}`} className="rounded-control border border-field px-3 py-1.5 text-sm hover:border-ink">
                            {child.name}
                        </Link>
                    ))}
                </nav>
            )}
            <Suspense fallback={<GridSkeleton />}>
                <ProductListing basePath={`/categories/${category.slug}`} filter={{ categoryId: category.id }} searchParams={searchParams} />
            </Suspense>
        </>
    );
}
