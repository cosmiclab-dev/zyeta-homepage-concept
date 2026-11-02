# Zyeta website concept

A design concept for a new Zyeta website. It is not the official Zyeta website: a label on every screen says so, the contact form sends nothing, and articles open on zyeta.com.

Live: https://cosmiclab-dev.github.io/zyeta-homepage-concept/

## Pages
- Home: thirteen scroll-driven scenes, from the photo globe to the 3D office floor that builds itself.
- Work, plus a page for each of five projects (LinkedIn, IFF, two for 7-Eleven, TDCX).
- Services, plus a page for each of the six services.
- Studio, Insights, Careers, Contact.

## How it is built
- Static HTML, CSS and JavaScript; no build step is needed to view it.
- `build/build.py` generates the inner pages from `build/content.py` and keeps the navigation and footer of `index.html` in sync. After changing content, run `python3 build/build.py`.
- Motion: GSAP (ScrollTrigger, SplitText, CustomEase), Lenis smooth scroll, Three.js for the globe and the fit-out model.
- `js/shared.js`: page transitions, cursor labels, navigation, menu. `js/page.js`: inner-page motion. `js/app.js`: home.
- Content is from zyeta.com and the earlier demo site. Reduced motion gives a still, fully readable site.
