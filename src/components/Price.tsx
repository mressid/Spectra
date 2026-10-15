import { discountPercent, formatMoney } from "@/lib/format";
import { words } from "@/lib/words";

/** "à partir de 30,000 DT  ̶6̶0̶,̶0̶0̶0̶ ̶D̶T̶  -50%", sized for a card or for the product page. */
export function Price({ price, oldPrice, from = false, large = false }: {
    price?: number | null;
    oldPrice?: number | null;
    from?: boolean;
    large?: boolean;
}) {
    if (price == null) return null;
    const discount = discountPercent(price, oldPrice);
    return (
        <p className="flex flex-wrap items-baseline gap-x-2">
            {from && <span className={large ? "text-sm text-muted" : "text-xs text-muted"}>{words.from}</span>}
            <span className={large ? "text-2xl font-bold" : "text-sm font-semibold"}>{formatMoney(price)}</span>
            {discount && (
                <>
                    <span className={`text-faint line-through ${large ? "" : "text-xs"}`}>{formatMoney(oldPrice)}</span>
                    <span className="rounded-chip bg-sale-soft px-1.5 py-0.5 text-xs font-semibold text-sale">{discount}</span>
                </>
            )}
        </p>
    );
}
