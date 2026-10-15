import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getGovernorates, getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { getWords } from "@/lib/words";

export async function generateMetadata({ params }: PageProps<"/[lang]/checkout">): Promise<Metadata> {
    return { title: getWords((await params).lang as Language).checkout, robots: { index: false } };
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/checkout">) {
    const lang = (await params).lang as Language;
    const [governorates, settings] = await Promise.all([getGovernorates(), getStoreSettings()]);
    return (
        <>
            <h1 className="mb-8 text-3xl font-bold tracking-tight">{getWords(lang).checkout}</h1>
            <CheckoutForm
                lang={lang}
                governorates={governorates}
                delivery={{ fee: settings.deliveryFee, freeFrom: settings.freeDeliveryThreshold ?? null, byGovernorate: settings.deliveryFeesByGovernorate }}
            />
        </>
    );
}
