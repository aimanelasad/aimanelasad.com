/*
 * AI atom interactions (landing page):
 *  - hovering / focusing / tapping an electron shows a short description below
 *    the atom and freezes that electron while you read
 *  - electrons can be grabbed with the pointer, scrubbed along their orbit and
 *    flicked: they keep the spin you give them and ease back to normal speed
 *
 * Everything degrades gracefully: without Web Animations API support the
 * electrons simply keep their CSS animation, and the descriptions still work.
 */
(function () {
	'use strict';

	var figure = document.querySelector('.atom');
	if (!figure) return;
	var svg = figure.querySelector('svg');
	if (!svg || !svg.createSVGPoint) return;

	var CX = 230, CY = 180, A = 160, B = 62;
	var ROTS = [0, 60, 120];

	/* ---- arc-length lookup: ellipse parameter t -> fraction of path length --- */
	var N = 256, cum = new Float64Array(N + 1), total = 0;
	(function () {
		var prev = 0;
		for (var i = 1; i <= N; i++) {
			var t = (i - 0.5) / N * 2 * Math.PI;
			var ds = Math.sqrt(Math.pow(A * Math.sin(t), 2) + Math.pow(B * Math.cos(t), 2)) * (2 * Math.PI / N);
			prev += ds;
			cum[i] = prev;
		}
		total = prev;
	})();
	function fracFromT(t) {
		t = ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		var x = t / (2 * Math.PI) * N, i = Math.floor(x);
		if (i >= N) return 1;
		var lo = cum[i], hi = cum[i + 1];
		return (lo + (hi - lo) * (x - i)) / total;
	}

	function svgPoint(evt) {
		var pt = svg.createSVGPoint();
		pt.x = evt.clientX; pt.y = evt.clientY;
		return pt.matrixTransform(svg.getScreenCTM().inverse());
	}

	function fracFromPointer(evt, rotDeg) {
		var p = svgPoint(evt);
		var r = -rotDeg * Math.PI / 180;
		var dx = p.x - CX, dy = p.y - CY;
		var x = dx * Math.cos(r) - dy * Math.sin(r);
		var y = dx * Math.sin(r) + dy * Math.cos(r);
		return fracFromT(Math.atan2(y / B, x / A));
	}

	var electrons = [].slice.call(figure.querySelectorAll('.electron'));

	electrons.forEach(function (g, idx) {
		var key = 'e' + (idx + 1);
		var baseRate = idx === 1 ? -1 : 1;   // middle electron orbits the other way
		var anim = null, decayRaf = null;

		function getAnim() {
			if (anim) return anim;
			if (!g.getAnimations) return null;
			var as = g.getAnimations();
			for (var i = 0; i < as.length; i++) {
				if (as[i].animationName === 'atom-orbit') { anim = as[i]; break; }
			}
			if (anim && baseRate < 0 && anim.playbackRate > 0) anim.playbackRate = baseRate;
			return anim;
		}
		// establish the reversed direction once the animation exists (CSS animations
		// with a negative delay can appear in getAnimations() a moment late)
		[0, 300, 1200].forEach(function (ms) { window.setTimeout(getAnim, ms); });

		/* ---- description show/hide ---- */
		var pinned = false;
		function show() { figure.classList.add('show-' + key); var a = getAnim(); if (a && !dragging) a.playbackRate = 0; }
		function hide() {
			if (pinned) return;
			figure.classList.remove('show-' + key);
			var a = getAnim(); if (a && !dragging && !decayRaf) a.playbackRate = baseRate;
		}
		g.addEventListener('pointerenter', function () { if (!dragging) show(); });
		g.addEventListener('pointerleave', function () { hide(); });
		g.addEventListener('focus', show);
		g.addEventListener('blur', function () { pinned = false; hide(); });

		/* ---- grab, scrub, flick ---- */
		var dragging = false, moved = false, lastF = 0, lastT = 0, vel = 0;

		function wrap(d) { if (d > 0.5) d -= 1; if (d < -0.5) d += 1; return d; }

		g.addEventListener('pointerdown', function (evt) {
			var a = getAnim();
			moved = false;
			if (!a) return;
			dragging = true;
			if (decayRaf) { window.cancelAnimationFrame(decayRaf); decayRaf = null; }
			a.playbackRate = 0;
			lastF = fracFromPointer(evt, ROTS[idx]);
			lastT = evt.timeStamp;
			vel = 0;
			try { g.setPointerCapture(evt.pointerId); } catch (e) {}
			evt.preventDefault();
		});

		g.addEventListener('pointermove', function (evt) {
			if (!dragging) return;
			var a = getAnim(); if (!a) return;
			var f = fracFromPointer(evt, ROTS[idx]);
			var d = wrap(f - lastF);
			if (Math.abs(d) > 0.001) moved = true;
			var timing = a.effect.getTiming();
			a.currentTime = Number(a.currentTime) + d * timing.duration;
			var dt = Math.max(8, evt.timeStamp - lastT) / 1000;
			vel = 0.7 * vel + 0.3 * (d / dt);          // fractions per second, smoothed
			lastF = f; lastT = evt.timeStamp;
		});

		function release(evt) {
			if (!dragging) { return; }
			dragging = false;
			var a = getAnim(); if (!a) return;
			if (!moved) {
				// tap: pin/unpin the description (mainly for touch)
				pinned = !pinned;
				if (pinned) show(); else { figure.classList.remove('show-' + key); a.playbackRate = baseRate; }
				return;
			}
			var timing = a.effect.getTiming();
			var rate = vel * timing.duration / 1000;   // 1 = one revolution per duration
			var max = 14;
			if (rate > max) rate = max;
			if (rate < -max) rate = -max;
			if (Math.abs(rate) < 0.4) rate = baseRate;
			a.playbackRate = rate;
			// ease back to the natural pace
			var prev = performance.now();
			(function decay(now) {
				var dt = (now - prev) / 1000; prev = now;
				var r = a.playbackRate;
				r += (baseRate - r) * Math.min(1, dt / 1.6);
				if (Math.abs(r - baseRate) < 0.05) {
					a.playbackRate = baseRate; decayRaf = null; return;
				}
				a.playbackRate = r;
				decayRaf = window.requestAnimationFrame(decay);
			})(prev);
		}
		g.addEventListener('pointerup', release);
		g.addEventListener('pointercancel', release);
	});
})();
