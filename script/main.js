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
});
