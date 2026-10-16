"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import type { Language } from "@/lib/api/client";
import { cart } from "@/lib/cart";
import { getWords } from "@/lib/words";

/** The "add to cart" bar under a card: adds a simple product (one variant) straight from the catalogue. */
export function QuickAdd({ lang, line }: {
    lang: Language;
    line: { variantId: string; productSlug: string; name: string; imageUrl?: string; unitPrice: number };
}) {
    const words = getWords(lang);
    const [added, setAdded] = useState(false);
    return (
        <button
            type="button"
            onClick={() => {
                cart.add({ kind: "item", quantity: 1, ...line });
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1800);
            }}
            aria-label={`${words.addToCart} : ${line.name}`}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-control bg-ink font-display text-[13px] font-semibold uppercase tracking-[0.08em] text-on-ink transition-opacity hover:opacity-85"
        >
            {added ? <><Check size={16} aria-hidden />{words.added}</> : words.addToCart}
        </button>
    );
}
