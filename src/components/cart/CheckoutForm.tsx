"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { checkCoupon, placeOrder, type Order } from "@/app/actions";
import { cart, cartSubtotal, useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { words } from "@/lib/words";

interface Props {
    governorates: string[];
    delivery: { fee: number; freeFrom: number | null; byGovernorate: Record<string, number> };
}

// the API takes any JSON here; its OpenAPI type (JsonNode) comes out as an empty object
const personalizationOf = (text: string) => ({ text }) as unknown as Record<string, never>;

const input = "w-full rounded-control border border-field px-3 py-3 text-base";

/** Guest checkout, cash on delivery. The server prices the order; its totals are shown once placed. */
export function CheckoutForm({ governorates, delivery }: Props) {
    const lines = useCart();
    const [values, setValues] = useState({ customerName: "", customerPhone: "", customerEmail: "", state: "", city: "", streetLine1: "", streetLine2: "", deliveryNotes: "" });
    const [coupon, setCoupon] = useState({ code: "", applied: "", discount: 0, message: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [placed, setPlaced] = useState<Order | null>(null);
    const [pending, startTransition] = useTransition();

    if (placed) {
        return (
            <div className="mx-auto max-w-lg py-10 text-center">
                <p className="text-2xl font-semibold">{words.thanks}</p>
                <p className="mt-4 text-muted">{words.orderNumber}</p>
                <p className="text-xl font-bold">{placed.number}</p>
                <div className="mt-6 space-y-1 rounded-photo border border-line p-5 text-left text-sm">
                    {placed.items.map((item) => (
                        <p key={item.id} className="flex justify-between gap-4">
                            <span>{item.quantity} × {item.productNameSnapshot}{item.variantNameSnapshot !== item.productNameSnapshot ? ` (${item.variantNameSnapshot})` : ""}</span>
                            <span>{formatMoney(item.lineTotal)}</span>
                        </p>
                    ))}
                    {placed.discountTotal > 0 && <p className="flex justify-between text-stock"><span>{words.discount}</span><span>- {formatMoney(placed.discountTotal)}</span></p>}
                    <p className="flex justify-between"><span>{words.delivery}</span><span>{placed.shippingTotal > 0 ? formatMoney(placed.shippingTotal) : words.free}</span></p>
                    {placed.taxTotal > 0 && <p className="flex justify-between"><span>Droit de timbre</span><span>{formatMoney(placed.taxTotal)}</span></p>}
                    <p className="flex justify-between border-t border-line pt-2 text-base font-bold"><span>{words.total}</span><span>{formatMoney(placed.grandTotal)}</span></p>
                </div>
                <p className="mt-6 text-sm text-muted">{words.weWillCall}</p>
                <Link href="/" className="mt-6 inline-block rounded-control bg-ink px-6 py-3 font-semibold text-white">{words.backHome}</Link>
            </div>
        );
    }

    if (lines.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="text-muted">{words.emptyCart}</p>
                <Link href="/" className="mt-6 inline-block rounded-control bg-ink px-6 py-3 font-semibold text-white">{words.seeNew}</Link>
            </div>
        );
    }

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
            const result = await checkCoupon(coupon.code.trim(), subtotal, values.customerPhone);
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
            const result = await placeOrder({
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
            <span className="mb-1 block text-sm font-medium">{label}</span>
            <input name={name} value={values[name]} onChange={set(name)} className={input} aria-invalid={Boolean(errors[name])} {...props} />
            {errors[name] && <span className="mt-1 block text-sm text-sale">{errors[name]}</span>}
        </label>
    );

    return (
        <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]" noValidate>
            <div className="min-w-0 space-y-4">
                <h2 className="text-lg font-semibold">{words.yourDetails}</h2>
                {field("customerName", words.name, { required: true, autoComplete: "name" })}
                {field("customerPhone", words.phone, { required: true, type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "+216 …" })}
                <label className="block">
                    <span className="mb-1 block text-sm font-medium">{words.governorate}</span>
                    <select name="state" value={values.state} onChange={set("state")} required className={`${input} bg-page`} aria-invalid={Boolean(errors.state)}>
                        <option value="">{words.chooseGovernorate}</option>
                        {governorates.map((name) => <option key={name} value={name}>{name}</option>)}
                    </select>
                    {errors.state && <span className="mt-1 block text-sm text-sale">{errors.state}</span>}
                </label>
                {field("city", words.city, { required: true, autoComplete: "address-level2" })}
                {field("streetLine1", words.street, { required: true, autoComplete: "address-line1" })}
                {field("streetLine2", words.street2, { autoComplete: "address-line2" })}
                {field("customerEmail", words.email, { type: "email", autoComplete: "email" })}
                <label className="block">
                    <span className="mb-1 block text-sm font-medium">{words.notes}</span>
                    <textarea name="deliveryNotes" value={values.deliveryNotes} onChange={set("deliveryNotes")} rows={2} className={input} />
                </label>
            </div>

            <aside className="h-fit min-w-0 space-y-3 rounded-photo border border-line p-5 text-sm">
                {lines.map((line) => (
                    <p key={line.kind === "item" ? line.variantId + (line.personalization ?? "") : line.bundleId + line.variantIds.join()} className="flex justify-between gap-4">
                        <span>{line.quantity} × {line.name}{line.kind === "item" && line.variantName ? ` (${line.variantName})` : ""}</span>
                        <span>{formatMoney(line.unitPrice * line.quantity)}</span>
                    </p>
                ))}
                <div className="flex gap-2 border-t border-line pt-3">
                    <input
                        value={coupon.code}
                        onChange={(event) => setCoupon((current) => ({ ...current, code: event.target.value.toUpperCase(), message: "" }))}
                        placeholder={words.promoCode}
                        aria-label={words.promoCode}
                        className="min-w-0 flex-1 rounded-control border border-field px-3 py-2 text-base"
                    />
                    <button type="button" onClick={applyCoupon} disabled={!coupon.code.trim() || pending} className="rounded-control border border-ink px-3 font-medium disabled:opacity-50">
                        {words.apply}
                    </button>
                </div>
                {coupon.message && <p className="text-sale">{coupon.message}</p>}
                <p className="flex justify-between"><span>{words.subtotal}</span><span>{formatMoney(subtotal)}</span></p>
                {coupon.applied && <p className="flex justify-between text-stock"><span>{words.discount} ({coupon.applied})</span><span>- {formatMoney(coupon.discount)}</span></p>}
                <p className="flex justify-between"><span>{words.delivery}</span><span>{fee > 0 ? formatMoney(fee) : words.free}</span></p>
                <p className="flex justify-between border-t border-line pt-3 text-base font-bold"><span>{words.total}</span><span>{formatMoney(afterDiscount + fee)}</span></p>
                <p className="text-xs text-muted">{words.estimate} {words.payOnDelivery}.</p>
                {message && <p role="alert" className="rounded-control bg-sale-soft p-3 text-sale">{message}</p>}
                <button type="submit" disabled={pending} className="h-12 w-full rounded-control bg-ink font-semibold text-white disabled:opacity-60">
                    {pending ? words.placing : words.placeOrder}
                </button>
            </aside>
        </form>
    );
}
