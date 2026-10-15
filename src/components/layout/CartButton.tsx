"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import type { Language } from "@/lib/api/client";
import { cartCount, useCart } from "@/lib/cart";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";

export function CartButton({ lang }: { lang: Language }) {
    const count = cartCount(useCart());
    return (
        <Link href={localPath(lang, "/cart")} className="relative inline-flex h-11 w-11 items-center justify-center rounded-control hover:bg-surface" aria-label={`${getWords(lang).cart} (${count})`}>
            <ShoppingBag size={21} strokeWidth={1.8} aria-hidden />
            {count > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-on-ink tabular-nums">
                    {count}
                </span>
            )}
        </Link>
    );
}
