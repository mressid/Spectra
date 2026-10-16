import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { localPath } from "@/lib/i18n";
import { SOCIAL_NAMES, SocialIcon } from "../SocialIcon";
import { getWords } from "@/lib/words";

/** The footer the owner writes in the admin (Store design › Footer). */
export async function Footer({ lang }: { lang: Language }) {
    const settings = await getStoreSettings();
    const { footer } = settings;
    const words = getWords(lang);
    const whatsapp = footer.whatsapp?.replace(/[^\d]/g, "");
    const contact = "flex items-center gap-2.5 text-muted hover:text-ink";
    // no phone, WhatsApp, email or address: no empty "Contact" column
    const hasContact = Boolean(footer.phone || whatsapp || footer.email || footer.address);
    return (
        <footer className="mt-8 border-t border-line bg-raised text-sm">
            <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                <div className="space-y-3">
                    <p className="font-display text-xl font-bold uppercase tracking-[0.18em]">{settings.shopName || words.shop}</p>
                    {footer.aboutText && <p className="whitespace-pre-line leading-relaxed text-muted">{footer.aboutText}</p>}
                    {footer.socialLinks.length > 0 && (
                        <ul className="flex flex-wrap gap-2 pt-1">
                            {footer.socialLinks.map((social) => (
                                <li key={social.network}>
                                    <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={SOCIAL_NAMES[social.network] ?? social.network}
                                        title={SOCIAL_NAMES[social.network] ?? social.network}
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-field text-ink transition-colors hover:border-ink hover:bg-ink hover:text-on-ink"
                                    >
                                        <SocialIcon network={social.network} size={18} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {hasContact && (
                    <div className="space-y-2.5">
                        <p className="mb-2 font-display text-[15px] font-semibold">{words.contact}</p>
                        {footer.phone && <a href={`tel:${footer.phone}`} className={contact}><Phone size={16} aria-hidden />{footer.phone}</a>}
                        {whatsapp && <a href={`https://wa.me/${whatsapp}`} className={contact}><MessageCircle size={16} aria-hidden />WhatsApp</a>}
                        {footer.email && <a href={`mailto:${footer.email}`} className={contact}><Mail size={16} aria-hidden />{footer.email}</a>}
                        {footer.address && <p className="flex items-start gap-2.5 text-muted"><MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />{footer.address}</p>}
                    </div>
                )}
                {footer.columns.map((column) => (
                    <div key={column.title}>
                        <p className="mb-3 font-display text-[15px] font-semibold">{column.title}</p>
                        <ul className="space-y-2">
                            {column.links.map((link) => (
                                <li key={link.url + link.label}>
                                    <Link href={link.url} className="text-muted hover:text-ink">{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                <div>
                    <p className="mb-3 font-display text-[15px] font-semibold">{words.help}</p>
                    <Link href={localPath(lang, "/track")} className="text-muted hover:text-ink">{words.track}</Link>
                </div>
            </div>
            {footer.bottomText && <p className="border-t border-line px-4 py-5 text-center text-xs text-muted">{footer.bottomText}</p>}
        </footer>
    );
}
