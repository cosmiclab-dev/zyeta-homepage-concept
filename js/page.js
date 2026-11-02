// Inner pages: one set of reusable motion primitives driven by data attributes,
// plus the few interactive pieces (project list, gallery, stack, filters, clocks, accordion, form).
import { eases, transitions, cursor, navBehaviour, menu, rollLabels, magnets, smooth, footerWord, MOTION } from './shared.js';

const { gsap, ScrollTrigger, SplitText } = window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const desk = () => matchMedia('(min-width: 1024px)').matches;
const fine = matchMedia('(pointer: fine)').matches;

eases();
rollLabels();
menu();
transitions();
cursor();
clocks();
accordion();
form();
filters();
const lenis = smooth();

/* -------- things that work with or without motion -------- */
function clocks() {
  const els = $$('[data-tz]');
  if (!els.length) return;
  const fmt = {};
  const tick = () => els.forEach((el) => {
    const tz = el.dataset.tz;
    fmt[tz] = fmt[tz] || new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz, hour12: false });
    el.textContent = `${fmt[tz].format(new Date())} local time`;
  });
  tick(); setInterval(tick, 20000);
}

function accordion() {
  $$('.acc__item button').forEach((b) => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!open));
    b.closest('.acc__item').classList.toggle('is-open', !open);
  }));
}

function form() {
  const f = $('.form__f');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = $$('[required]', f).filter((i) => !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
    $$('.fld', f).forEach((x) => x.classList.remove('is-bad'));
    if (bad.length) { bad.forEach((i) => i.closest('.fld').classList.add('is-bad')); bad[0].focus(); return; }
    const m = $('.form__msg', f); m.hidden = false;
    if (MOTION()) gsap.fromTo(m, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'zOut' });
  });
}

function filters() {
  const chips = $$('.chip');
  if (!chips.length) return;
  const cards = $$('.ins__card');
  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    if (MOTION()) return; // the motion version animates the reflow
    const f = c.dataset.filter;
    cards.forEach((card) => { card.hidden = !(f === 'All' || card.dataset.cat === f); });
  }));
}

/* -------- motion -------- */
if (MOTION()) document.fonts.ready.then(run);
else { navBehaviour(); }

function run() {
  navBehaviour();
  magnets();
  const arriving = document.documentElement.classList.contains('pt-in');
  const d0 = arriving ? 0.45 : 0.1;

  // hero title: characters rise through line masks
  $$('[data-split]').forEach((el, i) => {
    const sp = SplitText.create(el, { type: 'lines,chars', mask: 'lines', linesClass: 'sl' });
    const inHero = el.closest('.ph, .pjh');
    const tw = { yPercent: 0, rotate: 0, duration: 1.1, ease: 'zOut', stagger: 0.018 };
    if (inHero) gsap.fromTo(sp.chars, { yPercent: 110, rotate: 4 }, { ...tw, delay: d0 });
    else gsap.fromTo(sp.chars, { yPercent: 110, rotate: 4 }, { ...tw, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  // hero support text
  $$('.ph__crumb, .pjh .ph__crumb').forEach((el) => gsap.fromTo(el, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'zOut', delay: d0 }));

  // lines rise
  $$('[data-lines]').forEach((el) => {
    const sp = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'sl' });
    const inHero = el.closest('.ph, .pjh');
    const tw = { yPercent: 0, duration: 1, ease: 'zOut', stagger: 0.08 };
    if (inHero) gsap.fromTo(sp.lines, { yPercent: 105 }, { ...tw, delay: d0 + 0.35 });
    else gsap.fromTo(sp.lines, { yPercent: 105 }, { ...tw, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // reading highlight: words brighten as the paragraph crosses the screen
  $$('[data-read]').forEach((el) => {
    const words = SplitText.create(el, { type: 'words', wordsClass: 'sw' }).words;
    gsap.fromTo(words, { opacity: 0.16 }, { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 } });
  });

  // hero media grows from an inset frame to full bleed
  $$('[data-grow]').forEach((el) => {
    const im = $('img', el);
    const from = desk() ? 'inset(0% 22% 0% 22% round 8px)' : 'inset(0% 6% 0% 6% round 8px)';
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 8%', scrub: 0.8 } })
      .fromTo(el, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' }, 0)
      .fromTo(im, { scale: 1.3 }, { scale: 1, ease: 'none' }, 0);
    gsap.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: 'zOut', delay: d0 + 0.3 });
  });

  // project hero: photo settles, then drifts as the text block scrolls over it
  $$('[data-zoom]').forEach((el) => {
    const im = $('img', el);
    gsap.fromTo(im, { scale: 1.18 }, { scale: 1, duration: 1.8, ease: 'zOut', delay: d0 });
    gsap.to(im, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
  });

  // image wipes up into its frame
  $$('[data-clip]').forEach((el) => {
    const im = $('img', el);
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%' } })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'zMask' }, 0)
      .fromTo(im, { scale: 1.25 }, { scale: 1, duration: 1.6, ease: 'zOut' }, 0);
  });

  // parallax drift
  $$('[data-parallax]').forEach((el) => {
    const s = parseFloat(el.dataset.parallax) || 6;
    gsap.fromTo(el, { yPercent: s }, { yPercent: -s, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // drawn rules between list items
  $$('[data-rules] > *').forEach((li) => {
    const r = document.createElement('i'); r.className = 'rule'; r.setAttribute('aria-hidden', 'true'); li.prepend(r);
    gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 90%' } })
      .fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'zOut' })
      .fromTo([...li.children].filter((c) => c !== r), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'zOut', stagger: 0.05 }, 0.15);
  });

  // rolling numbers
  $$('.roll').forEach(buildRoll);
  $$('.nums__row, .sv__stat').forEach((row) => {
    gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%' } })
      .fromTo($$('.rs', row), { yPercent: 0 }, { yPercent: (i, t) => -t.dataset.d * 10, duration: 1.4, ease: 'zOut', stagger: 0.06 })
      .fromTo(row.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'zOut', stagger: 0.08 }, 0);
  });

  // stages strip: ticks rise, the line runs across
  $$('[data-stages]').forEach((ol) => {
    gsap.timeline({ scrollTrigger: { trigger: ol, start: 'top 85%' } })
      .fromTo(ol, { '--run': 0 }, { '--run': 1, duration: 1.6, ease: 'zInOut' })
      .fromTo(ol.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'zOut', stagger: 0.08 }, 0.1);
  });

  floatList('.wl__list', '.wl__row', '.wl');
  floatList('.more__list', 'li > a', '.more');
  gallery();
  nextProject();
  stack();
  film();
  insightsFlip();
  mosaic();
  footerWord();
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => gsap.set('.progress', { scaleX: s.progress }) });
  addEventListener('load', () => ScrollTrigger.refresh());
}

function buildRoll(el) {
  if (el.dataset.built) return;
  const val = el.dataset.roll || el.textContent;
  el.textContent = ''; el.setAttribute('aria-label', val);
  [...val].forEach((ch) => {
    if (/\d/.test(ch)) {
      const d = document.createElement('span'); d.className = 'rd'; d.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span'); s.className = 'rs';
      for (let i = 0; i <= 9; i++) { const n = document.createElement('i'); n.textContent = i; s.appendChild(n); }
      s.dataset.d = ch; gsap.set(s, { yPercent: -ch * 10 }); d.appendChild(s); el.appendChild(d);
    } else { const t = document.createElement('span'); t.textContent = ch; el.appendChild(t); }
  });
  el.dataset.built = 1;
}

/* A list where hovering a row shows its photograph following the pointer. */
function floatList(listSel, rowSel, scopeSel) {
  const list = $(listSel); if (!list || !fine) return;
  const scope = list.closest(scopeSel); const box = $('.wl__float', scope); if (!box) return;
  const im = $('img', box);
  const xTo = gsap.quickTo(box, 'x', { duration: 0.7, ease: 'power3' }), yTo = gsap.quickTo(box, 'y', { duration: 0.7, ease: 'power3' });
  const rTo = gsap.quickTo(box, 'rotate', { duration: 0.9, ease: 'power3' });
  let lx = 0;
  list.addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); rTo(Math.max(-8, Math.min(8, (e.clientX - lx) * 0.6))); lx = e.clientX; });
  $$(rowSel, list).forEach((row) => {
    const src = row.dataset.img || (row.closest('[data-img]') && row.closest('[data-img]').dataset.img);
    row.addEventListener('pointerenter', () => {
      if (im.getAttribute('src') !== src) { im.src = src; gsap.fromTo(im, { scale: 1.2 }, { scale: 1, duration: 0.8, ease: 'zOut' }); }
      gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'zOut' });
      list.classList.add('is-hover'); row.classList.add('is-on');
    });
    row.addEventListener('pointerleave', () => { row.classList.remove('is-on'); });
  });
  list.addEventListener('pointerleave', () => { gsap.to(box, { autoAlpha: 0, scale: 0.7, duration: 0.4, ease: 'zOut' }); list.classList.remove('is-hover'); });
}

/* Project gallery: pinned, scrolls sideways on desktop; native swipe on touch. */
function gallery() {
  const sec = $('.hg'); if (!sec) return;
  const track = $('.hg__track', sec), n = $('.hg__n', sec);
  const figs = $$('.hg__f', sec);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    const dist = () => track.scrollWidth - innerWidth + parseFloat(getComputedStyle(sec).paddingLeft || 0);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: '.hg__pin', scrub: 0.8, invalidateOnRefresh: true,
      onUpdate: (s) => { n.textContent = Math.min(figs.length, 1 + Math.round(s.progress * (figs.length - 1))); } } });
    tl.to(track, { x: () => -dist(), ease: 'none' }, 0);
    figs.forEach((f) => tl.fromTo($('img', f), { xPercent: -8 }, { xPercent: 8, ease: 'none' }, 0));
  });
  mm.add('(max-width: 1023px)', () => {
    track.addEventListener('scroll', () => { const w = figs[0].offsetWidth; n.textContent = Math.min(figs.length, 1 + Math.round(track.scrollLeft / w)); }, { passive: true });
  });
}

/* Next project: the photograph opens out of a slit as you reach the end of the page. */
function nextProject() {
  const el = $('[data-grow-next]'); if (!el) return;
  gsap.timeline({ scrollTrigger: { trigger: '.next', start: 'top 85%', end: 'bottom bottom', scrub: 0.8 } })
    .fromTo(el, { clipPath: 'inset(42% 30% 42% 30%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none' }, 0)
    .fromTo($('img', el), { scale: 1.4 }, { scale: 1, ease: 'none' }, 0);
  gsap.fromTo('.next__name', { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: '.next', start: 'top 80%', end: 'top 30%', scrub: 0.8 } });
}

/* Services: each card pins while the next slides over it; the one underneath recedes. */
function stack() {
  const cards = $$('.stack__card'); if (!cards.length) return;
  cards.forEach((c, i) => {
    const next = cards[i + 1];
    gsap.fromTo($('.stack__media img', c), { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'top top', scrub: true } });
    gsap.fromTo($$('.stack__body > *', c), { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'zOut', stagger: 0.08, scrollTrigger: { trigger: c, start: 'top 45%' } });
    if (!next) return;
    gsap.to(c, { scale: 0.9, '--dim': 0.6, borderRadius: 24, ease: 'none', scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } });
  });
}

/* Careers photo film: drifts on its own, speeds up with scroll. */
function film() {
  const t = $('.film__track'); if (!t) return;
  const loop = gsap.to(t, { xPercent: -50, duration: 50, ease: 'none', repeat: -1 });
  ScrollTrigger.create({ trigger: '.film', start: 'top bottom', end: 'bottom top',
    onUpdate: (s) => { const v = Math.min(6, 1 + Math.abs(s.getVelocity()) / 300); gsap.to(loop, { timeScale: v * (s.direction || 1), duration: 0.3, overwrite: true }); gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.3 }); } });
}

/* Insights filter: cards reflow with Flip-style motion (positions measured before and after). */
function insightsFlip() {
  const chips = $$('.chip'); if (!chips.length) return;
  const cards = $$('.ins__card');
  chips.forEach((c) => c.addEventListener('click', () => {
    const f = c.dataset.filter;
    const first = new Map(cards.filter((x) => !x.hidden).map((x) => [x, x.getBoundingClientRect()]));
    cards.forEach((card) => { card.hidden = !(f === 'All' || card.dataset.cat === f); });
    cards.filter((x) => !x.hidden).forEach((x, i) => {
      const a = first.get(x), b = x.getBoundingClientRect();
      if (a) gsap.fromTo(x, { x: a.left - b.left, y: a.top - b.top }, { x: 0, y: 0, duration: 0.8, ease: 'zInOut' });
      else gsap.fromTo(x, { autoAlpha: 0, y: 40, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: 'zOut', delay: 0.05 * i });
    });
    ScrollTrigger.refresh();
  }));
  gsap.fromTo(cards, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'zOut', stagger: 0.06, scrollTrigger: { trigger: '.ins__grid', start: 'top 85%' } });
}

function mosaic() {
  const g = $('.mosaic__grid'); if (!g) return;
  gsap.fromTo($$('.mosaic__f', g), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'zMask', stagger: 0.1, scrollTrigger: { trigger: g, start: 'top 80%' } });
}

void lenis;
