import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { words } from "@/lib/words";

export const metadata: Metadata = { title: words.cart, robots: { index: false } };

export default function CartPage() {
    return (
        <>
            <h1 className="mb-6 text-2xl font-semibold">{words.cart}</h1>
            <CartView />
        </>
    );
}
