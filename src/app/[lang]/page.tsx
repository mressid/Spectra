import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { HomeSections } from "@/components/sections/HomeSections";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { getHome, getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { alternates } from "@/lib/i18n";
import { getWords } from "@/lib/words";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
    return { alternates: alternates((await params).lang as Language, "/") };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
    const lang = (await params).lang as Language;
    const [home, settings] = await Promise.all([getHome(lang), getStoreSettings()]);
    const shopName = settings.shopName || getWords(lang).shop;
    return (
        <>
            <h1 className="sr-only">{shopName}</h1>
            <HomeSections lang={lang} sections={home.sections} afterFirst={<TrustStrip lang={lang} settings={settings} />} />
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "Store",
                    name: shopName,
                    url: process.env.SITE_URL ?? "http://localhost:3000",
                    telephone: home.footer.phone ?? undefined,
                    email: home.footer.email ?? undefined,
                    address: home.footer.address ?? undefined,
                    sameAs: home.footer.socialLinks.map((social) => social.url),
                    paymentAccepted: "Cash",
                    currenciesAccepted: "TND",
                }}
            />
        </>
    );
}
