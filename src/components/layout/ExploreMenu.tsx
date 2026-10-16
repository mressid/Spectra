"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";

export interface ExploreCategory {
    id: string;
    name: string;
    slug: string;
    children: { id: string; name: string; slug: string }[];
}

interface ExploreProduct {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl?: string;
    priceFrom?: number;
    compareAtPriceFrom?: number;
    priceVaries: boolean;
    availability: "IN_STOCK" | "ON_ORDER" | "OUT_OF_STOCK";
}

/**
 * The header's "Explore" link. Clicking the word goes to the Explore page; pointing at it (or the chevron, which also
 * works from the keyboard) opens a panel under the header with the top-level categories on the left and, for the one
 * pointed at, its subcategories and a few of its products (loaded from /api/explore when the category is first
 * shown, then kept). The panel closes with Escape, a click outside, leaving it, or a link. The shop owner can switch it
 * off in the admin (Appearance > Navigation bar). Computers only: phones already list the categories in their menu.
 */
export function ExploreMenu({ lang, categories }: { lang: Language; categories: ExploreCategory[] }) {
    const words = getWords(lang);
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState(categories[0]?.id);
    const [loaded, setLoaded] = useState<Record<string, ExploreProduct[] | "error">>({});
    const requested = useRef(new Set<string>());
    const root = useRef<HTMLDivElement>(null);
    const timer = useRef<number>(undefined);
    // a short delay each way, so crossing the gap between the link and the panel does not close it
    const openSoon = () => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpen(true), 120);
    };
    const closeSoon = () => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setOpen(false), 200);
    };
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const load = useCallback((id: string) => {
        if (requested.current.has(id)) return;
        requested.current.add(id);
        fetch(`/api/explore?categoryId=${encodeURIComponent(id)}`)
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
            .then((body: { products: ExploreProduct[] }) => setLoaded((current) => ({ ...current, [id]: body.products })))
            .catch(() => {
                requested.current.delete(id);
                setLoaded((current) => ({ ...current, [id]: "error" }));
            });
    }, []);

    useEffect(() => {
        if (open && activeId) load(activeId);
    }, [open, activeId, load]);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        const onPointer = (event: MouseEvent) => {
            if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onPointer);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onPointer);
        };
    }, [open]);

    if (categories.length === 0) return null;
    const active = categories.find((category) => category.id === activeId) ?? categories[0];
    const products = loaded[active.id];
    const close = () => {
        window.clearTimeout(timer.current);
        setOpen(false);
    };
    return (
        <div ref={root} className="contents">
            <span className="inline-flex items-center gap-0.5" onMouseEnter={openSoon} onMouseLeave={closeSoon}>
                <Link href={localPath(lang, "/explore")} onClick={close} className={`font-display text-[15px] font-semibold hover:text-ink ${open ? "text-ink" : "text-ink/80"}`}>
                    {words.explore}
                </Link>
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls="explore-panel"
                    aria-label={words.explore}
                    onClick={() => {
                        window.clearTimeout(timer.current);
                        setOpen((value) => !value);
                    }}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-control text-ink/80 hover:text-ink"
                >
                    <ChevronDown size={16} strokeWidth={1.8} aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
            </span>
            {open && (
                <div id="explore-panel" onMouseEnter={() => window.clearTimeout(timer.current)} onMouseLeave={closeSoon} className="absolute inset-x-0 top-full z-50 border-b border-line bg-raised shadow-lg">
                    <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-6 lg:grid-cols-[240px_1fr]">
                        <ul className="space-y-0.5" aria-label={words.categories}>
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <Link
                                        href={localPath(lang, `/categories/${category.slug}`)}
                                        onMouseEnter={() => setActiveId(category.id)}
                                        onFocus={() => setActiveId(category.id)}
                                        onClick={close}
                                        className={`block rounded-control px-3 py-2 text-[15px] ${category.id === active.id ? "bg-surface font-semibold text-ink" : "text-ink/80 hover:bg-surface hover:text-ink"}`}
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="min-w-0">
                            <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                                <Link href={localPath(lang, `/categories/${active.slug}`)} onClick={close} className="font-display text-lg font-medium underline-offset-4 hover:underline">
                                    {words.seeAllIn(active.name)}
                                </Link>
                                {active.children.map((child) => (
                                    <Link key={child.id} href={localPath(lang, `/categories/${child.slug}`)} onClick={close} className="text-sm text-muted hover:text-ink">
                                        {child.name}
                                    </Link>
                                ))}
                            </div>
                            {products === undefined ? (
                                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-hidden>
                                    {[0, 1, 2, 3].map((index) => (
                                        <li key={index}>
                                            <div className="aspect-square animate-pulse rounded-photo bg-surface" />
                                            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-surface" />
                                        </li>
                                    ))}
                                </ul>
                            ) : products === "error" || products.length === 0 ? (
                                <p className="text-sm text-muted">{words.exploreEmpty}</p>
                            ) : (
                                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {products.map((product) => (
                                        <li key={product.id}>
                                            <Link href={localPath(lang, `/products/${product.slug}`)} onClick={close} className="group block">
                                                <div className="relative aspect-square overflow-hidden rounded-photo bg-surface">
                                                    {product.thumbnailUrl && (
                                                        <Image src={product.thumbnailUrl} alt="" fill sizes="(min-width: 1024px) 15vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                                                    )}
                                                </div>
                                                <p className="mt-2 line-clamp-2 text-sm leading-snug">{product.name}</p>
                                                <p className="text-sm font-semibold tabular-nums">
                                                    {product.priceVaries && <span className="font-normal text-muted">{words.from} </span>}
                                                    {product.priceFrom != null ? formatMoney(product.priceFrom, lang) : ""}
                                                </p>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
