import type { Metadata } from "next";
import { getImageProps } from "next/image";

/**
 * Page icons made from the shop's square icon (admin > Appearance): the image optimizer resizes it for the browser tab
 * (32 px), for other uses of the icon (128 px) and for the iPhone home screen (256 px, shown at 180). The links are
 * written into the cached page, so they follow the icon when the owner changes it, with no rebuild.
 */
export function shopIcons(iconUrl: string | undefined): Metadata["icons"] | undefined {
    if (!iconUrl) return undefined;
    const sized = (width: number) => getImageProps({ src: iconUrl, width, height: width, alt: "", quality: 85 }).props.src;
    return {
        icon: [
            { url: sized(32), sizes: "32x32" },
            { url: sized(128), sizes: "128x128" },
        ],
        apple: [{ url: sized(256), sizes: "180x180" }],
    };
}
