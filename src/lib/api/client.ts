import "server-only";
import type { components } from "./schema";

/**
 * Calls the store API (Spring Boot) from the server. Every response is wrapped in an envelope
 * { success, data, message, errors }; this returns `data` or throws an ApiError.
 *
 * Cached reads live in catalog.ts ('use cache' + cacheTag), not here: this file only talks HTTP.
 */
export type Schemas = components["schemas"];

export type Language = "fr" | "en";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

interface Envelope<T> {
    success: boolean;
    data: T | null;
    message: string;
    errors: string[];
}

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
        // "field:problem" pairs, e.g. "customerPhone:must be a valid phone number"
        readonly errors: string[] = [],
    ) {
        super(message);
    }

    /** { customerPhone: "must be a valid phone number" }, to show each problem under its field. */
    get fieldErrors(): Record<string, string> {
        return Object.fromEntries(
            this.errors.flatMap((error) => {
                const separator = error.indexOf(":");
                return separator > 0 ? [[error.slice(0, separator), error.slice(separator + 1).trim()]] : [];
            }),
        );
    }
}

/**
 * [language] sets Accept-Language: the API answers its messages (errors, promo code checks) in it.
 * Never pass an admin token here: the storefront only uses public endpoints.
 */
export async function api<T>(path: string, options: { language?: Language; method?: string; body?: unknown } = {}): Promise<T> {
    const response = await fetch(`${API_URL}/api/v1${path}`, {
        method: options.method ?? "GET",
        headers: {
            Accept: "application/json",
            ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...(options.language ? { "Accept-Language": options.language } : {}),
        },
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    let envelope: Envelope<T> | null = null;
    try {
        envelope = (await response.json()) as Envelope<T>;
    } catch {
        envelope = null;
    }
    if (!response.ok || !envelope?.success) {
        throw new ApiError(envelope?.message || response.statusText || "Request failed", response.status, envelope?.errors ?? []);
    }
    return envelope.data as T;
}

/** Spring pages: { content, page: { size, number, totalElements, totalPages } }, page numbers from 0. */
export interface Page<T> {
    content: T[];
    page: { size: number; number: number; totalElements: number; totalPages: number };
}
