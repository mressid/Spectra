"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import { useParams } from "next/navigation";
import { ui } from "@/components/ui";
import type { Language } from "@/lib/api/client";
import { getWords } from "@/lib/words";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
    const params = useParams<{ lang: string }>();
    const words = getWords((params.lang === "en" ? "en" : "fr") as Language);
    return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sale-soft text-sale">
                <TriangleAlert size={28} strokeWidth={1.5} aria-hidden />
            </span>
            <p className="text-lg">{words.error}</p>
            <button type="button" onClick={reset} className={ui.primary}>
                <RotateCw size={18} aria-hidden />
                {words.retry}
            </button>
        </div>
    );
}
