// Shared across every page: page transitions, cursor labels, nav behaviour, menu, magnetic buttons.
const { gsap } = window;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
export const MOTION = () => root.classList.contains('motion');

export function eases() {
  const { CustomEase } = window;
  gsap.registerPlugin(window.ScrollTrigger, window.SplitText, CustomEase);
  if (!CustomEase.get('zOut')) {
    CustomEase.create('zOut', '0.16,1,0.3,1');
    CustomEase.create('zInOut', '0.65,0,0.35,1');
    CustomEase.create('zMask', '0.77,0,0.175,1');
  }
}

/* Page transition: twelve column panels close like blinds, the next page opens them. */
export function transitions() {
  const pt = $('.pt');
  if (!pt) return;
  const panels = [...pt.children];
  if (root.classList.contains('pt-in')) {
    if (!MOTION()) root.classList.remove('pt-in');
    else gsap.fromTo(panels, { scaleY: 1 }, {
      scaleY: 0, transformOrigin: '50% 0%', duration: 0.75, ease: 'zInOut', delay: 0.08,
      stagger: { each: 0.03, from: 'edges' },
      onComplete: () => { root.classList.remove('pt-in'); gsap.set(panels, { clearProps: 'transform' }); },
    });
  }
  try { sessionStorage.removeItem('zy-pt'); sessionStorage.setItem('zy-loaded', '1'); } catch (e) {}

  document.addEventListener('click', (ev) => {
    const a = ev.target.closest && ev.target.closest('a[href]');
    if (!a || ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download') || a.hasAttribute('data-concept')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    ev.preventDefault();
    try { sessionStorage.setItem('zy-pt', '1'); } catch (e) {}
    if (!MOTION()) { location.href = url.href; return; }
    pt.classList.add('is-on');
    gsap.fromTo(panels, { scaleY: 0 }, {
      scaleY: 1, transformOrigin: '50% 100%', duration: 0.6, ease: 'zInOut',
      stagger: { each: 0.03, from: 'center' }, onComplete: () => { location.href = url.href; },
    });
  });
  addEventListener('pageshow', (ev) => {
    if (ev.persisted) { pt.classList.remove('is-on'); root.classList.remove('pt-in'); gsap.set(panels, { clearProps: 'transform' }); }
  });
}

/* Cursor label: a small bubble that names what a click does (View, Read, Next, Drag). Desktop only. */
export function cursor() {
  if (!matchMedia('(pointer: fine)').matches) return;
  const c = document.createElement('div');
  c.className = 'cur'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<span></span>';
  document.body.appendChild(c);
  const label = c.firstChild;
  const xTo = gsap.quickTo(c, 'x', { duration: 0.45, ease: 'power3' });
  const yTo = gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' });
  addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest && e.target.closest('[data-cursor]');
    if (t) { label.textContent = t.dataset.cursor; c.classList.add('is-on'); }
    else c.classList.remove('is-on');
  });
  document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
}

/* Nav: hides on the way down, returns on the way up; colour follows the section underneath. */
export function navBehaviour() {
  const nav = $('.nav');
  if (!nav) return;
  let theme = nav.dataset.theme, last = 0;
  const update = () => {
    const y = window.scrollY;
    const menuOpen = $('.nav__menu') && $('.nav__menu').getAttribute('aria-expanded') === 'true';
    if (!menuOpen) {
      if (y > 120 && y > last + 2) gsap.to(nav, { yPercent: -100, duration: 0.4, ease: 'zOut', overwrite: true });
      else if (y < last - 2 || y < 120) gsap.to(nav, { yPercent: 0, duration: 0.4, ease: 'zOut', overwrite: true });
    }
    last = y;
    const el = document.elementsFromPoint(innerWidth / 2, 36).find((n) => n.closest && n.closest('[data-theme]') && !n.closest('.nav'));
    const sec = el && el.closest('[data-theme]');
    const t = sec && (sec.dataset.navTheme || sec.dataset.theme);
    if (t && t !== theme) { theme = t; nav.dataset.theme = t; }
  };
  addEventListener('scroll', update, { passive: true });
  update();
}

/* Mobile menu: circle wipe from the button, Escape closes, focus returns. */
export function menu() {
  const btn = $('.nav__menu'), panel = $('#menu');
  if (!btn || !panel || btn._menu) return;
  btn._menu = true;
  const at = () => { const r = btn.getBoundingClientRect(); return `${r.left + r.width / 2}px ${r.top + r.height / 2}px`; };
  const close = (focus = true) => {
    btn.setAttribute('aria-expanded', 'false'); btn.textContent = 'Menu';
    gsap.to(panel, { clipPath: `circle(0% at ${at()})`, duration: MOTION() ? 0.6 : 0, ease: 'zMask', onComplete: () => { panel.hidden = true; } });
    if (focus) btn.focus();
  };
  const open = () => {
    panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.textContent = 'Close';
    gsap.fromTo(panel, { clipPath: `circle(0% at ${at()})` }, { clipPath: `circle(150% at ${at()})`, duration: MOTION() ? 0.9 : 0, ease: 'zMask' });
    if (MOTION()) gsap.fromTo($$('nav a', panel), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.05, duration: 0.8, ease: 'zOut', delay: 0.2 });
    $('nav a', panel).focus();
  };
  btn.addEventListener('click', () => (btn.getAttribute('aria-expanded') === 'true' ? close() : open()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  $$('a', panel).forEach((a) => a.addEventListener('click', () => close(false)));
}

/* Rolling nav labels */
export function rollLabels() {
  $$('[data-roll-text]').forEach((s) => {
    if (s.parentElement.classList.contains('rt-mask')) return;
    s.setAttribute('data-label', s.textContent);
    const m = document.createElement('span'); m.className = 'rt-mask'; s.replaceWith(m); m.appendChild(s);
  });
}

/* Magnetic buttons */
export function magnets() {
  if (!matchMedia('(pointer: fine)').matches) return;
  $$('[data-magnet]').forEach((b) => {
    if (b._mag) return; b._mag = true;
    const label = $('span', b) || b;
    const xb = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), yb = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
    const xl = gsap.quickTo(label, 'x', { duration: 0.6, ease: 'power3' }), yl = gsap.quickTo(label, 'y', { duration: 0.6, ease: 'power3' });
    addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < 100 + r.width / 2) { xb(dx * 0.12); yb(dy * 0.2); xl(dx * 0.08); yl(dy * 0.12); } else { xb(0); yb(0); xl(0); yl(0); }
    }, { passive: true });
  });
}

/* Smooth scroll on desktop; native on touch. */
export function smooth() {
  const { ScrollTrigger } = window;
  if (matchMedia('(pointer: coarse)').matches || !window.Lenis || !MOTION()) return null;
  const lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* Footer wordmark rises letter by letter at the end of every page. */
export function footerWord() {
  if (!MOTION() || !$('.foot__word')) return;
  gsap.fromTo('.foot__word span', { yPercent: 100 }, { yPercent: 0, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: '.foot__word', start: 'top bottom', end: 'bottom bottom', scrub: 0.8 } });
}
