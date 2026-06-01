/* ============================================================
         Product page data + logic
         ============================================================ */
      const PRODUCTS_DATA = {
        snowboard: {
          name:     "Turbo Men's Snowboard",
          price:    699,
          tag:      'Snowboards',
          tagColor: '#2a9d4e',
          tagline:  'Built for speed. Designed for control.',
          images: [
            'assets/bataleon-snow-board.png',
          ],
          sizes:   ['152 cm', '156 cm', '160 cm', '164 cm', '168 cm'],
          colours: ['Midnight Black', 'Arctic Blue', 'Storm Grey'],
          description: 'The Turbo Men\'s is an all-mountain board engineered for intermediate to advanced riders. Its hybrid camber profile delivers explosive pop off jumps while maintaining edge grip on hardpack. Lightweight paulownia wood core with carbon stringers for responsive, snappy turns at any speed.',
          specs: [
            { label: 'Length',       value: '156 cm' },
            { label: 'Profile',      value: 'Hybrid Camber' },
            { label: 'Flex',         value: '7/10 (Stiff)' },
            { label: 'Core',         value: 'Paulownia Wood' },
            { label: 'Base',         value: 'Sintered 7200' },
            { label: 'Terrain',      value: 'All-Mountain / Freeride' },
            { label: 'Rider Level',  value: 'Intermediate – Advanced' },
          ]
        },
        hoodie: {
          name:     'Essentials Cotton Hoodie',
          price:    89,
          tag:      'Apparel',
          tagColor: '#4361ee',
          tagline:  'Off-mountain comfort. All-day warmth.',
          images: [
            'assets/hoodie.png',
          ],
          sizes:   ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
          colours: ['Black', 'Slate Grey', 'Off-White'],
          description: 'A heavyweight 380 gsm organic cotton fleece hoodie built for cold mornings and après sessions. Relaxed fit with a double-lined hood, ribbed cuffs, and a kangaroo pocket. Minimal branding keeps it clean — the Omeo logo sits small on the left chest.',
          specs: [
            { label: 'Material',  value: '100% Organic Cotton Fleece (380 gsm)' },
            { label: 'Fit',       value: 'Relaxed Unisex' },
            { label: 'Sizes',     value: 'XS – XXL' },
            { label: 'Hood',      value: 'Double-lined' },
            { label: 'Pockets',   value: 'Kangaroo front pocket' },
            { label: 'Care',      value: 'Machine wash cold' },
          ]
        }
      };

      /* --- Fallback for unknown IDs --- */
      function getFallbackProduct(id) {
        // Try matching by id prefix in OMEO_PRODUCTS
        const match = OMEO_PRODUCTS.find(p => p.id === id);
        if (!match) return null;
        return {
          name:        match.name,
          price:       match.price,
          tag:         match.category,
          tagColor:    '#2a9d4e',
          tagline:     'Premium gear for every mountain.',
          images:      [match.img],
          sizes:       ['One Size'],
          colours:     ['Default'],
          description: 'Premium OMEO gear, built for the mountain.',
          specs:       []
        };
      }

      /* --- State --- */
      let currentProduct = null;
      let activeThumb    = 0;
      let isLiked        = false;

      /* --- Build and mount the product UI --- */
      function mountProduct(product) {
        currentProduct = product;
        const wrap = document.getElementById('productPageWrap');

        wrap.innerHTML = `
          <!-- Thumbnail strip -->
          <div class="thumb-strip-row">
            <button class="thumb-nav-btn" id="thumbPrev" aria-label="Previous image">‹</button>
            <div class="thumb-strip" id="thumbStrip">
              ${product.images.map((src, i) => `
                <div class="thumb-item ${i === 0 ? 'active' : ''}"
                     data-index="${i}"
                     onclick="setActiveThumb(${i})"
                     role="button"
                     tabindex="0"
                     aria-label="Product image ${i + 1}">
                  <img src="${src}" alt="Product view ${i + 1}" loading="lazy">
                </div>`).join('')}
            </div>
            <button class="thumb-nav-btn" id="thumbNext" aria-label="Next image">›</button>
          </div>

          <!-- Main image -->
          <div class="product-main-img">
            <img id="mainImg" src="${product.images[0]}" alt="${product.name}">
            <button class="wishlist-btn" id="wishlistBtn" aria-label="Add to wishlist" aria-pressed="false">♡</button>
          </div>

          <!-- Product info -->
          <div class="product-info">
            <h1 class="product-name">${product.name}</h1>
            <span class="product-tag" style="background:${product.tagColor}">${product.tag}</span>

            <div class="product-price"><sup>$</sup>${product.price}</div>
            <p class="product-tagline">${product.tagline}</p>

            <div class="product-selectors">
              <div class="selector-group">
                <label for="sizeSelect">Size</label>
                <select id="sizeSelect" aria-label="Select size">
                  ${product.sizes.map(s => `<option>${s}</option>`).join('')}
                </select>
              </div>
              <div class="selector-group">
                <label for="colourSelect">Colour</label>
                <select id="colourSelect" aria-label="Select colour">
                  ${product.colours.map(c => `<option>${c}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="product-actions">
              <button class="btn-cart" id="addToCartBtn" type="button">CART</button>
              <button class="btn-buy"  id="buyNowBtn"    type="button">BUY</button>
            </div>

            <!-- Description accordion -->
            <div class="accordion is-open" id="descAccordion">
              <button class="accordion-header" aria-expanded="true" aria-controls="descBody">
                Description
                <span class="accordion-icon" aria-hidden="true">▲</span>
              </button>
              <div class="accordion-body" id="descBody" role="region">
                <div class="accordion-body-inner">
                  <p>${product.description}</p>
                  ${product.specs.length ? `
                    <ul class="specs-list">
                      ${product.specs.map(s =>
                        `<li><strong>${s.label}</strong><span>${s.value}</span></li>`
                      ).join('')}
                    </ul>` : ''}
                </div>
              </div>
            </div>
          </div>`;

        /* Wire thumbnail nav */
        document.getElementById('thumbPrev').addEventListener('click', () =>
          setActiveThumb((activeThumb - 1 + product.images.length) % product.images.length)
        );
        document.getElementById('thumbNext').addEventListener('click', () =>
          setActiveThumb((activeThumb + 1) % product.images.length)
        );

        /* Wire wishlist */
        document.getElementById('wishlistBtn').addEventListener('click', toggleWishlist);

        /* Wire CART button */
        document.getElementById('addToCartBtn').addEventListener('click', () => {
          const productEntry = OMEO_PRODUCTS.find(p => p.id === currentProductId) || {
            id:       currentProductId,
            name:     product.name,
            category: product.tag,
            price:    product.price,
            img:      product.images[0]
          };
          addToCart(productEntry);
          const btn = document.getElementById('addToCartBtn');
          btn.textContent = 'ADDED ✓';
          btn.style.borderColor = '#e63946';
          btn.style.color = '#e63946';
          setTimeout(() => {
            btn.textContent   = 'CART';
            btn.style.borderColor = '';
            btn.style.color       = '';
          }, 1200);
        });

        /* Wire BUY button → go straight to payment */
        document.getElementById('buyNowBtn').addEventListener('click', () => {
          const productEntry = OMEO_PRODUCTS.find(p => p.id === currentProductId) || {
            id:       currentProductId,
            name:     product.name,
            category: product.tag,
            price:    product.price,
            img:      product.images[0]
          };
          addToCart(productEntry);
          location.href = 'payment.html';
        });

        /* Wire accordion */
        document.getElementById('descAccordion')
          .querySelector('.accordion-header')
          .addEventListener('click', toggleAccordion);

        /* Update document title */
        document.title = `OMEO — ${product.name}`;
      }

      function setActiveThumb(index) {
        activeThumb = index;
        const mainImg = document.getElementById('mainImg');
        if (mainImg) {
          mainImg.style.opacity = '0.5';
          mainImg.src = currentProduct.images[index];
          mainImg.onload = () => { mainImg.style.opacity = '1'; };
        }
        document.querySelectorAll('.thumb-item').forEach((el, i) => {
          el.classList.toggle('active', i === index);
        });
      }

      function toggleWishlist() {
        isLiked = !isLiked;
        const btn = document.getElementById('wishlistBtn');
        btn.classList.toggle('is-liked', isLiked);
        btn.setAttribute('aria-pressed', isLiked);
        btn.textContent = isLiked ? '♥' : '♡';
      }

      function toggleAccordion() {
        const acc = document.getElementById('descAccordion');
        const isOpen = acc.classList.toggle('is-open');
        acc.querySelector('.accordion-header').setAttribute('aria-expanded', isOpen);
      }

      /* --- Boot --- */
      let currentProductId;
      document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        currentProductId = params.get('id') || 'snowboard';

        let product = PRODUCTS_DATA[currentProductId];
        if (!product) product = getFallbackProduct(currentProductId);
        if (!product) {
          document.getElementById('productPageWrap').innerHTML =
            '<p style="padding:3rem 1rem;color:#8d99ae;text-align:center">Product not found. <a href="search.html" style="color:#e63946">Browse catalogue</a></p>';
          return;
        }
        mountProduct(product);
      });