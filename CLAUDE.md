# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Swadhu Nadan Acharukal is a static HTML website for a home-based Kerala pickle (achar) business based in Thodupuzha, Idukki. The site is hosted at `swadhunadanacharukal.com` and deployed via GitHub Pages (see `CNAME`). There is no build step, no framework, and no package manager — everything is plain HTML, CSS, and vanilla JavaScript.

## Development

Since this is a zero-build static site, "running" it means opening HTML files in a browser or serving them locally:

```bash
# Serve locally (Python, available on most machines)
python3 -m http.server 8080

# Or with Node
npx serve .
```

There are no tests, linters, or CI configurations in the repository.

## Architecture

### Page structure

Each HTML page is self-contained and shares the same header/footer markup duplicated across files. There is no templating engine. Pages:

- `index.html` — Homepage with hero, SEO intro, testimonials, image slider, and a product grid (pre-rendered in HTML; shows the 5 flagship pickles)
- `products.html` — Full product listing page with a product grid (pre-rendered in HTML; all products)
- `price-list.html` — Complete price table for all products and sizes, with a downloadable PDF (`assets/price-list.pdf`)
- `about.html`, `faq.html` — Static informational pages
- `mango-pickle-kerala.html`, `lemon-pickle-kerala.html`, `fish-pickle-kerala.html`, `beef-pickle-kerala.html`, `gooseberry-pickle-kerala.html` — Individual product detail pages (one per SKU), each with WhatsApp order buttons wired up to `main.js`

### JavaScript

**`js/sku-data.js`** — Single source of truth for all products. Exposes `window.SKU_INVENTORY` with an `items` array. Each item has: `sku`, `productName`, `displayPhoto`, `weightCategories`, `availableQuantities`, and a `prices` object keyed by weight string (e.g. `"250g"`). **All pricing and product changes start here.**

**`js/main.js`** — Loaded after `sku-data.js`. Handles:
- Mobile nav toggle (hamburger menu with keyboard/click-outside support)
- `renderProductCardsFromInventory(gridSelector, maxItems)` — reads `window.SKU_INVENTORY` and writes product card HTML into the DOM. Called on `index.html` (with `#product-grid-home`) and `products.html` (with `#product-grid`).
- WhatsApp order flow: `attachWhatsAppButtonListeners()` reads size/quantity selects from each card, computes a total cost via `getSelectedProductUnitPrice()`, generates a unique order ID (`SWA-YYYYMMDD-HHMMSS-XX`), and opens a pre-filled `wa.me` URL.
- Google Analytics 4 event tracking: `cta_click`, `scroll_depth`, `view_item` (via IntersectionObserver on product cards).
- Image slider on the homepage (auto-advance, touch/pointer swipe, keyboard arrows, `prefers-reduced-motion` aware).

The `productDetailPages` map in `main.js` links `productName` strings to their detail page filenames — keep this in sync when adding new products.

### CSS

Two CSS files exist — `assets/css/style.css` (used by all pages) and `css/styles.css` (appears to be an older/unused copy). The active stylesheet is `assets/css/style.css`. It uses CSS custom properties defined in `:root` for the full design system (colors, typography, spacing, radius, shadows).

### SEO & Structured Data

Each page includes full `<meta>` tags (Open Graph, Twitter Card), a `<link rel="canonical">`, and one or more `application/ld+json` structured data blocks (Schema.org types vary by page: `FoodEstablishment`, `LocalBusiness`, `WebSite`, `ItemList`, `Product`). The `sitemap.xml` and `robots.txt` are manually maintained.

## Adding a New Product

1. Add an entry to `window.SKU_INVENTORY.items` in `js/sku-data.js`
2. Add the product image to `assets/img/` (a `.jpeg` plus `.webp` and `-480.webp` variants)
3. Add a matching card to the **pre-rendered** grid in `products.html` (`#product-grid` has `data-prerendered="true"`, so the JS renderer is only a fallback — the static HTML is what users see). The homepage grid (`#product-grid-home`) intentionally shows only the 5 flagship pickles.
4. Add a row to the table in `price-list.html`
5. Optionally create a detail page (copy an existing `*-pickle-kerala.html` as a template) and add it to `productDetailPages` in `js/main.js`; products without a detail page simply get no "Know More" link
6. Add a `<url>` entry to `sitemap.xml` (if a new page was created)
7. Update structured data on `products.html` (`ItemList` schema) and the FAQ price answer in `faq.html`, plus `llms.txt`

When prices change: update `js/sku-data.js`, the pre-rendered cards in `index.html`/`products.html`, the detail pages (visible text, size selects, `Product` offers and `FAQPage` JSON-LD), `price-list.html`, `faq.html`, `llms.txt`, and the `priceRange` field in every page's business JSON-LD.
