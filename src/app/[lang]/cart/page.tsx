import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import type { Language } from "@/lib/api/client";
import { getWords } from "@/lib/words";

export async function generateMetadata({ params }: PageProps<"/[lang]/cart">): Promise<Metadata> {
    return { title: getWords((await params).lang as Language).cart, robots: { index: false } };
}

export default async function CartPage({ params }: PageProps<"/[lang]/cart">) {
    const lang = (await params).lang as Language;
    return (
        <>
            <h1 className="mb-6 text-3xl font-bold tracking-tight">{getWords(lang).cart}</h1>
            <CartView lang={lang} />
        </>
    );
}
