import type { Metadata, Viewport } from "next";
import { Fira_Sans, Fraunces } from "next/font/google";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getStoreSettings } from "@/lib/api/catalog";
import { isLanguage, LANGUAGES } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import "../globals.css";

const body = Fira_Sans({ variable: "--font-body", weight: ["400", "500", "600"], subsets: ["latin", "latin-ext"], display: "swap" });
// titles: a soft serif gives the shop its editorial look (docs/DESIGN.md)
const title = Fraunces({ variable: "--font-title", weight: ["400", "500", "600"], subsets: ["latin", "latin-ext"], display: "swap" });

// both languages are built ahead; one the shop does not offer redirects to its default language
export async function generateStaticParams() {
    return LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
    const { lang } = await params;
    // not a language ("/.well-known/…" from a browser, a stray path): the layout answers 404 below
    if (!isLanguage(lang)) return {};
    const settings = await getStoreSettings();
    const shopName = settings.shopName || getWords(lang).shop;
    return {
        metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
        title: { default: shopName, template: `%s · ${shopName}` },
        description: settings.footer.aboutText ?? getWords(lang).deliveryEverywhere,
        openGraph: { siteName: shopName, locale: lang === "fr" ? "fr_TN" : "en_US", type: "website" },
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0e1114" },
    ],
};

// applies a theme the visitor chose before the page paints, so it never flashes the other one
const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function LanguageLayout({ children, params }: LayoutProps<"/[lang]">) {
    const { lang } = await params;
    if (!isLanguage(lang)) notFound();
    const settings = await getStoreSettings();
    if (!settings.languages.includes(lang)) {
        redirect(`/${settings.defaultLanguage}`);
    }
    return (
        <html lang={lang} className={`${body.variable} ${title.variable} antialiased`} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
            </head>
            <body className="flex min-h-dvh flex-col bg-page font-sans text-ink">
                <Header lang={lang} />
                <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-16 pt-6 sm:px-6">{children}</main>
                <Footer lang={lang} />
            </body>
        </html>
    );
}
