import type { Metadata } from "next";
import { TrackOrder } from "@/components/cart/TrackOrder";
import { words } from "@/lib/words";

export const metadata: Metadata = { title: words.track, robots: { index: false } };

export default function TrackPage() {
    return (
        <>
            <h1 className="mb-6 text-2xl font-semibold">{words.track}</h1>
            <TrackOrder />
        </>
    );
}
