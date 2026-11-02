// ZYETA: scroll choreography. One labelled timeline per scene, scrubbed by ScrollTrigger.
import { createGlobe } from './globe.js';
import { createFitout } from './fitout.js';
import { transitions, cursor } from './shared.js';

const { gsap, ScrollTrigger, SplitText, CustomEase } = window;
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create('zOut', '0.16,1,0.3,1');
CustomEase.create('zInOut', '0.65,0,0.35,1');
CustomEase.create('zMask', '0.77,0,0.175,1');
transitions();
cursor();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const MOTION = root.classList.contains('motion');
const isTouch = matchMedia('(pointer: coarse)').matches;
const mq = { desk: '(min-width: 1024px)', mob: '(max-width: 1023px)' };
const state = { paused: false, lenis: null };

/* ---------------- shared helpers (motion primitives) ---------------- */
// Rolling digits: each digit is a strip 0-9 that rolls to its value. Built at final state, so it reads correctly with no motion.
function buildRoll(el) {
  if (el.dataset.built) return;
  const val = el.dataset.roll || el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', val);
  [...val].forEach((ch) => {
    if (/\d/.test(ch)) {
      const d = document.createElement('span'); d.className = 'rd'; d.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span'); s.className = 'rs';
      for (let i = 0; i <= 9; i++) { const n = document.createElement('i'); n.textContent = i; s.appendChild(n); }
      s.dataset.d = ch; gsap.set(s, { yPercent: -ch * 10 }); d.appendChild(s); el.appendChild(d);
    } else { const t = document.createElement('span'); t.textContent = ch; t.setAttribute('aria-hidden', 'true'); el.appendChild(t); }
  });
  el.dataset.built = 1;
}
const rollTween = (el, opts = {}) => gsap.fromTo($$('.rs', el), { yPercent: 0, y: 0 }, { yPercent: (i, t) => -t.dataset.d * 10, duration: 1.4, ease: 'zOut', stagger: 0.06, ...opts });

const splitLines = (el) => SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'sl' });
const splitChars = (el) => SplitText.create(el, { type: 'lines,chars', mask: 'lines', linesClass: 'sl' });
const splitWords = (el) => SplitText.create(el, { type: 'words', wordsClass: 'sw' });

/* ---------------- always on (motion or not) ---------------- */
$$('.roll').forEach(buildRoll);
$$('[data-roll-text]').forEach((s) => { s.setAttribute('data-label', s.textContent); const m = document.createElement('span'); m.className = 'rt-mask'; s.replaceWith(m); m.appendChild(s); });
$('.hero__video').addEventListener('playing', (e) => e.target.classList.add('is-playing'));

// Voices tabs: proper tablist, click or arrow keys. No auto-advance.
(function voicesTabs() {
  const tabs = $$('.voices__tabs [role="tab"]');
  const qs = $$('.voices__q');
  const ph = $$('.voices__photo img');
  let cur = 0;
  function show(i, focus) {
    if (i === cur) return;
    const prev = cur; cur = i;
    tabs.forEach((t, n) => { t.setAttribute('aria-selected', n === i); t.tabIndex = n === i ? 0 : -1; });
    if (focus) tabs[i].focus();
    if (!MOTION) { qs.forEach((q, n) => q.classList.toggle('is-on', n === i)); return; }
    const outL = $$('.sl > *, .sl', qs[prev]).length ? null : null; // noop, kept simple
    gsap.to(qs[prev], { autoAlpha: 0, y: -24, duration: 0.45, ease: 'zOut', onComplete: () => qs[prev].classList.remove('is-on') });
    qs[i].classList.add('is-on');
    const sp = qs[i]._split || (qs[i]._split = splitLines($('blockquote p', qs[i])));
    gsap.set(qs[i], { autoAlpha: 1, y: 0 });
    gsap.fromTo(sp.lines, { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: 'zOut', stagger: 0.06 });
    gsap.fromTo($('figcaption', qs[i]), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, delay: 0.3 });
    gsap.set(ph, { zIndex: 0 }); gsap.set(ph[i], { zIndex: 2 });
    gsap.fromTo(ph[i], { clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 0.9, ease: 'zMask' });
    void outL;
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(i));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show((cur + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show((cur + tabs.length - 1) % tabs.length, true); }
    });
  });
  // swipe on touch
  let sx = null;
  $('.voices__quotes').addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  $('.voices__quotes').addEventListener('touchend', (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show((cur + (dx < 0 ? 1 : tabs.length - 1)) % tabs.length); sx = null; });
})();

// Mobile menu: circle wipe from the Menu button, Escape closes, focus returns.
(function menu() {
  const btn = $('.nav__menu'), panel = $('#menu');
  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    const r = btn.getBoundingClientRect();
    gsap.to(panel, { clipPath: `circle(0% at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)`, duration: MOTION ? 0.6 : 0, ease: 'zMask', onComplete: () => { panel.hidden = true; } });
    btn.textContent = 'Menu'; btn.focus();
  };
  const open = () => {
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.textContent = 'Close';
    const r = btn.getBoundingClientRect();
    gsap.fromTo(panel, { clipPath: `circle(0% at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)` }, { clipPath: `circle(150% at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)`, duration: MOTION ? 0.9 : 0, ease: 'zMask' });
    if (MOTION) gsap.fromTo($$('nav a', panel), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.06, duration: 0.8, ease: 'zOut', delay: 0.2 });
    $('nav a', panel).focus();
  };
  btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close() : open()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  $$('a', panel).forEach((a) => a.addEventListener('click', () => close()));
})();

// Awards: on touch, the card nearest the centre of the swipe row reveals its photo.
(function awards() {
  const list = $('.awards__cards');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-on', isTouch && e.intersectionRatio > 0.7)), { root: matchMedia(mq.desk).matches ? null : list, threshold: [0.7] });
  $$('.award', list).forEach((c) => io.observe(c));
})();

/* ---------------- motion only ---------------- */
if (MOTION) {
  document.fonts.ready.then(start);
} else {
  // still document: keep the hero video still too, show the poster
}

function start() {
  /* smooth scroll: Lenis on desktop, native on touch */
  if (!isTouch && window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    state.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  ScrollTrigger.config({ ignoreMobileResize: true });

  // anchor links scroll smoothly and land past pinned spacers correctly
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); const t = id.length > 1 && $(id); if (!t) return;
    e.preventDefault();
    const st = ScrollTrigger.getAll().find((s) => s.trigger === t && s.pin);
    const y = st ? st.start : t.getBoundingClientRect().top + window.scrollY;
    if (state.lenis) state.lenis.scrollTo(y, { duration: id === '#main' ? 2 : 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }));

  setupNav();
  setupPause();

  const mm = gsap.matchMedia();
  mm.add({ desk: mq.desk, mob: mq.mob }, (ctx) => {
    const desk = ctx.conditions.desk;
    const L = (d, m) => (desk ? d : m); // pin lengths
    sceneHero(desk, L);
    sceneGlobe(desk, L);
    sceneProjects(desk, L);
    scenePromise(desk, L);
    sceneNumbers();
    sceneClients();
    sceneFitout(desk, L);
    sceneServices(desk);
    sceneVoices(desk, L);
    sceneAwards();
    sceneResearch(desk, L);
    sceneContact(desk, L);
    sceneFooter();
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => gsap.set('.progress', { scaleX: s.progress }) });
    // while a stage is pinned it paints its colour below itself, so a phone's collapsing address bar never shows the next scene
    ScrollTrigger.getAll().filter((t) => t.pin).forEach((t) => ScrollTrigger.create({ trigger: t.trigger, start: () => t.start, end: () => t.end, toggleClass: { targets: t.pin, className: 'is-pinned' } }));
  });

  loader().then(heroIntro);
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------------- nav: hide on the way down, theme follows the scene ---------------- */
function setupNav() {
  const nav = $('.nav');
  let theme = 'dark';
  state.setTheme = (t) => { if (t !== theme) { theme = t; nav.dataset.theme = t; } };
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate(self) {
      const y = self.scroll();
      if (y > 120 && self.direction === 1 && !document.body.classList.contains('menu-open')) gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'zOut', overwrite: true });
      else if (self.direction === -1 || y < 120) gsap.to(nav, { yPercent: 0, duration: 0.4, ease: 'zOut', overwrite: true });
      // theme: read after this frame's scene updates have run, so it never lags behind
      cancelAnimationFrame(state.navRaf); state.navRaf = requestAnimationFrame(() => {
      const el = document.elementsFromPoint(window.innerWidth / 2, 36).find((n) => n.closest && n.closest('[data-theme]') && !n.closest('.nav'));
      const sec = el && el.closest('section, footer');
      if (sec) state.setTheme(sec.dataset.navTheme || sec.dataset.theme);
      });
    },
  });
}

/* ---------------- pause control: video, globe spin, light loop ---------------- */
function setupPause() {
  const b = $('[data-pause]'); const v = $('.hero__video');
  b.addEventListener('click', () => {
    state.paused = !state.paused; b.setAttribute('aria-pressed', state.paused); b.textContent = state.paused ? 'Play motion' : 'Pause motion';
    if (state.paused) v.pause(); else v.play().catch(() => {});
    state.globe && state.globe.setPaused(state.paused);
    state.clientsLoop && (state.paused ? state.clientsLoop.pause() : state.clientsLoop.play());
  });
}

/* ---------------- SCENE 00: loader ---------------- */
function loader() {
  const el = $('.loader');
  if (!el || root.classList.contains('seen') || getComputedStyle(el).display === 'none') return Promise.resolve();
  const poster = $('.loader__full');
  const ready = Promise.race([poster.decode().catch(() => {}), new Promise((r) => setTimeout(r, 4000))]);
  state.lenis && state.lenis.stop();
  document.body.style.overflow = 'hidden';
  const thumbs = $$('.loader__strip img').filter((i) => getComputedStyle(i).display !== 'none');
  const key = $('.loader__strip .is-key');
  // wait for the strip's own photos (max 2.5s) so the first frames are never blank on a slow network
  gsap.set(thumbs, { clipPath: 'inset(100% 0 0 0)' });
  const thumbsReady = Promise.race([Promise.all(thumbs.map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 2500))]);
  const tl = gsap.timeline({ defaults: { ease: 'zOut' }, paused: true });
  thumbsReady.then(() => tl.play());
  tl.addLabel('lines', 0)
    .from('.cols span', { scaleY: 0, transformOrigin: 'top', duration: 0.9, stagger: 0.03 }, 'lines')
    .fromTo(thumbs, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.7, stagger: 0.05, ease: 'zMask' }, 0.4)
    .add(rollTween($('.loader__count .roll'), { duration: 1.2, stagger: 0.04 }), 0.4)
    .addLabel('gather', 1.7)
    .add(() => {
      const kr = key.getBoundingClientRect();
      thumbs.forEach((t) => { if (t === key) return; const r = t.getBoundingClientRect(); gsap.to(t, { x: kr.left - r.left, duration: 0.6, ease: 'zInOut', autoAlpha: 0 }); });
    }, 'gather')
    .to('.loader__count', { autoAlpha: 0, duration: 0.4 }, 'gather')
    .addLabel('open', 2.3)
    .add(() => {
      const r = key.getBoundingClientRect(); const W = innerWidth, H = innerHeight;
      gsap.fromTo(poster, { clipPath: `inset(${r.top}px ${W - r.right}px ${H - r.bottom}px ${r.left}px)` }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1.2, ease: 'zInOut' });
    }, 'open');
  return Promise.all([new Promise((r) => tl.eventCallback('onComplete', r)), ready]).then(() => new Promise((r) => setTimeout(r, 1200))).then(() => {
    gsap.to(el, { autoAlpha: 0, duration: 0.3, onComplete: () => el.remove() });
    document.body.style.overflow = '';
    state.lenis && state.lenis.start();
    try { sessionStorage.setItem('zy-loaded', '1'); } catch (e) {}
  });
}

/* ---------------- SCENE 01: hero ---------------- */
let heroSplit;
function heroIntro() {
  const v = $('.hero__video');
  v.play().catch(() => {});
  if (state.paused) v.pause();
  heroSplit = heroSplit || splitChars($('.hero__title'));
  const tl = gsap.timeline({ defaults: { ease: 'zOut' } });
  tl.fromTo('.hero__media', { scale: 1.1 }, { scale: 1, duration: 1.8 }, 0)
    .fromTo(heroSplit.chars, { yPercent: 110, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.022 }, 0.1)
    .fromTo('.hero__sub', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.7)
    .fromTo('.nav', { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.9);
}
function sceneHero(desk, L) {
  heroSplit = heroSplit || splitChars($('.hero__title'));
  const sec = $('.hero');
  const lines = heroSplit.lines;
  const frame = desk ? 'inset(28% 35% 28% 35% round 6px)' : 'inset(30% 12% 30% 12% round 6px)';
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
    trigger: sec, start: 'top top', end: L('+=120%', '+=100%'), pin: '.hero__stage', scrub: 0.8,
    onLeave: () => gsap.set('.hero__stage', { autoAlpha: 0 }), onEnterBack: () => gsap.set('.hero__stage', { autoAlpha: 1 }),
    onUpdate: (s) => { sec.dataset.navTheme = s.progress > 0.45 ? 'light' : 'dark'; },
  } });
  tl.to(lines[0], { y: () => -innerHeight * 0.3, autoAlpha: 0, duration: 0.35 }, 0)
    .to(lines[1], { y: () => -innerHeight * 0.18, autoAlpha: 0, duration: 0.35 }, 0)
    .to('.hero__sub', { autoAlpha: 0, duration: 0.25 }, 0)
    .fromTo('.hero__media', { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: frame, duration: 0.7, ease: 'zInOut' }, 0.25)
    .to('.hero__video, .hero__poster', { scale: 1.15, duration: 0.75 }, 0.25);
  // the hero frame and the globe's seed image share a size
  const seed = $('.globe__seed');
  gsap.set(seed, desk ? { width: '30vw', height: '44svh' } : { width: '76vw', height: '40svh' });
}

/* ---------------- SCENE 02: the globe ---------------- */
function sceneGlobe(desk, L) {
  const sec = $('.globe'), canvas = $('.globe__canvas');
  const cap = $('.globe__cap');
  if (!state.globe) {
    try {
      const names = ['linkedinbengaluruworkplacedesign-1','iffhyderabad-2','7elevenphase2-3','7elevenbengaluru-2','tdcxasiasleadingdigitaltransformat-1','iffhyderabad-6',
        '7elevenbengaluru-1','7elevenbengaluru-3','7elevenbengaluru-4','7elevenbengaluru-5','7elevenbengaluru-6','7elevenbengaluru-7',
        '7elevenphase2-1','7elevenphase2-2','7elevenphase2-4','7elevenphase2-5','7elevenphase2-6','7elevenphase2-7',
        'linkedinbengaluruworkplacedesign-2','linkedinbengaluruworkplacedesign-3','linkedinbengaluruworkplacedesign-4','linkedinbengaluruworkplacedesign-5','linkedinbengaluruworkplacedesign-6','linkedinbengaluruworkplacedesign-7',
        'iffhyderabad-1','iffhyderabad-3','iffhyderabad-4','iffhyderabad-5','iffhyderabad-7',
        'tdcxasiasleadingdigitaltransformat-2','tdcxasiasleadingdigitaltransformat-3','tdcxasiasleadingdigitaltransformat-4','tdcxasiasleadingdigitaltransformat-5','tdcxasiasleadingdigitaltransformat-6','tdcxasiasleadingdigitaltransformat-7',
        'careers-4','careers-5','careers-6','careers-7','portfolio-1','portfolio-2','portfolio-3','portfolio-5','well-consultancy','well-hsr-consultancy',
        'wellconsultation-1','wellconsultation-3','wellconsultation-5','wellconsultation-6','wellconsultation-7','workplacedesignconsultancy-1','workplacestrategy-1','workplacestrategy-2',
        'workspacedesignandbuild-2','sustainabilityconsultancy-1','office-lounge','data-driven-workplace-design-firm','design-build','design-consultancy','global-capability-centers-gccs-in-asia',
        'carbon-neutral-gcc-office','hospitality-service-hubs-3','hospitality-service-hubs-5','design-that-speak-positivity-scaled','ai-in-office-interior-design-1','healthandsafetyratingconsultation-1','healthandsafetyratingconsultation-5','about-2','tdcx-workplace-design','hero-broll-poster'];
      const capFor = (n) => n.startsWith('linkedin') ? 'LinkedIn, Bengaluru, 2025' : n.startsWith('iff') ? 'IFF, Hyderabad, 2025' : n.startsWith('7elevenphase2') ? '7-Eleven, Bengaluru, 2025' : n.startsWith('7elevenbengaluru') ? '7-Eleven, Bengaluru, 2024' : n.startsWith('tdcx') ? 'TDCX, Hyderabad, 2025' : '';
      const tiles = names.map((n) => ({ src: `media/thumb/${n}.webp`, cap: capFor(n) }));
      state.globe = createGlobe(canvas, {
        tiles, frontIndex: names.indexOf('hero-broll-poster'), featureIndex: 0, mobile: !desk,
        onHover: (h) => { if (!h) { gsap.to(cap, { autoAlpha: 0, duration: 0.2 }); return; } cap.textContent = h.text; gsap.to(cap, { autoAlpha: 1, x: h.x + 16, y: h.y + 16, duration: 0.25, ease: 'power3' }); },
      });
      gsap.ticker.add(() => state.globe.frame());
      addEventListener('resize', () => state.globe.resize());
    } catch (e) { root.classList.add('no-webgl'); return; }
  }
  state.globe.resize();
  const head = splitLines($('.globe__head h2'));
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
    trigger: sec, start: 'top top', end: L('+=220%', '+=180%'), pin: '.globe__stage', scrub: 0.8,
    onLeave: () => gsap.set('.globe__stage', { autoAlpha: 0 }), onEnterBack: () => gsap.set('.globe__stage', { autoAlpha: 1 }),
    onUpdate: (s) => { state.globe.setProgress(s.progress); sec.dataset.navTheme = s.progress < 0.12 ? 'light' : 'dark'; },
  } });
  // render only while any part of the scene is on screen
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => state.globe.setActive(s.isActive), onRefresh: (s) => state.globe.setActive(s.isActive) });
  tl.fromTo('.globe__stage', { backgroundColor: '#E9EAE6', '--sb': '#E9EAE6' }, { backgroundColor: '#1F2B27', '--sb': '#1F2B27', duration: 0.15 }, 0)
    .fromTo('.globe__seed', { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.92, duration: 0.12 }, 0.04)
    .fromTo(head.lines, { yPercent: 105 }, { yPercent: 0, duration: 0.08, stagger: 0.02, ease: 'zOut' }, 0.14)
    .fromTo('.globe__count', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.18)
    .add(rollTween($('.globe__count .roll'), { duration: 0.12, stagger: 0.02 }), 0.18)
    .fromTo('.globe__hint', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.3)
    .to('.globe__hint, .globe__head', { autoAlpha: 0, duration: 0.06 }, 0.78)
    .fromTo('.globe__out', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.08 }, 0.92);
}

/* ---------------- SCENE 03: featured projects ---------------- */
function sceneProjects(desk, L) {
  const sec = $('.proj');
  const imgs = $$('.proj__frame img'), names = $$('.proj__names p'), items = $$('.proj__item');
  const bgs = items.map((i) => i.dataset.bg);
  const frame = desk ? 'inset(15% 24% 24% 24% round 6px)' : 'inset(24% 6% 34% 6% round 6px)';
  const nameSplits = names.map((n) => splitChars(n));
  gsap.set(imgs.slice(1), { yPercent: 100 });
  gsap.set(items.slice(1), { autoAlpha: 0 });
  const nEl = $('.proj__n');
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
    trigger: sec, start: 'top top', end: L('+=270%', '+=240%'), pin: '.proj__stage', scrub: 0.8,
    onLeave: () => gsap.set('.proj__stage', { autoAlpha: 0 }), onEnterBack: () => gsap.set('.proj__stage', { autoAlpha: 1 }),
    onUpdate: (s) => { nEl.textContent = s.progress < 0.36 ? 1 : s.progress < 0.7 ? 2 : 3; },
  } });
  tl.set('.proj__stage', { backgroundColor: bgs[0], '--sb': bgs[0] }, 0)
    .fromTo('.proj__frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)' }, { clipPath: frame, duration: 0.12, ease: 'zInOut' }, 0)
    .fromTo(nameSplits[0].chars, { yPercent: 110 }, { yPercent: 0, duration: 0.08, stagger: 0.004, ease: 'zOut' }, 0.06)
    .fromTo(items[0], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.1)
    .fromTo('.proj__count', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.1);
  nameSplits.slice(1).forEach((s) => gsap.set(s.chars, { yPercent: 110 }));
  [1, 2].forEach((i) => {
    const at = i === 1 ? 0.33 : 0.62;
    tl.to('.proj__stage', { backgroundColor: bgs[i], '--sb': bgs[i], duration: 0.12 }, at)
      .to(imgs[i - 1], { yPercent: -30, scale: 1.08, duration: 0.14, ease: 'zInOut' }, at)
      .to(imgs[i], { yPercent: 0, duration: 0.14, ease: 'zInOut' }, at)
      .to(nameSplits[i - 1].chars, { yPercent: -110, duration: 0.07, stagger: 0.003, ease: 'zInOut' }, at)
      .to(nameSplits[i].chars, { yPercent: 0, duration: 0.08, stagger: 0.004, ease: 'zOut' }, at + 0.05)
      .to(items[i - 1], { autoAlpha: 0, y: -20, duration: 0.05 }, at)
      .fromTo(items[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.06 }, at + 0.07)
      .to('.proj__bar i', { scaleX: (i + 1) / 3, duration: 0.1 }, at);
  });
  tl.to('.proj__list, .proj__count, .proj__names', { autoAlpha: 0, duration: 0.05 }, 0.88)
    .to('.proj__frame', { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.1, ease: 'zInOut' }, 0.9)
    .to(imgs[2], { scale: 1, duration: 0.1 }, 0.9);
}

/* ---------------- SCENE 04: promise ---------------- */
function scenePromise(desk, L) {
  const sec = $('.promise');
  const h = splitLines($('.promise__text h2'));
  const words = splitWords($('.promise__body')).words;
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
    trigger: sec, start: 'top top', end: L('+=170%', '+=140%'), pin: '.promise__stage', scrub: 0.8,
    onUpdate: (s) => { sec.dataset.navTheme = s.progress < 0.3 ? 'dark' : 'light'; },
  } });
  gsap.set('.promise__text', { autoAlpha: 1 });
  tl.fromTo('.promise__disc', { y: () => innerHeight * 1.02 }, { y: () => -innerHeight * 0.32, duration: 0.4, ease: 'zInOut' }, 0)
    .fromTo('.promise__bg', { scale: 1 }, { scale: 1.12, duration: 0.4 }, 0)
    .to('.promise__arc', { autoAlpha: 0, duration: 0.06 }, 0.27)
    .fromTo(h.lines, { yPercent: 105 }, { yPercent: 0, duration: 0.1, stagger: 0.025, ease: 'zOut' }, 0.25)
    .fromTo('.promise__body', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.04 }, 0.36)
    .fromTo(words, { opacity: 0.14 }, { opacity: 1, duration: 0.02, stagger: 0.46 / words.length }, 0.4)
    .to('.promise__text', { y: () => -innerHeight * 0.12, autoAlpha: 0, duration: 0.08 }, 0.94);
}

/* ---------------- SCENE 05: numbers ---------------- */
function sceneNumbers() {
  $$('.nums__row').forEach((row) => {
    let rule = $('.nums__rule', row);
    if (!rule) { rule = document.createElement('i'); rule.className = 'nums__rule'; row.prepend(rule); }
    const label = splitLines($('.nums__label', row));
    const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 82%', toggleActions: 'play none none reverse' } });
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'zOut' })
      .add(rollTween($('.roll', row)), 0.15)
      .fromTo($('.nums__val', row), { autoAlpha: 0, yPercent: 20 }, { autoAlpha: 1, yPercent: 0, duration: 1.1, ease: 'zOut' }, 0.1)
      .fromTo(label.lines, { yPercent: 105 }, { yPercent: 0, duration: 0.8, ease: 'zOut', stagger: 0.06 }, 0.35);
    const drift = innerWidth < 1024 ? 10 : 40;
    gsap.fromTo($('.nums__val', row), { y: drift }, { y: -drift, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* ---------------- clients: a band that drifts and leans with scroll speed ---------------- */
function sceneClients() {
  const track = $('.clients__track'); if (!track || track._loop) return;
  const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  track._loop = loop;
  const skew = gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3' });
  ScrollTrigger.create({ trigger: '.clients', start: 'top bottom', end: 'bottom top',
    onUpdate: (s) => {
      const v = s.getVelocity();
      skew(Math.max(-5, Math.min(5, v / -500)));
      gsap.to(loop, { timeScale: Math.min(5, 1 + Math.abs(v) / 400) * (s.direction || 1), duration: 0.2, overwrite: true });
      gsap.to(loop, { timeScale: 1, duration: 1.4, delay: 0.25 });
    },
    onToggle: (s) => { if (!s.isActive) skew(0); } });
  gsap.fromTo('.clients__k', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'zOut', scrollTrigger: { trigger: '.clients', start: 'top 85%' } });
  state.clientsLoop = loop;
}

/* ---------------- SCENE 06: fit-out ---------------- */
function sceneFitout(desk, L) {
  const sec = $('.fit'), canvas = $('.fit__canvas');
  if (!state.fit) {
    try {
      state.fit = createFitout(canvas, { mobile: !desk });
      gsap.ticker.add(() => state.fit.frame());
      addEventListener('resize', () => state.fit.resize());
    } catch (e) { return; }
  }
  state.fit.resize();
  const steps = $$('.fit__steps li');
  const splits = steps.map((li) => ({ h: splitLines($('h3', li)), p: splitLines($('p', li)) }));
  steps.forEach((li, i) => gsap.set(li, { autoAlpha: i === 0 ? 1 : 0 }));
  const dots = $$('.fit__dots button');
  const digit = $('.fit__d--b .fit__s');
  let cur = -1;
  function setStage(i) {
    if (i === cur) return;
    const prev = cur; cur = i;
    dots.forEach((d, n) => d.classList.toggle('is-on', n === i));
    gsap.to(digit, { yPercent: -100 * i / 7, duration: 0.8, ease: 'zInOut', overwrite: true });
    if (prev >= 0) {
      gsap.to([...splits[prev].h.lines, ...splits[prev].p.lines], { yPercent: -105, duration: 0.45, ease: 'zInOut', overwrite: true, onComplete: () => gsap.set(steps[prev], { autoAlpha: 0 }) });
    }
    gsap.set(steps[i], { autoAlpha: 1 });
    gsap.fromTo([...splits[i].h.lines, ...splits[i].p.lines], { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: 'zOut', stagger: 0.05, delay: prev >= 0 ? 0.2 : 0, overwrite: true });
  }
  const st = ScrollTrigger.create({
    trigger: sec, start: 'top top', end: L('+=560%', '+=480%'), pin: '.fit__stage', scrub: 0.8,
    onUpdate: (s) => {
      state.fit.setProgress(s.progress);
      setStage(Math.min(6, Math.floor(s.progress * 7)));
      gsap.set('.fit__bar i', { scaleX: s.progress });
      const hp = Math.max(0, (s.progress * 7 - 6) / 0.7);
      gsap.set('.fit__photo', { autoAlpha: Math.min(1, hp) });
    },
  });
  ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => state.fit.setActive(s.isActive), onRefresh: (s) => state.fit.setActive(s.isActive) });
  setStage(0);
  dots.forEach((d, i) => d.addEventListener('click', () => {
    const y = st.start + (st.end - st.start) * ((i + 0.62) / 7);
    state.lenis ? state.lenis.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y, behavior: 'smooth' });
  }));
  gsap.fromTo('.fit__title', { autoAlpha: 0 }, { autoAlpha: 1, scrollTrigger: { trigger: sec, start: 'top 60%', toggleActions: 'play none none reverse' } });
}

/* ---------------- SCENE 07: services ---------------- */
function sceneServices(desk) {
  const items = $$('.svc__item'), imgs = $$('.svc__frame img'), tag = $('.svc__tag span');
  let cur = -1, z = 2;
  gsap.set(imgs, { zIndex: 0 }); gsap.set(imgs[0], { zIndex: 1 });
  function setActive(i) {
    if (i === cur || i < 0) return;
    cur = i;
    items.forEach((it, n) => { it.classList.toggle('is-on', n === i); $('a', it).toggleAttribute('aria-current', n === i); });
    gsap.set(imgs[i], { zIndex: ++z });
    gsap.fromTo(imgs[i], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1, ease: 'zMask', overwrite: true });
    gsap.to(tag, { yPercent: -110, duration: 0.3, ease: 'zInOut', onComplete: () => { tag.textContent = $('h3', items[i]).textContent; gsap.fromTo(tag, { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: 'zOut' }); } });
  }
  items.forEach((it, i) => {
    ScrollTrigger.create({ trigger: it, start: desk ? 'top 55%' : 'top 64%', end: desk ? 'bottom 55%' : 'bottom 64%', onToggle: (s) => s.isActive && setActive(i) });
    it.addEventListener('mouseenter', () => setActive(i));
    $('a', it).addEventListener('focus', () => setActive(i));
  });
  setActive(0);
  gsap.fromTo(splitLines($('.svc__head h2')).lines, { yPercent: 105 }, { yPercent: 0, duration: 1, ease: 'zOut', stagger: 0.08, scrollTrigger: { trigger: '.svc__head', start: 'top 80%' } });
  gsap.fromTo('.svc__frame', { clipPath: 'inset(18% 18% 18% 18%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.svc__body', start: 'top bottom', end: 'top 30%', scrub: 0.8 } });
}

/* ---------------- SCENE 08: voices ---------------- */
function sceneVoices(desk, L) {
  const sec = $('.voices');
  const q0 = $('.voices__q');
  const words = splitWords($('blockquote p', q0)).words;
  gsap.fromTo(sec, { borderRadius: '32px 32px 0 0' }, { borderRadius: '0px 0px 0 0', ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: true } });
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: L('+=140%', '+=120%'), pin: '.voices__stage', scrub: 0.8 } });
  tl.fromTo('.voices__photo', { clipPath: 'inset(30% 30% 30% 30%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: 'zInOut' }, 0)
    .fromTo('.voices__photo img', { scale: 1.3 }, { scale: 1, duration: 0.35 }, 0)
    .fromTo('.voices__h', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.05)
    .fromTo(words, { opacity: 0.16 }, { opacity: 1, duration: 0.02, stagger: 0.5 / words.length }, 0.2)
    .fromTo('.voices__q figcaption', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.74)
    .fromTo('.voices__tabs button', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.08, stagger: 0.03 }, 0.82);
}

/* ---------------- SCENE 09: awards ---------------- */
function sceneAwards() {
  gsap.fromTo(splitLines($('.awards__head h2')).lines, { yPercent: 105 }, { yPercent: 0, duration: 1, ease: 'zOut', scrollTrigger: { trigger: '.awards', start: 'top 75%' } });
  gsap.fromTo('.award', { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'zOut', stagger: 0.08, scrollTrigger: { trigger: '.awards__cards', start: 'top 85%' } });
}

/* ---------------- SCENE 10: research ---------------- */
function sceneResearch(desk, L) {
  const sec = $('.res');
  const titles = $$('.res__titles p').map((p) => splitLines(p));
  const imgs = $$('.res__img img'), items = $$('.res__list li');
  titles.slice(1).forEach((t) => gsap.set(t.lines, { yPercent: 105 }));
  gsap.set(imgs.slice(1), { clipPath: 'inset(0% 0% 0% 100%)' });
  gsap.set(items.slice(1), { autoAlpha: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: L('+=200%', '+=180%'), pin: '.res__stage', scrub: 0.8 } });
  tl.fromTo('.res__img', { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.12, ease: 'zInOut' }, 0)
    .fromTo(titles[0].lines, { yPercent: 105 }, { yPercent: 0, duration: 0.1, stagger: 0.02, ease: 'zOut' }, 0.04)
    .fromTo(items[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.1);
  [1, 2].forEach((i) => {
    const at = i === 1 ? 0.38 : 0.7;
    tl.to(titles[i - 1].lines, { yPercent: -105, duration: 0.08, stagger: 0.015, ease: 'zInOut' }, at)
      .to(titles[i].lines, { yPercent: 0, duration: 0.1, stagger: 0.02, ease: 'zOut' }, at + 0.05)
      .to(imgs[i], { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.12, ease: 'zMask' }, at)
      .fromTo(imgs[i], { scale: 1.2 }, { scale: 1, duration: 0.14 }, at)
      .to(items[i - 1], { autoAlpha: 0, duration: 0.04 }, at)
      .to(items[i], { autoAlpha: 1, duration: 0.06 }, at + 0.06);
  });
  tl.fromTo('.res__all', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.85);
}

/* ---------------- SCENE 11: contact ---------------- */
function sceneContact(desk, L) {
  const sec = $('.contact');
  const h = splitChars($('.contact__inner h2'));
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: L('+=110%', '+=100%'), pin: '.contact__stage', scrub: 0.8 } });
  tl.fromTo('.contact__bg', { clipPath: 'circle(0% at 50% 50%)', scale: 1.15 }, { clipPath: 'circle(75% at 50% 50%)', scale: 1, duration: 0.45, ease: 'zInOut' }, 0)
    .fromTo(h.chars, { yPercent: 110 }, { yPercent: 0, duration: 0.2, stagger: 0.25 / h.chars.length, ease: 'zOut' }, 0.28)
    .fromTo('.contact__line', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.12 }, 0.6)
    .fromTo('.contact__acts > *', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.04 }, 0.66);
  // magnetic button
  const b = $('[data-magnet]');
  if (b && !isTouch && !b._mag) {
    b._mag = true;
    const label = $('span', b);
    const xb = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), yb = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
    const xl = gsap.quickTo(label, 'x', { duration: 0.6, ease: 'power3' }), yl = gsap.quickTo(label, 'y', { duration: 0.6, ease: 'power3' });
    addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy);
      if (d < 100 + r.width / 2) { xb(dx * 0.12); yb(dy * 0.2); xl(dx * 0.08); yl(dy * 0.12); }
      else { xb(0); yb(0); xl(0); yl(0); }
    });
  }
}

/* ---------------- SCENE 12: footer ---------------- */
function sceneFooter() {
  gsap.fromTo('.foot__word span', { yPercent: 100 }, { yPercent: 0, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: '.foot__word', start: 'top bottom', end: 'bottom bottom', scrub: 0.8 } });
  gsap.fromTo('.foot__grid > div', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'zOut', stagger: 0.05, scrollTrigger: { trigger: '.foot__grid', start: 'top 85%' } });
}
