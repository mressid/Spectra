import type { Language } from "./api/client";

/** TND always has 3 decimals (millimes): "35,500 DT" in French, "TND 35.500" in English. */
export function formatMoney(amount: number | string | null | undefined, language: Language = "fr"): string {
    return Number(amount ?? 0).toLocaleString(language === "fr" ? "fr-TN" : "en-GB", {
        style: "currency",
        currency: "TND",
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
    });
}

/** How shops say it: 2 days -> "48h", 5 days -> "5 jours". */
export function formatLeadTime(days: number | null | undefined, language: Language = "fr"): string {
    if (days == null) return "";
    if (days <= 3) return `${days * 24}h`;
    return language === "fr" ? `${days} jours` : `${days} days`;
}
