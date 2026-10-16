import type { StoreSettings } from "@/lib/api/catalog";

/**
 * The shop's own look (admin > Appearance), turned into CSS variables that override the defaults of
 * globals.css. Every value is optional; a missing or malformed one keeps the default. docs/DESIGN_TOKENS.md.
 */
type Theme = StoreSettings["theme"];

const HEX = /^#[0-9a-f]{6}$/i;
const color = (value?: string | null) => (value && HEX.test(value) ? value.toLowerCase() : null);

// photos and cards, buttons and fields, badges
const CORNERS = {
    SHARP: ["2px", "2px", "2px"],
    SOFT: ["18px", "5px", "4px"],
    ROUND: ["28px", "999px", "999px"],
} as const;

function channel(hex: string, index: number) {
    const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function contrast(a: string, b: string) {
    const luminance = (hex: string) => 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
}

/** White or near-black, whichever reads better on [background]. */
export const textOn = (background: string) => (contrast(background, "#ffffff") >= contrast(background, "#111418") ? "#ffffff" : "#111418");

/** The colour variables of one theme; [dark] mixes the accent's soft tone into the dark page colour. */
function colors(values: { ink: string | null; accent: string | null; page?: string | null; surface?: string | null }, dark: boolean) {
    const rules: string[] = [];
    if (values.ink) rules.push(`--color-ink:${values.ink}`, `--color-on-ink:${textOn(values.ink)}`);
    if (values.accent) rules.push(`--color-stock:${values.accent}`, `--color-stock-soft:color-mix(in srgb, ${values.accent} ${dark ? 18 : 12}%, ${values.page ?? (dark ? "#0e1114" : "#ffffff")})`);
    if (values.page) rules.push(`--color-page:${values.page}`, `--color-raised:${values.page}`);
    if (values.surface) rules.push(`--color-surface:${values.surface}`);
    return rules.join(";");
}

/** CSS for a <style> in the page head, or null when the shop kept every default. */
export function themeCss(theme: Theme | undefined): string | null {
    if (!theme) return null;
    const rules: string[] = [];
    const light = colors({ ink: color(theme.primaryColor), accent: color(theme.accentColor), page: color(theme.backgroundColor), surface: color(theme.surfaceColor) }, false);
    const dark = colors({ ink: color(theme.primaryColorDark), accent: color(theme.accentColorDark), page: color(theme.backgroundColorDark), surface: color(theme.surfaceColorDark) }, true);
    const shape = [];
    if (theme.corners && theme.corners !== "SOFT") {
        const [photo, control, chip] = CORNERS[theme.corners] ?? CORNERS.SOFT;
        shape.push(`--radius-photo:${photo}`, `--radius-control:${control}`, `--radius-chip:${chip}`);
    }
    if (theme.headingFont === "SANS") shape.push("--font-heading:var(--font-body),system-ui,sans-serif");
    // "html:root" outranks the defaults in globals.css whatever the order of the style sheets; the dark
    // rules outrank the light ones because they carry :not(...)
    if (light || shape.length) rules.push(`html:root{${[light, ...shape].filter(Boolean).join(";")}}`);
    if (dark) {
        rules.push(`@media (prefers-color-scheme:dark){html:root:not([data-theme="light"]){${dark}}}`);
        rules.push(`html:root[data-theme="dark"]{${dark}}`);
    }
    return rules.length ? rules.join("\n") : null;
}
