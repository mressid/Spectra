import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LANGUAGE } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
    title: { default: "Boutique", template: "%s · Boutique" },
    description: "Accessoires livrés partout en Tunisie, paiement à la livraison.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang={LANGUAGE} className={`${inter.variable} antialiased`}>
            <body className="flex min-h-dvh flex-col font-sans">{children}</body>
        </html>
    );
}
