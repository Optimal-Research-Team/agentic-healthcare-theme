/* Agentic theme — interactions */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ------------------------------------------------------------------
       1. Stripe-style flowing gradient (WebGL, CSS fallback underneath)
       ------------------------------------------------------------------ */
    var FRAG = [
        'precision mediump float;',
        'uniform vec2 r; uniform float t;',
        'vec3 c1 = vec3(.478,.451,1.);',   // #7a73ff
        'vec3 c2 = vec3(.937,0.,.561);',   // #ef008f
        'vec3 c3 = vec3(1.,.729,.153);',   // #ffba27
        'vec3 c4 = vec3(.431,.765,.957);', // #6ec3f4
        'vec3 c5 = vec3(.39,.36,1.);',     // #635bff
        'void main(){',
        '  vec2 uv = gl_FragCoord.xy / r;',
        '  vec2 p = uv; p.x *= r.x / r.y * .55;',
        '  float s = t * .06;',
        '  float n1 = sin(p.x * 2.3 + s * 3.1 + sin(p.y * 2.9 + s * 2.) * 1.4);',
        '  float n2 = sin(p.y * 3.1 - s * 2.4 + sin(p.x * 1.9 - s * 1.7) * 1.8);',
        '  float n3 = sin((p.x - p.y) * 2.6 + s * 2.2 + cos(p.y * 3.4 + s) * .9);',
        '  float n4 = sin((p.x + p.y * .6) * 3.3 - s * 1.6);',
        '  vec3 col = mix(c5, c2, smoothstep(-.9, .9, n1));',
        '  col = mix(col, c4, smoothstep(.15, 1., n2) * .85);',
        '  col = mix(col, c3, smoothstep(.35, 1., n3) * .9);',
        '  col = mix(col, c1, smoothstep(.5, 1., n4) * .6);',
        '  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233))) * 43758.5453) - .5) * .02;',
        '  gl_FragColor = vec4(col, 1.);',
        '}'
    ].join('\n');
    var VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }';

    function initGradient(canvas) {
        var gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
        if (!gl) return;
        function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
        var prog = gl.createProgram();
        gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
        gl.useProgram(prog);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prog, 'a');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        var uR = gl.getUniformLocation(prog, 'r');
        var uT = gl.getUniformLocation(prog, 't');

        var visible = true, raf = 0, start = performance.now() - Math.random() * 40000;
        function size() {
            var dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.6; // soft gradient: render low-res
            var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
            var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
            if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
            gl.uniform2f(uR, w, h);
        }
        function frame(now) {
            size();
            gl.uniform1f(uT, (now - start) / 1000);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            if (!reduceMotion && visible) raf = requestAnimationFrame(frame);
        }
        canvas.style.background = 'none';
        frame(performance.now());
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (e) {
                visible = e[0].isIntersecting;
                cancelAnimationFrame(raf);
                if (visible && !reduceMotion) raf = requestAnimationFrame(frame);
            }).observe(canvas);
        }
        window.addEventListener('resize', function () { if (reduceMotion) frame(performance.now()); });
    }
    document.querySelectorAll('[data-gradient]').forEach(initGradient);

    /* ------------------------------------------------------------------
       2. Generative cover art (seeded by slug)
       ------------------------------------------------------------------ */
    function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var PALETTES = [
        ['#635bff', '#ef008f', '#ffba27', '#6ec3f4'],
        ['#0a2540', '#635bff', '#6ec3f4', '#00d4aa'],
        ['#7a73ff', '#ff5996', '#ffcb57', '#a960ee'],
        ['#11efe3', '#635bff', '#ef008f', '#0a2540'],
        ['#ff7a3d', '#ef008f', '#7a73ff', '#ffba27'],
        ['#0a2540', '#00d4aa', '#6ec3f4', '#ffba27']
    ];

    function art(el) {
        var seed = el.getAttribute('data-art') || 'x';
        var R = rng(hash(seed));
        var pal = PALETTES[Math.floor(R() * PALETTES.length)];
        var id = 'a' + hash(seed).toString(36);
        var W = 800, H = 500;
        var blobs = '';
        for (var i = 0; i < 5; i++) {
            var c = pal[(i + 1) % pal.length];
            blobs += '<circle cx="' + (R() * W) + '" cy="' + (R() * H) + '" r="' + (140 + R() * 220) + '" fill="' + c + '" opacity="' + (.55 + R() * .4) + '"/>';
        }
        // grid
        var grid = '';
        for (var x = 40; x < W; x += 40) grid += '<path d="M' + x + ' 0V' + H + '"/>';
        for (var y = 40; y < H; y += 40) grid += '<path d="M0 ' + y + 'H' + W + '"/>';
        // ECG trace
        var baseY = 190 + R() * 140, pts = [[0, baseY]], cx = 0;
        while (cx < W) {
            cx += 70 + R() * 90;
            pts.push([cx, baseY]);
            if (R() > .35 && cx < W - 60) {
                var a = 30 + R() * 90;
                pts.push([cx + 10, baseY - 14], [cx + 18, baseY], [cx + 26, baseY + a * .35], [cx + 36, baseY - a], [cx + 48, baseY + a * .5], [cx + 58, baseY]);
                cx += 58;
            }
        }
        var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
        var angle = Math.floor(R() * 360);
        el.innerHTML =
            '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
            '<defs><filter id="' + id + 'b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>' +
            '<linearGradient id="' + id + 'g" gradientTransform="rotate(' + angle + ' .5 .5)"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[2] + '"/></linearGradient>' +
            '<linearGradient id="' + id + 'l" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff" stop-opacity=".95"/><stop offset=".8" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>' +
            '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 'g)"/>' +
            '<g filter="url(#' + id + 'b)">' + blobs + '</g>' +
            '<g stroke="#fff" stroke-opacity=".12" stroke-width="1">' + grid + '</g>' +
            '<path d="' + d + '" fill="none" stroke="url(#' + id + 'l)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>' +
            '</svg>';
    }
    document.querySelectorAll('[data-art]').forEach(art);

    /* ------------------------------------------------------------------
       3. Agent console demo (fictional data)
       ------------------------------------------------------------------ */
    var RUNS = [
        {
            name: 'referral-intake',
            outcome: '11 min of admin work, done before the coffee cools.',
            steps: [
                ['Fax received · <b>4 pages</b>', '0.4s'],
                ['Classified as <b>cardiology referral</b>', '1.1s'],
                ['Patient matched in EMR', '0.8s'],
                ['Missing ECG → <b>requested from sender</b>', '2.3s', 'flag'],
                ['Booked first available · <b>Tue 10:40</b>', '1.6s']
            ]
        },
        {
            name: 'pre-visit-history',
            outcome: 'History ready before the patient walks in.',
            steps: [
                ['Voice call with patient · <b>6 min</b>', '6m'],
                ['Chief complaint: <b>3 weeks of cough</b>', '0.9s'],
                ['Medications reconciled · <b>8 active</b>', '1.4s'],
                ['Red-flag screen · <b>none found</b>', '0.7s'],
                ['Summary filed to chart for review', '0.5s']
            ]
        },
        {
            name: 'lab-triage',
            outcome: 'Clinician reviews 3 results, not 42.',
            steps: [
                ['<b>42</b> results received via HL7', '0.3s'],
                ['<b>39</b> within normal range → filed', '1.2s'],
                ['<b>3</b> flagged for clinician review', '0.6s'],
                ['Critical K⁺ 6.1 → <b>on-call paged</b>', '0.4s', 'flag'],
                ['Patient follow-ups drafted', '2.0s']
            ]
        }
    ];

    function initConsole(root) {
        var list = root.querySelector('[data-console-steps]');
        var nameEl = root.querySelector('[data-console-name]');
        var statusEl = root.querySelector('[data-console-status]');
        var outcomeEl = root.querySelector('[data-console-outcome]');
        var tabsEl = root.querySelector('[data-console-tabs]');
        tabsEl.innerHTML = RUNS.map(function () { return '<i></i>'; }).join('');
        var tabs = tabsEl.querySelectorAll('i');
        var runIdx = 0, timers = [];

        function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

        function play() {
            timers.forEach(clearTimeout); timers = [];
            var run = RUNS[runIdx];
            nameEl.textContent = run.name;
            tabs.forEach(function (t, i) { t.classList.toggle('is-active', i === runIdx); });
            statusEl.classList.remove('is-done');
            statusEl.lastChild.textContent = 'Running';
            outcomeEl.classList.remove('is-in');
            list.innerHTML = run.steps.map(function (s) {
                return '<li class="step"><span class="step__icon"></span><span class="step__text">' + s[0] + '</span><span class="step__time">' + s[1] + '</span></li>';
            }).join('');
            var items = list.querySelectorAll('.step');
            var t = 300;
            items.forEach(function (li, i) {
                later(function () { li.classList.add('is-in', 'is-running'); }, t);
                t += 850 + (i === 0 ? 200 : 0);
                later(function () {
                    li.classList.remove('is-running');
                    li.classList.add('is-done');
                    if (run.steps[i][2] === 'flag') li.classList.add('is-flag');
                }, t);
                t += 120;
            });
            later(function () {
                statusEl.classList.add('is-done');
                statusEl.lastChild.textContent = 'Complete';
                outcomeEl.textContent = run.outcome;
                outcomeEl.classList.add('is-in');
            }, t + 150);
            later(function () { runIdx = (runIdx + 1) % RUNS.length; play(); }, t + 3600);
        }

        if (reduceMotion) {
            tabs[0].classList.add('is-active');
            outcomeEl.classList.add('is-in');
            statusEl.classList.add('is-done');
            statusEl.lastChild.textContent = 'Complete';
            return;
        }
        play();
    }
    document.querySelectorAll('[data-console]').forEach(initConsole);

    /* ------------------------------------------------------------------
       4. Nav: stuck state + mobile menu
       ------------------------------------------------------------------ */
    var nav = document.querySelector('[data-nav]');
    if (nav) {
        var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 12); };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        var burger = nav.querySelector('[data-burger]');
        if (burger) burger.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    /* ------------------------------------------------------------------
       5. Reading progress
       ------------------------------------------------------------------ */
    var bar = document.querySelector('[data-progress]');
    var body = document.querySelector('.article__body');
    if (bar && body) {
        var ticking = false;
        var update = function () {
            var rect = body.getBoundingClientRect();
            var total = rect.height - window.innerHeight * .6;
            var p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));
            bar.style.transform = 'scaleX(' + p + ')';
            ticking = false;
        };
        window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();
    }

    /* ------------------------------------------------------------------
       6. Content polish: standalone bold paragraphs → claims
       ------------------------------------------------------------------ */
    document.querySelectorAll('.gh-content > p').forEach(function (p) {
        var text = p.textContent.trim();
        if (!text) return;
        var bold = Array.prototype.map.call(p.querySelectorAll('strong, b'), function (s) { return s.textContent; }).join('').trim();
        if (bold && bold.length >= text.length - 2 && text.length > 40) p.classList.add('is-claim');
    });

    /* ------------------------------------------------------------------
       7. Copy link
       ------------------------------------------------------------------ */
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var url = btn.getAttribute('data-copy');
            (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
                var old = btn.textContent; btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = old; }, 1600);
            }).catch(function () { window.prompt('Copy link', url); });
        });
    });

    /* ------------------------------------------------------------------
       8. Voice-wave heights + scroll reveal
       ------------------------------------------------------------------ */
    document.querySelectorAll('.wave i').forEach(function (i, n) {
        var h = .3 + Math.abs(Math.sin(n * 1.7)) * .7;
        i.style.setProperty('--h', h.toFixed(2));
        i.style.animationDelay = (-n * .11) + 's';
        i.style.backgroundPosition = (n / 23 * 100) + '% 0';
    });

    if ('IntersectionObserver' in window && !reduceMotion) {
        var targets = document.querySelectorAll('.feature, .row, .tile, .author-card, .section__head');
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
        }, { rootMargin: '0px 0px -8% 0px' });
        targets.forEach(function (el, i) {
            if (el.getBoundingClientRect().top < window.innerHeight) return;
            el.classList.add('reveal');
            el.style.transitionDelay = (el.classList.contains('tile') ? (i % 4) * 70 : 0) + 'ms';
            io.observe(el);
        });
    }
})();
