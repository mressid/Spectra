import { JsonLd } from "@/components/JsonLd";
import { HomeSections } from "@/components/sections/HomeSections";
import { getHome, getStoreSettings } from "@/lib/api/catalog";
import { LANGUAGE } from "@/lib/i18n";
import { words } from "@/lib/words";

export default async function HomePage() {
    const [home, settings] = await Promise.all([getHome(LANGUAGE), getStoreSettings()]);
    const site = process.env.SITE_URL ?? "http://localhost:3000";
    return (
        <>
            <h1 className="sr-only">{settings.shopName || words.shop}</h1>
            <HomeSections sections={home.sections} />
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "Store",
                    name: settings.shopName || words.shop,
                    url: site,
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
