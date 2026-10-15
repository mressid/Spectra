import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/api/catalog";

/** Square photo, name, availability. Price comes once the API lists it (docs/ROADMAP.md, API-1). */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                {product.thumbnailUrl && (
                    <Image
                        src={product.thumbnailUrl}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        priority={priority}
                        className="object-cover transition-opacity group-hover:opacity-90"
                    />
                )}
            </div>
            <p className="mt-2 truncate text-sm">{product.name}</p>
            {product.availability === "OUT_OF_STOCK" && <p className="text-xs text-muted">Épuisé</p>}
        </Link>
    );
}
