import Link from "next/link";
import { getCategories, getHome, getStoreSettings } from "@/lib/api/catalog";
import { LANGUAGE } from "@/lib/i18n";
import { words } from "@/lib/words";
import { AnnouncementBar } from "./AnnouncementBar";
import { CartButton } from "./CartButton";

/** Banner, shop name, top-level categories (a drawer on phones, a row on desktop), search and cart. */
export async function Header() {
    const [home, settings, categories] = await Promise.all([getHome(LANGUAGE), getStoreSettings(), getCategories()]);
    const topLevel = categories.filter((category) => !category.parentId);
    const shopName = settings.shopName || words.shop;
    return (
        <header className="relative border-b border-line">
            <AnnouncementBar announcements={home.announcements} />
            <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
                {/* a <details> drawer: works without JavaScript */}
                <details className="group lg:hidden">
                    <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center" aria-label={words.menu}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                            <path d="M4 7h16M4 12h16M4 17h16" />
                        </svg>
                    </summary>
                    <nav className="absolute left-0 right-0 z-20 border-b border-line bg-page px-4 py-2">
                        {topLevel.map((category) => (
                            <Link key={category.id} href={`/categories/${category.slug}`} className="block py-3 text-base">
                                {category.name}
                            </Link>
                        ))}
                    </nav>
                </details>
                <Link href="/" className="mr-auto text-lg font-semibold tracking-tight">
                    {shopName}
                </Link>
                <nav className="hidden gap-6 text-sm lg:flex" aria-label={words.categories}>
                    {topLevel.map((category) => (
                        <Link key={category.id} href={`/categories/${category.slug}`} className="hover:text-muted">
                            {category.name}
                        </Link>
                    ))}
                </nav>
                <Link href="/search" className="flex h-11 w-11 items-center justify-center" aria-label={words.search}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" />
                    </svg>
                </Link>
                <CartButton />
            </div>
        </header>
    );
}
