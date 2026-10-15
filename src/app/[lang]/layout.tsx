import type { Metadata, Viewport } from "next";
import { Fira_Sans, Fira_Sans_Condensed } from "next/font/google";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { isLanguage, LANGUAGES } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import "../globals.css";

const body = Fira_Sans({ variable: "--font-body", weight: ["400", "500", "600"], subsets: ["latin", "latin-ext"], display: "swap" });
const title = Fira_Sans_Condensed({ variable: "--font-title", weight: ["500", "600", "700"], subsets: ["latin", "latin-ext"], display: "swap" });

// both languages are built ahead; one the shop does not offer redirects to its default language
export async function generateStaticParams() {
    return LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
    const { lang } = await params;
    const settings = await getStoreSettings();
    const shopName = settings.shopName || getWords(lang as Language).shop;
    return {
        metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
        title: { default: shopName, template: `%s · ${shopName}` },
        description: settings.footer.aboutText ?? getWords(lang as Language).deliveryEverywhere,
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
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6">{children}</main>
                <Footer lang={lang} />
            </body>
        </html>
    );
}
