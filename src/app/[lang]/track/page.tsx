import type { Metadata } from "next";
import { TrackOrder } from "@/components/cart/TrackOrder";
import type { Language } from "@/lib/api/client";
import { getWords } from "@/lib/words";

export async function generateMetadata({ params }: PageProps<"/[lang]/track">): Promise<Metadata> {
    return { title: getWords((await params).lang as Language).track, robots: { index: false } };
}

export default async function TrackPage({ params }: PageProps<"/[lang]/track">) {
    const lang = (await params).lang as Language;
    return (
        <>
            <h1 className="mb-8 font-display text-[2rem] font-semibold leading-tight tracking-tight">{getWords(lang).track}</h1>
            <TrackOrder lang={lang} />
        </>
    );
}
