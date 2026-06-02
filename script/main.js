/* ============================================================
   OMEO — Shared JS  (loaded on every page)
   ============================================================ */

/* ---------- Shared product catalog ---------- */
const OMEO_PRODUCTS = [
  {
    id: 'snowboard',
    name: "Turbo Men's Snowboard",
    category: 'Snowboards',
    price: 699,
    img: 'assets/bataleon-snow-board.png'
  },
  {
    id: 'hoodie',
    name: 'Essentials Cotton Hoodie',
    category: 'Apparel',
    price: 89,
    img: 'assets/hoodie.png'
  },
  {
    id: 'bindings-hydra',
    name: 'Hydra-Flex Pro Bindings',
    category: 'Bindings',
    price: 249,
    img: 'assets/bataleon-snow-binder.png'
  },
  {
    id: 'skis-azure',
    name: 'Azure Velocity Skis',
    category: 'Skis',
    price: 599,
    img: 'assets/media/products/skiis.png'
  },
  {
    id: 'bag-pro',
    name: 'Bag Pro',
    category: 'Accessories',
    price: 129,
    img: 'assets/snow-board-bag.png'
  },
  {
    id: 'booties',
    name: 'Booties',
    category: 'Footwear',
    price: 79,
    img: 'assets/media/products/booties.png'
  },
  {
    id: 'bindings-blaster',
    name: 'Blaster AsymWrap Bindings',
    category: 'Bindings',
    price: 199,
    img: 'assets/bataleon-snow-binder.png'
  },
  {
    id: 'skis-mindbender',
    name: 'Mindbender 90 Skis',
    category: 'Skis',
    price: 749,
    img: 'assets/media/products/Skis_F26_Mindbender90_Base_5000x.jpg'
  },
  {
    id: 'jacket-sabre',
    name: 'Sabre Snow Jacket',
    category: 'Apparel',
    price: 649,
    img: 'assets/media/products/Arteryx_warmJacket_F25-X000010536-Sabre-Jacket-Black_5000x.jpg'
  },
  {
    id: 'goggles-method',
    name: 'Method II Snow Goggles',
    category: 'Accessories',
    price: 219,
    img: 'assets/media/METHOD_II_Googles.jpg'
  }
];

/* ============================================================
   Cart helpers  (localStorage key: "omeoCart")
   Item shape: { id, name, category, price, img, qty }
   ============================================================ */
function getCart() {
  try { return JSON.parse(localStorage.getItem('omeoCart') || '[]'); }
  catch (e) { return []; }
}
function saveCart(cart) {
  localStorage.setItem('omeoCart', JSON.stringify(cart));
}

/** Add one unit of a product, or increment existing qty */
function addToCart(product) {
  const cart     = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateAllCartBadges();
  _refreshOverlayCart();
}

/** Change qty by delta; removes item if qty reaches 0 */
function updateCartItemQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
  saveCart(cart);
  updateAllCartBadges();
  _refreshOverlayCart();
  // Search page also has its own cart preview
  if (typeof renderCartPreview === 'function') renderCartPreview();
}

/** Fully remove an item from the cart */
function removeCartItem(id) {
  saveCart(getCart().filter(i => i.id !== id));
  updateAllCartBadges();
  _refreshOverlayCart();
  if (typeof renderCartPreview === 'function') renderCartPreview();
}

/** Sync all .cart-badge elements on the page */
function updateAllCartBadges() {
  const count = getCart().reduce((s, i) => s + (i.qty || 0), 0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.hidden      = count === 0;
  });
}

/* ============================================================
   Search overlay
   Injected once into <body>; opened by clicking any .search input
   in the nav.  On search.html the overlay is NOT attached
   (that page has its own full search UI).
   ============================================================ */
function initSearchOverlay() {
  // Don't attach on the dedicated search page
  if (document.body.classList.contains('page-search')) return;

  /* --- Build overlay DOM --- */
  const el = document.createElement('div');
  el.id        = 'searchOverlay';
  el.className = 'search-overlay';
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Search');

  el.innerHTML = `
    <div class="sov-panel">

      <div class="sov-search-row">
        <input
          class="sov-input"
          id="sovInput"
          type="search"
          placeholder="Search products, brands, gear…"
          autocomplete="off"
          aria-label="Search products">
        <button class="sov-close" id="sovClose" aria-label="Close search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="sov-meta">
        <p class="sov-dym" id="sovDym" hidden>
          Did you mean <a id="sovDymLink" href="#">Snow board</a>?
        </p>
        <div class="sov-filter-row">
          <span class="sov-filter-label">Filter by</span>
          <select id="sovSort" class="sov-filter-select">
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      <div class="sov-results" id="sovResults"></div>

      <div class="sov-results-footer">
        <span class="sov-count" id="sovCount"></span>
        <a class="sov-see-all" id="sovSeeAll" href="search.html">See all</a>
      </div>

      <div class="sov-cart-section" id="sovCartSection"></div>

    </div>`;

  document.body.appendChild(el);

  /* --- Event wiring --- */
  // Backdrop click closes
  el.addEventListener('click', e => { if (e.target === el) closeSearchOverlay(); });
  document.getElementById('sovClose').addEventListener('click', closeSearchOverlay);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearchOverlay(); });

  // Live filter
  document.getElementById('sovInput').addEventListener('input',  _renderOverlayResults);
  document.getElementById('sovSort').addEventListener('change',  _renderOverlayResults);

  // Enter in overlay → go to full search page
  document.getElementById('sovInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const q = document.getElementById('sovInput').value.trim();
      if (q) location.href = 'search.html?q=' + encodeURIComponent(q);
    }
  });

  // Wire nav .search inputs to open the overlay
  document.querySelectorAll('.topbar .search input').forEach(navInput => {
    navInput.addEventListener('focus',  () => openSearchOverlay(navInput.value.trim()));
    navInput.addEventListener('click',  () => openSearchOverlay(navInput.value.trim()));
    navInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = navInput.value.trim();
        if (q) location.href = 'search.html?q=' + encodeURIComponent(q);
      }
    });
  });

  // Wire nav search buttons
  document.querySelectorAll('.topbar .search button').forEach(btn => {
    btn.onclick = null; // clear any inline handler
    btn.addEventListener('click', () => openSearchOverlay());
  });
}

/** Open overlay, optionally pre-fill query */
function openSearchOverlay(query) {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  if (query !== undefined) document.getElementById('sovInput').value = query;
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  _renderOverlayResults();
  _refreshOverlayCart();
  setTimeout(() => document.getElementById('sovInput')?.focus(), 50);
}

function closeSearchOverlay() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function _renderOverlayResults() {
  const query = (document.getElementById('sovInput')?.value || '').trim().toLowerCase();
  const sort  = document.getElementById('sovSort')?.value || 'relevance';

  let list = [...OMEO_PRODUCTS];
  if (query) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }
  if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

  // "Did you mean?" — triggered by snowboard typos
  const dym     = document.getElementById('sovDym');
  const dymLink = document.getElementById('sovDymLink');
  if (dym) {
    const isMisspelled = query && (query === 'snowbaord' || query === 'snwoboard' || query === 'snow hoodie');
    dym.hidden = !isMisspelled;
    if (dymLink) dymLink.href = 'search.html?q=snowboard';
  }

  // Update count + "see all" link
  const countEl  = document.getElementById('sovCount');
  const seeAllEl = document.getElementById('sovSeeAll');
  if (countEl)  countEl.textContent  = list.length + ' result' + (list.length !== 1 ? 's' : '') + '..';
  if (seeAllEl) seeAllEl.href        = 'search.html' + (query ? '?q=' + encodeURIComponent(query) : '');

  // Render first 4
  const shown  = list.slice(0, 4);
  const grid   = document.getElementById('sovResults');
  if (!grid) return;

  if (shown.length === 0) {
    grid.innerHTML = '<p class="sov-empty">No products found.</p>';
    return;
  }

  grid.innerHTML = shown.map(p => `
    <article class="sov-card" onclick="closeSearchOverlay(); location.href='product.html?id=${p.id}'">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="sov-card-info">
        <h4>${p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name}</h4>
        <p>${p.category}</p>
      </div>
    </article>`).join('');
}

function _refreshOverlayCart() {
  const section = document.getElementById('sovCartSection');
  if (!section) return;
  const cart = getCart();

  if (cart.length === 0) { section.innerHTML = ''; return; }

  section.innerHTML = `
    <h3 class="sov-cart-heading">In your cart...</h3>
    ${cart.map(item => `
      <div class="sov-cart-item" data-id="${item.id}">
        <img src="${item.img}" alt="${item.name}">
        <div class="sov-cart-item-info">
          <strong>${item.name}</strong>
        </div>
        <button class="sov-cart-remove"
          onclick="removeCartItem('${item.id}')"
          aria-label="Remove ${item.name}">✕</button>
        <div class="sov-cart-qty">
          <button onclick="updateCartItemQty('${item.id}', 1)" aria-label="Increase">+</button>
          <span>${item.qty}</span>
          <button onclick="updateCartItemQty('${item.id}', -1)" aria-label="Decrease">−</button>
        </div>
      </div>`).join('')}`;
}

/* ============================================================
   Mobile menu
   ============================================================ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn   = document.getElementById('mobileMenuClose');
  if (!hamburger || !mobileMenu) return;

  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  mobileMenu.addEventListener('click', e => { if (e.target === mobileMenu) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* ============================================================
   Featured product carousel (home page)
   ============================================================ */
function initCarousel() {
  const carousel   = document.querySelector('[data-carousel]');
  const prevButton = document.querySelector('[data-carousel-prev]');
  const nextButton = document.querySelector('[data-carousel-next]');
  if (!carousel || !prevButton || !nextButton) return;

  const scrollAmount = () => Math.max(260, carousel.clientWidth * 0.75);
  prevButton.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  nextButton.addEventListener('click', () => carousel.scrollBy({ left:  scrollAmount(), behavior: 'smooth' }));
}

/* ============================================================
   Contact form (home page)
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    alert('Thanks, ' + (name || 'friend') + '! We\'ll be in touch.');
    form.reset();
  });
}

/* ============================================================
   SCROLL REVEAL
   Adds data-reveal to below-fold elements then observes them.
   Works without libraries — gracefully degrades if JS is off.
   ============================================================ */
function initScrollReveal() {
  if (!window.IntersectionObserver) return;

  // Single elements that slide up on their own
  const singles = [
    '#about h2',
    '#about > p',
    '.featured-section .section-heading',
    '.trust-heading',
    '.catalogue-section',
    '#contact h2',
    '#contact form',
    '.banner-section',
  ];
  singles.forEach(sel =>
    document.querySelectorAll(sel).forEach(el =>
      el.setAttribute('data-reveal', '')
    )
  );

  // Staggered groups — siblings get increasing delays
  ['.hero-copy-stats .hero-stat', '.trust-grid .trust-item'].forEach(sel =>
    document.querySelectorAll(sel).forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      el.setAttribute('data-reveal-delay', Math.min(i + 1, 5));
    })
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // fire once only
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
}

/* ============================================================
   HERO PARALLAX
   Background image scrolls at 38% of page scroll speed,
   creating a depth effect as the hero scrolls out of view.
   ============================================================ */
function initParallax() {
  const hero = document.querySelector('.hero-visual');
  if (!hero) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;
    if (scrollY > hero.offsetTop + hero.offsetHeight) { ticking = false; return; }
    hero.style.backgroundPositionY = `calc(0% + ${scrollY * 0.38}px)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}

/* ============================================================
   ANIMATED STAT COUNTERS
   Numbers like "500+" and "10+" count up from 0 when they
   scroll into view. Non-numeric values (e.g. "Free") are skipped.
   ============================================================ */
function initStatCounters() {
  const stats = document.querySelectorAll('.hero-stat-num');
  if (!stats.length || !window.IntersectionObserver) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);

      const el      = entry.target;
      const text    = el.textContent.trim();
      const match   = text.match(/^(\d+)(\D*)$/);
      if (!match) return; // "Free" → skip

      const target   = parseInt(match[1], 10);
      const suffix   = match[2];
      const duration = 2200;
      const start    = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 4); // quartic ease-out: fast start, slow finish
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      el.textContent = '0' + suffix;
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });

  stats.forEach(el => observer.observe(el));
}

/* ============================================================
   Boot — runs on every page
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  updateAllCartBadges();
  initMobileMenu();
  initSearchOverlay();
  initCarousel();
  initContactForm();
  initScrollReveal();
  initParallax();
  initStatCounters();
});
