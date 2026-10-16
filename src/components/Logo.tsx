import Image from "next/image";
import type { StoreSettings } from "@/lib/api/catalog";

/**
 * What the header shows (admin > Appearance > Brand): the wide logo, the square icon, or the shop name.
 * Automatic (nothing chosen) is the wide logo when there is one, else the name; a choice whose picture
 * is missing falls back to the name. A separate dark-theme logo replaces the wide one in the dark theme
 * (see .logo-* in globals.css).
 */
export function Logo({ settings, fallbackName, height = 32 }: { settings: StoreSettings; fallbackName: string; height?: number }) {
    const name = settings.shopName || fallbackName;
    const { logoUrl, logoDarkUrl, iconUrl, headerLogo } = settings.theme ?? {};
    const mode = headerLogo ?? (logoUrl || logoDarkUrl ? "WIDE" : "NAME");
    if (mode === "SQUARE" && iconUrl) {
        return <Image src={iconUrl} alt={name} width={height * 2} height={height * 2} className="w-auto object-contain" style={{ height: height * 1.25 }} priority />;
    }
    if (mode === "WIDE" && (logoUrl || logoDarkUrl)) {
        const image = (url: string, className: string, alt: string) => (
            <Image src={url} alt={alt} width={height * 5} height={height} className={`w-auto max-w-[180px] object-contain ${className}`} style={{ height }} priority />
        );
        return (
            <span className={`flex items-center justify-center ${logoUrl && logoDarkUrl ? "logo-has-dark" : ""}`}>
                {logoUrl ? image(logoUrl, "logo-light", name) : null}
                {logoDarkUrl ? image(logoDarkUrl, logoUrl ? "logo-dark" : "", logoUrl ? "" : name) : null}
            </span>
        );
    }
    return <>{name}</>;
}
