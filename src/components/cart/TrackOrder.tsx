"use client";

import { CircleCheck, CircleSlash, Package, PhoneCall, Truck } from "lucide-react";
import { useState, useTransition } from "react";
import { cancelOrder, trackOrder, type Order } from "@/lib/actions";
import type { Language } from "@/lib/api/client";
import { formatMoney } from "@/lib/format";
import { getWords } from "@/lib/words";
import { ui } from "../ui";

const STEPS = [
    { status: "PENDING", icon: Package },
    { status: "CONFIRMED", icon: PhoneCall },
    { status: "SHIPPED", icon: Truck },
    { status: "FULFILLED", icon: CircleCheck },
];

/** Order number + phone -> status and lines; cancelling is possible while the order is new or confirmed. */
export function TrackOrder({ lang }: { lang: Language }) {
    const words = getWords(lang);
    const [number, setNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [message, setMessage] = useState("");
    const [pending, startTransition] = useTransition();

    const run = (action: typeof trackOrder) =>
        startTransition(async () => {
            const result = await action(lang, number, phone);
            setMessage(result.ok ? (action === cancelOrder ? words.cancelled : "") : result.message);
            if (result.ok) setOrder(result.data);
        });

    const reached = order ? STEPS.findIndex((step) => step.status === order.status) : -1;
    return (
        <div className="grid max-w-3xl gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    run(trackOrder);
                }}
                className="space-y-4"
            >
                <p className="text-sm text-muted">{words.trackIntro}</p>
                <label className="block">
                    <span className={ui.label}>{words.orderNumber}</span>
                    <input value={number} onChange={(event) => setNumber(event.target.value.toUpperCase())} required className={ui.input} placeholder="ORD-…" />
                </label>
                <label className="block">
                    <span className={ui.label}>{words.phone}</span>
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" inputMode="tel" required className={ui.input} />
                </label>
                <button type="submit" disabled={pending} className={`${ui.primary} w-full`}>{words.find}</button>
                {message && <p role="status" className="text-sm">{message}</p>}
            </form>
            {order && (
                <div className={`${ui.card} p-5 text-sm`}>
                    <p className="text-xs uppercase tracking-wider text-muted">{words.orderNumber}</p>
                    <p className="text-lg font-bold">{order.number}</p>
                    {reached >= 0 ? (
                        <ol className="mt-5 grid grid-cols-4 gap-1">
                            {STEPS.map(({ status, icon: Icon }, index) => {
                                const done = index <= reached;
                                return (
                                    <li key={status} className="flex flex-col items-center gap-1.5 text-center">
                                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${done ? "bg-stock text-page" : "bg-surface text-faint"}`}>
                                            <Icon size={17} aria-hidden />
                                        </span>
                                        <span className={`text-[11px] leading-tight ${done ? "text-ink" : "text-faint"}`}>{words.status[status]}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    ) : (
                        <p className="mt-4 flex items-center gap-2 font-medium text-muted">
                            <CircleSlash size={16} aria-hidden />
                            {words.status[order.status] ?? order.status}
                        </p>
                    )}
                    <ul className="mt-5 space-y-1.5 border-t border-line pt-4 tabular-nums">
                        {order.items.map((item) => (
                            <li key={item.id} className="flex justify-between gap-4">
                                <span><span className="text-muted">{item.quantity} × </span>{item.productNameSnapshot}</span>
                                <span>{formatMoney(item.lineTotal, lang)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 flex justify-between border-t border-line pt-3 font-semibold tabular-nums"><span>{words.total}</span><span>{formatMoney(order.grandTotal, lang)}</span></p>
                    {(order.status === "PENDING" || order.status === "CONFIRMED") && (
                        <button type="button" disabled={pending} onClick={() => run(cancelOrder)} className="mt-4 text-sm font-medium text-sale underline underline-offset-2">
                            {words.cancelOrder}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
