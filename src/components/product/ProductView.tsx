"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Media, Product, VariantWithOptions } from "@/lib/api/catalog";
import { cart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { words } from "@/lib/words";
import { Availability } from "../Availability";
import { Price } from "../Price";

interface Props {
    product: Product;
    variants: VariantWithOptions[];
    optionGroups: { name: string; values: string[] }[];
    photos: Media[];
    delivery: { fee: number; freeFrom: number | null };
}

/**
 * The interactive part of the product page: gallery, option picker, quantity, personalisation and the
 * order button. Everything it shows comes from the server render; choosing an option fetches nothing.
 */
export function ProductView({ product, variants, optionGroups, photos, delivery }: Props) {
    const router = useRouter();
    // an option with a single value is chosen for the customer
    const [chosen, setChosen] = useState<Record<string, string>>(() =>
        Object.fromEntries(optionGroups.filter((group) => group.values.length === 1).map((group) => [group.name, group.values[0]])),
    );
    const [quantity, setQuantity] = useState(1);
    const [personalization, setPersonalization] = useState("");
    const [photoIndex, setPhotoIndex] = useState(0);
    const [added, setAdded] = useState(false);

    const variant = useMemo(() => {
        if (!product.hasVariants) return variants[0];
        if (optionGroups.some((group) => !chosen[group.name])) return undefined;
        return variants.find((item) => optionGroups.every((group) => item.options[group.name] === chosen[group.name]));
    }, [chosen, optionGroups, product.hasVariants, variants]);

    // a value is possible when some orderable variant has it together with the other chosen values
    const isPossible = (name: string, value: string) =>
        variants.some(
            (item) =>
                item.canBeOrdered &&
                item.options[name] === value &&
                optionGroups.every((group) => group.name === name || !chosen[group.name] || item.options[group.name] === chosen[group.name]),
        );

    const gallery = [
        ...(product.thumbnailUrl ? [{ url: product.thumbnailUrl, alt: product.name }] : []),
        ...photos.map((photo) => ({ url: photo.url, alt: photo.altText ?? product.name })),
    ];
    const missing = optionGroups.filter((group) => !chosen[group.name]).map((group) => group.name);
    const canOrder = Boolean(variant?.canBeOrdered);
    const status = variant?.availabilityStatus ?? product.availability;

    const addToCart = () => {
        if (!variant) return;
        cart.add({
            kind: "item",
            variantId: variant.id,
            productSlug: product.slug,
            name: product.name,
            variantName: product.hasVariants ? variant.name : undefined,
            imageUrl: product.thumbnailUrl,
            unitPrice: variant.price,
            quantity,
            personalization: personalization.trim() || undefined,
        });
        setAdded(true);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
            {/* gallery */}
            <div>
                <div className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                    {gallery[photoIndex] && (
                        <Image src={gallery[photoIndex].url} alt={gallery[photoIndex].alt} fill priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
                    )}
                </div>
                {gallery.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                        {gallery.map((photo, index) => (
                            <button
                                key={photo.url + index}
                                type="button"
                                onClick={() => setPhotoIndex(index)}
                                aria-label={`Photo ${index + 1}`}
                                aria-current={index === photoIndex}
                                className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-control border-2 ${index === photoIndex ? "border-ink" : "border-transparent"}`}
                            >
                                <Image src={photo.url} alt="" fill sizes="64px" className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* details */}
            <div>
                <h1 className="text-2xl font-semibold leading-tight lg:text-3xl">{product.name}</h1>
                <div className="mt-3">
                    {variant ? (
                        <Price price={variant.price} oldPrice={variant.compareAtPrice} large />
                    ) : (
                        <Price price={product.priceFrom} oldPrice={product.compareAtPriceFrom} from={product.priceVaries} large />
                    )}
                </div>
                <div className="mt-2">
                    <Availability status={status} leadTimeDays={variant?.leadTimeDays ?? product.leadTimeDays} />
                </div>
                {product.shortDescription && <p className="mt-4 text-muted">{product.shortDescription}</p>}

                {optionGroups.map((group) => (
                    <fieldset key={group.name} className="mt-5">
                        <legend className="mb-2 text-sm font-semibold">{group.name}</legend>
                        <div className="flex flex-wrap gap-2">
                            {group.values.map((value) => {
                                const active = chosen[group.name] === value;
                                const possible = isPossible(group.name, value);
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => {
                                            setChosen((current) => ({ ...current, [group.name]: value }));
                                            setAdded(false);
                                        }}
                                        className={`min-h-11 rounded-control border px-4 text-sm ${
                                            active ? "border-ink bg-ink text-white" : possible ? "border-field hover:border-ink" : "border-field text-faint line-through"
                                        }`}
                                    >
                                        {value}
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                ))}

                {product.allowPersonalization && (
                    <label className="mt-5 block">
                        <span className="mb-1 block text-sm font-semibold">{words.personalisation}</span>
                        {product.personalizationInstructions && <span className="mb-2 block text-sm text-muted">{product.personalizationInstructions}</span>}
                        <input
                            value={personalization}
                            onChange={(event) => setPersonalization(event.target.value)}
                            maxLength={100}
                            className="w-full rounded-control border border-field px-3 py-3 text-base"
                        />
                    </label>
                )}

                <div className="mt-6 flex items-center gap-3">
                    <label className="sr-only" htmlFor="quantity">{words.quantity}</label>
                    <div className="flex items-center rounded-control border border-field">
                        <button type="button" className="h-12 w-11 text-lg" aria-label="-1" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                        <input
                            id="quantity"
                            inputMode="numeric"
                            value={quantity}
                            onChange={(event) => setQuantity(Math.min(99, Math.max(1, Number(event.target.value.replace(/\D/g, "")) || 1)))}
                            className="h-12 w-10 text-center text-base"
                        />
                        <button type="button" className="h-12 w-11 text-lg" aria-label="+1" onClick={() => setQuantity((value) => Math.min(99, value + 1))}>+</button>
                    </div>
                    <button
                        type="button"
                        disabled={!canOrder}
                        onClick={addToCart}
                        className="h-12 flex-1 rounded-control border border-ink font-semibold disabled:border-field disabled:text-muted"
                    >
                        {added ? `✓ ${words.added}` : words.addToCart}
                    </button>
                </div>
                <button
                    type="button"
                    disabled={!canOrder}
                    onClick={() => {
                        addToCart();
                        router.push("/checkout");
                    }}
                    className="mt-3 h-12 w-full rounded-control bg-ink font-semibold text-white disabled:bg-surface disabled:text-muted"
                >
                    {status === "OUT_OF_STOCK" && variant ? words.soldOut : missing.length ? words.choose(missing) : words.order}
                </button>
                <p className="mt-3 text-sm text-muted">
                    🚚 {words.delivery} {delivery.fee > 0 ? formatMoney(delivery.fee) : words.free}
                    {delivery.freeFrom != null && delivery.fee > 0 && ` · ${words.freeFrom(formatMoney(delivery.freeFrom))}`} · {words.payOnDelivery}
                </p>
            </div>
        </div>
    );
}
