"use client";

import Image from "next/image";
import Link from "next/link";
import { cart, cartSubtotal, lineKey, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { words } from "@/lib/words";

/** The cart lines with quantities; prices are those seen on the product pages, checked again at checkout. */
export function CartView() {
    const lines = useCart();
    if (lines.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="text-muted">{words.emptyCart}</p>
                <Link href="/" className="mt-6 inline-block rounded-control bg-ink px-6 py-3 font-semibold text-white">{words.seeNew}</Link>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <ul className="divide-y divide-line">
                {lines.map((line) => {
                    const key = lineKey(line);
                    const href = line.kind === "item" ? `/products/${line.productSlug}` : `/bundles/${line.bundleSlug}`;
                    return (
                        <li key={key} className="flex gap-4 py-4">
                            <Link href={href} className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-control bg-surface">
                                {line.imageUrl && <Image src={line.imageUrl} alt={line.name} fill sizes="80px" className="object-cover" />}
                            </Link>
                            <div className="min-w-0 flex-1">
                                <Link href={href} className="font-medium">{line.name}</Link>
                                {line.kind === "item" && line.variantName && <p className="text-sm text-muted">{line.variantName}</p>}
                                {line.kind === "bundle" && <p className="text-sm text-muted">{words.bundle}</p>}
                                {line.kind === "item" && line.personalization && <p className="text-sm text-muted">« {line.personalization} »</p>}
                                <div className="mt-2 flex items-center gap-3">
                                    <div className="flex items-center rounded-control border border-field">
                                        <button type="button" className="h-9 w-9" aria-label="-1" onClick={() => cart.setQuantity(key, line.quantity - 1)}>−</button>
                                        <span className="w-8 text-center text-sm">{line.quantity}</span>
                                        <button type="button" className="h-9 w-9" aria-label="+1" onClick={() => cart.setQuantity(key, line.quantity + 1)}>+</button>
                                    </div>
                                    <button type="button" className="text-sm text-muted underline" onClick={() => cart.setQuantity(key, 0)}>Retirer</button>
                                </div>
                            </div>
                            <p className="text-sm font-semibold">{formatMoney(line.unitPrice * line.quantity)}</p>
                        </li>
                    );
                })}
            </ul>
            <aside className="h-fit rounded-photo border border-line p-5">
                <p className="flex justify-between text-sm"><span>{words.subtotal}</span><span className="font-semibold">{formatMoney(cartSubtotal(lines))}</span></p>
                <p className="mt-1 text-xs text-muted">{words.estimate}</p>
                <Link href="/checkout" className="mt-4 block rounded-control bg-ink py-3 text-center font-semibold text-white">{words.checkout}</Link>
            </aside>
        </div>
    );
}
