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
 *  - Without JavaScript the CSS shows all sections stacked below the header
 *    (see `html:not(.js)` rules in main.css), so nothing here is load-bearing
 *    for reading the content.
 */
(function () {
	'use strict';

	var DURATION = 325; // ms — must match --dur in main.css

	var body = document.body;
	var wrapper = document.getElementById('wrapper');
	var header = document.getElementById('header');
	var footer = document.getElementById('footer');
	var main = document.getElementById('main');
	var articles = Array.prototype.slice.call(main.querySelectorAll('article'));
	var ids = articles.map(function (a) { return a.id; });
	var baseTitle = document.title;

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

	function titleFor(article) {
		var h = article.querySelector('h2');
		return h ? h.textContent.trim() + ' – ' + baseTitle : baseTitle;
	}

	/* ---- URL helpers ---------------------------------------------------- */

	function close() {
		// Replace the "#section" entry with the plain URL instead of pushing a new
		// one, so the Back button does not re-open the article just closed and the
		// history does not grow with every open/close cycle.
		if (window.history.replaceState) {
			window.history.replaceState(null, '', window.location.pathname + window.location.search);
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

	function focusArticle(article) {
		article.setAttribute('tabindex', '-1');
		article.focus({ preventScroll: true });
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
			document.title = titleFor(article);
			window.scrollTo(0, 0);
			focusArticle(article);
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
			document.title = titleFor(article);
			window.scrollTo(0, 0);
			focusArticle(article);
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
			document.title = baseTitle;
			// Return keyboard focus to the nav link of the section just closed
			// (or to the first nav link for sections without one, e.g. #legal).
			var link = header.querySelector('nav a[href="#' + article.id + '"]') || header.querySelector('nav a');
			if (link) link.focus({ preventScroll: true });
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

	// Add a close button to every article — first in DOM order so that it is
	// the first Tab stop, matching its visual position (top right).
	articles.forEach(function (article) {
		var btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'close';
		btn.setAttribute('aria-label', 'Close');
		btn.textContent = 'Close';
		btn.addEventListener('click', close);
		article.insertBefore(btn, article.firstElementChild);
	});

	// Escape closes the open article.
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && targetFromHash() !== null) close();
	});

	// Clicking on the dim area outside the panel closes it. Both mousedown and
	// click must land outside the panel, so that drag-selecting text that ends
	// outside the panel (click fires on the common ancestor) does not close it.
	var pressOutside = false;
	function outsidePanel(target) {
		var id = targetFromHash();
		return id !== null && !byId(id).contains(target);
	}
	wrapper.addEventListener('mousedown', function (e) { pressOutside = outsidePanel(e.target); });
	wrapper.addEventListener('click', function (e) {
		if (pressOutside && outsidePanel(e.target)) close();
		pressOutside = false;
	});

	window.addEventListener('hashchange', function () { sync(); });
	window.addEventListener('popstate', function () { sync(); });

	// Initial state: reconcile immediately (the script sits at the end of
	// <body>, so the DOM is complete) — deep links must not wait for images
	// or fonts to finish loading. Only the entrance animation waits for load.
	sync(true);
	window.addEventListener('load', function () {
		window.setTimeout(function () { body.classList.remove('is-preload'); }, 100);
	});
})();
