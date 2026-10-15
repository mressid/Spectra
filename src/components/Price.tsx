import type { Language } from "@/lib/api/client";
import { discountPercent, formatMoney } from "@/lib/format";
import { getWords } from "@/lib/words";

/** "from 30,000 DT  60,000 DT  -50%", sized for a card or for the product page. */
export function Price({ lang, price, oldPrice, from = false, large = false }: {
    lang: Language;
    price?: number | null;
    oldPrice?: number | null;
    from?: boolean;
    large?: boolean;
}) {
    if (price == null) return null;
    const discount = discountPercent(price, oldPrice);
    return (
        <p className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
            {from && <span className={large ? "text-sm text-muted" : "text-xs text-muted"}>{getWords(lang).from}</span>}
            <span className={large ? "text-[1.75rem] font-bold leading-none" : "text-[15px] font-semibold"}>{formatMoney(price, lang)}</span>
            {discount && <span className={`text-faint line-through ${large ? "" : "text-xs"}`}>{formatMoney(oldPrice, lang)}</span>}
            {discount && large && <span className="rounded-chip bg-sale-soft px-2 py-0.5 text-xs font-semibold text-sale">{discount}</span>}
        </p>
    );
}
