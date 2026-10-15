"use client";

import { CircleCheck, HandCoins, Loader2, Tag } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { checkCoupon, placeOrder, type Order } from "@/lib/actions";
import type { Language } from "@/lib/api/client";
import { cart, cartSubtotal, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { localPath } from "@/lib/i18n";
import { getWords } from "@/lib/words";
import { ui } from "../ui";
import { EmptyCart } from "./CartView";

interface Props {
    lang: Language;
    governorates: string[];
    delivery: { fee: number; freeFrom: number | null; byGovernorate: Record<string, number> };
}

// the API takes any JSON here; its OpenAPI type (JsonNode) comes out as an empty object
const personalizationOf = (text: string) => ({ text }) as unknown as Record<string, never>;

/** Guest checkout, cash on delivery. The server prices the order; its totals are shown once placed. */
export function CheckoutForm({ lang, governorates, delivery }: Props) {
    const words = getWords(lang);
    const lines = useCart();
    const [values, setValues] = useState({ customerName: "", customerPhone: "", customerEmail: "", state: "", city: "", streetLine1: "", streetLine2: "", deliveryNotes: "" });
    const [coupon, setCoupon] = useState({ code: "", applied: "", discount: 0, message: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [placed, setPlaced] = useState<Order | null>(null);
    const [pending, startTransition] = useTransition();

    if (placed) return <Confirmation lang={lang} order={placed} />;
    if (lines.length === 0) return <EmptyCart lang={lang} />;

    const subtotal = cartSubtotal(lines);
    const afterDiscount = Math.max(0, subtotal - coupon.discount);
    const zoneFee = values.state ? delivery.byGovernorate[values.state] : undefined;
    const fee = delivery.freeFrom != null && subtotal >= delivery.freeFrom ? 0 : zoneFee ?? delivery.fee;

    const set = (field: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setValues((current) => ({ ...current, [field]: event.target.value }));
        setErrors((current) => ({ ...current, [field]: "" }));
    };

    const applyCoupon = () =>
        startTransition(async () => {
            const result = await checkCoupon(lang, coupon.code.trim(), subtotal, values.customerPhone);
            if (result.ok && result.data.valid) {
                setCoupon({ code: result.data.code, applied: result.data.code, discount: result.data.discount, message: "" });
            } else {
                setCoupon((current) => ({ ...current, applied: "", discount: 0, message: result.ok ? result.data.message ?? "" : result.message }));
            }
        });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        setMessage("");
        startTransition(async () => {
            const result = await placeOrder(lang, {
                customerName: values.customerName.trim(),
                customerPhone: values.customerPhone.trim(),
                customerEmail: values.customerEmail.trim() || undefined,
                streetLine1: values.streetLine1.trim(),
                streetLine2: values.streetLine2.trim() || undefined,
                city: values.city.trim(),
                state: values.state || undefined,
                countryCode: "TN",
                deliveryNotes: values.deliveryNotes.trim() || undefined,
                couponCode: coupon.applied || undefined,
                items: lines.flatMap((line) =>
                    line.kind === "item"
                        ? [{ variantId: line.variantId, quantity: line.quantity, ...(line.personalization ? { personalization: personalizationOf(line.personalization) } : {}) }]
                        : [],
                ),
                bundles: lines.flatMap((line) => (line.kind === "bundle" ? [{ bundleId: line.bundleId, quantity: line.quantity, variantIds: line.variantIds }] : [])),
            });
            if (result.ok) {
                cart.clear();
                setPlaced(result.data);
                window.scrollTo({ top: 0 });
            } else {
                setErrors(result.fieldErrors);
                setMessage(result.message);
            }
        });
    };

    const field = (name: keyof typeof values, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
        <label className="block">
            <span className={ui.label}>{label}</span>
            <input name={name} value={values[name]} onChange={set(name)} className={`${ui.input} ${errors[name] ? "border-sale" : ""}`} aria-invalid={Boolean(errors[name])} {...props} />
            {errors[name] && <span className="mt-1.5 block text-sm text-sale">{errors[name]}</span>}
        </label>
    );

    return (
        <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12" noValidate>
            <div className="min-w-0 space-y-8">
                <fieldset className="space-y-4">
                    <legend className="mb-4 text-lg font-semibold">{words.yourDetails}</legend>
                    {field("customerName", words.name, { required: true, autoComplete: "name" })}
                    {field("customerPhone", words.phone, { required: true, type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "+216 …" })}
                    {field("customerEmail", words.email, { type: "email", autoComplete: "email" })}
                </fieldset>
                <fieldset className="space-y-4">
                    <legend className="mb-4 text-lg font-semibold">{words.deliveryAddress}</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className={ui.label}>{words.governorate}</span>
                            <select name="state" value={values.state} onChange={set("state")} required className={`${ui.input} ${errors.state ? "border-sale" : ""}`} aria-invalid={Boolean(errors.state)}>
                                <option value="">{words.chooseGovernorate}</option>
                                {governorates.map((name) => <option key={name} value={name}>{name}</option>)}
                            </select>
                            {errors.state && <span className="mt-1.5 block text-sm text-sale">{errors.state}</span>}
                        </label>
                        {field("city", words.city, { required: true, autoComplete: "address-level2" })}
                    </div>
                    {field("streetLine1", words.street, { required: true, autoComplete: "address-line1" })}
                    {field("streetLine2", words.street2, { autoComplete: "address-line2" })}
                    <label className="block">
                        <span className={ui.label}>{words.notes}</span>
                        <textarea name="deliveryNotes" value={values.deliveryNotes} onChange={set("deliveryNotes")} rows={2} className={ui.input} />
                    </label>
                </fieldset>
            </div>

            <aside className={`${ui.card} h-fit min-w-0 p-5 lg:sticky lg:top-24`}>
                <p className="mb-4 text-lg font-semibold">{words.summary}</p>
                <ul className="space-y-2 text-sm">
                    {lines.map((line) => (
                        <li key={line.kind === "item" ? line.variantId + (line.personalization ?? "") : line.bundleId + line.variantIds.join()} className="flex justify-between gap-4">
                            <span className="min-w-0"><span className="text-muted tabular-nums">{line.quantity} × </span>{line.name}{line.kind === "item" && line.variantName ? <span className="text-muted"> · {line.variantName}</span> : null}</span>
                            <span className="shrink-0 tabular-nums">{formatMoney(line.unitPrice * line.quantity, lang)}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-4 flex gap-2 border-t border-line pt-4">
                    <div className="relative min-w-0 flex-1">
                        <Tag size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
                        <input
                            value={coupon.code}
                            onChange={(event) => setCoupon((current) => ({ ...current, code: event.target.value.toUpperCase(), message: "" }))}
                            placeholder={words.promoCode}
                            aria-label={words.promoCode}
                            className={`${ui.input} py-2.5 pl-9`}
                        />
                    </div>
                    <button type="button" onClick={applyCoupon} disabled={!coupon.code.trim() || pending} className={`${ui.secondary} h-auto px-4`}>
                        {words.apply}
                    </button>
                </div>
                {coupon.message && <p className="mt-2 text-sm text-sale">{coupon.message}</p>}
                <dl className="mt-4 space-y-2 text-sm tabular-nums">
                    <div className="flex justify-between"><dt>{words.subtotal}</dt><dd>{formatMoney(subtotal, lang)}</dd></div>
                    {coupon.applied && <div className="flex justify-between text-stock"><dt>{words.discount} · {coupon.applied}</dt><dd>- {formatMoney(coupon.discount, lang)}</dd></div>}
                    <div className="flex justify-between"><dt>{words.delivery}</dt><dd>{fee > 0 ? formatMoney(fee, lang) : words.free}</dd></div>
                    <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>{words.total}</dt><dd>{formatMoney(afterDiscount + fee, lang)}</dd></div>
                </dl>
                <p className="mt-3 flex items-start gap-2 text-xs text-muted">
                    <HandCoins size={15} className="mt-px shrink-0" aria-hidden />
                    {words.payOnDeliveryText} {words.estimate}
                </p>
                {message && <p role="alert" className="mt-4 rounded-control bg-sale-soft p-3 text-sm text-sale">{message}</p>}
                <button type="submit" disabled={pending} className={`${ui.primary} mt-5 w-full`}>
                    {pending && <Loader2 size={18} className="animate-spin" aria-hidden />}
                    {pending ? words.placing : words.placeOrder}
                </button>
            </aside>
        </form>
    );
}

function Confirmation({ lang, order }: { lang: Language; order: Order }) {
    const words = getWords(lang);
    return (
        <div className="mx-auto max-w-lg py-8 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stock-soft text-stock">
                <CircleCheck size={32} strokeWidth={1.8} aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">{words.thanks}</h2>
            <p className="mt-4 text-sm text-muted">{words.orderNumber}</p>
            <p className="text-xl font-bold tracking-wide">{order.number}</p>
            <dl className={`${ui.card} mt-6 space-y-2 p-5 text-left text-sm tabular-nums`}>
                {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-4">
                        <dt className="min-w-0"><span className="text-muted">{item.quantity} × </span>{item.productNameSnapshot}{item.variantNameSnapshot !== item.productNameSnapshot ? <span className="text-muted"> · {item.variantNameSnapshot}</span> : null}</dt>
                        <dd className="shrink-0">{formatMoney(item.lineTotal, lang)}</dd>
                    </div>
                ))}
                {order.discountTotal > 0 && <div className="flex justify-between text-stock"><dt>{words.discount}</dt><dd>- {formatMoney(order.discountTotal, lang)}</dd></div>}
                <div className="flex justify-between"><dt>{words.delivery}</dt><dd>{order.shippingTotal > 0 ? formatMoney(order.shippingTotal, lang) : words.free}</dd></div>
                {order.taxTotal > 0 && <div className="flex justify-between"><dt>{words.stampDuty}</dt><dd>{formatMoney(order.taxTotal, lang)}</dd></div>}
                <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>{words.total}</dt><dd>{formatMoney(order.grandTotal, lang)}</dd></div>
            </dl>
            <p className="mt-6 text-sm text-muted">{words.weWillCall}</p>
            <Link href={localPath(lang, "/")} className={`${ui.primary} mt-6`}>{words.backHome}</Link>
        </div>
    );
}
