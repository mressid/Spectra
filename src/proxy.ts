import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LANGUAGE, isLanguage, LANGUAGES } from "@/lib/i18n";

/**
 * Pages live under /fr/… and /en/…. A path without a language ("/", "/products/x", an old link) is sent
 * to the visitor's language: the one they chose before (cookie "lang"), else their browser's, else French.
 * A language the shop does not offer is handled by app/[lang]/layout.tsx.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const first = pathname.split("/")[1] ?? "";
    if (isLanguage(first)) {
        return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLanguage(request)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
}

function preferredLanguage(request: NextRequest): string {
    const chosen = request.cookies.get("lang")?.value;
    if (chosen && isLanguage(chosen)) return chosen;
    const accepted = (request.headers.get("accept-language") ?? "")
        .split(",")
        .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
    return accepted.find((code) => (LANGUAGES as string[]).includes(code)) ?? DEFAULT_LANGUAGE;
}

export const config = {
    // everything except the API route, Next internals, metadata files and files with an extension
    matcher: ["/((?!api|_next|sitemap.xml|robots.txt|.*\\..*).*)"],
};
