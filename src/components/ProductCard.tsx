import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/catalog";
import { Availability } from "./Availability";
import { Price } from "./Price";

/** Square photo, name, price, and a word when it is not simply in stock. The whole card is one link. */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
    return (
        <Link href={`/products/${product.slug}`} className="group block focus-visible:outline-2 focus-visible:outline-stock">
            <div className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                {product.thumbnailUrl && (
                    <Image
                        src={product.thumbnailUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        priority={priority}
                        className={`object-cover transition-opacity group-hover:opacity-90 ${product.availability === "OUT_OF_STOCK" ? "opacity-60" : ""}`}
                    />
                )}
            </div>
            <p className="mt-2 truncate text-sm">{product.name}</p>
            <Price price={product.priceFrom} oldPrice={product.compareAtPriceFrom} from={product.priceVaries} />
            <Availability status={product.availability} leadTimeDays={product.leadTimeDays} compact />
        </Link>
    );
}
