"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HomePage } from "@/lib/api/catalog";

const TONES: Record<string, string> = { NEUTRAL: "bg-ink text-on-ink", ACCENT: "bg-stock text-page", ALERT: "bg-sale text-page" };

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
        <div className={`${TONES[message.tone] ?? TONES.NEUTRAL} px-4 py-2 text-center text-[13px] font-medium`} aria-live="polite">
            {message.message}
            {message.linkUrl && message.linkLabel && (
                <Link href={message.linkUrl} className="ml-2 inline-flex items-center gap-1 underline underline-offset-2">
                    {message.linkLabel}
                    <ArrowRight size={14} aria-hidden />
                </Link>
            )}
        </div>
    );
}
