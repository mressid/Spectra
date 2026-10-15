import { CircleCheck, CircleSlash, Clock } from "lucide-react";
import type { Language } from "@/lib/api/client";
import { formatLeadTime } from "@/lib/format";
import { getWords } from "@/lib/words";

/** In stock / made to order · ready in 48h / sold out, each with its own icon and colour. */
export function Availability({ lang, status, leadTimeDays, compact = false }: {
    lang: Language;
    status: "IN_STOCK" | "ON_ORDER" | "OUT_OF_STOCK";
    leadTimeDays?: number | null;
    compact?: boolean;
}) {
    const words = getWords(lang);
    const size = compact ? 13 : 16;
    const text = compact ? "text-xs" : "text-sm font-medium";
    if (status === "ON_ORDER") {
        const lead = formatLeadTime(leadTimeDays, lang);
        return (
            <p className={`flex items-center gap-1.5 ${text} text-order`}>
                <Clock size={size} aria-hidden />
                {words.madeToOrder}{lead && ` · ${words.readyIn(lead)}`}
            </p>
        );
    }
    if (status === "OUT_OF_STOCK") {
        return <p className={`flex items-center gap-1.5 ${text} text-muted`}><CircleSlash size={size} aria-hidden />{words.soldOut}</p>;
    }
    return compact ? null : <p className={`flex items-center gap-1.5 ${text} text-stock`}><CircleCheck size={size} aria-hidden />{words.inStock}</p>;
}
