import { PackageSearch, Phone, Search, Truck } from "lucide-react";
import Link from "next/link";
import { getAnnouncements, getCategories, getStoreSettings, type StoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { AnnouncementBar } from "./AnnouncementBar";
import { Logo } from "../Logo";
import { CartButton } from "./CartButton";
import { LanguageSwitch } from "./LanguageSwitch";
import { ExploreMenu, type ExploreCategory } from "./ExploreMenu";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "./ThemeToggle";

type Part = "burger" | "logo" | "menu" | "actions";

// where each part sits (left, centre, right) for each arrangement; the admin's Appearance page draws the same
const ZONES: Record<NonNullable<NonNullable<StoreSettings["theme"]>["navbarLayout"]>, Part[][]> = {
    LOGO_CENTER: [["menu"], ["logo"], ["actions"]],
    LOGO_LEFT: [["logo", "menu"], ["actions"]],
    LOGO_LEFT_MENU_CENTER: [["logo"], ["menu"], ["actions"]],
    LOGO_RIGHT: [["actions"], ["menu"], ["logo"]],
};
const ALIGN_3 = ["justify-start", "justify-center", "justify-end"];
const ALIGN_2 = ["justify-start", "justify-end"];

/**
 * Owner's banner, a thin utility bar (contact, delivery, tracking, language, theme), then the main row:
 * logo, category links, and search and cart, arranged as the owner chose (admin > Appearance > Navigation bar):
 * logo centred, logo left with the links beside it, logo left with the links centred, or logo right.
 */
export async function Header({ lang }: { lang: Language }) {
    // not getHome(): the header is on every page, and the homepage's product sections would tie them all to every product
    const [announcements, settings, categories] = await Promise.all([getAnnouncements(), getStoreSettings(), getCategories()]);
    const words = getWords(lang);
    const topLevel = categories.filter((category) => !category.parentId).map(({ id, name, slug }) => ({ id, name, slug }));
    const languages = settings.languages.filter((code): code is Language => code === "fr" || code === "en");
    const phone = settings.footer.phone;
    const delivery = settings.freeDeliveryThreshold != null && settings.deliveryFee > 0
        ? words.freeFrom(formatMoney(settings.freeDeliveryThreshold, lang))
        : settings.deliveryFee > 0 ? formatMoney(settings.deliveryFee, lang) : words.free;
    const utility = "flex items-center gap-1.5 hover:text-ink";

    const theme = settings.theme ?? {};
    const layout = theme.navbarLayout ?? "LOGO_CENTER";
    // the phone menu button always comes first, on the left (it only shows below the lg breakpoint)
    const zones = ZONES[layout].map((parts, index) => (index === 0 ? (["burger", ...parts] as Part[]) : parts));
    const align = layout === "LOGO_LEFT" ? ALIGN_2 : ALIGN_3;
    const showMenu = theme.navShowMenu !== false;
    const showSearch = theme.navShowSearch !== false;
    const showExplore = theme.navShowExplore !== false;
    const exploreCategories: ExploreCategory[] = topLevel.map((category) => ({
        ...category,
        children: categories.filter((child) => child.parentId === category.id).map(({ id, name, slug }) => ({ id, name, slug })),
    }));
    // the logo block also sizes itself: a long name wraps less when it has room
    const logo = (
        <Link key="logo" href={localPath(lang, "/")} className="shrink-0 px-1 text-center font-display text-xl font-bold uppercase tracking-[0.18em] lg:text-2xl">
            <Logo settings={settings} fallbackName={words.shop} />
        </Link>
    );
    const burger = <MobileMenu key="burger" lang={lang} languages={languages} categories={topLevel} />;
    // the links and the Explore panel only show on computers
    const menu = showMenu || showExplore ? (
        <nav key="menu" className="hidden items-center gap-6 lg:flex" aria-label={words.categories}>
            {showExplore && <ExploreMenu lang={lang} categories={exploreCategories} />}
            {showMenu && topLevel.slice(0, 6).map((category) => (
                <Link key={category.id} href={localPath(lang, `/categories/${category.slug}`)} className="whitespace-nowrap font-display text-[15px] font-medium text-ink/80 hover:text-ink">
                    {category.name}
                </Link>
            ))}
        </nav>
    ) : null;
    const actions = (
        <div key="actions" className="flex items-center gap-1">
            {showSearch && (
                <Link href={localPath(lang, "/search")} className="inline-flex h-11 w-11 items-center justify-center rounded-control hover:bg-surface" aria-label={words.search}>
                    <Search size={20} strokeWidth={1.7} aria-hidden />
                </Link>
            )}
            <CartButton lang={lang} />
        </div>
    );
    const columns = layout === "LOGO_LEFT" ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr_auto_1fr]";
    return (
        <header className={`${theme.navSticky === false ? "relative" : "sticky"} top-0 z-40`}>
            <AnnouncementBar announcements={announcements} />
            <div className="hidden border-b border-line bg-raised text-xs text-muted lg:block">
                <div className="mx-auto flex h-9 max-w-[1400px] items-center gap-6 px-6">
                    {phone && <a href={`tel:${phone}`} className={utility}><Phone size={13} aria-hidden />{phone}</a>}
                    <span className="flex items-center gap-1.5"><Truck size={14} aria-hidden />{words.delivery} {delivery}</span>
                    <span className="flex-1" />
                    <Link href={localPath(lang, "/track")} className={utility}><PackageSearch size={14} aria-hidden />{words.track}</Link>
                    <LanguageSwitch lang={lang} languages={languages} />
                    <ThemeToggle lang={lang} compact />
                </div>
            </div>
            <div className="relative border-b border-line bg-raised/90 backdrop-blur supports-[backdrop-filter]:bg-raised/80">
                <div className={`mx-auto grid h-16 max-w-[1400px] items-center px-2 sm:px-4 lg:h-[72px] lg:px-6 ${columns}`}>
                    {zones.map((parts, index) => (
                        <div key={index} className={`flex min-w-0 items-center gap-6 ${align[index]}`}>
                            {parts.map((part) => (part === "burger" ? burger : part === "logo" ? logo : part === "menu" ? menu : actions))}
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}
