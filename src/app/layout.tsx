import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getStoreSettings } from "@/lib/api/catalog";
import { LANGUAGE } from "@/lib/i18n";
import { words } from "@/lib/words";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getStoreSettings();
    const shopName = settings.shopName || words.shop;
    return {
        metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
        title: { default: shopName, template: `%s · ${shopName}` },
        description: settings.footer.aboutText ?? "Livraison partout en Tunisie, paiement à la livraison.",
        openGraph: { siteName: shopName, locale: "fr_TN", type: "website" },
    };
}

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang={LANGUAGE} className={`${inter.variable} antialiased`}>
            <body className="flex min-h-dvh flex-col font-sans">
                <Header />
                <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
                <Footer />
            </body>
        </html>
    );
}
