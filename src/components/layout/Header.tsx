import { PackageSearch, Phone, Search, Truck } from "lucide-react";
import Link from "next/link";
import { getCategories, getHome, getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { AnnouncementBar } from "./AnnouncementBar";
import { CartButton } from "./CartButton";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Owner's banner, a thin utility bar (contact, delivery, tracking, language, theme), then the main row:
 * categories on the left, the shop name centred, search and cart on the right.
 */
export async function Header({ lang }: { lang: Language }) {
    const [home, settings, categories] = await Promise.all([getHome(lang), getStoreSettings(), getCategories()]);
    const words = getWords(lang);
    const topLevel = categories.filter((category) => !category.parentId).map(({ id, name, slug }) => ({ id, name, slug }));
    const languages = settings.languages.filter((code): code is Language => code === "fr" || code === "en");
    const phone = home.footer.phone;
    const delivery = settings.freeDeliveryThreshold != null && settings.deliveryFee > 0
        ? words.freeFrom(formatMoney(settings.freeDeliveryThreshold, lang))
        : settings.deliveryFee > 0 ? formatMoney(settings.deliveryFee, lang) : words.free;
    const utility = "flex items-center gap-1.5 hover:text-ink";
    return (
        <header className="sticky top-0 z-40">
            <AnnouncementBar announcements={home.announcements} />
            <div className="hidden border-b border-line bg-raised text-xs text-muted lg:block">
                <div className="mx-auto flex h-9 max-w-6xl items-center gap-6 px-6">
                    {phone && <a href={`tel:${phone}`} className={utility}><Phone size={13} aria-hidden />{phone}</a>}
                    <span className="flex items-center gap-1.5"><Truck size={14} aria-hidden />{words.delivery} {delivery}</span>
                    <span className="flex-1" />
                    <Link href={localPath(lang, "/track")} className={utility}><PackageSearch size={14} aria-hidden />{words.track}</Link>
                    <LanguageSwitch lang={lang} languages={languages} />
                    <ThemeToggle lang={lang} compact />
                </div>
            </div>
            <div className="border-b border-line bg-raised/90 backdrop-blur supports-[backdrop-filter]:bg-raised/80">
                <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-2 sm:px-4 lg:h-[72px] lg:px-6">
                    <div className="flex items-center">
                        <MobileMenu lang={lang} languages={languages} categories={topLevel} />
                        <nav className="hidden items-center gap-6 lg:flex" aria-label={words.categories}>
                            {topLevel.slice(0, 6).map((category) => (
                                <Link key={category.id} href={localPath(lang, `/categories/${category.slug}`)} className="font-display text-[15px] font-medium text-ink/80 hover:text-ink">
                                    {category.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <Link href={localPath(lang, "/")} className="px-3 text-center font-display text-xl font-bold uppercase tracking-[0.18em] lg:text-2xl">
                        {settings.shopName || words.shop}
                    </Link>
                    <div className="flex items-center justify-end gap-1">
                        <Link href={localPath(lang, "/search")} className="inline-flex h-11 w-11 items-center justify-center rounded-control hover:bg-surface" aria-label={words.search}>
                            <Search size={20} strokeWidth={1.7} aria-hidden />
                        </Link>
                        <CartButton lang={lang} />
                    </div>
                </div>
            </div>
        </header>
    );
}
