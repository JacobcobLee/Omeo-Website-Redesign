document.addEventListener('DOMContentLoaded', function(){
	const form = document.getElementById('contactForm');
	if(form){
		form.addEventListener('submit', function(e){
			e.preventDefault();
			const name = document.getElementById('name').value.trim();
			const email = document.getElementById('email').value.trim();
			console.log('Contact form submitted', {name, email});
			alert('Thanks, ' + (name || 'friend') + '! This is a demo form.');
			form.reset();
		});
	}

	const carousel = document.querySelector('[data-carousel]');
	const prevButton = document.querySelector('[data-carousel-prev]');
	const nextButton = document.querySelector('[data-carousel-next]');

	if(carousel && prevButton && nextButton){
		const scrollAmount = () => Math.max(260, carousel.clientWidth * 0.75);

		prevButton.addEventListener('click', function(){
			carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
		});

		nextButton.addEventListener('click', function(){
			carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
		});
	}
});
