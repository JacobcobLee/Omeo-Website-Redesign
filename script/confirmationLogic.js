      /* ── Confirmation page logic ─────────────────────────── */

      const ORDER_NUM = Math.floor(60 + Math.random() * 40);

      function boot() {
        /* Set order number */
        document.getElementById('orderNum').textContent        = ORDER_NUM;
        document.getElementById('orderNumDetail').textContent  = ORDER_NUM;

        /* Build order details from whatever was in the cart before payment cleared it */
        const stored = sessionStorage.getItem('lastOrder');
        const items  = stored ? JSON.parse(stored) : [];

        renderOrderDetails(items);
        renderAlsoBought(items.map(i => i.id));
      }

      function renderOrderDetails(items) {
        const el       = document.getElementById('orderDetailItems');
        const totalEl  = document.getElementById('detailTotal');
        const shipEl   = document.getElementById('detailShipping');

        if (items.length === 0) {
          el.innerHTML = '<div class="order-detail-row"><span>No items recorded</span><strong>—</strong></div>';
          totalEl.textContent = '—';
          return;
        }

        const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
        const shipping = subtotal >= 500 ? 0 : 12;
        const total    = subtotal + shipping;

        el.innerHTML = items.map(item => `
          <div class="order-detail-row">
            <span>${item.name} ×${item.qty}</span>
            <strong>$${(item.price * item.qty).toLocaleString()}</strong>
          </div>`).join('');

        shipEl.textContent = shipping === 0 ? 'Free' : '$' + shipping;
        totalEl.textContent = '$' + total.toLocaleString();
      }

      function toggleOrderDetails() {
        const panel = document.getElementById('orderDetailsPanel');
        panel.classList.toggle('is-open');
        const btn = document.querySelector('.btn-order-details');
        btn.textContent = panel.classList.contains('is-open') ? 'HIDE DETAILS' : 'ORDER DETAILS';
      }

      function renderAlsoBought(purchasedIds) {
        const carousel   = document.getElementById('confirmCarousel');
        const section    = document.getElementById('alsoBoughtConfirm');
        const suggestions = OMEO_PRODUCTS.filter(p => !purchasedIds.includes(p.id));

        if (suggestions.length === 0) { section.hidden = true; return; }

        carousel.innerHTML = suggestions.map(p => `
          <article class="product-card" onclick="location.href='product.html?id=${p.id}'" style="cursor:pointer">
            <img src="${p.img}" alt="${p.name}">
            <div class="product-body">
              <div class="product-body-row">
                <div>
                  <h3>${p.name}</h3>
                  <p>$${p.price}</p>
                </div>
                <button class="card-add" type="button"
                  onclick="event.stopPropagation(); addToCart(${JSON.stringify(p).replace(/"/g,'&quot;')})"
                  aria-label="Add ${p.name} to cart">+</button>
              </div>
            </div>
          </article>`).join('');
      }

      /* Save cart to sessionStorage before payment.html clears it */
      document.addEventListener('DOMContentLoaded', () => {
        /* If arriving fresh (cart already cleared by payment), try sessionStorage */
        if (!sessionStorage.getItem('lastOrder')) {
          const cart = getCart();
          if (cart.length > 0) sessionStorage.setItem('lastOrder', JSON.stringify(cart));
        }
        boot();
      });