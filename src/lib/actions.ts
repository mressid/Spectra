"use server";

import { api, ApiError, type Language, type Schemas } from "@/lib/api/client";
import { getWords } from "@/lib/words";

/**
 * Checkout and order tracking, called from the browser through Server Actions: the browser never talks
 * to the store API directly. Messages come back in the shop's language.
 */
export type Order = Schemas["OrderResponseDto"];
export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string; fieldErrors: Record<string, string> };

async function attempt<T>(lang: Language, call: () => Promise<T>): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await call() };
    } catch (error) {
        if (error instanceof ApiError) {
            return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
        }
        return { ok: false, message: getWords(lang).serverDown, fieldErrors: {} };
    }
}

export async function placeOrder(lang: Language, order: Schemas["PlaceOrderDto"]): Promise<ActionResult<Order>> {
    return attempt(lang, () => api<Order>("/checkout/orders", { method: "POST", body: order, language: lang }));
}

export async function checkCoupon(lang: Language, code: string, subtotal: number, customerPhone?: string): Promise<ActionResult<Schemas["CouponQuoteDto"]>> {
    return attempt(lang, () =>
        api<Schemas["CouponQuoteDto"]>("/checkout/coupon-check", {
            method: "POST",
            body: { code, subtotal, customerPhone: customerPhone || undefined },
            language: lang,
        }),
    );
}

export async function trackOrder(lang: Language, orderNumber: string, customerPhone: string): Promise<ActionResult<Order>> {
    return attempt(lang, () => api<Order>("/checkout/track-order", { method: "POST", body: { orderNumber: orderNumber.trim(), customerPhone }, language: lang }));
}

export async function cancelOrder(lang: Language, orderNumber: string, customerPhone: string): Promise<ActionResult<Order>> {
    return attempt(lang, () => api<Order>("/checkout/cancel-order", { method: "POST", body: { orderNumber: orderNumber.trim(), customerPhone }, language: lang }));
}
