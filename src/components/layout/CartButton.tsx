"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";
import { words } from "@/lib/words";

export function CartButton() {
    const count = cartCount(useCart());
    return (
        <Link href="/cart" className="relative flex h-11 w-11 items-center justify-center" aria-label={`${words.cart} (${count})`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M6 7h12l-1 13H7L6 7Z" />
                <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs font-semibold text-white">
                    {count}
                </span>
            )}
        </Link>
    );
}
