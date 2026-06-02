/* ============================================================
         Search page data & logic
         ============================================================ */
      // Product data is defined in main.js as OMEO_PRODUCTS
      const ALL_PRODUCTS = OMEO_PRODUCTS;

      /* --- Render product grid --- */
      function renderProducts() {
        const sort    = document.getElementById('sortSelect').value;
        const query   = (document.getElementById('searchInput').value || '').trim().toLowerCase();
        const grid    = document.getElementById('productGrid');
        const counter = document.getElementById('resultsCount');

        let list = [...ALL_PRODUCTS];

        // "Did you mean?" element reference (used inside and outside query block)
        const dym     = document.getElementById('didYouMean');
        const dymLink = document.getElementById('didYouMeanLink');

        // Filter by query
        if (query) {
          list = list.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
          );
          // Show "did you mean?" for common typos
          if (dym && dymLink) {
            const typos = { 'snowbaord': 'snowboard', 'snwoboard': 'snowboard', 'skiis': 'skis', 'aparel': 'apparel', 'booots': 'boots' };
            const suggestion = typos[query];
            if (suggestion) {
              dymLink.textContent = suggestion;
              dymLink.href = 'search.html?q=' + encodeURIComponent(suggestion);
              dym.hidden = false;
            } else {
              dym.hidden = true;
            }
          }
        } else {
          // No query — make sure the suggestion is hidden
          if (dym) dym.hidden = true;
        }

        // Sort
        if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
        if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

        counter.textContent = list.length + ' result' + (list.length !== 1 ? 's' : '');

        if (list.length === 0) {
          grid.innerHTML = '<p style="color:#8d99ae;grid-column:1/-1">No products found. Try a different search.</p>';
          return;
        }

        grid.innerHTML = list.map(p => `
          <article class="product-card" onclick="location.href='product.html?id=${p.id}'">
            <img src="${p.img}" alt="${p.name}" loading="lazy">
            <div class="product-body">
              <div class="product-body-row">
                <div>
                  <p class="product-card-category">${p.category}</p>
                  <h3>${p.name}</h3>
                  <p class="product-card-price">$${p.price}</p>
                </div>
                <button
                  class="card-add"
                  type="button"
                  aria-label="Add ${p.name} to cart"
                  onclick="event.stopPropagation(); handleAddToCart(${JSON.stringify(p).replace(/"/g, '&quot;')})">+</button>
              </div>
            </div>
          </article>
        `).join('');
      }

      /* --- Add to cart with feedback --- */
      function handleAddToCart(product) {
        addToCart(product);
        renderCartPreview();
        // Flash button feedback via brief class toggle
        const btn = event.currentTarget;
        btn.textContent = '✓';
        btn.style.background = '#e63946';
        btn.style.color = '#fff';
        btn.style.borderColor = '#e63946';
        setTimeout(() => {
          btn.textContent = '+';
          btn.style.background = '';
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 900);
      }

      /* --- Render "In your cart" preview --- */
      function renderCartPreview() {
        const cart    = getCart();
        const preview = document.getElementById('cartPreview');
        const actions = document.getElementById('cartPreviewActions');

        if (cart.length === 0) {
          preview.innerHTML = '<p class="cart-preview-empty">Your cart is empty.</p>';
          actions.hidden = true;
          return;
        }

        preview.innerHTML = `
          <div class="cart-preview-list">
            ${cart.map(item => `
              <div class="cart-preview-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-preview-item-info">
                  <strong>${item.name}</strong>
                  <p>${item.category} &middot; Qty: ${item.qty}</p>
                </div>
                <span class="cart-preview-item-price">$${(item.price * item.qty).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>`;
        actions.hidden = false;
      }

      /* --- Search trigger --- */
      function runSearch() {
        renderProducts();
      }

      /* --- Read ?q= from URL and pre-fill --- */
      function initSearchPage() {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        if (q) {
          document.getElementById('searchInput').value = q;
          document.getElementById('headerSearch').value = q;
        }
        renderProducts();
        renderCartPreview();

        // Live filter on Enter key
        document.getElementById('searchInput').addEventListener('keydown', e => {
          if (e.key === 'Enter') renderProducts();
        });
      }

      document.addEventListener('DOMContentLoaded', initSearchPage);