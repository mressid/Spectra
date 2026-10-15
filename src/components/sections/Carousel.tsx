"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeSection } from "@/lib/api/catalog";

type Slide = NonNullable<HomeSection["slides"]>[number];

const AUTOPLAY_MS = 6000;

/**
 * Homepage slides in a scroll-snap row (swipe on phones), with arrows, one dot per slide and an
 * automatic change every 6 s that pauses on hover or focus and never runs with reduced motion.
 * Phones get the 4:5 image when there is one (else the centre of the 5:2 one).
 */
export function Carousel({ slides, labels }: { slides: Slide[]; labels: { previous: string; next: string; slide: string } }) {
    const row = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const many = slides.length > 1;

    const goTo = useCallback(
        (index: number) => {
            const element = row.current;
            if (!element) return;
            const target = (index + slides.length) % slides.length;
            element.scrollTo({ left: target * element.clientWidth, behavior: "smooth" });
        },
        [slides.length],
    );

    useEffect(() => {
        if (!many || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = window.setInterval(() => {
            if (!document.hidden) goTo(active + 1);
        }, AUTOPLAY_MS);
        return () => window.clearInterval(timer);
    }, [active, goTo, many, paused]);

    const arrow =
        "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black shadow-sm transition hover:bg-white sm:flex";
    return (
        <div
            className="relative"
            role="region"
            aria-roledescription="carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            <div
                ref={row}
                onScroll={(event) => {
                    const element = event.currentTarget;
                    setActive(Math.round(element.scrollLeft / Math.max(1, element.clientWidth)));
                }}
                className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-photo [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {slides.map((slide, index) => (
                    <SlideView key={slide.id} slide={slide} priority={index === 0} label={`${labels.slide} ${index + 1} / ${slides.length}`} />
                ))}
            </div>
            {many && (
                <>
                    <button type="button" onClick={() => goTo(active - 1)} aria-label={labels.previous} className={`${arrow} left-4`}>
                        <ChevronLeft size={20} aria-hidden />
                    </button>
                    <button type="button" onClick={() => goTo(active + 1)} aria-label={labels.next} className={`${arrow} right-4`}>
                        <ChevronRight size={20} aria-hidden />
                    </button>
                    {/* on a dark pill so the dots read on light photos too */}
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur-sm sm:bottom-6">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                type="button"
                                onClick={() => goTo(index)}
                                aria-label={`${labels.slide} ${index + 1}`}
                                aria-current={index === active}
                                className={`h-2 rounded-full transition-all ${index === active ? "w-6 bg-white" : "w-2 bg-white/55 hover:bg-white/80"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function SlideView({ slide, priority, label }: { slide: Slide; priority: boolean; label: string }) {
    const alt = slide.altText ?? slide.title ?? "";
    const common = { alt, priority, sizes: "(min-width: 1152px) 1152px, 100vw" };
    const desktop = getImageProps({ ...common, src: slide.imageUrl, width: 1920, height: 768 }).props;
    const phone = getImageProps({ ...common, src: slide.mobileImageUrl ?? slide.imageUrl, width: 1080, height: 1350 }).props;
    const hasText = Boolean(slide.title || slide.description || slide.buttonLabel);
    const content = (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface sm:aspect-[5/2]">
            <picture>
                <source media="(min-width: 640px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
                <img {...phone} alt={alt} className="h-full w-full object-cover" style={{ width: "100%", height: "100%" }} />
            </picture>
            {hasText && (
                <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6 pb-14 text-white sm:justify-center sm:bg-gradient-to-r sm:from-black/55 sm:via-black/15 sm:p-16">
                    {slide.title && <p className="max-w-xl font-display text-[2rem] font-semibold leading-[1.05] tracking-tight [text-wrap:balance] sm:text-6xl">{slide.title}</p>}
                    {slide.description && <p className="max-w-md text-sm sm:text-base">{slide.description}</p>}
                    {slide.buttonLabel && slide.linkUrl && (
                        <span className="mt-2 inline-flex h-11 items-center gap-2 rounded-control bg-white px-6 font-display text-[15px] font-semibold tracking-wide text-black">
                            {slide.buttonLabel}
                            <ArrowRight size={16} aria-hidden />
                        </span>
                    )}
                </div>
            )}
        </div>
    );
    return (
        <div className="w-full shrink-0 snap-center" role="group" aria-roledescription="slide" aria-label={label}>
            {slide.linkUrl ? <Link href={slide.linkUrl}>{content}</Link> : content}
        </div>
    );
}
