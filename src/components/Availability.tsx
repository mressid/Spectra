import { formatLeadTime } from "@/lib/format";
import { words } from "@/lib/words";

/** ● En stock / ⏳ Sur commande · prêt en 48h / Épuisé. */
export function Availability({ status, leadTimeDays, compact = false }: {
    status: "IN_STOCK" | "ON_ORDER" | "OUT_OF_STOCK";
    leadTimeDays?: number | null;
    compact?: boolean;
}) {
    const size = compact ? "text-xs" : "text-sm font-medium";
    if (status === "ON_ORDER") {
        const lead = formatLeadTime(leadTimeDays);
        return <p className={`${size} text-order`}>⏳ {words.madeToOrder}{lead && ` · ${words.readyIn(lead)}`}</p>;
    }
    if (status === "OUT_OF_STOCK") return <p className={`${size} text-muted`}>{words.soldOut}</p>;
    return compact ? null : <p className={`${size} text-stock`}>● {words.inStock}</p>;
}
