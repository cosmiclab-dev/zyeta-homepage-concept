#!/usr/bin/env python3
"""Generates the inner pages of the Zyeta concept site and keeps the shared
navigation, menu and footer of index.html in sync. Run from the repo root:
    python3 build/build.py
"""
import html, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from content import *

V = '8'  # asset version, bump to skip browser caches
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
e = html.escape
PROJ = {p['slug']: p for p in PROJECTS}

NAV = [('Work', 'work.html'), ('Services', 'services.html'), ('Studio', 'studio.html'),
       ('Insights', 'insights.html'), ('Careers', 'careers.html'), ('Contact', 'contact.html')]


def nav(p, current='', pause=False):
    links = ''.join(f'<a href="{p}{h}"{" aria-current=\"page\"" if h == current else ""}><span data-roll-text>{t}</span></a>' for t, h in NAV)
    pause_btn = '<button class="nav__pause" type="button" aria-pressed="false" data-pause>Pause motion</button>' if pause else ''
    return f'''<!-- nav -->
<header class="nav" data-theme="dark">
  <a class="nav__mark" href="{p}index.html" aria-label="Zyeta, home">ZYETA</a>
  <nav class="nav__links" aria-label="Main">{links}</nav>
  <div class="nav__end">
    {pause_btn}
    <a class="btn btn--pill nav__cta" href="{p}contact.html#brief">Send a brief</a>
    <button class="nav__menu" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
  </div>
</header>
<div class="menu" id="menu" hidden>
  <nav aria-label="Menu">{''.join(f'<a href="{p}{h}">{t}</a>' for t, h in [('Home', 'index.html')] + NAV)}</nav>
  <p class="menu__offices">{', '.join(o[0] for o in OFFICES)}</p>
</div>
<!-- /nav -->'''


def footer(p, cta=True):
    svc = ''.join(f'<li><a href="{p}services/{s["slug"]}.html">{e(s["name"])}</a></li>' for s in SERVICES)
    return f'''<!-- footer -->
<footer class="foot" data-theme="dark">
  {f'<div class="foot__cta"><p class="foot__ask display">Send the floor, the headcount and the date.</p><a class="btn btn--big" href="{p}contact.html#brief" data-magnet><span>Send a brief</span></a></div>' if cta else ''}
  <div class="foot__grid">
    <div><h2 class="small">Studio</h2><p>138, Field Marshal Cariappa Rd<br>Shanthala Nagar, Ashok Nagar<br>Bengaluru, Karnataka 560025</p><p class="foot__tel">+91 63645 99441</p></div>
    <div><h2 class="small">Services</h2><ul>{svc}</ul></div>
    <div><h2 class="small">Explore</h2><ul><li><a href="{p}work.html">Work</a></li><li><a href="{p}studio.html">Studio</a></li><li><a href="{p}insights.html">Insights</a></li><li><a href="{p}careers.html">Careers</a></li><li><a href="{p}contact.html">Contact</a></li></ul></div>
    <div><h2 class="small">Locations</h2><p>{', '.join(o[0] for o in OFFICES)}</p></div>
    <div><h2 class="small">Follow</h2><ul><li><a href="https://www.linkedin.com/company/9431681/" target="_blank" rel="noopener">LinkedIn</a></li><li><a href="https://www.instagram.com/zyeta_official/" target="_blank" rel="noopener">Instagram</a></li><li><a href="https://www.youtube.com/channel/UCQvUrmPI_JJtdvjoc7bY1pQ" target="_blank" rel="noopener">YouTube</a></li><li><a href="https://zyeta.medium.com/" target="_blank" rel="noopener">Medium</a></li></ul></div>
    <div><h2 class="small">Official site</h2><ul><li><a href="https://www.zyeta.com/" target="_blank" rel="noopener">zyeta.com</a></li><li><a href="https://www.zyeta.com/privacy-policy/" target="_blank" rel="noopener">Privacy policy</a></li><li><a href="https://www.zyeta.com/terms-and-conditions/" target="_blank" rel="noopener">Terms</a></li></ul></div>
  </div>
  <p class="foot__word" aria-hidden="true"><span>Z</span><span>Y</span><span>E</span><span>T</span><span>A</span></p>
  <div class="foot__base small"><p>Design concept for Zyeta, 2026</p><a href="#main" class="foot__top">Back to top</a></div>
</footer>
<!-- /footer -->'''


HEAD_SCRIPT = '''<script>
  (function () {
    var d = document.documentElement, rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    d.classList.add(rm ? 'no-motion' : 'motion'); d.classList.remove(rm ? 'motion' : 'no-motion');
    try {
      if (sessionStorage.getItem('zy-loaded')) d.classList.add('seen');
      if (!rm && sessionStorage.getItem('zy-pt')) { d.classList.add('pt-in'); setTimeout(function () { d.classList.remove('pt-in'); }, 2500); }
    } catch (e) {}
  })();
</script>'''

CONCEPT = '<p class="concept" role="note">Design concept. Not the official Zyeta website.</p>'
PT = '<div class="pt" aria-hidden="true">' + '<i></i>' * 12 + '</div>'
COLS = '<div class="cols" aria-hidden="true">' + '<span></span>' * 12 + '</div>'


def page(path, title, desc, body, theme='light', current='', cta=True):
    depth = path.count('/')
    p = '../' * depth
    out = f'''<!doctype html>
<html lang="en" class="no-motion">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(title)} | Zyeta Concept</title>
<meta name="robots" content="noindex, nofollow">
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#1F2B27">
<link rel="preload" as="font" href="{p}media/UntitledSans-Regular.ttf" type="font/ttf" crossorigin>
<link rel="stylesheet" href="{p}css/site.css?v={V}">
<link rel="stylesheet" href="{p}css/pages.css?v={V}">
{HEAD_SCRIPT}
</head>
<body class="inner" data-page="{path.split('/')[-1][:-5]}">
<a class="skip" href="#main">Skip to content</a>
{CONCEPT}
{COLS}
<div class="progress" aria-hidden="true"></div>
{PT}
{nav(p, current)}
<main id="main">
{body}
</main>
{footer(p, cta)}
<script src="{p}vendor/gsap.min.js"></script>
<script src="{p}vendor/ScrollTrigger.min.js"></script>
<script src="{p}vendor/SplitText.min.js"></script>
<script src="{p}vendor/CustomEase.min.js"></script>
<script src="{p}vendor/lenis.min.js"></script>
<script type="module" src="{p}js/page.js?v={V}"></script>
</body>
</html>
'''
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, 'w').write(out)
    return out


def img(p, name, alt='', cls='', lazy=True, attrs=''):
    return f'<img src="{p}media/img/{name}.webp" alt="{e(alt)}"{" class=" + chr(34) + cls + chr(34) if cls else ""}{" loading=\"lazy\"" if lazy else ""} decoding="async"{attrs}>'


def hero(p, crumb, title, sub, image=None, alt='', theme='light'):
    media = f'<div class="ph__media" data-grow>{img(p, image, alt, lazy=False)}</div>' if image else ''
    return f'''<section class="ph" data-theme="{theme}">
  <div class="ph__inner">
    <p class="ph__crumb small">{crumb}</p>
    <h1 class="ph__title display" data-split>{title}</h1>
    {f'<p class="ph__sub subtitle" data-lines>{sub}</p>' if sub else ''}
  </div>
  {media}
</section>'''


def cta(p, text='Send the floor, the headcount and the date.'):
    return ''  # the footer carries the closing call to action on every page


def stages_strip(active):
    items = ''.join(f'<li class="{"is-on" if i in active else ""}"><span class="stages__n">0{i + 1}</span><span>{s}</span></li>' for i, s in enumerate(STAGES))
    return f'<ol class="stages" data-stages>{items}</ol>'


# ---------------- WORK ----------------
def build_work():
    p = ''
    rows = ''.join(f'''<li class="wl__row" data-img="media/img/{pr['img']}-1.webp">
  <a href="work/{pr['slug']}.html" data-cursor="View">
    <span class="wl__thumb">{img(p, pr['img'] + '-1', '')}</span>
    <span class="wl__name title">{e(pr['name'])}</span>
    <span class="wl__client">{e(pr['client'])}</span>
    <span class="wl__city">{e(pr['city'].split(',')[0])}</span>
    <span class="wl__year">{pr['year']}</span>
  </a>
</li>''' for pr in PROJECTS)
    body = hero(p, 'Work', 'Floors we have handed over', 'Five workplaces, photographed at handover. More than 186 workplace projects delivered across India and APAC.') + f'''
<section class="wl" data-theme="light" aria-label="Projects">
  <div class="wl__head small" aria-hidden="true"><span>Project</span><span>Client</span><span>City</span><span>Year</span></div>
  <ol class="wl__list">{rows}</ol>
  <div class="wl__float" aria-hidden="true"><img alt=""></div>
</section>
<section class="mosaic" data-theme="dark" aria-label="On the floor">
  <h2 class="title mosaic__h" data-lines>On the floor</h2>
  <div class="mosaic__grid">
    {''.join(f'<figure class="mosaic__f" data-parallax="{s}">{img(p, n, a)}</figure>' for n, a, s in [
        ('iffhyderabad-4', 'IFF Hyderabad, a staircase in a double-height space', '-8'),
        ('linkedinbengaluruworkplacedesign-5', 'LinkedIn Bengaluru, a mural-lined meeting room', '6'),
        ('7elevenphase2-5', '7-Eleven Bengaluru, a long cafeteria under strip lights', '-4'),
        ('tdcxasiasleadingdigitaltransformat-3', 'TDCX Hyderabad, colourful breakout seating', '10'),
        ('7elevenbengaluru-1', '7-Eleven Bengaluru, a planted breakout with neon lighting', '-6'),
        ('iffhyderabad-6', 'IFF Hyderabad, a bright cafe counter', '4')])}
  </div>
</section>'''
    page('work.html', 'Work', 'Workplaces designed and built by Zyeta across India and APAC.', body, current='work.html')


def build_project(i, pr):
    p = '../'
    nxt = PROJECTS[(i + 1) % len(PROJECTS)]
    gal = ''.join(f'<figure class="hg__f">{img(p, pr["img"] + "-" + str(k), pr["client"] + ", " + pr["city"].split(",")[0])}</figure>' for k in range(2, 8))
    body = f'''<section class="pjh" data-theme="dark" style="--pbg:{pr['bg']}">
  <div class="pjh__media" data-zoom>{img(p, pr['img'] + '-1', pr['client'] + ' workplace, ' + pr['city'], lazy=False)}</div>
  <div class="pjh__text">
    <p class="ph__crumb small"><a href="../work.html">Work</a> / {e(pr['client'])}</p>
    <h1 class="display" data-split>{e(pr['name'])}</h1>
    <p class="subtitle" data-lines>{e(pr['sub'])}</p>
  </div>
</section>
<section class="meta" data-theme="light" aria-label="Project facts">
  <dl class="meta__grid" data-rules>
    <div><dt class="small">Client</dt><dd>{e(pr['client'])}</dd></div>
    <div><dt class="small">Location</dt><dd>{e(pr['city'])}</dd></div>
    <div><dt class="small">Year</dt><dd>{pr['year']}</dd></div>
    <div><dt class="small">On the floor</dt><dd>{e(pr['floor'])}</dd></div>
  </dl>
</section>
<section class="brief" data-theme="light" aria-labelledby="brief-h">
  <h2 class="small brief__h" id="brief-h">The brief, and the floor</h2>
  <div class="brief__text">
    <p class="brief__lead" data-read>{e(pr['brief'][0])}</p>
    <p data-lines>{e(pr['brief'][1])}</p>
  </div>
  <figure class="brief__img" data-clip>{img(p, pr['img'] + '-2', pr['client'] + ' floor detail')}</figure>
</section>
<section class="hg" data-theme="dark" aria-label="Gallery" style="--pbg:{pr['bg']}">
  <div class="hg__pin">
    <p class="hg__k small">On the floor, {e(pr['city'].split(',')[0])}</p>
    <div class="hg__track">{gal}</div>
    <p class="hg__count small" aria-hidden="true"><span class="hg__n">1</span> of 6</p>
  </div>
</section>
<section class="next" data-theme="dark" style="--pbg:{nxt['bg']}">
  <a class="next__link" href="{nxt['slug']}.html" data-cursor="Next">
    <span class="next__k small">Next project</span>
    <span class="next__name display">{e(nxt['name'])}</span>
    <span class="next__meta small">{e(nxt['client'])}, {e(nxt['city'].split(',')[0])}, {nxt['year']}</span>
    <span class="next__media" data-grow-next>{img(p, nxt['img'] + '-1', '')}</span>
  </a>
</section>'''
    page(f'work/{pr["slug"]}.html', f'{pr["name"]}, {pr["client"]}', pr['sub'], body, current='work.html')


# ---------------- SERVICES ----------------
def build_services():
    p = ''
    cards = ''.join(f'''<li class="stack__card" data-theme="dark">
  <div class="stack__media">{img(p, s['img'], s['alt'])}</div>
  <div class="stack__body">
    <h2 class="display">{e(s['name'])}</h2>
    <p class="subtitle">{e(s['line'])}</p>
    <a class="btn btn--pill" href="services/{s['slug']}.html">Read about {e(s['name'])}</a>
  </div>
</li>''' for s in SERVICES)
    body = hero(p, 'Services', 'Six ways in, one contract', 'Strategy, design, build and certification, run by one team that answers for the whole floor.') + f'''
<section class="stack" aria-label="Services"><ol class="stack__list">{cards}</ol></section>
<section class="flow" data-theme="light" aria-labelledby="flow-h">
  <h2 class="title" id="flow-h" data-lines>Every service sits on one sequence</h2>
  <p class="flow__p" data-read>The team that plans the floor also draws it, builds it and hands it over. Whichever service you start with, it connects to the same seven stages, so nothing is translated twice.</p>
  {stages_strip(list(range(7)))}
</section>'''
    page('services.html', 'Services', 'Design and build, consultancy, strategy, WELL and sustainability services from Zyeta.', body, current='services.html')


def build_service(i, s):
    p = '../'
    rel = PROJ[s['related']]
    others = [x for x in SERVICES if x is not s]
    stat = ''
    if s['stat']:
        n, suf, lab = s['stat']
        stat = f'<div class="sv__stat"><p class="giant"><span class="roll" data-roll="{n}">{n}</span>{e(suf) if suf != "days" else ""}</p><p>{e(("Days, " if suf == "days" else "") + lab)}</p></div>'
    body = hero(p, f'<a href="../services.html">Services</a> / {e(s["name"])}', e(s['name']), e(s['line']), s['img'], s['alt']) + f'''
<section class="sv" data-theme="light" aria-labelledby="sv-h">
  <h2 class="small sv__h" id="sv-h">What it is</h2>
  <p class="sv__lead" data-read>{e(s['intro'])}</p>
  {stat}
</section>
<section class="inc" data-theme="light" aria-labelledby="inc-h">
  <h2 class="title" id="inc-h" data-lines>What is included</h2>
  <ul class="inc__list" data-rules>{''.join(f'<li class="subtitle">{e(x)}</li>' for x in s['inc'])}</ul>
</section>
<section class="flow flow--svc" data-theme="dark" aria-labelledby="fl-h">
  <h2 class="title" id="fl-h" data-lines>Where it sits in the build</h2>
  <p class="flow__p">Highlighted stages are the ones this service leads. The rest are run by the same team.</p>
  {stages_strip(s['stages'])}
</section>
<section class="rel" data-theme="light" aria-label="Related project">
  <a class="rel__link" href="../work/{rel['slug']}.html" data-cursor="View">
    <figure class="rel__img" data-clip>{img(p, rel['img'] + '-1', rel['client'] + ', ' + rel['city'])}</figure>
    <span class="rel__k small">Related project</span>
    <span class="rel__name title">{e(rel['name'])}</span>
    <span class="small">{e(rel['client'])}, {e(rel['city'].split(',')[0])}, {rel['year']}</span>
  </a>
</section>
<section class="more" data-theme="light" aria-labelledby="more-h">
  <h2 class="small" id="more-h">Other services</h2>
  <ul class="more__list">{''.join(f'<li><a href="{o["slug"]}.html" data-img="../media/img/{o["img"]}.webp"><span class="title">{e(o["name"])}</span><span class="small">{e(o["line"])}</span></a></li>' for o in others)}</ul>
  <div class="wl__float" aria-hidden="true"><img alt=""></div>
</section>'''
    page(f'services/{s["slug"]}.html', s['name'], s['intro'], body, current='services.html')


# ---------------- STUDIO ----------------
def build_studio():
    p = ''
    nums = ''.join(f'<li class="nums__row"><p class="nums__label">{e(l)}</p><p class="nums__val giant">{e(pre)}<span class="roll" data-roll="{n}">{n}</span>{e(suf)}</p></li>' for n, suf, pre, l in NUMBERS)
    attrs = ''.join(f'<li><h3 class="subtitle">{e(t)}</h3><p>{e(d)}</p></li>' for t, d in ATTRS)
    people = ''.join(f'<li><span class="subtitle">{e(n)}</span><span class="small">{e(t)}</span></li>' for n, t in PEOPLE)
    body = hero(p, 'Studio', 'A design and technology firm', 'An integrated workspace design and build firm, privately held by its executive management, delivering across India and APAC.', 'people-zyeta-bangalore', 'The Zyeta team together in the office') + f'''
<section class="attrs" data-theme="light" aria-labelledby="attrs-h">
  <div class="attrs__side"><h2 class="title" id="attrs-h" data-lines>Why we work differently</h2><p class="small">Six standards Zyeta holds every project to.</p></div>
  <ol class="attrs__list" data-rules>{attrs}</ol>
</section>
<section class="nums nums--studio" data-theme="light" aria-label="Track record"><ul class="nums__list">{nums}</ul></section>
<section class="ppl" data-theme="dark" aria-labelledby="ppl-h">
  <h2 class="title" id="ppl-h" data-lines>The people who answer for the floor</h2>
  <ul class="ppl__list">{people}</ul>
  <figure class="ppl__img" data-clip>{img(p, 'people-zyeta-employees-bangalore', 'Zyeta colleagues talking in the Bengaluru studio')}</figure>
</section>
<section class="locs" data-theme="light" aria-labelledby="locs-h">
  <h2 class="title" id="locs-h" data-lines>Twelve cities, one standard</h2>
  <ul class="locs__list">{''.join(f'<li><span class="subtitle">{e(c)}</span><span class="small">{e(cn)}</span><span class="locs__t small" data-tz="{tz}"></span></li>' for c, cn, a, ph, tz in OFFICES)}</ul>
</section>'''
    page('studio.html', 'Studio', 'Why Zyeta works differently, the people behind it, and where it delivers.', body, current='studio.html')


# ---------------- INSIGHTS ----------------
def build_insights():
    p = ''
    cats = ['All', 'Case study', 'Report', 'Blog']
    chips = ''.join(f'<button type="button" class="chip" aria-pressed="{"true" if c == "All" else "false"}" data-filter="{c}">{c}</button>' for c in cats)
    feat = INSIGHTS[0]
    cards = ''.join(f'''<li class="ins__card" data-cat="{c}">
  <a href="{u}" target="_blank" rel="noopener" data-cursor="Read">
    <figure class="ins__img">{img(p, im, '')}</figure>
    <p class="small">{e(c)}, {e(d)}</p>
    <h3 class="subtitle">{e(t)}</h3>
  </a>
</li>''' for c, d, t, im, u in INSIGHTS[1:])
    body = hero(p, 'Insights', 'From the research desk', 'Case studies, research papers and articles on how workplaces are changing. Each opens on zyeta.com.') + f'''
<section class="feat" data-theme="dark" aria-label="Latest">
  <a class="feat__link" href="{feat[4]}" target="_blank" rel="noopener" data-cursor="Read">
    <figure class="feat__img" data-zoom>{img(p, feat[3], '')}</figure>
    <span class="small">Latest, {e(feat[0])}, {e(feat[1])}</span>
    <span class="title">{e(feat[2])}</span>
  </a>
</section>
<section class="ins" data-theme="light" aria-label="All insights">
  <div class="ins__filters" role="group" aria-label="Filter insights">{chips}</div>
  <ul class="ins__grid">{cards}</ul>
</section>'''
    page('insights.html', 'Insights', 'Research and insights on the future of work from Zyeta.', body, current='insights.html')


# ---------------- CAREERS ----------------
def build_careers():
    p = ''
    film = ['careers-4', 'people-zyeta-employes', 'careers-6', 'about-2', 'careers-5', 'people-zyeta-employees-bangalore', 'careers-7']
    body = hero(p, 'Careers', 'Start your journey at Zyeta', 'Designers, architects, engineers and technologists, working together from concept through completion.', 'people-zyeta-employes', 'The Zyeta team on an outing') + f'''
<section class="cv" data-theme="light" aria-label="Life at Zyeta">
  <ul class="cv__list">{''.join(f'<li><h2 class="display" data-read>{e(t)}</h2><p>{e(d)}</p></li>' for t, d in CAREERS)}</ul>
</section>
<section class="film" data-theme="dark" aria-label="Life at Zyeta">
  <div class="film__track">{''.join(f'<figure>{img(p, n, "")}</figure>' for n in film * 2)}</div>
</section>
<section class="jobs" data-theme="light" aria-labelledby="jobs-h">
  <h2 class="display" id="jobs-h" data-split>Ignite your potential.</h2>
  <p class="subtitle">Open roles are listed on LinkedIn. Send your CV with the role and city you want.</p>
  <a class="btn btn--big" href="https://www.linkedin.com/company/9431681/jobs/" target="_blank" rel="noopener">See open roles on LinkedIn</a>
</section>'''
    page('careers.html', 'Careers', 'Careers at Zyeta: designers, architects, engineers and technologists.', body, current='careers.html')


# ---------------- CONTACT ----------------
def build_contact():
    p = ''
    svc_opts = ''.join(f'<option>{e(s["name"])}</option>' for s in SERVICES)
    loc_opts = ''.join(f'<option>{e(o[0])}</option>' for o in OFFICES) + '<option>Other</option>'
    offices = ''.join(f'<li><span class="subtitle">{e(c)}</span><span>{e(a)}, {e(cn)}</span><span class="tnum">{e(ph)}</span><span class="small locs__t" data-tz="{tz}"></span></li>' for c, cn, a, ph, tz in OFFICES)
    faqs = ''.join(f'<li class="acc__item"><h3><button type="button" aria-expanded="false" id="faq-{i}-b" aria-controls="faq-{i}"><span class="subtitle">{e(q)}</span><i aria-hidden="true"></i></button></h3><div class="acc__p" id="faq-{i}" role="region" aria-labelledby="faq-{i}-b"><div><p>{e(a)}</p></div></div></li>' for i, (q, a) in enumerate(FAQS))
    body = f'''<section class="ph ph--contact" data-theme="light">
  <div class="ph__inner">
    <p class="ph__crumb small">Contact</p>
    <h1 class="ph__title display" data-split>Send the floor, the headcount and the date.</h1>
    <p class="ph__sub subtitle" data-lines>A Client Success Officer replies to every enquiry within one working day.</p>
  </div>
</section>
<section class="form" id="brief" data-theme="dark" aria-labelledby="form-h">
  <div class="form__side">
    <h2 class="title" id="form-h" data-lines>Tell us about the floor</h2>
    <p>Call <span class="tnum">+91 63645 99441</span>, any time.</p>
  </div>
  <form class="form__f" novalidate>
    <div class="fld"><label for="f-name">Full name</label><input id="f-name" name="name" autocomplete="name" required></div>
    <div class="fld"><label for="f-email">Business email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
    <div class="fld"><label for="f-company">Company</label><input id="f-company" name="company" autocomplete="organization"></div>
    <div class="fld"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
    <div class="fld"><label for="f-service">Type of service</label><select id="f-service" name="service">{svc_opts}</select></div>
    <div class="fld"><label for="f-size">Project area (sq ft)</label><select id="f-size" name="size"><option>15,000 to 30,000</option><option>31,000 to 50,000</option><option>51,000 and above</option></select></div>
    <div class="fld"><label for="f-loc">Location</label><select id="f-loc" name="location">{loc_opts}</select></div>
    <div class="fld"><label for="f-head">Headcount and move-in date</label><input id="f-head" name="headcount" placeholder="For example, 600 people by June"></div>
    <div class="form__end">
      <button class="btn btn--big" type="submit">Send the brief</button>
      <p class="form__msg" role="status" hidden>This is a design concept, so nothing was sent. To reach Zyeta, use the form on <a href="https://www.zyeta.com/contact/" target="_blank" rel="noopener">zyeta.com</a>.</p>
    </div>
  </form>
</section>
<section class="offices" data-theme="light" aria-labelledby="off-h">
  <h2 class="title" id="off-h" data-lines>Studios</h2>
  <ul class="offices__list" data-rules>{offices}</ul>
</section>
<section class="acc" data-theme="light" aria-labelledby="faq-h">
  <h2 class="title" id="faq-h" data-lines>Questions buyers ask first</h2>
  <ul class="acc__list">{faqs}</ul>
</section>'''
    page('contact.html', 'Contact', 'Send Zyeta your floor, headcount and date.', body, current='contact.html', cta=False)


# ---------------- HOME: keep shared blocks in sync ----------------
def sync_home():
    f = os.path.join(ROOT, 'index.html')
    s = open(f).read()
    s = re.sub(r'<!-- nav -->.*?<!-- /nav -->', lambda m: nav('', '', pause=True), s, flags=re.S)
    s = re.sub(r'<!-- footer -->.*?<!-- /footer -->', lambda m: footer('', cta=False), s, flags=re.S)
    s = re.sub(r'(css/site\.css|js/app\.js)\?v=\d+', lambda m: f'{m.group(1)}?v={V}', s)
    open(f, 'w').write(s)


if __name__ == '__main__':
    build_work()
    for i, pr in enumerate(PROJECTS): build_project(i, pr)
    build_services()
    for i, s in enumerate(SERVICES): build_service(i, s)
    build_studio(); build_insights(); build_careers(); build_contact()
    sync_home()
    print('built', 1 + len(PROJECTS) + 1 + len(SERVICES) + 4, 'pages')
