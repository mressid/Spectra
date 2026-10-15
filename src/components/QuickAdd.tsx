"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import type { Language } from "@/lib/api/client";
import { cart } from "@/lib/cart";
import { getWords } from "@/lib/words";

/** Adds a simple product (one variant) to the cart straight from its card. */
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
            className="flex h-9 w-9 items-center justify-center rounded-control bg-raised text-ink shadow-sm ring-1 ring-line transition hover:bg-ink hover:text-on-ink"
        >
            {added ? <Check size={17} aria-hidden /> : <Plus size={17} aria-hidden />}
        </button>
    );
}
