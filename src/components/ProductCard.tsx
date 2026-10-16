import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { discountPercent } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { Availability } from "./Availability";
import { Price } from "./Price";
import { QuickAdd } from "./QuickAdd";
import { ui } from "./ui";

/**
 * Catalogue tile: the photo on a light grey ground, a badge in the corner, the name and price centred
 * under it, then a full-width button: "add to cart" for simple products in stock, else "choose…".
 */
export function ProductCard({ lang, product, priority = false }: { lang: Language; product: Product; priority?: boolean }) {
    const discount = discountPercent(product.priceFrom, product.compareAtPriceFrom);
    const soldOut = product.availability === "OUT_OF_STOCK";
    const href = localPath(lang, `/products/${product.slug}`);
    const quickAdd = !product.hasVariants && product.defaultVariantId && product.priceFrom != null && !soldOut;
    return (
        <div className="group">
            <div className="relative">
                <Link href={href} className="block" tabIndex={-1} aria-hidden>
                    <div className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                        {product.thumbnailUrl && (
                            <Image
                                src={product.thumbnailUrl}
                                alt=""
                                fill
                                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                                priority={priority}
                                className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${soldOut ? "opacity-50 grayscale" : ""}`}
                            />
                        )}
                    </div>
                </Link>
                <div className="pointer-events-none absolute right-2 top-2 flex flex-col items-end gap-1">
                    {discount && !soldOut && <span className="rounded-chip bg-ink px-1.5 py-0.5 font-display text-[11px] font-semibold text-on-ink">{discount}</span>}
                    {soldOut && <span className="rounded-chip bg-raised px-1.5 py-0.5 font-display text-[11px] font-semibold text-ink">{getWords(lang).soldOut}</span>}
                </div>
            </div>
            <Link href={href} className="mt-3 block space-y-1 text-center">
                <p className="line-clamp-2 text-sm leading-snug">{product.name}</p>
                <div className="flex justify-center"><Price lang={lang} price={product.priceFrom} oldPrice={product.compareAtPriceFrom} from={product.priceVaries} /></div>
                {product.availability === "ON_ORDER" && (
                    <div className="flex justify-center"><Availability lang={lang} status="ON_ORDER" leadTimeDays={product.leadTimeDays} compact /></div>
                )}
            </Link>
            <div className="mt-3">
                {quickAdd ? (
                    <QuickAdd
                        lang={lang}
                        line={{ variantId: product.defaultVariantId!, productSlug: product.slug, name: product.name, imageUrl: product.thumbnailUrl, unitPrice: product.priceFrom! }}
                    />
                ) : (
                    <Link href={href} className={`${ui.secondary} h-11 w-full ${soldOut ? "pointer-events-none border-field text-faint" : ""}`} aria-disabled={soldOut}>
                        {soldOut ? getWords(lang).soldOut : getWords(lang).chooseOne}
                    </Link>
                )}
            </div>
        </div>
    );
}
