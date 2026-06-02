/* ── Payment page logic ──────────────────────────────── */

      const SHIPPING = 12;
      let promoApplied = false;
      let promoAmount  = 0;

      function renderSummary() {
        const cart     = getCart();
        const itemsEl  = document.getElementById('summaryItems');
        const subEl    = document.getElementById('summarySubtotal');
        const shipEl   = document.getElementById('summaryShipping');
        const totalEl  = document.getElementById('summaryTotal');

        const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
        const shipping = subtotal >= 500 ? 0 : SHIPPING;
        const total    = subtotal + shipping - promoAmount;

        itemsEl.innerHTML = cart.length === 0
          ? '<p style="color:#6b6b74;font-size:0.9rem">Your cart is empty.</p>'
          : cart.map(item => `
              <div class="summary-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="summary-item-info">
                  <h4>${item.name}</h4>
                  <p class="item-category">${item.category}</p>
                  <p class="item-qty">&times; ${item.qty}</p>
                </div>
                <span class="summary-item-price">$${(item.price * item.qty).toLocaleString()}</span>
              </div>`).join('');

        subEl.textContent  = '$' + subtotal.toLocaleString();
        shipEl.textContent = shipping === 0 ? 'Free' : '$' + shipping;
        totalEl.textContent = '$' + Math.max(0, total).toLocaleString();
      }

      function applyPromo() {
        const code = document.getElementById('promoCode').value.trim().toUpperCase();
        const msg  = document.getElementById('promoMsg');
        const row  = document.getElementById('promoRow');
        const disc = document.getElementById('promoDiscount');

        const codes = { 'OMEO10': 10, 'SNOW20': 20, 'HIRE15': 15 };

        if (codes[code]) {
          promoAmount  = codes[code];
          promoApplied = true;
          msg.textContent = `Code applied! −$${promoAmount} off your order.`;
          msg.style.color = '#2a9d4e';
          msg.style.display = 'block';
          disc.textContent = '−$' + promoAmount;
          row.style.display = 'flex';
          renderSummary();
        } else {
          promoApplied = false;
          promoAmount  = 0;
          msg.textContent = 'Invalid promo code.';
          msg.style.color = '#e63946';
          msg.style.display = 'block';
          row.style.display = 'none';
          renderSummary();
        }
      }

      function formatCard(input) {
        let v = input.value.replace(/\D/g, '').slice(0, 16);
        input.value = v.replace(/(.{4})/g, '$1 ').trim();
      }

      function handleCheckout(e) {
        e.preventDefault();
        /* Save cart to sessionStorage BEFORE clearing, so confirmation page can read it */
        const cartSnapshot = localStorage.getItem('omeoCart') || '[]';
        sessionStorage.setItem('lastOrder', cartSnapshot);
        localStorage.removeItem('omeoCart');
        location.href = 'confirmation.html';
      }

      document.addEventListener('DOMContentLoaded', renderSummary);