# ShopWave — Modern E-Commerce Product Store

> A fully functional, responsive e-commerce product store built with pure HTML, CSS, and vanilla JavaScript. No frameworks. No libraries. Just clean, well-structured code.

![ShopWave Banner](screenshots/desktop.png)

---

## 🔗 Live Demo
👉 [View Live Demo](YOUR_LIVE_LINK_HERE)

## 🎥 Video Walkthrough
📽️ [Watch on YouTube](YOUR_VIDEO_LINK_HERE) *(3–5 min screen recording of all features)*

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works — Technical Deep Dive](#how-it-works--technical-deep-dive)
- [File Structure](#file-structure)
- [Technologies Used](#technologies-used)
- [How to Run Locally](#how-to-run-locally)
- [Screenshots](#screenshots)
- [Bonus Features](#bonus-features)
- [What I Learned](#what-i-learned)

---

## Overview

ShopWave fetches 20 real products from the [FakeStore API](https://fakestoreapi.com/products) and displays them in a clean, responsive grid. Users can search, filter by category, sort, add items to a cart, manage a wishlist, compare products side by side, and toggle between dark and light mode — all without a single page reload.

Every feature is built using only native browser APIs: `fetch()`, `localStorage`, DOM manipulation, CSS custom properties, and ES6+ JavaScript.

---

## Features

### 🛍️ Core Product Listing
- Fetches all 20 products from FakeStore API using `fetch()` with `async/await`
- Displays a **skeleton loading screen** while data loads — placeholder cards with a shimmer animation that mimic the real card layout
- Shows a styled **error state** with a "Try Again" button if the API call fails
- **Responsive product grid** — 3 columns on desktop, 2 on tablet, 1 on mobile
- Each card shows: product image, category badge, title (truncated to 2 lines via `-webkit-line-clamp`), star rating with Font Awesome icons, price, and an Add to Cart button
- **Live product count** — "Showing X products" updates whenever filters change

### 🔍 Search, Filter & Sort
- **Real-time search** — filters products as you type (debounced at 300ms)
- **Category filter buttons** — generated dynamically from API data, never hardcoded
- **Sort dropdown** — 4 options: Price Low→High, Price High→Low, Rating Best First, Name A→Z
- All three work **simultaneously** — applying any combination gives accurate results
- **Clear All Filters** button resets everything in one click
- **Empty state** shown when no products match the current filter combination

### 🖼️ Product Detail Modal
- Clicking anywhere on a card (except the Add to Cart button) opens a full-detail modal
- Modal shows: full-size image, complete title, full description, category badge, star rating + review count, price, quantity selector, and Add to Cart button
- Quantity selector starts at 1 with + and − buttons (minimum stays at 1)
- Closes via: X button, clicking outside the modal overlay, or pressing Escape key

### 🛒 Shopping Cart
- Cart icon in header with a live **item count badge** (hidden when empty)
- Clicking the cart icon opens a **slide-in drawer** from the right side
- Each cart item shows: product image, truncated title, unit price, quantity controls (+ and −), and a separate Remove button
- Minus button at quantity 1 keeps the item — it does not delete it
- **Subtotal** updates live whenever quantity changes or an item is removed
- Empty cart shows a friendly message and a "Continue Shopping" button
- **Checkout** clears the cart and shows an order confirmation modal with all ordered items and the total

### 💾 LocalStorage Persistence
- Cart contents survive a full page refresh — items and quantities are restored exactly
- Cart badge reflects the correct count immediately on page load
- Wishlist items persist across sessions
- Dark/light mode preference is saved and restored with no flash on load

### 🌙 Dark / Light Mode
- Toggle button in header switches between dark and light mode
- Uses CSS custom properties — a single `body.dark` class overrides all color variables
- Theme preference saved to `localStorage` and applied before the page renders (via `theme-init.js` in `<head>`) to prevent any flash of wrong theme
- Toggle icon changes: moon icon in light mode, sun icon in dark mode

### 📱 Responsive Design
- Fully responsive from 320px (minimum mobile) up to 1440px+ (large desktop)
- Mobile header has a **hamburger menu** that slides the navigation in/out
- Cart drawer becomes **full screen width** on mobile
- Product grid adapts: 3 columns → 2 columns → 1 column
- All modals are scrollable on small screens with no overflow or clipping

---

## How It Works — Technical Deep Dive

### 1. Data Fetching (`api.js`)

```js
const fetchProducts = async () => {
  const response = await fetch('https://fakestoreapi.com/products');
  if (!response.ok) throw new Error(`HTTP error — status: ${response.status}`);
  return await response.json();
};
```

`fetchProducts()` uses `async/await` with proper error handling. If the response is not OK (e.g. 404 or 500), it throws an Error which is caught in `app.js` to show the error state. Categories are extracted using a `Set` to deduplicate:

```js
const extractCategories = (products) => {
  return [...new Set(products.map((p) => p.category))];
};
```

---

### 2. Skeleton Loading (`product.js` + `skeleton.css`)

Before the API responds, `showSkeletons(6)` injects 6 placeholder cards into the grid. Each skeleton card has the exact same structure as a real product card, styled with a shimmer animation in `skeleton.css`:

```css
@keyframes shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f0f1f8 25%, #e2e5f1 50%, #f0f1f8 75%);
  background-size: 600px 100%;
  animation: shimmer 1.4s infinite linear;
}
```

Once the API responds, the real product cards replace the skeletons.

---

### 3. Search + Filter + Sort Working Simultaneously (`filters.js`)

All three filters share module-level state variables:

```js
let activeCategory = 'all';
let searchQuery    = '';
let sortOrder      = 'default';
```

Every time any filter changes, the same `applyFilters()` function runs all three together:

```js
const applyFilters = (products) => {
  let result = products.filter((product) => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesSearch   = searchQuery === '' || product.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return sortProducts(result, sortOrder);
};
```

This means no filter ever "breaks" another — they always compose correctly.

---

### 4. Debounced Search (Closure Pattern) (`filters.js`)

The search input is debounced using a hand-written closure — no library:

```js
const createDebounce = (fn, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};
```

This waits 300ms after the user stops typing before filtering. The `timerId` is private inside the closure — it's not a global variable. This is the closure pattern the assignment asks for.

---

### 5. Cart State Management (`cart.js`)

The cart is a module-level array:

```js
let cart = loadCart(); // loaded from localStorage on startup
```

Every operation (add, increase, decrease, remove) updates this array, then calls `saveCart()` to persist it and `renderCart()` to update the UI. This means the cart is always in sync between memory, localStorage, and the DOM.

When the page loads, `loadCart()` reads from `localStorage` and immediately restores the full cart state — including the badge count — before the user interacts with anything.

---

### 6. Dark Mode with No Flash (`theme-init.js`)

The theme flash problem: if JS runs after the page renders, users briefly see the wrong theme. The solution is `theme-init.js` loaded in `<head>` — before any content renders:

```js
(function() {
  if (localStorage.getItem('shopwave-theme') === 'dark') {
    document.documentElement.classList.add('dark');
    document.addEventListener('DOMContentLoaded', function() {
      document.body.classList.add('dark');
    });
  }
})();
```

This IIFE runs immediately, adds the `dark` class to `<html>` before any content paints, and also adds it to `<body>` once the DOM is ready. The result: zero flash.

---

### 7. Product Comparison (`product.js`)

Up to 3 products can be selected for comparison. The state is a simple array:

```js
let compareList = [];
```

When a user clicks the compare button on a card, `toggleCompare()` adds or removes the product. If 3 are already selected, no more can be added. The compare bar at the bottom of the screen appears/disappears using a CSS class:

```css
.compare-bar { transform: translateY(100%); }
.compare-bar.visible { transform: translateY(0); }
```

When "Compare Now" is clicked, `renderCompareModal()` builds an HTML table dynamically, mapping over `compareList` to generate columns.

---

### 8. Wishlist with LocalStorage (`product.js`)

The wishlist works identically to the cart — module-level array, persisted to `localStorage`, restored on page load. The heart icon on each card reflects the current wishlist state. Toggling a heart updates the array, saves to localStorage, and syncs the icon class in real time.

---

## 📁 File Structure

```
ecommerce-store/
├── index.html                  # Main HTML — semantic structure, no inline styles or scripts
├── hero.png                    # Hero section image
├── CSS/
│   ├── style.css               # All main styles — layout, components, responsive design
│   ├── dark-mode.css           # Dark mode CSS variable overrides (body.dark class)
│   └── skeleton.css            # Skeleton loading card styles and shimmer animation
├── JS/
│   ├── theme-init.js           # Runs in <head> to apply dark mode before page renders
│   ├── api.js                  # fetch() logic and category extraction
│   ├── filters.js              # Search, category filter, sort, debounce, clear filters
│   ├── product.js              # Product card rendering, modal, wishlist, comparison
│   ├── cart.js                 # Cart add/remove/quantity/subtotal/checkout/localStorage
│   ├── ui.js                   # Modal open/close, cart drawer, dark mode toggle, hamburger
│   └── app.js                  # Main entry point — boots the app, coordinates all modules
└── README.md
```

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure — `<header>`, `<section>`, `<article>`, `<aside>`, `<nav>` |
| CSS3 | Custom Properties, Grid, Flexbox, Animations, `@keyframes`, `clamp()` |
| Vanilla JavaScript (ES6+) | `fetch`, `async/await`, `const`/`let`, arrow functions, template literals, destructuring, `Set`, `Map`, array methods |
| FakeStore API | Free REST API providing 20 real products with images, prices, ratings |
| Google Fonts | Syne (display/headings) + Inter (body text) |
| Font Awesome 6 | All icons — cart, heart, stars, hamburger, moon/sun |
| localStorage | Cart persistence, wishlist persistence, dark mode preference |

---

## 🚀 How to Run Locally

### Option 1 — VS Code Live Server (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ecommerce-store-YOUR_NAME.git
   ```
2. Open the folder in **VS Code**
3. Install the **Live Server** extension (by Ritwick Dey)
4. Right-click `index.html` → **Open with Live Server**
5. Site opens at `http://127.0.0.1:5501`

### Option 2 — Direct Browser Open

1. Download or clone the repository
2. Open the `ecommerce-store/` folder
3. Double-click `index.html` to open in your browser

> ⚠️ Note: The FakeStore API requires an internet connection. The site will show the error state if you're offline.

---

## 📸 Screenshots

### 🖥️ Desktop — Product Grid
![Desktop View](screenshots/desktop.png)

### 📱 Mobile — Responsive Layout
![Mobile View](screenshots/mobile.png)

### 🛒 Cart Drawer Open
![Cart Drawer](screenshots/cart.png)

---

## ⭐ Bonus Features Implemented

| Feature | Details |
|---|---|
| ❤️ Wishlist | Heart icon on every card saves products to localStorage. Wishlist modal shows all saved items with Add to Cart and Remove options |
| 📄 Load More | Shows 8 products at a time. "Load More" button reveals the next 8 without reloading the page |
| ⚖️ Product Comparison | Select up to 3 products using the compare icon on each card. A sticky bar appears at the bottom. "Compare Now" opens a side-by-side table of image, name, category, price, rating, and description |
| ⏱️ Debounced Search | Custom `createDebounce()` function using closures — waits 300ms after the user stops typing before filtering. Zero external libraries |
| ✨ Smooth Animations | Products animate in with a fade + slide-up on load. Modal has scale + fade entrance. Cart drawer slides in from the right. Hero image has a floating animation |

---

## 💡 What I Learned

This project was the most complex thing I've built so far, and it pushed me to think like a real developer rather than just writing code that works.

**The hardest part** was making search, category filter, and sort all work simultaneously without breaking each other. My first attempt used separate render functions for each filter, which caused them to reset each other. The solution was keeping a single source of truth — three module-level state variables — and always running one `applyFilters()` function that reads all three at once. This is the same pattern real frameworks use internally.

**LocalStorage persistence** taught me to think about data flow — when does state live in memory vs on disk? I learned that you have to restore state on every page load, not just save it on change.

**The dark mode flash** was a subtle bug I didn't expect. Even though my theme toggle worked perfectly, switching tabs and coming back caused a brief white flash. I fixed it by moving the theme-apply script to `<head>` so it runs before any content renders — a real production technique.

**Closures** clicked for me when writing the debounce function. The `timerId` variable lives inside the outer function and gets captured by the inner function. It's private, persistent, and shared across calls — that's what makes debounce work.

Overall, building this without any framework made me appreciate how much modern tools abstract away — and how much more control you have when you understand what's happening at the browser level.

---

## 👨‍💻 Author

**Your Name Here**
- GitHub: [@your-username](https://github.com/your-username)
- Assignment: MERN Stack + AI Engineering Bootcamp — Monthly Evaluation

---

*Built with ❤️ using only HTML, CSS, and vanilla JavaScript.*