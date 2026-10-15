"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bundle, Variant } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { cart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { ui } from "../ui";

/** The products of a bundle with an option choice for each product that has variants. */
export function BundleView({ lang, bundle, variants }: { lang: Language; bundle: Bundle; variants: Record<string, Variant[]> }) {
    const words = getWords(lang);
    const router = useRouter();
    const [chosen, setChosen] = useState<Record<string, string>>({});
    const needsChoice = bundle.items.filter((item) => item.hasVariants);
    const canOrder = bundle.isAvailable && needsChoice.every((item) => chosen[item.productId]);

    const add = () =>
        cart.add({
            kind: "bundle",
            bundleId: bundle.id,
            bundleSlug: bundle.slug,
            name: bundle.name,
            imageUrl: bundle.thumbnailUrl,
            unitPrice: bundle.bundlePrice,
            quantity: 1,
            variantIds: needsChoice.map((item) => chosen[item.productId]),
        });

    return (
        <div>
            <ul className="space-y-3">
                {bundle.items.map((item) => (
                    <li key={item.productId} className={`${ui.card} flex items-center gap-4 p-3`}>
                        <Link href={localPath(lang, `/products/${item.productSlug}`)} className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-control bg-surface">
                            {item.thumbnailUrl && <Image src={item.thumbnailUrl} alt={item.productName} fill sizes="80px" className="object-cover" />}
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium leading-snug">{item.quantity > 1 && <span className="text-muted">{item.quantity} × </span>}{item.productName}</p>
                            {item.hasVariants && (
                                <select
                                    value={chosen[item.productId] ?? ""}
                                    onChange={(event) => setChosen((current) => ({ ...current, [item.productId]: event.target.value }))}
                                    aria-label={`${item.productName} : ${words.option}`}
                                    className={`${ui.input} mt-2 py-2`}
                                >
                                    <option value="">{words.chooseOne}</option>
                                    {(variants[item.productId] ?? []).map((variant) => (
                                        <option key={variant.id} value={variant.id} disabled={!variant.canBeOrdered}>
                                            {variant.name}{variant.canBeOrdered ? "" : ` · ${words.soldOut}`}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                disabled={!canOrder}
                onClick={() => {
                    add();
                    router.push(localPath(lang, "/checkout"));
                }}
                className={`${ui.primary} mt-6 w-full`}
            >
                {bundle.isAvailable ? words.order : words.soldOut}
            </button>
            <p className="mt-2.5 text-center text-sm text-muted tabular-nums">{formatMoney(bundle.bundlePrice, lang)} · {words.payOnDelivery}</p>
        </div>
    );
}
