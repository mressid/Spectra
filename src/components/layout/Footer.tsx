import Link from "next/link";
import { getHome } from "@/lib/api/catalog";
import { LANGUAGE } from "@/lib/i18n";
import { words } from "@/lib/words";

const NETWORK_NAMES: Record<string, string> = {
    INSTAGRAM: "Instagram", FACEBOOK: "Facebook", TIKTOK: "TikTok", YOUTUBE: "YouTube", PINTEREST: "Pinterest", SNAPCHAT: "Snapchat", X: "X",
};

/** The footer the owner writes in the admin (Store design › Footer). */
export async function Footer() {
    const { footer } = await getHome(LANGUAGE);
    const whatsapp = footer.whatsapp?.replace(/[^\d]/g, "");
    return (
        <footer className="mt-16 border-t border-line bg-surface text-sm">
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                    {footer.aboutText && <p className="whitespace-pre-line text-muted">{footer.aboutText}</p>}
                    {footer.phone && <p><a href={`tel:${footer.phone}`} className="hover:underline">{footer.phone}</a></p>}
                    {whatsapp && <p><a href={`https://wa.me/${whatsapp}`} className="hover:underline">WhatsApp {footer.whatsapp}</a></p>}
                    {footer.email && <p><a href={`mailto:${footer.email}`} className="hover:underline">{footer.email}</a></p>}
                    {footer.address && <p className="text-muted">{footer.address}</p>}
                    {footer.socialLinks.length > 0 && (
                        <p className="flex flex-wrap gap-3 pt-1">
                            {footer.socialLinks.map((social) => (
                                <a key={social.network} href={social.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                                    {NETWORK_NAMES[social.network] ?? social.network}
                                </a>
                            ))}
                        </p>
                    )}
                </div>
                {footer.columns.map((column) => (
                    <div key={column.title}>
                        <p className="mb-2 font-semibold">{column.title}</p>
                        <ul className="space-y-1.5">
                            {column.links.map((link) => (
                                <li key={link.url + link.label}>
                                    <Link href={link.url} className="text-muted hover:text-ink">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                <div>
                    <Link href="/track" className="text-muted hover:text-ink">{words.track}</Link>
                </div>
            </div>
            {footer.bottomText && <p className="border-t border-line px-4 py-4 text-center text-xs text-muted">{footer.bottomText}</p>}
        </footer>
    );
}
