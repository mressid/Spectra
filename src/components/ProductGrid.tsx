import type { Product } from "@/lib/api/catalog";
import { words } from "@/lib/words";
import { ProductCard } from "./ProductCard";

/** 2 columns on phones, 3 on tablets, 4 on desktop. The first row loads its photos first. */
export function ProductGrid({ products, priorityCount = 2 }: { products: Product[]; priorityCount?: number }) {
    if (products.length === 0) return <p className="py-12 text-center text-muted">{words.noProducts}</p>;
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < priorityCount} />
            ))}
        </div>
    );
}
