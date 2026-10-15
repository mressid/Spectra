"use client";

import { words } from "@/lib/words";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="py-24 text-center">
            <p className="text-lg">{words.error}</p>
            <button type="button" onClick={reset} className="mt-6 rounded-control bg-ink px-6 py-3 font-semibold text-white">
                {words.retry}
            </button>
        </div>
    );
}
