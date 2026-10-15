import "server-only";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

/**
 * Admin-written text (Markdown, HTML or plain) as safe HTML, rendered on the server so no Markdown
 * library reaches the browser. The API sanitises HTML on save too; this is the second line.
 */
export function richTextToHtml(text: string | null | undefined, format: "MARKDOWN" | "HTML" | "TEXT" = "MARKDOWN"): string {
    if (!text?.trim()) return "";
    if (format === "TEXT") {
        return text
            .split(/\n{2,}/)
            .map((paragraph) => `<p>${sanitizeHtml(paragraph, { allowedTags: [] }).replace(/\n/g, "<br>")}</p>`)
            .join("");
    }
    const html = format === "HTML" ? text : (marked.parse(text, { async: false }) as string);
    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
        allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "width", "height"] },
        allowedSchemes: ["http", "https", "mailto", "tel"],
        transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
    });
}
