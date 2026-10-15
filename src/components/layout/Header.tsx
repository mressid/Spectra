import { Search } from "lucide-react";
import Link from "next/link";
import { getCategories, getHome, getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { AnnouncementBar } from "./AnnouncementBar";
import { CartButton } from "./CartButton";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

/** Banner, shop name, categories (a panel on phones, a row on desktop), search, language, theme, cart. */
export async function Header({ lang }: { lang: Language }) {
    const [home, settings, categories] = await Promise.all([getHome(lang), getStoreSettings(), getCategories()]);
    const words = getWords(lang);
    const topLevel = categories.filter((category) => !category.parentId).map(({ id, name, slug }) => ({ id, name, slug }));
    const languages = settings.languages.filter((code): code is Language => code === "fr" || code === "en");
    return (
        <header className="sticky top-0 z-40">
            <AnnouncementBar announcements={home.announcements} />
            <div className="border-b border-line bg-raised/90 backdrop-blur supports-[backdrop-filter]:bg-raised/80">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-1 px-2 sm:px-4">
                    <MobileMenu lang={lang} languages={languages} categories={topLevel} />
                    <Link href={localPath(lang, "/")} className="mr-auto px-2 text-lg font-bold tracking-tight lg:mr-8">
                        {settings.shopName || words.shop}
                    </Link>
                    <nav className="mr-auto hidden items-center gap-1 lg:flex" aria-label={words.categories}>
                        {topLevel.map((category) => (
                            <Link key={category.id} href={localPath(lang, `/categories/${category.slug}`)} className="rounded-control px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink">
                                {category.name}
                            </Link>
                        ))}
                    </nav>
                    <Link href={localPath(lang, "/search")} className="inline-flex h-11 w-11 items-center justify-center rounded-control hover:bg-surface" aria-label={words.search}>
                        <Search size={20} strokeWidth={1.8} aria-hidden />
                    </Link>
                    <div className="hidden lg:flex lg:items-center">
                        <LanguageSwitch lang={lang} languages={languages} />
                        <ThemeToggle lang={lang} />
                    </div>
                    <CartButton lang={lang} />
                </div>
            </div>
        </header>
    );
}
