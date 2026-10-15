# Storefront design system

A template for small shops (any kind of product: fashion, beauty, home, electronics…), Tunisia first.
Most customers arrive from an Instagram or WhatsApp link on a phone, browse a few products and order with
**cash on delivery**, without an account. Nothing in the design may assume one product type: no fixed
"size" or "colour" wording (option names come from the admin), no category-specific icons or examples.
The design has one job: make the product look good and make ordering feel safe and easy.

The look continues the store preview already in the admin
(`../accessories-store-system/admin/src/components/ProductPreview.tsx`, the backend and admin repo); open it next to this file.

## 1. Principles

1. **The photos are the design.** White page, black text, square photos large and sharp. No decoration
   competes with the products: no gradients, no shadows, no coloured backgrounds behind products.
2. **Phone first.** Design at 390 px wide, then widen. Thumb-reachable main buttons, 44 px touch targets.
3. **Trust at every step.** Cash on delivery, delivery fee and delay are visible before the cart, not discovered at checkout.
4. **French first**, short words. A Tunisian shopper should understand every label at a glance.
5. **Fast is a feature.** Every page must load fast on a mid-range Android over 4G (docs/RENDERING.md).

## 2. Tokens

Defined once in `src/app/globals.css` (`@theme`). Use the Tailwind names, never raw hex.

| Token | Value | Use |
|---|---|---|
| `ink` | `#111827` | Text, the primary button, a chosen option |
| `muted` | `#6B7280` | Secondary text, captions |
| `faint` | `#9CA3AF` | Old price (crossed out), unavailable option |
| `line` | `#E5E7EB` | Borders, dividers |
| `field` | `#D1D5DB` | Input and option-box borders |
| `surface` | `#F3F4F6` | Image placeholder, quiet blocks |
| `page` | `#FFFFFF` | Background |
| `stock` | `#15805A` | "En stock" and the store accent (links, focus ring) |
| `order` | `#B45309` | "Sur commande · prêt en 48h" |
| `sale` / `sale-soft` | `#B91C1C` / `#FEE2E2` | Discount badge (text / background), form errors |

Also `on-ink` (text on an ink background), `raised` (cards, drawers, header) and `stock-soft` (accent
background). Radii: `rounded-photo` 12 px (photos, cards), `rounded-control` 10 px (buttons, inputs,
option boxes), `rounded-chip` 6 px.

**Dark theme.** Every token has a dark value (`src/app/globals.css`). The site follows the phone's setting
until the visitor uses the theme toggle; the choice is stored in `localStorage` and applied before the
first paint by a small script in the layout. Write colours only through tokens, never `text-white` or
hex values, so both themes stay right. Exceptions on purpose: text over photos (carousel, category
tiles) is white, and brand logos sit on a white tile.

**Icons.** [lucide-react](https://lucide.dev) only, outline style, `strokeWidth` 1.8, 16–22 px, always
`aria-hidden` next to a visible word or with an `aria-label` on the button. **No emoji and no symbol
characters** (no ●, ★, ✓, 🚚) anywhere in the interface. Social networks are named in words (lucide has no
brand logos).

**Shared classes.** Buttons and fields use `ui.primary`, `ui.secondary`, `ui.quiet`, `ui.input`,
`ui.label`, `ui.card` from `src/components/ui.ts`.

Colour carries meaning: green = available, amber = made to order, red = discount or error. Never use them as decoration.

## 3. Typography

Two faces from `next/font` (self-hosted, `display: swap`): **Fira Sans Condensed** for titles, prices
and buttons (`font-display`), **Fira Sans** for everything else (`font-sans`). The shop name is set in
the condensed face, uppercase, widely tracked. The look is a printed catalogue: square corners, grey
photo tiles, centred names and prices under each photo, black buttons. Sizes:

| Use | Class |
|---|---|
| Product name on its page | `text-2xl lg:text-3xl font-semibold leading-tight` |
| Section title | `text-xl font-semibold` |
| Price on product page | `text-2xl font-bold` |
| Body | `text-base` (16 px minimum on inputs: smaller makes iPhones zoom) |
| Card name, captions | `text-sm`, `text-xs text-muted` |

Sentence case everywhere. No uppercase headings, no letter spacing.

## 4. Layout

- Content width `max-w-6xl mx-auto px-4`. Product grids: 2 columns on phones, 3 on tablets, 4 on desktop, `gap-4`.
- **Header**: top banner messages (from `/storefront/home`, rotating if several, `bg-ink text-white text-sm`),
  then logo/shop name, search icon, cart icon with count. Category menu: drawer on phones, a row on desktop.
- **Footer**: from `footer` in `/storefront/home`: about text, contact (phone, WhatsApp link, email),
  social links, link columns, bottom text.
- **Product page**: gallery left and details right on desktop (`1.1fr 1fr`), stacked on phones. On phones the
  order button sticks to the bottom of the screen once the in-page one scrolls away.

## 5. Components

| Component | Rules |
|---|---|
| **Product card** | Square photo (`aspect-square rounded-photo bg-surface`, `object-cover`), name `text-sm` one line, price (bold) with old price crossed out in `faint`, "Épuisé" in `muted` when sold out, small amber "Sur commande" when made to order. Whole card is one link. |
| **Price** | `formatMoney()` always: `35,500 DT`. "à partir de" when variants differ in price. Discount badge `-20%` in `sale` on `sale-soft`, `rounded-chip`. |
| **Availability line** | `● En stock` (green), `⏳ Sur commande · prêt en 48h` (amber), `Épuisé` (muted). |
| **Primary button** | `bg-ink text-white rounded-control py-3 font-semibold w-full` on phones. One per screen: "Commander · paiement à la livraison". Disabled state `bg-surface text-muted`. |
| **Secondary button** | `border border-ink rounded-control` (e.g. "Ajouter au panier" if both exist). |
| **Option picker** | One row per option, named in the admin (Taille, Couleur, Capacité…): outlined boxes `border-field rounded-control px-3 py-2`; chosen = `bg-ink text-white border-ink`; impossible combination = `text-faint line-through`. Until every option is chosen, the order button names what is missing ("Choisissez taille et couleur"), from the option names. |
| **Gallery** | Main photo square, thumbnails square in a row (scrollable on phones); swipe on phones. Variant photos replace the gallery when a variant is chosen. |
| **Delivery line** | Under the button: "🚚 Livraison 7,000 DT · gratuite dès 150,000 DT · paiement à la livraison" from store settings. |
| **Inputs** | Label above, `border-field rounded-control px-3 py-3 text-base`, focus ring `stock`. Error text under the field in `sale`. Phone input with `inputMode="tel"`. Governorate is a select of the 24 governorates. |
| **Empty and error states** | One sentence and one action ("Votre panier est vide · Voir les nouveautés"). |

## 6. Images

| Image | Shape | Notes |
|---|---|---|
| Product, variant, gallery | 1:1 | `sizes="(min-width:1024px) 25vw, 50vw"` in grids; first two of a page `priority` |
| Category tile | 4:3 | |
| Brand logo | 1:1, contained | `object-contain` on white |
| Carousel slide | 5:2 desktop, 4:5 phone (`mobileImageUrl`, else crop the centre) | `<picture>`-like switch with two `next/image` or `getImageProps` |
| Long-description image | 16:9 | |

Always `next/image` with real `alt` text (product name, or `altText` for slides). Never a raw `<img>`.

## 7. Words (French first)

| Concept | French | English |
|---|---|---|
| Order button | Commander · paiement à la livraison | Order · cash on delivery |
| In stock / made to order / sold out | En stock / Sur commande · prêt en %{time} / Épuisé | In stock / Made to order · ready in %{time} / Sold out |
| From (price) | à partir de | from |
| Cart | Panier | Cart |
| Free delivery from | Livraison gratuite dès | Free delivery from |
| Order statuses | Nouvelle, Confirmée, Chez le livreur, Livrée, Refusée, Annulée | New, Confirmed, With the courier, Delivered, Refused, Cancelled |

All of the website's own words live in `src/lib/words.ts`, French and English with the same keys
(`getWords(lang)`). Product, category and section texts come from the admin as written.
| Promo code | Code promo | Promo code |
| Governorate | Gouvernorat | Governorate |

Money `35,500 DT`, lead time `48h` (≤ 3 days) or `5 jours` (`formatLeadTime()`).

## 8. Accessibility

Visible focus ring (`outline-2 outline-stock`), every icon button has an `aria-label`, contrast at least
4.5:1 (all text tokens pass on white), forms usable with the keyboard, `lang` on `<html>`, respect
`prefers-reduced-motion` for the carousel (no autoplay).

## 9. Checklist for a new page

1. Server component; data from `src/lib/api/catalog.ts` (cached and tagged), never `fetch` in a page.
2. `generateMetadata`: title, description, canonical, Open Graph image (docs/RENDERING.md, SEO).
3. Looks right at 390 px first, then 1280 px.
4. Tokens only, one primary button, `next/image` with `alt`, French words from section 7.
5. `npm run typecheck && npm run lint && npm run build` pass.
