"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bundle, Variant } from "@/lib/api/catalog";
import { cart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { words } from "@/lib/words";

/** The products of a bundle with a size / colour choice for each product that has variants. */
export function BundleView({ bundle, variants }: { bundle: Bundle; variants: Record<string, Variant[]> }) {
    const router = useRouter();
    const [chosen, setChosen] = useState<Record<string, string>>({});
    const needsChoice = bundle.items.filter((item) => item.hasVariants);
    const complete = needsChoice.every((item) => chosen[item.productId]);
    const canOrder = bundle.isAvailable && complete;

    const add = () => {
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
    };

    return (
        <div>
            <ul className="space-y-4">
                {bundle.items.map((item) => (
                    <li key={item.productId} className="flex items-center gap-4 rounded-photo border border-line p-3">
                        <Link href={`/products/${item.productSlug}`} className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-control bg-surface">
                            {item.thumbnailUrl && <Image src={item.thumbnailUrl} alt={item.productName} fill sizes="80px" className="object-cover" />}
                        </Link>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">{item.quantity > 1 ? `${item.quantity} × ` : ""}{item.productName}</p>
                            {item.hasVariants && (
                                <select
                                    value={chosen[item.productId] ?? ""}
                                    onChange={(event) => setChosen((current) => ({ ...current, [item.productId]: event.target.value }))}
                                    aria-label={`${item.productName} : ${words.option}`}
                                    className="mt-2 w-full rounded-control border border-field bg-page px-3 py-2 text-base"
                                >
                                    <option value="">Choisissez…</option>
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
                    router.push("/checkout");
                }}
                className="mt-6 h-12 w-full rounded-control bg-ink font-semibold text-white disabled:bg-surface disabled:text-muted"
            >
                {bundle.isAvailable ? words.order : words.soldOut}
            </button>
            <p className="mt-2 text-center text-sm text-muted">{formatMoney(bundle.bundlePrice)} · {words.payOnDelivery}</p>
        </div>
    );
}
