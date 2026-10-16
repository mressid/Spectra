# Design tokens

The single list of the storefront's colours, fonts, radii and shared classes. The source of truth is
`src/app/globals.css` (`@theme`, plus the dark overrides) and `src/components/ui.ts`; this file mirrors
them. Change a value there, then here. Rules of use are in [DESIGN.md](DESIGN.md).

Use the Tailwind names (`bg-ink`, `text-muted`, `rounded-photo`), never raw hex values in components.

## Colours

| Token | Light | Dark | Use |
|---|---|---|---|
| `ink` | `#1b2150` | `#f1f3f5` | Text, primary button, chosen option (a deep navy) |
| `on-ink` | `#ffffff` | `#111418` | Text on an `ink` background |
| `muted` | `#5f6673` | `#a3aab4` | Secondary text, captions |
| `faint` | `#9aa1ab` | `#6d7480` | Old price (crossed out), unavailable option, placeholders |
| `line` | `#e6e8ec` | `#262b33` | Borders, dividers |
| `field` | `#d2d6dc` | `#3a414c` | Input and option-box borders |
| `surface` | `#f4f5f7` | `#1a1e24` | Photo tiles, image placeholders, quiet blocks |
| `raised` | `#ffffff` | `#15191e` | Cards, drawers, the header |
| `page` | `#ffffff` | `#0e1114` | Page background |
| `stock` | `#15805a` | `#3ccf91` | "In stock", links, focus ring (the store accent) |
| `stock-soft` | `#e7f4ee` | `#11291f` | Accent background |
| `order` | `#b45309` | `#f2a23c` | "Made to order · ready in 48h" |
| `sale` | `#b91c1c` | `#ff8a80` | Discount badge text, form errors |
| `sale-soft` | `#fdecec` | `#3a1616` | Discount badge background |

Colour carries meaning: green = available, amber = made to order, red = discount or error. Never use
them as decoration. The dark theme follows the phone's setting until the visitor uses the theme toggle
(`data-theme` on `<html>`, set before first paint).

## Fonts

| Token | Class | Face | Use |
|---|---|---|---|
| `--font-heading` | `font-heading` | Fraunces (serif), weights 400 / 500 / 600 | Page and section titles (`h1`, `h2`) |
| `--font-display` | `font-display` | Fira Sans | Prices, buttons, the shop name |
| `--font-sans` | `font-sans` | Fira Sans | Everything else |

Loaded in `src/app/[lang]/layout.tsx` with `next/font` (self-hosted, `display: swap`). Titles use
`font-medium` and `tracking-tight`; buttons are 13 px, uppercase, `tracking-[0.08em]`.

## Radii

| Token | Value | Use |
|---|---|---|
| `rounded-photo` | 18 px | Product photos, cards |
| `rounded-control` | 5 px | Buttons, inputs, option boxes |
| `rounded-chip` | 4 px | Badges |

## Layout

| Value | Use |
|---|---|
| `max-w-[1400px]` | Page container: header, main, footer, hero text column |
| `px-4` (`sm:px-6`) | Side gutter |
| 44 px | Minimum touch target (`h-11`) |

The home hero (carousel) is edge to edge: `w-screen` with `ml-[calc(50%-50vw)]`, and the body has
`overflow-x: clip` so the scrollbar never causes a horizontal scroll.

## Shared classes (`src/components/ui.ts`)

| Class | Use |
|---|---|
| `ui.primary` | Main button: `ink` background, 48 px high |
| `ui.secondary` | Outlined button: `ink` border, fills on hover |
| `ui.outline` | Small outlined button ("See all") |
| `ui.quiet` | Text-only button |
| `ui.icon` | 44 px square icon button |
| `ui.input` | Text field, select, textarea |
| `ui.label` | Label above a field |
| `ui.card` | Bordered card |
| `ui.title` | Section and page title (`font-heading`) |

## Changing the look for a shop (admin > Appearance)

The shop owner sets these in the admin (store settings `theme`, JSON in `store_settings.theme`); every
field is optional and an empty one keeps the default above. `src/lib/theme.ts` turns the values into CSS
variables that the layout puts in a `<style>` in the page head, after the defaults of `globals.css`.

| Setting | Variable(s) it sets | Default |
|---|---|---|
| `primaryColor` / `primaryColorDark` | `--color-ink`, and `--color-on-ink` (white or near-black, chosen for contrast) | `#1b2150` / `#f1f3f5` |
| `accentColor` / `accentColorDark` | `--color-stock`, and `--color-stock-soft` (the accent mixed into the page colour) | `#15805a` / `#3ccf91` |
| `backgroundColor` / `backgroundColorDark` | `--color-page`, `--color-raised` | `#ffffff` / `#0e1114` |
| `surfaceColor` / `surfaceColorDark` | `--color-surface` | `#f4f5f7` / `#1a1e24` |
| `headingFont` | `SERIF` keeps Fraunces; `SANS` sets `--font-heading` to the body font | `SERIF` |
| `corners` | `SHARP` 2 / 2 / 2 px, `SOFT` 18 / 5 / 4 px, `ROUND` 28 / 999 / 999 px (photo / control / chip) | `SOFT` |
| `logoUrl` / `logoDarkUrl` | the header shows the logo (wide, 4:1, at least 400 × 100 px) instead of the shop name; the dark logo replaces it in the dark theme | the shop name |
| `headerLogo` | what the header shows: `WIDE` (the logo), `SQUARE` (the icon) or `NAME` (the shop name in text); empty = the wide logo if there is one, else the name; a choice whose picture is missing shows the name | automatic |
| `navbarLayout` | where the header puts its parts: `LOGO_CENTER` (links, logo, search and cart), `LOGO_LEFT` (logo and links, then search and cart), `LOGO_LEFT_MENU_CENTER` (logo, links centred, search and cart), `LOGO_RIGHT` (search and cart, links, logo). Phones always have the menu button first and the logo | `LOGO_CENTER` |
| `navShowSearch`, `navShowMenu`, `navShowExplore`, `navSticky` | the search button, the category links on computers, the Explore panel (a header link opening the categories with a few products each), and whether the header stays at the top while scrolling | all on |
| `iconUrl` | the browser-tab icon (favicon) and home-screen icon, always this one whatever the header shows (exactly square, 1:1, at least 512 × 512 px; the admin refuses an upload of another shape); `src/lib/icons.ts` has the image optimizer make the 32, 128 and 256 px versions, written into the cached page, so a new icon shows without a rebuild | `app/favicon.ico` |

Colours are `#rrggbb`; anything else is ignored. The dark theme's brand colour has to be light, because
`ink` is also the text colour there. The admin page has three tabs (Brand: logo, icon, title font and corners; Light theme; Dark theme), previews both themes and warns when the brand colour
does not read on the page (contrast under 4.5). Changing the theme refreshes every page (the `settings` tag).

The shop name (store settings `shopName`, set under Appearance > Brand) is the text next to or instead of the logo, the footer title, the page-title suffix and the invoice header. Only when it is empty does the website use a generic word ("Boutique" / "Shop").

To change the defaults of every shop, edit `src/app/globals.css` and this file.
