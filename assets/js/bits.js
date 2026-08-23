/*
 * Background "bits": ones and zeros drifting slowly upwards behind the page.
 * Deliberately subtle — low opacity, slow, few glyphs — so that the text stays
 * readable. Honours prefers-reduced-motion (static frame) and pauses when the
 * tab is hidden.
 */
(function () {
	'use strict';

	var canvas = document.getElementById('bits');
	if (!canvas || !canvas.getContext) return;
	var ctx = canvas.getContext('2d');

	var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var DPR = Math.min(window.devicePixelRatio || 1, 2);
	var W = 0, H = 0;
	var bits = [];
	var COUNT = 0;
	var raf = null;
	var last = 0;

	function rand(a, b) { return a + Math.random() * (b - a); }

	function makeBit(fresh) {
		var size = rand(11, 26);
		return {
			x: rand(0, W),
			y: fresh ? H + size : rand(0, H),
			size: size,
			v: rand(6, 18) * (size / 18),              // px / s — larger glyphs drift a bit faster (parallax)
			sway: rand(0.2, 0.6),                       // horizontal sway amplitude factor
			phase: rand(0, Math.PI * 2),
			alpha: rand(0.05, 0.16),
			ch: Math.random() < 0.5 ? '0' : '1',
			flip: rand(4, 14),                          // seconds until the glyph flips 0 <-> 1
			t: rand(0, 4)
		};
	}

	function resize() {
		W = window.innerWidth;
		H = window.innerHeight;
		if (!W || !H) return;                       // not laid out yet (hidden tab) — retried from frame()
		canvas.width = Math.round(W * DPR);
		canvas.height = Math.round(H * DPR);
		canvas.style.width = W + 'px';
		canvas.style.height = H + 'px';
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
		// density: roughly one glyph per 25 000 px², capped
		COUNT = Math.max(20, Math.min(90, Math.round((W * H) / 25000)));
		while (bits.length < COUNT) bits.push(makeBit(false));
		bits.length = COUNT;
		draw(0);
	}

	function draw(dt) {
		ctx.clearRect(0, 0, W, H);
		ctx.textBaseline = 'middle';
		ctx.textAlign = 'center';
		for (var i = 0; i < bits.length; i++) {
			var b = bits[i];
			if (dt) {
				b.y -= b.v * dt;
				b.t += dt;
				if (b.t > b.flip) { b.t = 0; b.ch = b.ch === '0' ? '1' : '0'; b.flip = rand(4, 14); }
				if (b.y < -b.size) bits[i] = b = makeBit(true);
			}
			var x = b.x + Math.sin(b.y / 90 + b.phase) * b.size * b.sway;
			// fade in at the bottom edge, fade out towards the top
			var edge = Math.min(1, (H - b.y) / 80, (b.y + b.size) / 80);
			var a = b.alpha * Math.max(0, edge) * (0.85 + 0.15 * Math.sin(b.t * 2 + b.phase));
			ctx.font = '300 ' + b.size + 'px "Source Sans 3", "Segoe UI", sans-serif';
			ctx.fillStyle = 'rgba(190, 215, 235,' + a.toFixed(3) + ')';
			ctx.fillText(b.ch, x, b.y);
		}
	}

	function frame(ts) {
		if (W !== window.innerWidth || H !== window.innerHeight) resize();
		if (!W || !H) { raf = window.requestAnimationFrame(frame); return; }
		if (!last) last = ts;
		var dt = Math.min(0.05, (ts - last) / 1000); // clamp so a backgrounded tab does not jump
		last = ts;
		draw(dt);
		raf = window.requestAnimationFrame(frame);
	}

	function start() {
		if (reduced || raf) return;
		last = 0;
		raf = window.requestAnimationFrame(frame);
	}

	function stop() {
		if (raf) { window.cancelAnimationFrame(raf); raf = null; }
	}

	window.addEventListener('resize', resize);
	window.addEventListener('load', resize);
	document.addEventListener('visibilitychange', function () {
		if (document.hidden) stop(); else { resize(); start(); }
	});

	resize();
	start();
})();
