"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { HomePage } from "@/lib/api/catalog";

const TONES: Record<string, string> = { NEUTRAL: "bg-ink", ACCENT: "bg-stock", ALERT: "bg-sale" };

/** Top banner: one message at a time, changing every 5 s (never with reduced motion). */
export function AnnouncementBar({ announcements }: { announcements: HomePage["announcements"] }) {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (announcements.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = window.setInterval(() => setIndex((current) => (current + 1) % announcements.length), 5000);
        return () => window.clearInterval(timer);
    }, [announcements.length]);
    const message = announcements[index];
    if (!message) return null;
    return (
        <div className={`${TONES[message.tone] ?? "bg-ink"} px-4 py-2 text-center text-sm text-white`} aria-live="polite">
            {message.message}
            {message.linkUrl && message.linkLabel && (
                <Link href={message.linkUrl} className="ml-2 font-semibold underline underline-offset-2">
                    {message.linkLabel}
                </Link>
            )}
        </div>
    );
}
