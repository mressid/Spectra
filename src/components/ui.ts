/** Shared class names for buttons and fields, so every page uses the same shapes (docs/DESIGN.md). */
const base = "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-[opacity,background-color,border-color] disabled:cursor-not-allowed";

export const ui = {
    primary: `${base} h-12 bg-ink px-6 text-on-ink hover:opacity-90 disabled:bg-surface disabled:text-faint`,
    secondary: `${base} h-12 border border-ink px-5 text-ink hover:bg-surface disabled:border-field disabled:text-faint`,
    quiet: `${base} h-10 px-3 text-sm text-muted hover:bg-surface hover:text-ink`,
    icon: "inline-flex h-11 w-11 items-center justify-center rounded-control text-ink hover:bg-surface",
    input: "w-full rounded-control border border-field bg-raised px-3.5 py-3 text-base text-ink placeholder:text-faint focus:border-ink focus:outline-none",
    label: "mb-1.5 block text-sm font-medium",
    card: "rounded-photo border border-line bg-raised",
};
