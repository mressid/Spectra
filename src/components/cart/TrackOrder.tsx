"use client";

import { useState, useTransition } from "react";
import { cancelOrder, trackOrder, type Order } from "@/app/actions";
import { formatMoney } from "@/lib/format";
import { words } from "@/lib/words";

const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "FULFILLED"];

/** Order number + phone -> status and lines; cancelling is possible while the order is new or confirmed. */
export function TrackOrder() {
    const [number, setNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [message, setMessage] = useState("");
    const [pending, startTransition] = useTransition();

    const run = (action: typeof trackOrder) =>
        startTransition(async () => {
            const result = await action(number, phone);
            setMessage(result.ok ? (action === cancelOrder ? words.cancelled : "") : result.message);
            if (result.ok) setOrder(result.data);
        });

    const input = "w-full rounded-control border border-field px-3 py-3 text-base";
    return (
        <div className="max-w-lg">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    run(trackOrder);
                }}
                className="space-y-3"
            >
                <p className="text-sm text-muted">{words.trackIntro}</p>
                <input value={number} onChange={(event) => setNumber(event.target.value.toUpperCase())} placeholder={words.orderNumber} aria-label={words.orderNumber} required className={input} />
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder={words.phone} aria-label={words.phone} type="tel" inputMode="tel" required className={input} />
                <button type="submit" disabled={pending} className="h-12 w-full rounded-control bg-ink font-semibold text-white disabled:opacity-60">{words.find}</button>
            </form>
            {message && <p role="status" className="mt-4 text-sm">{message}</p>}
            {order && (
                <div className="mt-6 rounded-photo border border-line p-5 text-sm">
                    <p className="text-lg font-semibold">{order.number} · {words.status[order.status] ?? order.status}</p>
                    {STEPS.includes(order.status) && (
                        <ol className="mt-3 flex gap-1">
                            {STEPS.map((step, index) => (
                                <li key={step} className={`h-1.5 flex-1 rounded-full ${index <= STEPS.indexOf(order.status) ? "bg-stock" : "bg-line"}`} title={words.status[step]} />
                            ))}
                        </ol>
                    )}
                    <ul className="mt-4 space-y-1">
                        {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between gap-4">
                                <span>{item.quantity} × {item.productNameSnapshot}</span>
                                <span>{formatMoney(item.lineTotal)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 flex justify-between border-t border-line pt-3 font-semibold"><span>{words.total}</span><span>{formatMoney(order.grandTotal)}</span></p>
                    {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                        <button type="button" disabled={pending} onClick={() => run(cancelOrder)} className="mt-4 text-sm text-sale underline">
                            {words.cancelOrder}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
