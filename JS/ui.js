// ui.js — Modal, cart drawer, dark mode, hamburger, notifications

// ---- Dark Mode ----

/**
 * Apply the saved theme from localStorage (or default to light).
 * Called immediately to prevent flash of wrong theme.
 */
const initTheme = () => {
  const saved = localStorage.getItem('shopwave-theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
    updateThemeIcon(true);
  }
};

const updateThemeIcon = (isDark) => {
  const icon = document.querySelector('#themeToggle i');
  if (!icon) return;
  icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
};

const toggleTheme = () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('shopwave-theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
};

// ---- Product Modal ----

const openProductModal = () => {
  const modal = document.getElementById('productModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeProductModal = () => {
  const modal = document.getElementById('productModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
};

// ---- Order Confirmation Modal ----

const openOrderModal = () => {
  const modal = document.getElementById('orderModal');
  modal.classList.add('open');
};

const closeOrderModal = () => {
  const modal = document.getElementById('orderModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
};

// ---- Wishlist Modal ----

const openWishlistModal = () => {
  const modal = document.getElementById('wishlistModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeWishlistModal = () => {
  const modal = document.getElementById('wishlistModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
};

// ---- Compare Modal ----

const openCompareModal = () => {
  const modal = document.getElementById('compareModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeCompareModal = () => {
  const modal = document.getElementById('compareModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
};

// ---- Cart Drawer ----

const openCart = () => {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeCart = () => {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
};

// ---- Hamburger Navigation ----

const toggleNav = () => {
  const nav = document.getElementById('navMenu');
  nav.classList.toggle('open');
};

const closeNav = () => {
  document.getElementById('navMenu').classList.remove('open');
};

// ---- Build Star Rating HTML ----

/**
 * Generates star icons for a given numeric rating (0-5).
 * Supports full and half stars.
 */
const buildStarsHtml = (rating) => {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2; // round to nearest 0.5

  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(`<i class="fa-solid fa-star star filled"></i>`);
    } else if (i - 0.5 === rounded) {
      stars.push(`<i class="fa-solid fa-star-half-stroke star half"></i>`);
    } else {
      stars.push(`<i class="fa-regular fa-star star"></i>`);
    }
  }
  return stars.join('');
};

// ---- Keyboard Handler (Escape closes open overlays) ----

const handleGlobalKeydown = (event) => {
  if (event.key !== 'Escape') return;

  if (document.getElementById('productModal').classList.contains('open')) {
    closeProductModal();
  } else if (document.getElementById('orderModal').classList.contains('open')) {
    closeOrderModal();
  } else if (document.getElementById('wishlistModal').classList.contains('open')) {
    closeWishlistModal();
  } else if (document.getElementById('compareModal').classList.contains('open')) {
    closeCompareModal();
  } else if (document.getElementById('cartDrawer').classList.contains('open')) {
    closeCart();
  }
};

// ---- Bind all static UI events ----

const bindUIEvents = () => {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Cart open/close
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('continueShopping').addEventListener('click', closeCart);

  // Product modal close
  document.getElementById('modalClose').addEventListener('click', closeProductModal);
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProductModal();
  });

  // Order modal close
  document.getElementById('orderModalClose').addEventListener('click', closeOrderModal);
  document.getElementById('orderDoneBtn').addEventListener('click', closeOrderModal);
  document.getElementById('orderModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeOrderModal();
  });

  // Wishlist modal close
  document.getElementById('wishlistModalClose').addEventListener('click', closeWishlistModal);
  document.getElementById('wishlistModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeWishlistModal();
  });

  // Wishlist nav button
  document.getElementById('wishlistNavBtn').addEventListener('click', (e) => {
    e.preventDefault();
    renderWishlistModal();
    openWishlistModal();
    closeNav();
  });

  // Compare modal close
  document.getElementById('compareModalClose').addEventListener('click', closeCompareModal);
  document.getElementById('compareModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeCompareModal();
  });

  // Hamburger
  document.getElementById('hamburgerBtn').addEventListener('click', toggleNav);

  // Close nav when a nav link is clicked (mobile)
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Escape key
  document.addEventListener('keydown', handleGlobalKeydown);
};
