/* Agentic skin for Ghost "Source" — progressive enhancement via Code injection. */
(function () {
    'use strict';
    var script = document.currentScript;
    var BASE = script ? script.src.replace(/skin\/skin\.js.*$/, '') : '';
    var body = document.body;
    var isHome = body.classList.contains('home-template');
    var isPost = body.classList.contains('post-template');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var site = (document.querySelector('.gh-navigation-logo') || {}).href || '/';
    site = site.replace(/\/$/, '');

    function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
    function arrow() { return '<span class="ah-arrow" aria-hidden="true"></span>'; }

    /* ---------- Nav: stuck border ---------- */
    var nav = document.querySelector('.gh-navigation');
    if (nav) {
        var onScroll = function () { nav.classList.toggle('ah-stuck', window.scrollY > 8); };
        onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    }

    document.querySelectorAll('.gh-footer-signup-subhead').forEach(function (p) {
        p.textContent = p.textContent.replace(/\s*Free\.\s*Unsubscribe anytime\.?/i, '').trim();
    });
    document.querySelectorAll('.gh-form-input').forEach(function (i) { i.placeholder = 'you@clinic.ca'; });

    /* ---------- Generated cover art ---------- */
    function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
    function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    var PAL = [['#635bff','#ef008f','#ffba27','#6ec3f4'],['#0a2540','#635bff','#6ec3f4','#00d4aa'],['#7a73ff','#ff5996','#ffcb57','#a960ee'],['#11efe3','#635bff','#ef008f','#0a2540'],['#ff7a3d','#ef008f','#7a73ff','#ffba27'],['#0a2540','#00d4aa','#6ec3f4','#ffba27']];
    function art(seed) {
        var R = rng(hash(seed)), pal = PAL[Math.floor(R() * PAL.length)], id = 'a' + hash(seed).toString(36), W = 800, H = 500, blobs = '', grid = '';
        for (var i = 0; i < 5; i++) blobs += '<circle cx="' + R() * W + '" cy="' + R() * H + '" r="' + (140 + R() * 220) + '" fill="' + pal[(i + 1) % 4] + '" opacity="' + (.55 + R() * .4) + '"/>';
        for (var x = 40; x < W; x += 40) grid += '<path d="M' + x + ' 0V' + H + '"/>';
        for (var y = 40; y < H; y += 40) grid += '<path d="M0 ' + y + 'H' + W + '"/>';
        var by = 190 + R() * 140, pts = [[0, by]], cx = 0;
        while (cx < W) {
            cx += 70 + R() * 90; pts.push([cx, by]);
            if (R() > .35 && cx < W - 60) { var a = 30 + R() * 90; pts.push([cx + 10, by - 14], [cx + 18, by], [cx + 26, by + a * .35], [cx + 36, by - a], [cx + 48, by + a * .5], [cx + 58, by]); cx += 58; }
        }
        var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
        return '<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><filter id="' + id + 'b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter><linearGradient id="' + id + 'g" gradientTransform="rotate(' + Math.floor(R() * 360) + ' .5 .5)"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[2] + '"/></linearGradient><linearGradient id="' + id + 'l" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff" stop-opacity=".95"/><stop offset=".8" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="800" height="500" fill="url(#' + id + 'g)"/><g filter="url(#' + id + 'b)">' + blobs + '</g><g stroke="#fff" stroke-opacity=".12">' + grid + '</g><path d="' + d + '" fill="none" stroke="url(#' + id + 'l)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
    }
    function slugOf(a) { return (a.getAttribute('href') || '').replace(/^https?:\/\/[^/]+/, '').replace(/\//g, '') || 'post'; }

    document.querySelectorAll('.gh-card').forEach(function (card) {
        var link = card.querySelector('.gh-card-link');
        if (!link || card.querySelector('.gh-card-image')) return;
        var thumb = el('<div class="ah-thumb" aria-hidden="true"><div class="ah-art">' + art(slugOf(link)) + '</div></div>');
        link.appendChild(thumb);
    });

    /* ---------- Homepage ---------- */
    if (isHome) {
        var header = document.querySelector('.gh-header .gh-header-inner');
        if (header) {
            var h1 = header.querySelector('.gh-header-title');
            if (h1) h1.insertAdjacentElement('afterend', el('<p class="ah-sub">Essays on AI agents, clinical workflows and how we scale care in Canada, from a physician building in health tech.</p>'));
        }

        var container = document.querySelector('.gh-container.is-list');
        if (container) {
            container.id = 'essays';
            var inner = container.querySelector('.gh-container-inner');
            inner.insertBefore(el('<h2 class="ah-label">Essays</h2>'), inner.firstChild);
            var first = container.querySelector('.gh-card');
            if (first) first.classList.add('ah-feature');
        }

        var after = container || document.querySelector('.gh-header');
        var sections = el('<div class="ah-sections">' +
            /* Thesis */
            '<section class="ah-section"><div class="ah-wrap">' +
                '<p class="ah-kicker">The thesis</p>' +
                '<h2 class="ah-section-title">Supply can’t keep up with demand. <span class="ah-grad-text">Force multipliers can.</span></h2>' +
                '<div class="ah-points">' +
                    '<a class="ah-point" href="' + site + '/what-is-agentic-healthcare/"><span class="ah-num">01</span><h3>The demographic pyramid is inverting.</h3><p>A shrinking tax base is funding care for a growing population with complex needs. Reallocating existing resources can’t close that gap.</p></a>' +
                    '<a class="ah-point" href="' + site + '/canada-has-a-severe-shortage-of-ai-healthcare-workers/"><span class="ah-num">02</span><h3><span class="ah-grad-text">+20%</span> patients per clinic</h3><p>If visits move faster and each clinic sees about 20% more patients, the apparent MD and NP shortage disappears.</p></a>' +
                    '<a class="ah-point" href="' + site + '/what-is-agentic-healthcare/"><span class="ah-num">03</span><h3><span class="ah-grad-text">2–4×</span> faster visits</h3><p>AI agents as force multipliers help clinicians see patients two to four times faster, without compromising safety.</p></a>' +
                    '<a class="ah-point" href="' + site + '/voice-is-the-universal-interface/"><span class="ah-num">04</span><h3>Voice is the universal interface.</h3><p>Patients are already overwhelmed. For senior-facing care, the simplest app is no app at all.</p></a>' +
                '</div>' +
            '</div></section>' +
            /* Agent demo */
            '<section class="ah-section"><div class="ah-wrap ah-demo"><div>' +
                '<p class="ah-kicker">What “agentic” means</p>' +
                '<h2 class="ah-section-title">Agents that finish the work, not just draft it.</h2>' +
                '<p class="ah-demo__text">Software that takes a clinic task from inbox to done: reading the fax, finding the patient, chasing the missing ECG and booking the visit. Clinicians get their time back for patients.</p>' +
            '</div>' +
            '<div class="ah-stage-wrap"><div class="ah-stage" aria-hidden="true"><canvas data-ah-gradient></canvas></div>' +
                '<div class="ah-console" data-ah-console><div class="ah-console__bar"><span class="ah-dots"><i></i><i></i><i></i></span><span class="ah-cname">agent / <b data-n>referral-intake</b></span><span class="ah-demo-tag" title="Illustrative demo, fictional data">Demo</span><span class="ah-status" data-s><i></i><span>Running</span></span></div><ol class="ah-steps" data-steps></ol><div class="ah-console__foot"><span class="ah-outcome" data-o></span><span class="ah-tabs" data-t></span></div></div>' +
            '</div></div></section>' +
            /* Author */
            '<section class="ah-section"><div class="ah-wrap ah-author"><img src="' + BASE + 'assets/brand/mark-512.png" alt="" width="56" height="56" loading="lazy"><div>' +
                '<h2>Dr. Peter Phua, MD</h2>' +
                '<p>Physician working in Canadian health tech. MD from McMaster University, trained in family medicine, working on healthcare AI since the 2016 deep-learning era.</p>' +
                '<p class="ah-author__links"><a href="' + site + '/about/">About</a><span>·</span><a href="https://x.com/PeterPhuaAI" target="_blank" rel="noopener">X</a><span>·</span><a href="https://www.linkedin.com/in/peter-phua-md-ccfp-87a710318/" target="_blank" rel="noopener">LinkedIn</a></p>' +
            '</div></div></section>' +
        '</div>');
        if (after) after.insertAdjacentElement('afterend', sections);
        initGradient(sections.querySelector('[data-ah-gradient]'));
        initConsole(sections.querySelector('[data-ah-console]'));
    }

    /* ---------- Posts ---------- */
    if (isPost || body.classList.contains('page-template')) {
        document.querySelectorAll('.gh-content > p').forEach(function (p) {
            var text = p.textContent.trim();
            var bold = Array.prototype.map.call(p.querySelectorAll('strong, b'), function (s) { return s.textContent; }).join('').trim();
            if (text.length > 40 && bold && bold.length >= text.length - 2) p.classList.add('ah-claim');
        });
    }
    /* Author avatar: use the logo mark when the staff profile has no photo */
    document.querySelectorAll('.gh-article-author-image a').forEach(function (a) {
        if (a.querySelector('img') || !a.querySelector('svg')) return;
        a.innerHTML = '<img src="' + BASE + 'assets/brand/mark-512.png" alt="" width="36" height="36">';
        a.parentNode.classList.add('ah-avatar');
    });

    if (isPost) {
        var bar = el('<div class="ah-progress" aria-hidden="true"><span></span></div>');
        body.appendChild(bar);
        var content = document.querySelector('.gh-content'), span = bar.firstChild, ticking = false;
        var upd = function () {
            if (!content) return;
            var r = content.getBoundingClientRect(), total = r.height - window.innerHeight * .6;
            span.style.transform = 'scaleX(' + Math.min(1, Math.max(0, -r.top / Math.max(1, total))) + ')';
            ticking = false;
        };
        window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
        upd();
    }

    /* ---------- Flowing gradient (WebGL) ---------- */
    function initGradient(canvas) {
        if (!canvas) return;
        var gl = canvas.getContext('webgl', { antialias: false });
        if (!gl) return;
        var F = 'precision mediump float;uniform vec2 r;uniform float t;void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv;p.x*=r.x/r.y*.55;float s=t*.06;' +
            'float n1=sin(p.x*2.3+s*3.1+sin(p.y*2.9+s*2.)*1.4);float n2=sin(p.y*3.1-s*2.4+sin(p.x*1.9-s*1.7)*1.8);float n3=sin((p.x-p.y)*2.6+s*2.2+cos(p.y*3.4+s)*.9);float n4=sin((p.x+p.y*.6)*3.3-s*1.6);' +
            'vec3 col=mix(vec3(.39,.36,1.),vec3(.937,0.,.561),smoothstep(-.9,.9,n1));col=mix(col,vec3(.431,.765,.957),smoothstep(.15,1.,n2)*.85);col=mix(col,vec3(1.,.729,.153),smoothstep(.35,1.,n3)*.9);col=mix(col,vec3(.478,.451,1.),smoothstep(.5,1.,n4)*.6);gl_FragColor=vec4(col,1.);}';
        var V = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        function sh(ty, src) { var s = gl.createShader(ty); gl.shaderSource(s, src); gl.compileShader(s); return s; }
        var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, V)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, F)); gl.linkProgram(pr);
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
        gl.useProgram(pr);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), vis = false, raf = 0, t0 = performance.now() - Math.random() * 40000;
        function frame(now) {
            var k = Math.min(window.devicePixelRatio || 1, 1.5) * .6, w = Math.max(1, Math.round(canvas.clientWidth * k)), h = Math.max(1, Math.round(canvas.clientHeight * k));
            if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
            gl.uniform2f(uR, w, h); gl.uniform1f(uT, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            if (vis && !reduce) raf = requestAnimationFrame(frame);
        }
        canvas.style.background = 'none';
        frame(performance.now());
        new IntersectionObserver(function (e) { vis = e[0].isIntersecting; cancelAnimationFrame(raf); if (vis) raf = requestAnimationFrame(frame); }).observe(canvas);
    }

    /* ---------- Agent console (fictional data) ---------- */
    function initConsole(root) {
        if (!root) return;
        var RUNS = [
            { n: 'referral-intake', o: '11 min of admin work, done before the coffee cools.', s: [['Fax received · <b>4 pages</b>', '0.4s'], ['Classified as <b>cardiology referral</b>', '1.1s'], ['Patient matched in EMR', '0.8s'], ['Missing ECG → <b>requested from sender</b>', '2.3s', 1], ['Booked first available · <b>Tue 10:40</b>', '1.6s']] },
            { n: 'pre-visit-history', o: 'History ready before the patient walks in.', s: [['Voice call with patient · <b>6 min</b>', '6m'], ['Chief complaint: <b>3 weeks of cough</b>', '0.9s'], ['Medications reconciled · <b>8 active</b>', '1.4s'], ['Red-flag screen · <b>none found</b>', '0.7s'], ['Summary filed to chart for review', '0.5s']] },
            { n: 'lab-triage', o: 'Clinician reviews 3 results, not 42.', s: [['<b>42</b> results received via HL7', '0.3s'], ['<b>39</b> within normal range → filed', '1.2s'], ['<b>3</b> flagged for clinician review', '0.6s'], ['Critical K⁺ 6.1 → <b>on-call paged</b>', '0.4s', 1], ['Patient follow-ups drafted', '2.0s']] }
        ];
        var list = root.querySelector('[data-steps]'), nm = root.querySelector('[data-n]'), st = root.querySelector('[data-s]'), out = root.querySelector('[data-o]'), tabsEl = root.querySelector('[data-t]');
        tabsEl.innerHTML = RUNS.map(function () { return '<i></i>'; }).join('');
        var tabs = tabsEl.querySelectorAll('i'), idx = 0, timers = [];
        function later(f, ms) { timers.push(setTimeout(f, ms)); }
        function render(run, done) {
            nm.textContent = run.n;
            tabs.forEach(function (t, i) { t.classList.toggle('is-active', i === idx); });
            list.innerHTML = run.s.map(function (s) { return '<li class="ah-step' + (done ? ' is-done' + (s[2] ? ' is-flag' : '') : '') + '"><span class="ah-step__icon"></span><span class="ah-step__text">' + s[0] + '</span><span class="ah-step__time">' + s[1] + '</span></li>'; }).join('');
            st.classList.toggle('is-done', !!done); st.lastChild.textContent = done ? 'Complete' : 'Running';
            out.textContent = run.o; out.classList.toggle('is-in', !!done);
        }
        function play() {
            timers.forEach(clearTimeout); timers = [];
            var run = RUNS[idx]; render(run, false);
            var items = list.querySelectorAll('.ah-step'), t = 300;
            items.forEach(function (li, i) {
                later(function () { li.classList.add('is-in', 'is-running'); }, t);
                t += 850 + (i ? 0 : 200);
                later(function () { li.classList.remove('is-running'); li.classList.add('is-done'); if (run.s[i][2]) li.classList.add('is-flag'); }, t);
                t += 120;
            });
            later(function () { st.classList.add('is-done'); st.lastChild.textContent = 'Complete'; out.classList.add('is-in'); }, t + 150);
            later(function () { idx = (idx + 1) % RUNS.length; play(); }, t + 3600);
        }
        if (reduce) { render(RUNS[0], true); return; }
        play();
    }
})();
