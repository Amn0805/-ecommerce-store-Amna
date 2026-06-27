// cart.js — All cart logic: add, remove, quantity, subtotal, checkout, persistence

const CART_KEY = 'shopwave-cart';

// ---- Cart State ----

/**
 * Load cart from localStorage on init.
 * Returns an array of { id, title, price, image, quantity }.
 */
const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/** Persist current cart array to localStorage. */
const saveCart = (cartItems) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
};

// Use a module-level array so all functions share the same cart reference.
let cart = loadCart();

// ---- Cart Operations ----

/**
 * Add a product to cart or increase its quantity if already present.
 * `quantity` defaults to 1 but can be set from the modal quantity selector.
 */
const addToCart = (product, quantity = 1) => {
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity,
    });
  }

  saveCart(cart);
  renderCart();
  updateCartBadge();
};

/**
 * Increase quantity of a specific cart item by 1.
 */
const increaseQty = (productId) => {
  const item = cart.find((i) => i.id === productId);
  if (item) item.quantity += 1;
  saveCart(cart);
  renderCart();
  updateCartBadge();
};

/**
 * Decrease quantity. Minimum is 1; does NOT remove at 1
 * (use removeFromCart to fully delete).
 */
const decreaseQty = (productId) => {
  const item = cart.find((i) => i.id === productId);
  if (item && item.quantity > 1) item.quantity -= 1;
  saveCart(cart);
  renderCart();
  updateCartBadge();
};

/**
 * Remove an item entirely from cart regardless of quantity.
 */
const removeFromCart = (productId) => {
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
  updateCartBadge();
};

/** Compute and return the cart subtotal. */
const getSubtotal = () =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

/** Total item count (sum of quantities). */
const getTotalCount = () =>
  cart.reduce((sum, item) => sum + item.quantity, 0);

// ---- Render Cart Drawer ----

const renderCart = () => {
  const itemsContainer = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footerEl = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotal');

  if (cart.length === 0) {
    itemsContainer.innerHTML = '';
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'flex';

  itemsContainer.innerHTML = cart
    .map((item) => buildCartItemHtml(item))
    .join('');

  subtotalEl.textContent = `$${getSubtotal().toFixed(2)}`;

  // Bind cart item buttons
  itemsContainer.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);

      if (action === 'increase') increaseQty(id);
      else if (action === 'decrease') decreaseQty(id);
      else if (action === 'remove') removeFromCart(id);
    });
  });
};

const buildCartItemHtml = (item) => {
  return `
    <div class="cart-item">
      <div class="cart-item-img-wrap">
        <img
          class="cart-item-img"
          src="${item.image}"
          alt="${item.title}"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect width=%2260%22 height=%2260%22 fill=%22%23e2e5f1%22/><text x=%2230%22 y=%2235%22 text-anchor=%22middle%22 fill=%22%23aaa%22 font-size=%2212%22>IMG</text></svg>'"
        />
      </div>
      <div class="cart-item-info">
        <p class="cart-item-title">${item.title}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)} each</p>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">
          <i class="fa-solid fa-minus"></i>
        </button>
        <span class="cart-qty-num">${item.quantity}</span>
        <button class="cart-qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">
          <i class="fa-solid fa-plus"></i>
        </button>
        <button class="cart-remove-btn" data-action="remove" data-id="${item.id}" aria-label="Remove item">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `;
};

// ---- Cart Badge ----

const updateCartBadge = () => {
  const badge = document.getElementById('cartBadge');
  const count = getTotalCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
};

// ---- Checkout ----

const handleCheckout = () => {
  if (cart.length === 0) return;

  const orderItemsEl = document.getElementById('orderItems');
  const orderTotalEl = document.getElementById('orderTotal');

  // Build order item rows
  orderItemsEl.innerHTML = cart
    .map(
      (item) => `
      <div class="order-item">
        <span class="order-item-title">${item.title}</span>
        <span>×${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `
    )
    .join('');

  orderTotalEl.textContent = `Total: $${getSubtotal().toFixed(2)}`;

  // Clear cart after checkout
  cart = [];
  saveCart(cart);
  renderCart();
  updateCartBadge();

  closeCart();
  openOrderModal();
};

// ---- Bind Checkout Button ----

const bindCheckoutButton = () => {
  document.getElementById('checkoutBtn').addEventListener('click', handleCheckout);
};
