import { SearchX } from "lucide-react";
import Link from "next/link";
import { ui } from "@/components/ui";
import { getWords } from "@/lib/words";

// not-found has no params: the words are bilingual, the link goes to "/" and the proxy picks the language
export default function NotFound() {
    const fr = getWords("fr");
    const en = getWords("en");
    return (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface text-muted">
                <SearchX size={28} strokeWidth={1.5} aria-hidden />
            </span>
            <p className="text-lg">{fr.notFound}</p>
            <p className="text-sm text-muted" lang="en">{en.notFound}</p>
            <Link href="/" className={ui.primary}>{fr.backHome}</Link>
        </div>
    );
}
