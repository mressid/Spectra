"use client";

import { useSyncExternalStore } from "react";

/**
 * The cart lives in the browser (localStorage), no account needed. Lines keep what the cart page shows
 * (name, photo, price at the time); the server prices everything again when the order is placed.
 */
export interface CartItemLine {
    kind: "item";
    variantId: string;
    productSlug: string;
    name: string;
    variantName?: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    personalization?: string;
}

export interface CartBundleLine {
    kind: "bundle";
    bundleId: string;
    bundleSlug: string;
    name: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    // one chosen variant per product with variants
    variantIds: string[];
}

export type CartLine = CartItemLine | CartBundleLine;

const KEY = "storefront.cart";
const listeners = new Set<() => void>();
let cache: CartLine[] | null = null;
const EMPTY: CartLine[] = [];

function read(): CartLine[] {
    if (cache) return cache;
    try {
        cache = JSON.parse(localStorage.getItem(KEY) ?? "[]") as CartLine[];
    } catch {
        cache = [];
    }
    return cache;
}

function write(lines: CartLine[]) {
    cache = lines;
    try {
        localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
        // private mode: the cart still works for this page
    }
    listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.key === KEY) {
            cache = null;
            listener();
        }
    };
    window.addEventListener("storage", onStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
    };
};

export const lineKey = (line: CartLine) =>
    line.kind === "item" ? `item:${line.variantId}:${line.personalization ?? ""}` : `bundle:${line.bundleId}:${line.variantIds.join(",")}`;

export const cart = {
    add(line: CartLine) {
        const lines = read();
        const existing = lines.find((item) => lineKey(item) === lineKey(line));
        write(
            existing
                ? lines.map((item) => (item === existing ? { ...item, quantity: Math.min(item.quantity + line.quantity, 99) } : item))
                : [...lines, line],
        );
    },
    setQuantity(key: string, quantity: number) {
        write(read().flatMap((line) => (lineKey(line) === key ? (quantity > 0 ? [{ ...line, quantity: Math.min(quantity, 99) }] : []) : [line])));
    },
    clear() {
        write([]);
    },
};

/** The cart lines; empty during server rendering. */
export function useCart(): CartLine[] {
    return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cartCount = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
