"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { Language } from "@/lib/api/client";
import { getWords } from "@/lib/words";

type Theme = "light" | "dark";

const current = (): Theme =>
    (document.documentElement.dataset.theme as Theme | undefined) ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

// the theme lives on <html>; components re-read it when the visitor or the phone changes it
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", listener);
    return () => {
        listeners.delete(listener);
        media.removeEventListener("change", listener);
    };
};

/** Light / dark switch; the choice is remembered (the layout applies it before paint). */
export function ThemeToggle({ lang, withLabel = false, compact = false }: { lang: Language; withLabel?: boolean; compact?: boolean }) {
    const words = getWords(lang);
    const theme = useSyncExternalStore<Theme | null>(subscribe, current, () => null);
    const next: Theme = theme === "dark" ? "light" : "dark";
    const toggle = () => {
        document.documentElement.dataset.theme = next;
        try {
            localStorage.setItem("theme", next);
        } catch {
            // private mode: the choice lasts for this page
        }
        listeners.forEach((listener) => listener());
    };
    const label = next === "dark" ? words.themeDark : words.themeLight;
    return (
        <button
            type="button"
            onClick={toggle}
            aria-label={`${words.theme} : ${label}`}
            className={
                withLabel
                    ? "flex w-full items-center gap-3 py-3 text-base"
                    : compact
                      ? "inline-flex h-7 w-7 items-center justify-center rounded-control hover:text-ink"
                      : "inline-flex h-11 w-11 items-center justify-center rounded-control hover:bg-surface"
            }
        >
            {/* the icon shows the theme a tap switches to */}
            {theme === "dark" ? <Sun size={compact ? 15 : 20} strokeWidth={1.8} aria-hidden /> : <Moon size={compact ? 15 : 20} strokeWidth={1.8} aria-hidden />}
            {withLabel && <span>{words.theme} · {theme === "dark" ? words.themeDark : words.themeLight}</span>}
        </button>
    );
}
