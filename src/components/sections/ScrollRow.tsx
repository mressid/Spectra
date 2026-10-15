"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

/** A sideways row of cards with previous / next buttons on wide screens (swipe on phones). */
export function ScrollRow({ children, labels }: { children: React.ReactNode; labels: { previous: string; next: string } }) {
    const row = useRef<HTMLDivElement>(null);
    const scroll = (direction: 1 | -1) => row.current?.scrollBy({ left: direction * row.current.clientWidth * 0.9, behavior: "smooth" });
    const arrow = "absolute top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-raised text-ink shadow-sm hover:border-ink lg:flex";
    return (
        <div className="relative">
            <button type="button" onClick={() => scroll(-1)} aria-label={labels.previous} className={`${arrow} -left-5`}>
                <ChevronLeft size={18} aria-hidden />
            </button>
            <div ref={row} className="-mx-4 flex snap-x gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:gap-6">
                {children}
            </div>
            <button type="button" onClick={() => scroll(1)} aria-label={labels.next} className={`${arrow} -right-5`}>
                <ChevronRight size={18} aria-hidden />
            </button>
        </div>
    );
}
