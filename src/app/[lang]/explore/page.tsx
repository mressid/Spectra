import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductGrid } from "@/components/ProductGrid";
import { getCategories, getCategoryPreview, getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { alternates, localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";

/** Whether the owner left the Explore link on (admin > Appearance > Navigation bar); off, the page does not exist. */
async function isEnabled() {
    return (await getStoreSettings()).theme?.navShowExplore !== false;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/explore">): Promise<Metadata> {
    const { lang } = await params;
    if (!(await isEnabled())) return {};
    const words = getWords(lang as Language);
    return { title: words.explore, description: words.exploreIntro, alternates: alternates(lang as Language, "/explore") };
}

/** Every top-level category with a few of its products: a way to browse the whole shop from one page. */
export default async function ExplorePage({ params }: PageProps<"/[lang]/explore">) {
    const { lang: code } = await params;
    const lang = code as Language;
    if (!(await isEnabled())) notFound();
    const words = getWords(lang);
    const categories = (await getCategories()).filter((category) => !category.parentId);
    const sections = (
        await Promise.all(categories.map(async (category) => ({ category, products: await getCategoryPreview(category.id, 8) })))
    ).filter((section) => section.products.length > 0);
    return (
        <>
            <Breadcrumb lang={lang} crumbs={[{ name: words.explore, path: "/explore" }]} />
            <h1 className="mb-2 font-heading text-[2rem] font-medium leading-tight tracking-tight">{words.explore}</h1>
            <p className="mb-6 max-w-2xl text-muted">{words.exploreIntro}</p>
            {sections.length > 1 && (
                <nav aria-label={words.categories} className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                    {sections.map(({ category }) => (
                        <a key={category.id} href={`#${category.slug}`} className="inline-flex h-9 shrink-0 items-center rounded-control border border-line px-4 text-sm hover:border-ink">
                            {category.name}
                        </a>
                    ))}
                </nav>
            )}
            {sections.length === 0 ? (
                <p className="py-16 text-center text-muted">{words.noProducts}</p>
            ) : (
                <div className="space-y-16">
                    {sections.map(({ category, products }, index) => (
                        <section key={category.id} id={category.slug} className="scroll-mt-40">
                            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                                <h2 className="font-heading text-[1.75rem] font-medium leading-tight tracking-tight">{category.name}</h2>
                                <Link href={localPath(lang, `/categories/${category.slug}`)} className="inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
                                    {words.seeAll}
                                    <ArrowRight size={16} aria-hidden />
                                </Link>
                            </div>
                            <ProductGrid lang={lang} products={products} priorityCount={index === 0 ? 4 : 0} />
                        </section>
                    ))}
                </div>
            )}
        </>
    );
}
