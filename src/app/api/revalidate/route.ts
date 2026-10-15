import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";

/**
 * Called by the store API after an admin change: POST { "tags": ["product:<id>", "products"] } with the
 * header X-Revalidate-Secret. Marks those cache entries stale; the next visit rebuilds them while the
 * old page is still served (profile "max"), so customers never wait for a rebuild.
 */
export async function POST(request: Request) {
    const secret = process.env.REVALIDATE_SECRET ?? "";
    const given = request.headers.get("x-revalidate-secret") ?? "";
    if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
        return Response.json({ revalidated: false, message: "Invalid secret" }, { status: 401 });
    }
    const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
    const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string" && tag.length <= 256) : [];
    if (tags.length === 0) {
        return Response.json({ revalidated: false, message: "Send { tags: [...] }" }, { status: 400 });
    }
    for (const tag of tags) {
        revalidateTag(tag, "max");
    }
    return Response.json({ revalidated: true, tags });
}
