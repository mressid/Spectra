"use client";

import { Check, HandCoins, Minus, Plus, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Media, Product, VariantWithOptions } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { cart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { Availability } from "../Availability";
import { Price } from "../Price";
import { ui } from "../ui";

interface Props {
    lang: Language;
    brandName?: string;
    product: Product;
    variants: VariantWithOptions[];
    optionGroups: { name: string; values: string[] }[];
    photos: Media[];
    delivery: { fee: number; freeFrom: number | null };
}

/**
 * The interactive part of the product page: gallery, option picker, quantity, personalisation and the
 * order buttons. Everything it shows comes from the server render; choosing an option fetches nothing.
 */
export function ProductView({ lang, brandName, product, variants, optionGroups, photos, delivery }: Props) {
    const words = getWords(lang);
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
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
            {/* gallery */}
            <div className="flex flex-col gap-3 lg:sticky lg:top-32 lg:flex-row-reverse lg:self-start">
                <div className="relative aspect-square flex-1 overflow-hidden rounded-photo bg-surface">
                    {gallery[photoIndex] && (
                        <Image src={gallery[photoIndex].url} alt={gallery[photoIndex].alt} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                    )}
                </div>
                {gallery.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[560px] lg:w-[72px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
                        {gallery.map((photo, index) => (
                            <button
                                key={photo.url + index}
                                type="button"
                                onClick={() => setPhotoIndex(index)}
                                aria-label={words.photo(index + 1)}
                                aria-current={index === photoIndex}
                                className={`relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-control ring-2 ring-offset-2 ring-offset-page transition ${index === photoIndex ? "ring-ink" : "ring-transparent hover:ring-field"}`}
                            >
                                <Image src={photo.url} alt="" fill sizes="72px" className="object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* details */}
            <div className="min-w-0">
                {brandName && <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted">{brandName}</p>}
                <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight [text-wrap:balance] lg:text-[2.6rem]">{product.name}</h1>
                <div className="mt-4">
                    {variant ? (
                        <Price lang={lang} price={variant.price} oldPrice={variant.compareAtPrice} large />
                    ) : (
                        <Price lang={lang} price={product.priceFrom} oldPrice={product.compareAtPriceFrom} from={product.priceVaries} large />
                    )}
                </div>
                <div className="mt-3">
                    <Availability lang={lang} status={status} leadTimeDays={variant?.leadTimeDays ?? product.leadTimeDays} />
                </div>
                {product.shortDescription && <p className="mt-5 leading-relaxed text-muted">{product.shortDescription}</p>}

                <div className="mt-6 space-y-5 border-t border-line pt-6">
                    {optionGroups.map((group) => (
                        <fieldset key={group.name}>
                            <legend className="mb-2.5 text-sm">
                                <span className="font-semibold">{group.name}</span>
                                {chosen[group.name] && <span className="text-muted"> · {chosen[group.name]}</span>}
                            </legend>
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
                                            className={`min-h-11 min-w-11 rounded-control border px-4 text-sm font-medium transition-colors ${
                                                active
                                                    ? "border-ink bg-ink text-on-ink"
                                                    : possible
                                                      ? "border-field hover:border-ink"
                                                      : "border-line text-faint line-through"
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
                        <label className="block">
                            <span className={ui.label}>{words.personalisation}</span>
                            {product.personalizationInstructions && <span className="mb-2 block text-sm text-muted">{product.personalizationInstructions}</span>}
                            <input value={personalization} onChange={(event) => setPersonalization(event.target.value)} maxLength={100} className={ui.input} />
                        </label>
                    )}

                    <div className="flex items-stretch gap-3">
                        <div className="flex items-center rounded-control border border-field" role="group" aria-label={words.quantity}>
                            <button type="button" className="flex h-12 w-11 items-center justify-center" aria-label={words.decrease} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                                <Minus size={16} aria-hidden />
                            </button>
                            <input
                                aria-label={words.quantity}
                                inputMode="numeric"
                                value={quantity}
                                onChange={(event) => setQuantity(Math.min(99, Math.max(1, Number(event.target.value.replace(/\D/g, "")) || 1)))}
                                className="h-12 w-9 bg-transparent text-center text-base tabular-nums focus:outline-none"
                            />
                            <button type="button" className="flex h-12 w-11 items-center justify-center" aria-label={words.increase} onClick={() => setQuantity((value) => Math.min(99, value + 1))}>
                                <Plus size={16} aria-hidden />
                            </button>
                        </div>
                        <button type="button" disabled={!canOrder} onClick={addToCart} className={`${ui.secondary} flex-1`}>
                            {added ? <Check size={18} aria-hidden /> : <ShoppingBag size={18} aria-hidden />}
                            {added ? words.added : words.addToCart}
                        </button>
                    </div>
                    <button
                        type="button"
                        disabled={!canOrder}
                        onClick={() => {
                            addToCart();
                            router.push(localPath(lang, "/checkout"));
                        }}
                        className={`${ui.primary} w-full`}
                    >
                        {status === "OUT_OF_STOCK" && variant ? words.soldOut : missing.length ? words.choose(missing) : words.order}
                    </button>
                </div>

                <ul className="mt-6 divide-y divide-line rounded-photo border border-line text-sm">
                    <li className="flex items-center gap-3 px-4 py-3">
                        <Truck size={18} strokeWidth={1.8} className="shrink-0 text-muted" aria-hidden />
                        <span>
                            {words.delivery} {delivery.fee > 0 ? formatMoney(delivery.fee, lang) : words.free}
                            {delivery.freeFrom != null && delivery.fee > 0 && <span className="text-muted"> · {words.freeFrom(formatMoney(delivery.freeFrom, lang))}</span>}
                        </span>
                    </li>
                    <li className="flex items-center gap-3 px-4 py-3">
                        <HandCoins size={18} strokeWidth={1.8} className="shrink-0 text-muted" aria-hidden />
                        <span>{words.payOnDelivery}<span className="text-muted"> · {words.payOnDeliveryText}</span></span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
