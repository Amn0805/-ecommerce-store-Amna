// app.js — Main entry point for ShopWave
// Initialises all modules and coordinates data flow.

// ---- Apply theme immediately to prevent flash ----
// (Runs before DOMContentLoaded since this script is deferred via placement at
// bottom of body — theme class is applied early via inline snippet in <head>.)
initTheme();

// ---- App State ----
let allProducts = [];       // Original full product list from API
let allCategories = [];     // Extracted unique category names
let filteredProducts = [];  // Currently displayed (after filters)

// ---- Boot Sequence ----

/**
 * Main init: fetch products, render everything, bind all events.
 */
const init = async () => {
  showSkeletons(6);

  try {
    allProducts = await fetchProducts();
    allCategories = extractCategories(allProducts);
    filteredProducts = [...allProducts];

    resetPagination();
    renderProducts(filteredProducts, allProducts);
    renderCategoryButtons(allCategories, onFilterChange);
    syncClearButtonVisibility();

  } catch (error) {
    console.error('Failed to load products:', error);
    showErrorState();
  }

  // Restore cart state visually (badge + items) from localStorage
  renderCart();
  updateCartBadge();
  updateWishlistBadge();
};

// ---- Filter Change Handler ----

/**
 * Called whenever search, category, or sort changes.
 * Re-applies all filters and re-renders products.
 */
const onFilterChange = () => {
  filteredProducts = applyFilters(allProducts);
  resetPagination();
  renderProducts(filteredProducts, allProducts);
  syncClearButtonVisibility();
};

// ---- Bind Dynamic Events ----

const bindDynamicEvents = () => {
  // Search input (with debounce handled inside filters.js)
  bindSearchInput(onFilterChange);

  // Sort select
  bindSortSelect(onFilterChange);

  // Clear All Filters button
  document.getElementById('clearFiltersBtn').addEventListener('click', () => {
    clearAllFilters(allCategories, onFilterChange);
    onFilterChange();
  });

  // Empty state clear button
  document.getElementById('emptyStateClear').addEventListener('click', () => {
    clearAllFilters(allCategories, onFilterChange);
    onFilterChange();
  });

  // Retry button (error state)
  document.getElementById('retryBtn').addEventListener('click', () => {
    document.getElementById('errorState').style.display = 'none';
    init();
  });

  // Load More button (bonus: pagination)
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    renderProducts(filteredProducts, allProducts);
  });

  // Checkout
  bindCheckoutButton();

  // Compare bar buttons
  document.getElementById('compareNowBtn').addEventListener('click', () => {
    renderCompareModal();
    openCompareModal();
  });
  document.getElementById('compareClearBtn').addEventListener('click', () => {
    compareList.length = 0;
    syncCompareBar();
  });
};

// ---- DOMContentLoaded ----

document.addEventListener('DOMContentLoaded', () => {
  bindUIEvents();
  bindDynamicEvents();
  init();
});
