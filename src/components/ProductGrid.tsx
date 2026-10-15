import { PackageSearch } from "lucide-react";
import type { Product } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { getWords } from "@/lib/words";
import { ProductCard } from "./ProductCard";

/** 2 columns on phones, 3 on tablets, 4 on desktop. The first row loads its photos first. */
export function ProductGrid({ lang, products, priorityCount = 2 }: { lang: Language; products: Product[]; priorityCount?: number }) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-16 text-muted">
                <PackageSearch size={32} strokeWidth={1.5} aria-hidden />
                <p>{getWords(lang).noProducts}</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {products.map((product, index) => (
                <ProductCard key={product.id} lang={lang} product={product} priority={index < priorityCount} />
            ))}
        </div>
    );
}
