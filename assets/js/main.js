/*
 * aimanelasad.com — article overlay logic (no dependencies)
 *
 * Behaviour:
 *  - The landing view shows #header. Clicking a nav link (or opening a URL with
 *    a hash such as /#cv) fades the header out and fades the matching <article>
 *    in, inside #main.
 *  - The article is closed by its ✕ button, the Escape key, clicking on the dim
 *    area outside the panel, or the browser's back button.
 *  - The URL hash is the single source of truth: every change (click, back/
 *    forward, manual edit) goes through sync(), which moves the view towards
 *    the hash. Changes that arrive while a transition is running are not
 *    dropped — sync() runs again as soon as the transition has finished.
 */
(function () {
	'use strict';

	var DURATION = 325; // ms — must match --dur in main.css

	var body = document.body;
	var header = document.getElementById('header');
	var footer = document.getElementById('footer');
	var main = document.getElementById('main');
	var articles = Array.prototype.slice.call(main.querySelectorAll('article'));
	var ids = articles.map(function (a) { return a.id; });

	var current = null;   // id of the open article, or null
	var locked = false;   // true while a transition is running
	var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var delay = reduced ? 0 : DURATION;

	function byId(id) { return document.getElementById(id); }

	function reflow(el) { return el.offsetWidth; } // force style recalculation so transitions fire

	function targetFromHash() {
		var id = window.location.hash.replace(/^#/, '');
		return ids.indexOf(id) !== -1 ? id : null;
	}

	/* ---- URL helpers ---------------------------------------------------- */

	function open(id) { window.location.hash = '#' + id; }

	function close() {
		// Remove the fragment without leaving a dangling "#" in the URL.
		if (window.history.pushState) {
			window.history.pushState('', document.title, window.location.pathname + window.location.search);
			sync();
		} else {
			window.location.hash = '';
		}
	}

	/* ---- transitions ---------------------------------------------------- */

	function finish() {
		locked = false;
		sync();
	}

	// header → article
	function showFromHeader(id, initial) {
		locked = true;
		var article = byId(id);
		body.classList.add('is-article-visible');

		var step = function () {
			header.hidden = true;
			footer.hidden = true;
			main.hidden = false;
			article.hidden = false;
			reflow(article);
			article.classList.add('active');
			current = id;
			window.scrollTo(0, 0);
			article.setAttribute('tabindex', '-1');
			article.focus({ preventScroll: true });
			window.setTimeout(finish, initial ? 0 : delay);
		};

		if (initial) step(); else window.setTimeout(step, delay);
	}

	// article A → article B
	function switchTo(id) {
		locked = true;
		var old = byId(current);
		old.classList.remove('active');
		window.setTimeout(function () {
			old.hidden = true;
			var article = byId(id);
			article.hidden = false;
			reflow(article);
			article.classList.add('active');
			current = id;
			window.scrollTo(0, 0);
			article.setAttribute('tabindex', '-1');
			article.focus({ preventScroll: true });
			window.setTimeout(finish, delay);
		}, delay);
	}

	// article → header
	function hide() {
		locked = true;
		var article = byId(current);
		article.classList.remove('active');
		window.setTimeout(function () {
			article.hidden = true;
			main.hidden = true;
			header.hidden = false;
			footer.hidden = false;
			reflow(header);
			body.classList.remove('is-article-visible');
			window.scrollTo(0, 0);
			current = null;
			window.setTimeout(finish, delay);
		}, delay);
	}

	/* ---- reconcile view with URL ---------------------------------------- */

	function sync(initial) {
		if (locked) return;             // finish() will call sync() again
		var target = targetFromHash();
		if (target === current) return;
		if (target === null) hide();
		else if (current === null) showFromHeader(target, !!initial);
		else switchTo(target);
	}

	/* ---- wiring --------------------------------------------------------- */

	// Add a close button to every article.
	articles.forEach(function (article) {
		var btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'close';
		btn.setAttribute('aria-label', 'Close');
		btn.textContent = 'Close';
		btn.addEventListener('click', close);
		article.appendChild(btn);
	});

	// Escape closes the open article.
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && targetFromHash() !== null) close();
	});

	// Clicking on the dim area outside the panel closes it.
	main.addEventListener('click', function (e) {
		if (e.target === main && targetFromHash() !== null) close();
	});

	window.addEventListener('hashchange', function () { sync(); });
	window.addEventListener('popstate', function () { sync(); });

	// Initial state.
	window.addEventListener('load', function () {
		window.setTimeout(function () { body.classList.remove('is-preload'); }, 100);
		sync(true);
	});

	// Exposed for nav links that want to open programmatically (not required).
	window.siteOpen = open;
})();
