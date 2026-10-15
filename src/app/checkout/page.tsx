import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getGovernorates, getStoreSettings } from "@/lib/api/catalog";
import { words } from "@/lib/words";

export const metadata: Metadata = { title: words.checkout, robots: { index: false } };

export default async function CheckoutPage() {
    const [governorates, settings] = await Promise.all([getGovernorates(), getStoreSettings()]);
    return (
        <>
            <h1 className="mb-6 text-2xl font-semibold">{words.checkout}</h1>
            <CheckoutForm
                governorates={governorates}
                delivery={{ fee: settings.deliveryFee, freeFrom: settings.freeDeliveryThreshold ?? null, byGovernorate: settings.deliveryFeesByGovernorate }}
            />
        </>
    );
}
