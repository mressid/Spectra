import { HandCoins, PhoneCall, Truck } from "lucide-react";
import type { StoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { getWords } from "@/lib/words";

/** Three outlined tiles with the terms every shop of the template shares: delivery, cash, phone confirmation. */
export function TrustStrip({ lang, settings }: { lang: Language; settings: StoreSettings }) {
    const words = getWords(lang);
    const fee = settings.deliveryFee > 0 ? formatMoney(settings.deliveryFee, lang) : words.free;
    const deliveryText = settings.freeDeliveryThreshold != null && settings.deliveryFee > 0
        ? `${words.delivery} ${fee} · ${words.freeFrom(formatMoney(settings.freeDeliveryThreshold, lang))}`
        : `${words.delivery} ${fee}`;
    const items = [
        { icon: Truck, title: words.deliveryEverywhere, text: deliveryText },
        { icon: HandCoins, title: words.payOnDelivery, text: words.payOnDeliveryText },
        { icon: PhoneCall, title: words.weConfirm, text: words.weConfirmText },
    ];
    return (
        <ul className="grid gap-3 sm:grid-cols-3 sm:gap-5">
            {items.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-4 rounded-photo border border-line px-5 py-4 sm:flex-col sm:py-6 sm:text-center">
                    <Icon size={24} strokeWidth={1.5} className="shrink-0 text-ink" aria-hidden />
                    <span>
                        <span className="block font-display text-[15px] font-semibold">{title}</span>
                        <span className="mt-0.5 block text-sm text-muted">{text}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
