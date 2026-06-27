// filters.js — Search, sort, category filter logic
// All three must work simultaneously at all times.

// ---- State (module-level, shared with products.js via app.js) ----
// These are read by products.js to render the correct subset.
let activeCategory = 'all';
let searchQuery = '';
let sortOrder = 'default';

// ---- Debounce (written with a closure — no library) ----

/**
 * Returns a debounced version of `fn` that fires only after
 * `delay` ms have passed since the last call.
 * Uses a closure to capture the timer handle privately.
 */
const createDebounce = (fn, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};

// ---- Filter + Sort Logic ----

/**
 * Apply search, category, and sort to the full products array.
 * Returns a new filtered/sorted array (no mutation).
 */
const applyFilters = (products) => {
  let result = products.filter((product) => {
    const matchesCategory =
      activeCategory === 'all' ||
      product.category === activeCategory;

    const matchesSearch =
      searchQuery === '' ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Sort the filtered result
  result = sortProducts(result, sortOrder);

  return result;
};

/**
 * Sort an array of products by the given order key.
 * Returns a new sorted array (uses .sort on a copy).
 */
const sortProducts = (products, order) => {
  const copy = [...products];

  const sorters = {
    'price-asc':  (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    'rating-desc':(a, b) => b.rating.rate - a.rating.rate,
    'name-asc':   (a, b) => a.title.localeCompare(b.title),
  };

  if (sorters[order]) {
    copy.sort(sorters[order]);
  }

  return copy;
};

// ---- Category Button Generation ----

/**
 * Dynamically generate category filter buttons from API data.
 * Never hardcodes category names.
 */
const renderCategoryButtons = (categories, onSelect) => {
  const container = document.getElementById('categoryFilters');

  const allBtn = buildCatButton('all', 'All', activeCategory);
  const categoryButtons = categories.map((cat) =>
    buildCatButton(cat, cat, activeCategory)
  );

  container.innerHTML = [allBtn, ...categoryButtons].join('');

  // Bind click events
  container.querySelectorAll('.cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      // Update active class
      container.querySelectorAll('.cat-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.category === activeCategory)
      );
      onSelect();
    });
  });
};

const buildCatButton = (value, label, currentActive) => {
  const isActive = value === currentActive ? 'active' : '';
  return `<button class="cat-btn ${isActive}" data-category="${value}">${label}</button>`;
};

// ---- Search Input ----

const bindSearchInput = (onChange) => {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');

  const debouncedChange = createDebounce(() => {
    searchQuery = input.value.trim();
    clearBtn.style.display = searchQuery ? 'flex' : 'none';
    onChange();
  }, 300);

  input.addEventListener('input', debouncedChange);

  clearBtn.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clearBtn.style.display = 'none';
    onChange();
  });
};

// ---- Sort Select ----

const bindSortSelect = (onChange) => {
  const select = document.getElementById('sortSelect');
  select.addEventListener('change', () => {
    sortOrder = select.value;
    onChange();
  });
};

// ---- Clear All Filters ----

const clearAllFilters = (categories, onSelect) => {
  // Reset state
  activeCategory = 'all';
  searchQuery = '';
  sortOrder = 'default';

  // Reset DOM elements
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  document.getElementById('sortSelect').value = 'default';
  document.getElementById('clearFiltersBtn').style.display = 'none';

  // Re-render category buttons with all selected
  renderCategoryButtons(categories, onSelect);
};

// ---- Show/hide the Clear All button ----

/**
 * Show "Clear All Filters" button only when any filter is active.
 */
const syncClearButtonVisibility = () => {
  const isFiltered =
    activeCategory !== 'all' ||
    searchQuery !== '' ||
    sortOrder !== 'default';

  const btn = document.getElementById('clearFiltersBtn');
  btn.style.display = isFiltered ? 'flex' : 'none';
};

// ---- Update Product Count Label ----

const updateProductCount = (count) => {
  const el = document.getElementById('productCount');
  el.textContent = `Showing ${count} product${count !== 1 ? 's' : ''}`;
};
