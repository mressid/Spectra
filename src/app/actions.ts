"use server";

import { api, ApiError, type Schemas } from "@/lib/api/client";
import { LANGUAGE } from "@/lib/i18n";

/**
 * Checkout and order tracking, called from the browser through Server Actions: the browser never talks
 * to the store API directly. Messages come back in the shop's language.
 */
export type Order = Schemas["OrderResponseDto"];
export type ActionResult<T> = { ok: true; data: T } | { ok: false; message: string; fieldErrors: Record<string, string> };

async function attempt<T>(call: () => Promise<T>): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await call() };
    } catch (error) {
        if (error instanceof ApiError) {
            return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
        }
        return { ok: false, message: "Le serveur ne répond pas. Réessayez dans un instant.", fieldErrors: {} };
    }
}

export async function placeOrder(order: Schemas["PlaceOrderDto"]): Promise<ActionResult<Order>> {
    return attempt(() => api<Order>("/checkout/orders", { method: "POST", body: order, language: LANGUAGE }));
}

export async function checkCoupon(code: string, subtotal: number, customerPhone?: string): Promise<ActionResult<Schemas["CouponQuoteDto"]>> {
    return attempt(() =>
        api<Schemas["CouponQuoteDto"]>("/checkout/coupon-check", {
            method: "POST",
            body: { code, subtotal, customerPhone: customerPhone || undefined },
            language: LANGUAGE,
        }),
    );
}

export async function trackOrder(orderNumber: string, customerPhone: string): Promise<ActionResult<Order>> {
    return attempt(() => api<Order>("/checkout/track-order", { method: "POST", body: { orderNumber: orderNumber.trim(), customerPhone }, language: LANGUAGE }));
}

export async function cancelOrder(orderNumber: string, customerPhone: string): Promise<ActionResult<Order>> {
    return attempt(() => api<Order>("/checkout/cancel-order", { method: "POST", body: { orderNumber: orderNumber.trim(), customerPhone }, language: LANGUAGE }));
}
