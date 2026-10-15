/** Shared class names for buttons and fields, so every page uses the same shapes (docs/DESIGN.md). */
const base =
    "inline-flex items-center justify-center gap-2 rounded-control font-display font-semibold tracking-wide transition-[opacity,background-color,border-color,color] disabled:cursor-not-allowed";

export const ui = {
    primary: `${base} h-12 bg-ink px-7 text-[15px] text-on-ink hover:opacity-85 disabled:bg-surface disabled:text-faint`,
    secondary: `${base} h-12 border border-ink px-6 text-[15px] text-ink hover:bg-ink hover:text-on-ink disabled:border-field disabled:text-faint disabled:hover:bg-transparent`,
    // "See all": small outlined button under a section
    outline: `${base} h-10 border border-field px-5 text-sm text-ink hover:border-ink`,
    quiet: `${base} h-10 px-3 text-sm font-medium text-muted hover:bg-surface hover:text-ink`,
    icon: "inline-flex h-11 w-11 items-center justify-center rounded-control text-ink hover:bg-surface",
    input: "w-full rounded-control border border-field bg-raised px-3.5 py-3 text-base text-ink placeholder:text-faint focus:border-ink focus:outline-none",
    label: "mb-1.5 block text-sm font-medium",
    card: "rounded-photo border border-line bg-raised",
    // section and page titles
    title: "font-display font-semibold tracking-tight",
};
