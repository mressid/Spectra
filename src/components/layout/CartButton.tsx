"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { Language } from "@/lib/api/client";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";

/** Bag icon with the item count; on wide screens also "2 products · 840,000 DT". */
export function CartButton({ lang }: { lang: Language }) {
    const words = getWords(lang);
    const lines = useCart();
    const count = cartCount(lines);
    return (
        <Link href={localPath(lang, "/cart")} className="flex h-11 items-center gap-2.5 rounded-control px-2 hover:bg-surface" aria-label={`${words.cart} (${count})`}>
            <span className="relative">
                <ShoppingBag size={21} strokeWidth={1.7} aria-hidden />
                {count > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-on-ink tabular-nums">
                        {count}
                    </span>
                )}
            </span>
            <span className="hidden text-sm leading-tight xl:block">
                <span className="block text-xs text-muted">{words.products(count)}</span>
                <span className="block font-display font-semibold tabular-nums">{formatMoney(cartSubtotal(lines), lang)}</span>
            </span>
        </Link>
    );
}
