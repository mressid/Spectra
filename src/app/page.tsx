import { ProductCard } from "@/components/ProductCard";
import { getHome } from "@/lib/api/catalog";
import { LANGUAGE } from "@/lib/i18n";

/**
 * Skeleton homepage: proves the pipeline (cached API read, images, tokens). The real homepage renders
 * every section type in order (docs/ROADMAP.md, step 2).
 */
export default async function HomePage() {
    const home = await getHome(LANGUAGE);
    return (
        <>
            {home.announcements.map((announcement) => (
                <p key={announcement.id} className="bg-ink px-4 py-2 text-center text-sm text-white">
                    {announcement.message}
                </p>
            ))}
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                {home.sections.map((section) =>
                    section.type === "PRODUCTS" ? (
                        <section key={section.id} className="mb-12">
                            <h2 className="mb-4 text-xl font-semibold">{section.title}</h2>
                            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                                {(section.products ?? []).map((product, index) => (
                                    <ProductCard key={product.id} product={product} priority={index < 2} />
                                ))}
                            </div>
                        </section>
                    ) : null,
                )}
            </main>
            <footer className="border-t border-line px-4 py-6 text-center text-sm text-muted">{home.footer.bottomText}</footer>
        </>
    );
}
