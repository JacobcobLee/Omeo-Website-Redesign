/* ============================================================
   OMEO — Shared JS (all pages load this file)
   ============================================================ */

/* ---------- Cart helpers (localStorage) ---------- */
function getCart() {
	try { return JSON.parse(localStorage.getItem('omeoCart') || '[]'); }
	catch(e) { return []; }
}
function saveCart(cart) {
	localStorage.setItem('omeoCart', JSON.stringify(cart));
}
function addToCart(product) {
	const cart = getCart();
	const existing = cart.find(item => item.id === product.id);
	if (existing) {
		existing.qty += 1;
	} else {
		cart.push({ ...product, qty: 1 });
	}
	saveCart(cart);
	updateAllCartBadges();
}
function updateAllCartBadges() {
	const cart = getCart();
	const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
	document.querySelectorAll('.cart-badge').forEach(badge => {
		badge.textContent = count;
		badge.hidden = count === 0;
	});
}

/* ---------- Hamburger / mobile menu ---------- */
function initMobileMenu() {
	const hamburger    = document.getElementById('hamburger');
	const mobileMenu   = document.getElementById('mobileMenu');
	const closeBtn     = document.getElementById('mobileMenuClose');
	if (!hamburger || !mobileMenu) return;

	function openMenu() {
		mobileMenu.classList.add('is-open');
		mobileMenu.setAttribute('aria-hidden', 'false');
		hamburger.setAttribute('aria-expanded', 'true');
		document.body.style.overflow = 'hidden';
	}
	function closeMenu() {
		mobileMenu.classList.remove('is-open');
		mobileMenu.setAttribute('aria-hidden', 'true');
		hamburger.setAttribute('aria-expanded', 'false');
		document.body.style.overflow = '';
	}

	hamburger.addEventListener('click', openMenu);
	if (closeBtn) closeBtn.addEventListener('click', closeMenu);
	// Close on overlay backdrop click (outside the menu content)
	mobileMenu.addEventListener('click', function(e) {
		if (e.target === mobileMenu) closeMenu();
	});
	// Close on Escape
	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape') closeMenu();
	});
}

/* ---------- Featured carousel ---------- */
function initCarousel() {
	const carousel   = document.querySelector('[data-carousel]');
	const prevButton = document.querySelector('[data-carousel-prev]');
	const nextButton = document.querySelector('[data-carousel-next]');
	if (!carousel || !prevButton || !nextButton) return;

	const scrollAmount = () => Math.max(260, carousel.clientWidth * 0.75);
	prevButton.addEventListener('click', () => carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
	nextButton.addEventListener('click', () => carousel.scrollBy({ left:  scrollAmount(), behavior: 'smooth' }));
}

/* ---------- Contact form ---------- */
function initContactForm() {
	const form = document.getElementById('contactForm');
	if (!form) return;
	form.addEventListener('submit', function(e) {
		e.preventDefault();
		const name  = document.getElementById('name').value.trim();
		const email = document.getElementById('email').value.trim();
		console.log('Contact form submitted', { name, email });
		alert('Thanks, ' + (name || 'friend') + '! This is a demo form.');
		form.reset();
	});
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', function() {
	updateAllCartBadges();
	initMobileMenu();
	initCarousel();
	initContactForm();
});
