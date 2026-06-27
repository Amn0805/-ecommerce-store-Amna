// products.js — Product rendering, modal, wishlist, comparison

// ---- Constants ----
const PAGE_SIZE = 8; // for Load More (bonus feature)
const WISHLIST_KEY = 'shopwave-wishlist';

// ---- Wishlist State ----

const loadWishlist = () => {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (list) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
};

let wishlist = loadWishlist();

const isWishlisted = (productId) =>
  wishlist.some((item) => item.id === productId);

const toggleWishlist = (product) => {
  if (isWishlisted(product.id)) {
    wishlist = wishlist.filter((item) => item.id !== product.id);
  } else {
    wishlist.push(product);
  }
  saveWishlist(wishlist);
  updateWishlistBadge();
};

const updateWishlistBadge = () => {
  const badge = document.getElementById('wishlistNavCount');
  const count = wishlist.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
};

// ---- Comparison State (max 3) ----

let compareList = [];

const toggleCompare = (product) => {
  const idx = compareList.findIndex((p) => p.id === product.id);

  if (idx !== -1) {
    compareList.splice(idx, 1);
  } else if (compareList.length < 3) {
    compareList.push(product);
  }

  syncCompareBar();
};

const syncCompareBar = () => {
  const bar = document.getElementById('compareBar');
  const countEl = document.getElementById('compareCount');
  countEl.textContent = compareList.length;

  if (compareList.length > 0) {
    bar.classList.add('visible');
    bar.style.display = 'block';
  } else {
    bar.classList.remove('visible');
    bar.style.display = 'none';
  }

  // Update compare check buttons on cards
  document.querySelectorAll('.compare-check-btn').forEach((btn) => {
    const id = Number(btn.dataset.id);
    btn.classList.toggle('selected', compareList.some((p) => p.id === id));
    btn.title = compareList.some((p) => p.id === id) ? 'Remove from compare' : 'Add to compare';
  });
};

// ---- Skeleton Loader ----

const showSkeletons = (count = 6) => {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = Array.from({ length: count })
    .map(
      () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-badge"></div>
        <div class="skeleton skeleton-title-1"></div>
        <div class="skeleton skeleton-title-2"></div>
        <div class="skeleton skeleton-rating"></div>
        <div class="skeleton-footer">
          <div class="skeleton skeleton-price"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
      </div>
    </div>
  `
    )
    .join('');
};

// ---- Load More State ----
let visibleCount = PAGE_SIZE;

const resetPagination = () => {
  visibleCount = PAGE_SIZE;
};

// ---- Render Product Grid ----

/**
 * Renders the filtered/sorted products into the grid.
 * Handles empty state and load-more pagination.
 * `allFiltered` is the full filtered set; `visibleCount` controls pagination.
 */
const renderProducts = (filteredProducts, allProducts) => {
  const grid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  const errorState = document.getElementById('errorState');
  const loadMoreWrap = document.getElementById('loadMoreWrap');

  errorState.style.display = 'none';

  if (filteredProducts.length === 0) {
    grid.innerHTML = '';
    emptyState.style.display = 'flex';
    loadMoreWrap.style.display = 'none';
    updateProductCount(0);
    return;
  }

  emptyState.style.display = 'none';

  const toShow = filteredProducts.slice(0, visibleCount);

  grid.innerHTML = toShow.map((product) => buildProductCardHtml(product)).join('');

  updateProductCount(filteredProducts.length);
  syncCompareBar();
  updateWishlistBadge();

  // Show/hide Load More
  if (visibleCount < filteredProducts.length) {
    loadMoreWrap.style.display = 'block';
  } else {
    loadMoreWrap.style.display = 'none';
  }

  // Bind card events
  bindCardEvents(allProducts);
};

// ---- Build Product Card HTML ----

const buildProductCardHtml = (product) => {
  const { id, title, category, price, rating, image } = product;
  const starsHtml = buildStarsHtml(rating.rate);
  const hearted = isWishlisted(id) ? 'wishlisted' : '';
  const compareSelected = compareList.some((p) => p.id === id) ? 'selected' : '';

  return `
    <article class="product-card" data-id="${id}">
      <div class="card-img-wrap">
        <button
          class="compare-check-btn ${compareSelected}"
          data-id="${id}"
          title="Add to compare"
          aria-label="Compare ${title}"
        >
          <i class="fa-solid fa-code-compare"></i>
        </button>
        <img
          class="card-img"
          src="${image}"
          alt="${title}"
          loading="lazy"
          onerror="this.classList.add('img-error'); this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><rect width=%22200%22 height=%22200%22 fill=%22%23e2e5f1%22/><text x=%22100%22 y=%22105%22 text-anchor=%22middle%22 fill=%22%23aaa%22 font-size=%2214%22>No Image</text></svg>'"
        />
        <button
          class="wishlist-heart-btn ${hearted}"
          data-id="${id}"
          aria-label="${hearted ? 'Remove from wishlist' : 'Add to wishlist'}"
        >
          <i class="fa-${hearted ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
      <div class="card-body">
        <span class="card-category">${category}</span>
        <h3 class="card-title">${title}</h3>
        <div class="card-rating">
          <div class="stars">${starsHtml}</div>
          <span class="rating-text">${rating.rate} (${rating.count})</span>
        </div>
        <div class="card-footer">
          <p class="card-price">$${price.toFixed(2)}</p>
          <button
            class="add-to-cart-btn"
            data-id="${id}"
            aria-label="Add ${title} to cart"
          >
            <i class="fa-solid fa-plus"></i> Add
          </button>
        </div>
      </div>
    </article>
  `;
};

// ---- Bind Card Events ----

const bindCardEvents = (allProducts) => {
  const grid = document.getElementById('productGrid');

  grid.querySelectorAll('.product-card').forEach((card) => {
    const id = Number(card.dataset.id);
    const product = allProducts.find((p) => p.id === id);
    if (!product) return;

    // Open modal on card click (except buttons)
    card.addEventListener('click', (e) => {
      const isBtn = e.target.closest('button');
      if (!isBtn) openModal(product);
    });

    // Add to cart button
    const addBtn = card.querySelector('.add-to-cart-btn');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(product, 1);
      animateCartBtn(addBtn);
    });

    // Wishlist heart button
    const heartBtn = card.querySelector('.wishlist-heart-btn');
    heartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(product);
      const wasHearted = heartBtn.classList.contains('wishlisted');
      heartBtn.classList.toggle('wishlisted');
      heartBtn.querySelector('i').className = wasHearted
        ? 'fa-regular fa-heart'
        : 'fa-solid fa-heart';
      heartBtn.ariaLabel = wasHearted ? 'Add to wishlist' : 'Remove from wishlist';
    });

    // Compare toggle
    const compareBtn = card.querySelector('.compare-check-btn');
    compareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCompare(product);
    });
  });
};

/** Brief visual feedback when adding to cart */
const animateCartBtn = (btn) => {
  const original = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-check"></i> Added`;
  btn.style.background = 'var(--clr-success)';
  setTimeout(() => {
    btn.innerHTML = original;
    btn.style.background = '';
  }, 900);
};

// ---- Product Detail Modal ----

let modalQty = 1;

const openModal = (product) => {
  const { title, description, category, price, rating, image } = product;
  modalQty = 1;

  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="modal-content">
      <div class="modal-img-col">
        <img
          class="modal-product-img"
          src="${image}"
          alt="${title}"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 300%22><rect width=%22300%22 height=%22300%22 fill=%22%23e2e5f1%22/><text x=%22150%22 y=%22155%22 text-anchor=%22middle%22 fill=%22%23aaa%22 font-size=%2216%22>No Image</text></svg>'"
        />
      </div>
      <div class="modal-info-col">
        <span class="card-category">${category}</span>
        <h2 class="modal-title" id="modalTitle">${title}</h2>
        <p class="modal-desc">${description}</p>
        <div class="modal-rating">
          <div class="stars">${buildStarsHtml(rating.rate)}</div>
          <span>${rating.rate} stars · ${rating.count} reviews</span>
        </div>
        <p class="modal-price">$${price.toFixed(2)}</p>
        <div class="modal-actions">
          <div class="qty-control">
            <button class="qty-btn" id="modalQtyMinus" aria-label="Decrease quantity">
              <i class="fa-solid fa-minus"></i>
            </button>
            <span class="qty-display" id="modalQtyDisplay">1</span>
            <button class="qty-btn" id="modalQtyPlus" aria-label="Increase quantity">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          <button class="btn-primary" id="modalAddToCart" style="flex:1">
            <i class="fa-solid fa-bag-shopping"></i> Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;

  // Qty controls
  document.getElementById('modalQtyMinus').addEventListener('click', () => {
    if (modalQty > 1) {
      modalQty -= 1;
      document.getElementById('modalQtyDisplay').textContent = modalQty;
    }
  });
  document.getElementById('modalQtyPlus').addEventListener('click', () => {
    modalQty += 1;
    document.getElementById('modalQtyDisplay').textContent = modalQty;
  });

  // Add to cart from modal
  document.getElementById('modalAddToCart').addEventListener('click', () => {
    addToCart(product, modalQty);
    closeProductModal();
  });

  openProductModal();
};

// ---- Wishlist Modal Render ----

const renderWishlistModal = () => {
  const container = document.getElementById('wishlistItems');

  if (wishlist.length === 0) {
    container.innerHTML = `
      <div class="wishlist-empty">
        <i class="fa-regular fa-heart"></i>
        <p>Your wishlist is empty. Heart a product to save it here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="wishlist-grid">
      ${wishlist.map((product) => buildWishlistItemHtml(product)).join('')}
    </div>
  `;

  // Bind wishlist item buttons
  container.querySelectorAll('[data-wl-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.wlAction;
      const id = Number(btn.dataset.id);
      const product = wishlist.find((p) => p.id === id);
      if (!product) return;

      if (action === 'add-cart') {
        addToCart(product, 1);
        closeWishlistModal();
      } else if (action === 'remove') {
        toggleWishlist(product);
        // Re-render wishlist modal
        renderWishlistModal();
        // Sync heart buttons on cards
        const heartBtn = document.querySelector(
          `.wishlist-heart-btn[data-id="${id}"]`
        );
        if (heartBtn) {
          heartBtn.classList.remove('wishlisted');
          heartBtn.querySelector('i').className = 'fa-regular fa-heart';
        }
      }
    });
  });
};

const buildWishlistItemHtml = (product) => `
  <div class="wishlist-item">
    <div class="wishlist-item-img-wrap">
      <img
        class="wishlist-item-img"
        src="${product.image}"
        alt="${product.title}"
        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22><rect width=%22120%22 height=%22120%22 fill=%22%23e2e5f1%22/></svg>'"
      />
    </div>
    <div class="wishlist-item-body">
      <p class="wishlist-item-title">${product.title}</p>
      <p class="wishlist-item-price">$${product.price.toFixed(2)}</p>
      <div class="wishlist-item-actions">
        <button class="btn-xs btn-xs-primary" data-wl-action="add-cart" data-id="${product.id}">
          <i class="fa-solid fa-bag-shopping"></i> Add to Cart
        </button>
        <button class="btn-xs btn-xs-outline" data-wl-action="remove" data-id="${product.id}">
          Remove
        </button>
      </div>
    </div>
  </div>
`;

// ---- Compare Modal ----

const renderCompareModal = () => {
  const wrap = document.getElementById('compareTableWrap');

  if (compareList.length < 2) {
    wrap.innerHTML = '<p style="color:var(--clr-text-muted);font-size:0.9rem">Select at least 2 products to compare.</p>';
    return;
  }

  const rows = [
    { label: 'Image', key: 'image', render: (p) => `<img class="compare-prod-img" src="${p.image}" alt="${p.title}" />` },
    { label: 'Name', key: 'title', render: (p) => `<span class="compare-prod-name">${p.title}</span>` },
    { label: 'Category', key: 'category', render: (p) => `<span class="card-category">${p.category}</span>` },
    { label: 'Price', key: 'price', render: (p) => `<strong>$${p.price.toFixed(2)}</strong>` },
    { label: 'Rating', key: 'rating', render: (p) => `${buildStarsHtml(p.rating.rate)} <span style="font-size:0.78rem">${p.rating.rate} (${p.rating.count})</span>` },
    { label: 'Description', key: 'description', render: (p) => `<span style="font-size:0.78rem;line-height:1.6">${p.description.slice(0, 120)}…</span>` },
  ];

  const headerCells = compareList
    .map(() => `<th style="text-align:center;min-width:200px">Product</th>`)
    .join('');

  const bodyRows = rows
    .map((row) => {
      const cells = compareList.map((p) => `<td style="text-align:center">${row.render(p)}</td>`).join('');
      return `<tr><th style="white-space:nowrap">${row.label}</th>${cells}</tr>`;
    })
    .join('');

  wrap.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th>Attribute</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>${bodyRows}</tbody>
    </table>
  `;
};

// ---- Error State ----

const showErrorState = () => {
  document.getElementById('productGrid').innerHTML = '';
  document.getElementById('errorState').style.display = 'flex';
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('loadMoreWrap').style.display = 'none';
};
