import { HandCoins, PhoneCall, Truck } from "lucide-react";
import type { StoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { getWords } from "@/lib/words";

/** Three facts every shop of the template shares: delivery terms, cash on delivery, phone confirmation. */
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
        <ul className="grid gap-px overflow-hidden rounded-photo border border-line bg-line sm:grid-cols-3">
            {items.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-3 bg-raised p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stock-soft text-stock">
                        <Icon size={19} strokeWidth={1.8} aria-hidden />
                    </span>
                    <span>
                        <span className="block text-sm font-semibold">{title}</span>
                        <span className="block text-sm text-muted">{text}</span>
                    </span>
                </li>
            ))}
        </ul>
    );
}
