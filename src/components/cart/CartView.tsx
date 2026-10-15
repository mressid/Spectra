"use client";

import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Language } from "@/lib/api/client";
import { cart, cartSubtotal, lineKey, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { ui } from "../ui";

export function EmptyCart({ lang }: { lang: Language }) {
    const words = getWords(lang);
    return (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-muted">
                <ShoppingBag size={28} strokeWidth={1.5} aria-hidden />
            </span>
            <p className="text-muted">{words.emptyCart}</p>
            <Link href={localPath(lang, "/")} className={ui.primary}>{words.seeNew}</Link>
        </div>
    );
}

/** The cart lines with quantities; prices are those seen on the product pages, checked again at checkout. */
export function CartView({ lang }: { lang: Language }) {
    const words = getWords(lang);
    const lines = useCart();
    if (lines.length === 0) return <EmptyCart lang={lang} />;
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <ul className="divide-y divide-line border-y border-line">
                {lines.map((line) => {
                    const key = lineKey(line);
                    const href = localPath(lang, line.kind === "item" ? `/products/${line.productSlug}` : `/bundles/${line.bundleSlug}`);
                    return (
                        <li key={key} className="flex gap-4 py-5">
                            <Link href={href} className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-control bg-surface sm:w-24">
                                {line.imageUrl && <Image src={line.imageUrl} alt={line.name} fill sizes="96px" className="object-cover" />}
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <Link href={href} className="font-medium leading-snug hover:underline">{line.name}</Link>
                                        {line.kind === "item" && line.variantName && <p className="text-sm text-muted">{line.variantName}</p>}
                                        {line.kind === "bundle" && <p className="text-sm text-muted">{words.bundle}</p>}
                                        {line.kind === "item" && line.personalization && <p className="text-sm text-muted">« {line.personalization} »</p>}
                                    </div>
                                    <p className="shrink-0 font-semibold tabular-nums">{formatMoney(line.unitPrice * line.quantity, lang)}</p>
                                </div>
                                <div className="mt-auto flex items-center gap-2 pt-3">
                                    <div className="flex items-center rounded-control border border-field" role="group" aria-label={words.quantity}>
                                        <button type="button" className="flex h-9 w-9 items-center justify-center" aria-label={words.decrease} onClick={() => cart.setQuantity(key, line.quantity - 1)}>
                                            <Minus size={14} aria-hidden />
                                        </button>
                                        <span className="w-7 text-center text-sm tabular-nums">{line.quantity}</span>
                                        <button type="button" className="flex h-9 w-9 items-center justify-center" aria-label={words.increase} onClick={() => cart.setQuantity(key, line.quantity + 1)}>
                                            <Plus size={14} aria-hidden />
                                        </button>
                                    </div>
                                    <button type="button" className={ui.quiet} onClick={() => cart.setQuantity(key, 0)}>
                                        <Trash2 size={15} aria-hidden />
                                        {words.remove}
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <aside className={`${ui.card} h-fit p-5`}>
                <p className="flex justify-between"><span>{words.subtotal}</span><span className="font-semibold tabular-nums">{formatMoney(cartSubtotal(lines), lang)}</span></p>
                <p className="mt-1.5 text-xs text-muted">{words.estimate}</p>
                <Link href={localPath(lang, "/checkout")} className={`${ui.primary} mt-5 w-full`}>
                    {words.checkout}
                    <ArrowRight size={18} aria-hidden />
                </Link>
            </aside>
        </div>
    );
}
