// Centralized site-wide scripts
// Logout handler: capture clicks on elements with .logout-btn or .logout-button
document.addEventListener('click', function (e) {
	try {
		const el = e.target.closest && e.target.closest('.logout-btn, .logout-button');
		if (!el) return;
		e.preventDefault();
		// Optional: add a small fade/feedback here before redirect
		window.location.href = 'TiendaOnline.html';
	} catch (err) {
		// Fail silently - don't break other scripts
		console.error('Logout handler error', err);
	}
});

// You can add other global handlers below (to keep onclicks out of templates)
