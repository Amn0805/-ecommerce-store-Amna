# ShopWave — E-Commerce Product Store

 A fully functional, zero-dependency e-commerce store built with pure HTML, CSS, and vanilla JavaScript. No frameworks. No libraries. No shortcuts.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Live Demo](#live-demo)
3. [Tech Stack](#tech-stack)
4. [File Structure](#file-structure)
5. [How to Run Locally](#how-to-run-locally)

7. [Feature Breakdown & How Each One Works](#feature-breakdown--how-each-one-works)
   - [Data Fetching & API](#1-data-fetching--api)
   - [Skeleton Loading Screen](#2-skeleton-loading-screen)
   - [Error State & Retry](#3-error-state--retry)
   - [Product Grid](#4-product-grid)
   - [Product Cards](#5-product-cards)
   - [Search](#6-search)
   - [Category Filters](#7-category-filters)
   - [Sort](#8-sort)
   - [Simultaneous Filter + Search + Sort](#9-simultaneous-filter--search--sort)
   - [Clear All Filters](#10-clear-all-filters)
   - [Empty State](#11-empty-state)
   - [Product Count](#12-product-count)
   - [Product Detail Modal](#13-product-detail-modal)
   - [Shopping Cart Drawer](#14-shopping-cart-drawer)
   - [Cart Quantity Controls](#15-cart-quantity-controls)
   - [Cart Subtotal](#16-cart-subtotal)
   - [Checkout & Order Confirmation](#17-checkout--order-confirmation)
   - [LocalStorage Persistence](#18-localstorage-persistence)
   - [Dark / Light Mode](#19-dark--light-mode)
   - [Responsive Design](#20-responsive-design)
   - [Hamburger Menu](#21-hamburger-menu)
   - [Wishlist (Bonus)](#22-wishlist-bonus)
   - [Load More / Pagination (Bonus)](#23-load-more--pagination-bonus)
   - [Product Comparison (Bonus)](#24-product-comparison-bonus)
   - [Debounced Search (Bonus)](#25-debounced-search-bonus)
   - [Animations (Bonus)](#26-animations-bonus)
8. [JavaScript Architecture](#javascript-architecture)
9. [CSS Architecture](#css-architecture)
10. [LocalStorage Keys Reference](#localstorage-keys-reference)
11. [API Reference](#api-reference)
12. [Code Quality Standards](#code-quality-standards)
13. [Known Edge Cases Handled](#known-edge-cases-handled)
14. [Screenshots](#screenshots)
15. [Video Walkthrough](#video-walkthrough)
16. [What I Learned](#what-i-learned)

---

## Project Overview

ShopWave is a multi-page-style single-page e-commerce store that fetches 20 real products from the [Fake Store API](https://fakestoreapi.com/products) and gives users a complete shopping experience — browsing, filtering, searching, sorting, wishlisting, comparing, and checking out — all without a single framework or library touching the JavaScript.

The project was built as a monthly performance evaluation for the MERN Stack + AI Engineering Bootcamp, covering: semantic HTML, responsive CSS, DOM manipulation, `fetch` / `async-await`, array methods, closures, `localStorage`, and event handling.

---

## Live Demo

> 🔗 [Add your GitHub Pages / Netlify / Vercel link here]

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic elements: `<header>`, `<section>`, `<article>`, `<aside>`, `<nav>`) |
| Styling | CSS3 (custom properties, grid, flexbox, keyframe animations, media queries) |
| Logic | Vanilla JavaScript ES6+ (arrow functions, destructuring, `async/await`, template literals, `Set`, closures, array methods) |
| Data | [Fake Store API](https://fakestoreapi.com/products) — free, no key required |
| Fonts | Google Fonts — [Syne](https://fonts.google.com/specimen/Syne) (display/headings), [Inter](https://fonts.google.com/specimen/Inter) (body) |
| Icons | [Font Awesome 6.5](https://fontawesome.com/) via CDN |
| Storage | Browser `localStorage` — cart persistence, wishlist persistence, theme preference |

---

## File Structure

```
ecommerce-store/
│
├── index.html              ← Single HTML file; all markup, no inline JS, no inline CSS
│
├── css/
│   ├── style.css           ← Main styles: layout, components, animations, responsive breakpoints
│   ├── dark-mode.css       ← Dark mode CSS variable overrides, applied via body.dark class
│   └── skeleton.css        ← Skeleton loading card shimmer animation styles
│
├── js/
│   ├── api.js              ← fetchProducts() and extractCategories() — all network logic isolated here
│   ├── ui.js               ← Modal open/close, cart drawer, dark mode toggle, star builder, keyboard handler
│   ├── filters.js          ← Search state, category state, sort state, debounce, applyFilters(), renderCategoryButtons()
│   ├── cart.js             ← Cart array, add/remove/increase/decrease, subtotal, localStorage save/load, checkout
│   ├── products.js         ← Product card builder, modal builder, wishlist, compare list, skeleton, pagination
│   └── app.js              ← Entry point: initialises everything, coordinates all modules, binds global events
│
└── README.md
```

### Why this separation matters

Each file has **one job**. `api.js` never touches the DOM. `cart.js` never calls `fetch`. `ui.js` never knows about products. `app.js` is the only file that calls across modules — it imports nothing (scripts share the global scope via sequential `<script>` tags), but architecturally it acts as the controller that wires everything together.

---

## How to Run Locally

No build tools. No npm install. No bundler. Just a browser and a local server.

**Option 1 — Node.js:**
```bash
npx serve .
# Open the URL it prints
```

**Option 2 — VS Code:**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, right-click `index.html`, click **Open with Live Server**.

> ⚠️ Do not open `index.html` directly with `file://` — the Fake Store API request may be blocked by CORS in some browsers without a proper HTTP origin. Always use a local server.

---

## How to Deploy

**GitHub Pages (free):**
1. Push the repo to GitHub (make sure it is **public**)
2. Go to **Settings → Pages → Source → Deploy from branch → main → / (root)**
3. GitHub builds and gives you a URL like `https://your-username.github.io/ecommerce-store-your-name`

---

## Feature Breakdown & How Each One Works

### 1. Data Fetching & API

**File:** `api.js`, called from `app.js`

```
https://fakestoreapi.com/products
```

`fetchProducts()` is an `async` arrow function. It calls `fetch()` on the API URL and `await`s the response. If `response.ok` is false (e.g. 404, 500), it throws a custom `Error` with the HTTP status. If the network is down entirely, `fetch` itself throws, which is also caught. On success it calls `response.json()` and returns the parsed array of 20 product objects.

Each product object from the API has this shape:
```json
{
  "id": 1,
  "title": "Fjallraven - Foldsack No. 1 Backpack",
  "price": 109.95,
  "description": "Your perfect pack for everyday use...",
  "category": "men's clothing",
  "image": "https://fakestoreapi.com/img/...",
  "rating": { "rate": 3.9, "count": 120 }
}
```

`extractCategories()` receives the products array and uses `new Set(products.map(p => p.category))` to get unique categories, then spreads it back into an array. This is why category buttons are always accurate — they come directly from the data.

---

### 2. Skeleton Loading Screen

**Files:** `products.js` (`showSkeletons()`), `css/skeleton.css`

Before the API call completes, `showSkeletons(6)` is called. It inserts 6 `skeleton-card` divs into the `#productGrid` using `Array.from({ length: 6 }).map(...)`. Each skeleton card has the exact same layout structure as a real product card (image area, badge placeholder, two title lines, rating line, price + button row) so the layout doesn't shift when real cards load in.

The shimmer animation in `skeleton.css` uses a `linear-gradient` sweeping from left to right using `background-position` animation:
```css
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
```
The gradient is set to be wider than the element (`background-size: 600px 100%`), so animating `background-position` creates the sweeping light effect without JavaScript.

---

### 3. Error State & Retry

**File:** `products.js` (`showErrorState()`), `app.js`

The `init()` function wraps the `fetchProducts()` call in a `try/catch`. If any error is thrown — network failure, bad HTTP status, malformed JSON — the `catch` block calls `showErrorState()`, which hides the grid, hides the empty state, and shows `#errorState` (a styled div with a warning icon, message, and "Try Again" button).

The retry button's event listener is bound in `app.js`:
```js
document.getElementById('retryBtn').addEventListener('click', () => {
  document.getElementById('errorState').style.display = 'none';
  init();
});
```
Clicking it hides the error state and runs `init()` again from scratch — skeleton loads, API is called again, and either products render or the error state returns.

---

### 4. Product Grid

**Files:** `products.js`, `css/style.css`

The grid is a CSS Grid container:
```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```
Responsive breakpoints in `style.css` change it to 2 columns at `≤1024px` and 1 column at `≤480px`. The JavaScript only injects `<article>` elements — the grid layout is entirely CSS-driven.

---

### 5. Product Cards

**File:** `products.js` (`buildProductCardHtml()`)

Each card is built as a template literal string and injected via `grid.innerHTML`. The card uses semantic HTML (`<article>`) and contains:

- **Image** — loaded lazily (`loading="lazy"`). If the image URL fails, an `onerror` inline handler swaps it for an inline base64-encoded SVG placeholder. This avoids broken image icons.
- **Category badge** — plain text from `product.category`, styled as a pill
- **Title** — CSS `line-clamp` truncates to 2 lines:
  ```css
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  ```
- **Star rating** — built by `buildStarsHtml(rating.rate)` in `ui.js`. The rating is rounded to the nearest 0.5, then a `for` loop from 1 to 5 decides whether each position gets a full star (`fa-star`), half star (`fa-star-half-stroke`), or empty star (`fa-regular fa-star`).
- **Price** — formatted with `.toFixed(2)` for consistent decimal places
- **Add to Cart button** — has `e.stopPropagation()` so clicking it does not also open the modal
- **Heart (wishlist) button** — top-right corner, toggles filled/outline icon
- **Compare checkbox button** — top-left corner, small icon button

---

### 6. Search

**File:** `filters.js` (`bindSearchInput()`)

The search input fires a debounced handler on every `input` event (not `keyup` — `input` catches paste, autofill, and voice input too). The handler trims the value, stores it in the module-level `searchQuery` variable, shows/hides the ✕ clear button, then calls `onFilterChange()`.

The filter itself is case-insensitive:
```js
product.title.toLowerCase().includes(searchQuery.toLowerCase())
```

The ✕ button inside the search field clears `input.value`, resets `searchQuery` to `''`, hides itself, and calls `onFilterChange()`.

---

### 7. Category Filters

**File:** `filters.js` (`renderCategoryButtons()`, `buildCatButton()`)

Category buttons are generated entirely from API data — no category name is hardcoded in the HTML or JavaScript. After products are fetched, `extractCategories()` produces an array of unique strings (e.g. `["men's clothing", "jewelery", "electronics", "women's clothing"]`).

`renderCategoryButtons()` builds an "All" button first, then maps each category to a `<button class="cat-btn">` element using `buildCatButton()`. It sets `data-category` on each button, injects the HTML into `#categoryFilters`, then rebinds click events.

When a category button is clicked, `activeCategory` is updated, all buttons get their `active` class toggled via `.classList.toggle('active', condition)`, and `onFilterChange()` runs.

---

### 8. Sort

**File:** `filters.js` (`bindSortSelect()`, `sortProducts()`)

The `<select>` element fires a `change` event. The handler stores the value in `sortOrder` and calls `onFilterChange()`.

`sortProducts()` uses a strategy object (a plain object acting as a lookup table) instead of a chain of `if/else`:
```js
const sorters = {
  'price-asc':   (a, b) => a.price - b.price,
  'price-desc':  (a, b) => b.price - a.price,
  'rating-desc': (a, b) => b.rating.rate - a.rating.rate,
  'name-asc':    (a, b) => a.title.localeCompare(b.title),
};
```
It spreads the products into a copy first (`[...products]`) so the original `allProducts` array is never mutated.

---

### 9. Simultaneous Filter + Search + Sort

**File:** `filters.js` (`applyFilters()`)

This is the most important function in the project. Every time anything changes, `onFilterChange()` in `app.js` calls:
```js
filteredProducts = applyFilters(allProducts);
```

`applyFilters()` always reads from `allProducts` (the raw API data, never changed), and applies all three active state variables in one pass:

```js
const applyFilters = (products) => {
  let result = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch   = searchQuery === '' || product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  result = sortProducts(result, sortOrder);
  return result;
};
```

Because all three (search, category, sort) are stored as module-level variables and `applyFilters` reads all three every time it runs, they always work together. Changing the sort doesn't reset the search. Clicking a category doesn't clear the sort.

---

### 10. Clear All Filters

**File:** `filters.js` (`clearAllFilters()`)

Resets all three state variables to their defaults:
```js
activeCategory = 'all';
searchQuery    = '';
sortOrder      = 'default';
```
Then resets all the corresponding DOM elements (clears the input value, resets the select, hides the clear button), and calls `renderCategoryButtons()` to re-render the buttons with "All" active.

It is triggered from three places in `app.js`: the "Clear All Filters" button in the results bar, the "Reset Filters" button inside the empty state, and the `clearAllFilters` utility itself (which `onFilterChange` then calls).

---

### 11. Empty State

**File:** `products.js` (`renderProducts()`)

Inside `renderProducts()`, after filtering, if `filteredProducts.length === 0`, the grid is cleared, `#emptyState` is shown, and `#loadMoreWrap` is hidden. The empty state div has a magnifying glass icon, a "No products found" message, and a "Reset Filters" button that calls `clearAllFilters()`.

---

### 12. Product Count

**File:** `filters.js` (`updateProductCount()`)

```js
const updateProductCount = (count) => {
  el.textContent = `Showing ${count} product${count !== 1 ? 's' : ''}`;
};
```

This is called inside `renderProducts()` every time the grid is re-rendered. It shows the count of the *filtered* result, not the raw total — so "Showing 3 products" when you have filtered down, and "Showing 20 products" when no filters are active. The singular/plural logic handles the "1 product" edge case.

---

### 13. Product Detail Modal

**File:** `products.js` (`openModal()`), `ui.js` (`openProductModal()`, `closeProductModal()`)

Clicking anywhere on a product card (except a button) calls `openModal(product)`. The modal body HTML is built fresh each time using a template literal — it is injected into `#modalBody` using `.innerHTML`. This means every modal open starts with quantity = 1 and fresh event listeners.

The modal shows:
- Full-size product image (with SVG fallback on error)
- Full untruncated title
- Complete description text
- Category badge
- Star rating + review count (e.g. "3.9 stars · 120 reviews")
- Price
- Quantity selector (+/− buttons with a display span)
- "Add to Cart" button

**Quantity selector logic:**
```js
document.getElementById('modalQtyMinus').addEventListener('click', () => {
  if (modalQty > 1) {      // hard floor at 1, cannot go below
    modalQty -= 1;
    document.getElementById('modalQtyDisplay').textContent = modalQty;
  }
});
```
When "Add to Cart" is clicked, `addToCart(product, modalQty)` is called with the chosen quantity, then the modal closes.

**Three ways to close the modal** — all handled in `ui.js`:
1. Click the ✕ button → `closeProductModal()`
2. Click the dark overlay behind the modal → `e.target === e.currentTarget` check fires `closeProductModal()`
3. Press `Escape` → `handleGlobalKeydown` checks which modal is open and closes it

`openProductModal()` adds `.open` to `#productModal` (which transitions `opacity` from 0 to 1 and translates the box from `translateY(24px)` to `translateY(0)`), and sets `document.body.style.overflow = 'hidden'` to prevent background scrolling.

---

### 14. Shopping Cart Drawer

**Files:** `cart.js`, `ui.js`

The cart is a `<aside>` element positioned `fixed` to the right edge of the screen, translated off-screen by default (`transform: translateX(100%)`). Opening it adds the `.open` class which transitions it to `translateX(0)`. A separate `#cartOverlay` div covers the rest of the screen with a semi-transparent background.

**Opening:** clicking the bag icon in the header  
**Closing:** clicking the ✕ in the drawer header, clicking the overlay, clicking "Continue Shopping" in the empty state, or pressing Escape

The cart drawer renders inside `renderCart()` which is called after every state change (add, remove, increase, decrease). It rebuilds the entire cart HTML from the `cart` array on every render.

---

### 15. Cart Quantity Controls

**File:** `cart.js`

Inside each cart item are three buttons:
- **− button** → `decreaseQty(id)` — decreases quantity, **minimum is 1**, will not delete the item
- **+ button** → `increaseQty(id)` — increases quantity with no upper limit
- **✕ button** → `removeFromCart(id)` — removes the item entirely from the cart array regardless of quantity

All three use `data-action` and `data-id` attributes. A single delegated event listener on `#cartItems` reads these attributes:
```js
itemsContainer.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    if (action === 'increase') increaseQty(id);
    else if (action === 'decrease') decreaseQty(id);
    else if (action === 'remove') removeFromCart(id);
  });
});
```
After every operation, `saveCart(cart)` persists the new state to `localStorage`, `renderCart()` re-renders the drawer, and `updateCartBadge()` updates the header count.

---

### 16. Cart Subtotal

**File:** `cart.js` (`getSubtotal()`)

```js
const getSubtotal = () =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
```

`reduce` walks the cart array, multiplying each item's unit price by its quantity and accumulating the total. The result is displayed as `$${getSubtotal().toFixed(2)}`. This is recalculated and re-rendered every single time `renderCart()` runs, so it is always live and accurate.

---

### 17. Checkout & Order Confirmation

**File:** `cart.js` (`handleCheckout()`), `ui.js` (`openOrderModal()`)

When "Checkout" is clicked:
1. `handleCheckout()` checks `cart.length === 0` and exits early if the cart is empty (guard clause)
2. It maps over the current `cart` array to build order row HTML (title, quantity, line total) and injects it into `#orderItems`
3. It calculates and displays the grand total in `#orderTotal`
4. It **clears the cart**: `cart = []`, calls `saveCart([])`, `renderCart()`, and `updateCartBadge()` — in that order so storage is updated before the UI
5. It calls `closeCart()` then `openOrderModal()` — the order confirmation modal slides in

The order modal has a green checkmark icon, "Order Confirmed!" heading, the itemised list, grand total, and a "Continue Shopping" button that closes the modal.

---

### 18. LocalStorage Persistence

**Files:** `cart.js`, `products.js`, `ui.js`

Three separate keys are used:

| Key | Value | Managed by |
|---|---|---|
| `shopwave-cart` | JSON array of cart items `[{ id, title, price, image, quantity }]` | `cart.js` |
| `shopwave-wishlist` | JSON array of full product objects | `products.js` |
| `shopwave-theme` | String `'dark'` or `'light'` | `ui.js` |

**Cart persistence:** `loadCart()` runs at the top of `cart.js` before any function is defined, so `let cart = loadCart()` initialises the cart from storage on every page load. `saveCart()` wraps `JSON.stringify` and `localStorage.setItem`. Both are wrapped in `try/catch` to handle `QuotaExceededError` or parsing failures silently.

**Cart badge on load:** `app.js` calls `updateCartBadge()` inside `init()`, which runs on `DOMContentLoaded`. So the badge count is correct the moment the page finishes parsing, before the user does anything.

**Wishlist persistence:** identical pattern to cart — `loadWishlist()` runs at module level, `saveWishlist()` writes on every toggle.

**Theme persistence:** described in detail in section 19.

---

### 19. Dark / Light Mode

**Files:** `ui.js` (`initTheme()`, `toggleTheme()`), `css/dark-mode.css`, `index.html` (inline `<head>` script)

**The flash problem and how it is solved:**

If you save the theme in localStorage and apply it on `DOMContentLoaded`, there is a brief moment where the browser has painted the default (light) theme before JavaScript runs — a visible flash of white. To prevent this, a tiny inline IIFE runs in `<head>`, *before* any CSS or body content is painted:

```html
<script>
  (function() {
    if (localStorage.getItem('shopwave-theme') === 'dark') {
      document.documentElement.classList.add('dark');
      document.addEventListener('DOMContentLoaded', function() {
        document.body.classList.add('dark');
      });
    }
  })();
</script>
```

This adds `.dark` to `<html>` immediately so the browser's first paint already has dark styles applied.

**How the toggle works:**
```js
const toggleTheme = () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('shopwave-theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
};
```
`.classList.toggle()` returns `true` if the class was added. The icon is updated to a sun (☀) in dark mode and moon (🌙) in light mode.

**How dark styles work:**

`dark-mode.css` overrides every CSS custom property declared in `:root {}` using `body.dark {}`. Because all colours in `style.css` reference variables like `var(--clr-bg)`, changing the variables at the `body.dark` level cascades every colour change automatically — no element-by-element overrides needed.

---

### 20. Responsive Design

**File:** `css/style.css` (media queries at bottom)

| Breakpoint | Grid | Cart | Notes |
|---|---|---|---|
| `> 1024px` | 3 columns | Side drawer (400px wide) | Desktop default |
| `≤ 1024px` | 2 columns | Side drawer (400px wide) | Tablet landscape |
| `≤ 768px` | 2 columns | Full width (`width: 100%`) | Tablet portrait; hamburger appears |
| `≤ 480px` | 1 column | Full width | Mobile; controls stack vertically |
| `320px` | 1 column | Full width | Minimum supported width |

All modals have `max-height: 90vh` and `overflow-y: auto`, so they scroll internally on small screens and never clip or overflow the viewport. Product modal switches from a two-column layout (image left, info right) to a single column on mobile using a `grid-template-columns: 1fr` override.

---

### 21. Hamburger Menu

**File:** `ui.js` (`toggleNav()`, `closeNav()`)

The `<nav>` element is hidden off-screen on mobile using `transform: translateY(-120%)`. Clicking the hamburger button calls `toggleNav()`, which calls `nav.classList.toggle('open')`. The `.open` class overrides the transform to `translateY(0)`, sliding the nav down with a CSS transition.

Any nav link click calls `closeNav()` to dismiss the menu automatically. The hamburger button itself is `display: none` on desktop and `display: flex` on mobile via a `@media (max-width: 768px)` rule.

---

### 22. Wishlist (Bonus)

**File:** `products.js`

Each product card has a heart button in the top-right corner. Clicking it calls `toggleWishlist(product)`:
- If the product is already in the wishlist, it is removed using `.filter()`
- If it is not, the full product object is pushed into the `wishlist` array
- `saveWishlist(wishlist)` persists the change
- The badge count on the Wishlist nav link is updated

Clicking "Wishlist" in the header nav calls `renderWishlistModal()` then `openWishlistModal()`. The modal renders a 2-column grid of saved items, each with an image, truncated title, price, "Add to Cart" button, and "Remove" button.

"Add to Cart" from the wishlist calls `addToCart(product, 1)` and closes the modal. "Remove" calls `toggleWishlist(product)`, re-renders the modal in place, and syncs the heart button on the card in the background grid (if visible) back to the unfilled state.

---

### 23. Load More / Pagination (Bonus)

**File:** `products.js`

Instead of showing all 20 products at once, `PAGE_SIZE = 8` controls the initial count. `visibleCount` starts at 8 and is reset to 8 via `resetPagination()` every time filters change (so filtering back to "All" starts from the beginning, not mid-way through a scroll).

Inside `renderProducts()`:
```js
const toShow = filteredProducts.slice(0, visibleCount);
```
Only `toShow` is rendered. If `visibleCount < filteredProducts.length`, the "Load More" button is shown. Clicking it increments `visibleCount += PAGE_SIZE` and calls `renderProducts()` again — no new API call, just slicing more from the already-fetched array.

---

### 24. Product Comparison (Bonus)

**File:** `products.js` (`toggleCompare()`, `renderCompareModal()`, `syncCompareBar()`)

Each product card has a small compare icon button in the top-left corner. Clicking it calls `toggleCompare(product)`:
- If the product is already in `compareList`, it is removed using `splice()`
- If not, and `compareList.length < 3`, it is pushed in
- Maximum 3 products can be selected

`syncCompareBar()` shows/hides the sticky bottom bar that says "Compare: 2/3 selected". When "Compare Now" is clicked, `renderCompareModal()` builds an HTML `<table>` where each column is a product and each row is an attribute (Image, Name, Category, Price, Rating, Description). The table is scrollable horizontally on small screens.

---

### 25. Debounced Search (Bonus)

**File:** `filters.js` (`createDebounce()`)

A hand-written closure-based debounce — no library:

```js
const createDebounce = (fn, delay) => {
  let timerId;               // captured in closure — private to each debounced function
  return (...args) => {
    clearTimeout(timerId);   // cancel the previous pending call
    timerId = setTimeout(() => fn(...args), delay);  // schedule a new one
  };
};
```

The key insight: `timerId` lives in the closure of `createDebounce`. Every time the returned function is called, it cancels the previous `setTimeout` before scheduling a new one. The original `fn` only fires if 300ms pass without another call. This prevents `applyFilters()` from running on every single keypress for fast typists.

Usage:
```js
const debouncedChange = createDebounce(() => {
  searchQuery = input.value.trim();
  onChange();
}, 300);
input.addEventListener('input', debouncedChange);
```

---

### 26. Animations (Bonus)

**File:** `css/style.css` (hero section), `css/style.css` (product cards)

**Hero section entry animations:**
- `.animate-fade-left` — text slides in from the left (`translateX(-48px)` → `translateX(0)`) over 0.85s
- `.animate-fade-right` — laptop image slides in from the right with a 0.18s delay so it trails the text slightly
- `.animate-float-up/down/mid` — the three floating badges pop up in sequence at 0.55s, 0.70s, 0.85s delays
- `floatBob` — the laptop continuously bobs up and down with a 6s infinite ease-in-out keyframe
- `glowPulse` — the ambient glow behind the laptop pulses in opacity and scale on a 4s loop
- `badgeBob` — each badge gently bobs independently with different `animation-delay` values so they move out of sync

**Product cards:**
```css
animation: fadeSlideUp 0.4s ease both;
```
Cards animate in with `opacity: 0 → 1` and `translateY(20px) → 0` when rendered. Because all cards are injected into `innerHTML` at once, they all animate simultaneously on load but the effect reads as a smooth reveal.

**Modals and cart drawer:**
- Modals use `opacity` + `transform: translateY(24px) scale(0.97)` transitions — they appear to rise and expand into view
- The cart drawer uses `transform: translateX(100%)` → `transform: translateX(0)` with a `cubic-bezier(0.16, 1, 0.3, 1)` easing curve (fast start, elastic finish)

---

## JavaScript Architecture

The six files load in this exact order in `index.html`:

```
api.js → ui.js → filters.js → cart.js → products.js → app.js
```

All files share the browser's global scope. There is no `import`/`export` syntax. This means:
- `app.js` can call `fetchProducts()` (defined in `api.js`) ✓
- `products.js` can call `addToCart()` (defined in `cart.js`) ✓
- `products.js` can call `buildStarsHtml()` (defined in `ui.js`) ✓
- `app.js` can call `applyFilters()` (defined in `filters.js`) ✓

`app.js` is always last so it can reference every function from every preceding file.

**Execution flow on page load:**

```
1. Browser parses HTML
2. Inline <head> script runs → applies dark class if saved
3. Scripts load in order (api, ui, filters, cart, products, app)
4. app.js top-level: initTheme() runs immediately
5. DOMContentLoaded fires → bindUIEvents() + bindDynamicEvents() + init()
6. init() → showSkeletons(6) → fetchProducts() [async]
7. API responds → allProducts = data, allCategories extracted
8. renderProducts() → builds 8 cards, injects into grid
9. renderCategoryButtons() → builds All + 4 category buttons
10. renderCart() → restores cart from localStorage
11. updateCartBadge() → shows correct count immediately
12. updateWishlistBadge() → shows wishlist count immediately
```

---

## CSS Architecture

`style.css` is organised into clearly labelled sections:

```
:root CSS variables
Reset & Base
Header
Hero (two-column layout + animations)
Products Section (controls, category buttons, results bar)
Product Grid
Product Cards
Empty / Error States
Load More
Product Modal
Order Confirmation Modal
Wishlist Modal
Cart Drawer
Shared Buttons
Compare Bar
Compare Modal
Responsive Media Queries
Scrollbar
```

All colours are CSS custom properties defined in `:root`. Dark mode overrides only need to redefine those properties inside `body.dark {}` — because every colour reference in the file is `var(--clr-something)`, the cascade does the rest automatically.

---

## LocalStorage Keys Reference

| Key | Type | Content | Set by | Read by |
|---|---|---|---|---|
| `shopwave-cart` | JSON string | `Array<{ id, title, price, image, quantity }>` | `cart.js` | `cart.js` on load |
| `shopwave-wishlist` | JSON string | `Array<product>` (full API objects) | `products.js` | `products.js` on load |
| `shopwave-theme` | String | `'dark'` or `'light'` | `ui.js` | Inline `<head>` script + `ui.js` |

---

## API Reference

**Endpoint:** `GET https://fakestoreapi.com/products`  
**Auth:** None required  
**Returns:** Array of 20 product objects  
**Response time:** ~200–600ms depending on network  
**Rate limit:** None documented (free tier)

The API is read-only. ShopWave never POSTs to it — all cart, wishlist, and checkout operations are local.

---

## Code Quality Standards

Every line of JavaScript in this project follows these rules:

- `const` and `let` only — `var` is never used
- All data processing uses array methods: `.filter()`, `.map()`, `.sort()`, `.find()`, `.reduce()`, `.some()`, `.findIndex()`
- No manual `for` loops for data processing (the one `for` loop in the codebase iterates `i = 1` to `5` for star generation — a loop counter, not data processing)
- All HTML generation uses template literals — no string concatenation with `+`
- Functions are small and single-purpose — no function exceeds 20 lines of actual logic
- Meaningful names throughout — `filteredProducts`, `buildCartItemHtml`, `syncClearButtonVisibility`
- No `alert()` or `confirm()` anywhere — all messaging is custom UI
- No inline `<script>` tags in `<body>` (the `<head>` script is a documented exception for theme flash prevention)
- No inline `style=""` attributes in HTML (the `style="display:none"` on initially-hidden elements is set at markup time to prevent layout flash before JS runs — all subsequent visibility changes are JS-driven)

---

## Known Edge Cases Handled

| Scenario | Handling |
|---|---|
| API request fails | `try/catch` in `init()` shows error state with retry button |
| API returns non-200 status | `if (!response.ok) throw new Error(...)` in `fetchProducts()` |
| Product image URL is broken | `onerror` inline handler swaps to inline SVG placeholder |
| Cart is empty at checkout | Early return guard: `if (cart.length === 0) return` |
| localStorage is unavailable or corrupted | `try/catch` in `loadCart()` and `loadWishlist()` returns `[]` |
| Search returns zero results | Empty state shown with reset button |
| User tries to compare only 1 product | `renderCompareModal()` shows a "select at least 2" message |
| Minus button at quantity 1 in cart | `if (item.quantity > 1)` check prevents going below 1 |
| Filter changes mid-pagination | `resetPagination()` is called on every `onFilterChange()` |
| Dark mode flash on reload | Inline `<head>` IIFE applies class before first paint |
| Wishlist heart out of sync after modal remove | `heartBtn.classList.remove('wishlisted')` called directly on card DOM element |

---

## Screenshots

| Desktop — Product Grid | Mobile View | Cart Drawer Open |
|---|---|---|
| *(add screenshot)* | *(add screenshot)* | *(add screenshot)* |

> Add at least 3 screenshots. Capture: (1) desktop grid with filters visible, (2) mobile view with hamburger, (3) cart drawer open with items.

---

## Video Walkthrough

> 🎥 [Add YouTube unlisted link or Google Drive link here]
>
> The walkthrough covers: page load → skeleton → products render → search → category filter → sort → all three simultaneously → clear filters → open product modal → add to cart with quantity → cart drawer → checkout → order confirmation → dark mode toggle → wishlist → load more → product comparison

---

## What I Learned

The most valuable lesson from this project was understanding why state management exists. When search, category, and sort all had to work at the same time, I initially tried to update the grid from multiple places — and immediately ran into bugs where one filter would undo another. The fix was obvious in hindsight: there is exactly one place where the grid gets updated (`renderProducts`), and it always receives its data from one function (`applyFilters`) that reads all three state variables at once. Every user action just updates a variable and calls `onFilterChange()` — nothing else. That pattern eliminated an entire class of bugs.

Writing a debounce function from scratch also made closures finally click. Seeing that `timerId` is private to each debounced function, not shared between them, because it lives in the closure — that is the kind of thing that only lands when you write it yourself.

The dark mode flash prevention was the most surprising problem. I assumed `DOMContentLoaded` was early enough, but the browser can paint a frame before that fires. Adding an inline script to `<head>` that reads localStorage and adds the class before any content is rendered is the correct solution, and it is the same technique used by major sites like GitHub and Notion.