import { getImageProps } from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { HomeSection } from "@/lib/api/catalog";

type Slide = NonNullable<HomeSection["slides"]>[number];

/**
 * Homepage slides as a scroll-snap row: swipe on phones, scrollbar on desktop, no JavaScript.
 * Phones get the 4:5 image when there is one (else the centre of the 5:2 one).
 */
export function Carousel({ slides }: { slides: Slide[] }) {
    return (
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {slides.map((slide, index) => (
                <SlideView key={slide.id} slide={slide} priority={index === 0} />
            ))}
        </div>
    );
}

function SlideView({ slide, priority }: { slide: Slide; priority: boolean }) {
    const alt = slide.altText ?? slide.title ?? "";
    const common = { alt, priority, sizes: "100vw" };
    const desktop = getImageProps({ ...common, src: slide.imageUrl, width: 1920, height: 768 }).props;
    const phone = getImageProps({ ...common, src: slide.mobileImageUrl ?? slide.imageUrl, width: 1080, height: 1350 }).props;
    const hasText = Boolean(slide.title || slide.description || slide.buttonLabel);
    const content = (
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-photo bg-surface sm:aspect-[5/2]">
            <picture>
                <source media="(min-width: 640px)" srcSet={desktop.srcSet} />
                <img {...phone} alt={alt} className="h-full w-full object-cover" style={{ width: "100%", height: "100%" }} />
            </picture>
            {hasText && (
                <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6 text-white sm:justify-center sm:bg-gradient-to-r sm:from-black/55 sm:via-black/15 sm:p-14">
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
        <div className="w-full shrink-0 snap-center">
            {slide.linkUrl ? <Link href={slide.linkUrl}>{content}</Link> : content}
        </div>
    );
}
