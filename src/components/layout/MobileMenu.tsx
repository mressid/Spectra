"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Language } from "@/lib/api/client";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { LanguageSwitch } from "./LanguageSwitch";
import { ThemeToggle } from "./ThemeToggle";

/** Phones: a panel from the left with the categories, the language and the theme. */
export function MobileMenu({ lang, languages, categories }: {
    lang: Language;
    languages: Language[];
    categories: { id: string; name: string; slug: string }[];
}) {
    const words = getWords(lang);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} aria-label={words.menu} aria-expanded={open} className="inline-flex h-11 w-11 items-center justify-center rounded-control hover:bg-surface lg:hidden">
                <Menu size={22} strokeWidth={1.8} aria-hidden />
            </button>
            {/* rendered in <body>: the header's backdrop blur would otherwise clip a fixed panel to the header */}
            {open && createPortal(
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={words.menu}>
                    <button type="button" aria-label={words.close} className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <div className="absolute inset-y-0 left-0 flex w-[min(85vw,340px)] flex-col bg-raised px-5 pb-6 pt-3 shadow-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold uppercase tracking-wider text-muted">{words.categories}</span>
                            <button type="button" onClick={() => setOpen(false)} aria-label={words.close} className="inline-flex h-11 w-11 items-center justify-center rounded-control hover:bg-surface">
                                <X size={22} strokeWidth={1.8} aria-hidden />
                            </button>
                        </div>
                        <nav className="mt-2 flex-1 overflow-y-auto">
                            {categories.map((category) => (
                                <Link key={category.id} href={localPath(lang, `/categories/${category.slug}`)} onClick={() => setOpen(false)} className="block border-b border-line py-3.5 text-base">
                                    {category.name}
                                </Link>
                            ))}
                            <Link href={localPath(lang, "/track")} onClick={() => setOpen(false)} className="block py-3.5 text-base text-muted">{words.track}</Link>
                        </nav>
                        <div className="border-t border-line pt-3">
                            <LanguageSwitch lang={lang} languages={languages} block />
                            <ThemeToggle lang={lang} withLabel />
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </>
    );
}
