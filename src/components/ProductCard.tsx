import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { discountPercent } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { Availability } from "./Availability";
import { Price } from "./Price";

/** Square photo with its badges, name, price, and a word when it is not simply in stock. One link. */
export function ProductCard({ lang, product, priority = false }: { lang: Language; product: Product; priority?: boolean }) {
    const discount = discountPercent(product.priceFrom, product.compareAtPriceFrom);
    const soldOut = product.availability === "OUT_OF_STOCK";
    return (
        <Link href={localPath(lang, `/products/${product.slug}`)} className="group block rounded-photo focus-visible:outline-offset-4">
            <div className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                {product.thumbnailUrl && (
                    <Image
                        src={product.thumbnailUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        priority={priority}
                        className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] ${soldOut ? "opacity-50 grayscale" : ""}`}
                    />
                )}
                <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                    {discount && !soldOut && <span className="rounded-chip bg-sale px-1.5 py-0.5 text-[11px] font-bold text-page">{discount}</span>}
                    {soldOut && <span className="rounded-chip bg-raised/90 px-1.5 py-0.5 text-[11px] font-semibold text-ink">{getWords(lang).soldOut}</span>}
                </div>
            </div>
            <div className="mt-3 space-y-1">
                <p className="line-clamp-2 text-sm leading-snug">{product.name}</p>
                <Price lang={lang} price={product.priceFrom} oldPrice={product.compareAtPriceFrom} from={product.priceVaries} />
                {product.availability === "ON_ORDER" && <Availability lang={lang} status="ON_ORDER" leadTimeDays={product.leadTimeDays} compact />}
            </div>
        </Link>
    );
}
