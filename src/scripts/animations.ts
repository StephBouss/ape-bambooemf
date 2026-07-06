import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger);

if (prefersReducedMotion) {
  // Rien à animer : tout le contenu est déjà visible statiquement (voir tokens.css).
} else {
  initSmoothScroll();
  initHeroTimeline();
  initRevealGroups();
  initTableRowReveals();
}

function initSmoothScroll() {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  // Une seule boucle rAF (celle de gsap.ticker) pilote Lenis — en ajouter une seconde
  // manuelle désynchronise les deltas de temps et peut geler des tweens GSAP en cours.
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initHeroTimeline() {
  const items = gsap.utils.toArray<HTMLElement>('.hero-reveal');
  if (!items.length) return;
  gsap.set(items, { opacity: 0, y: 24 });
  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.15,
  });
}

function initRevealGroups() {
  document.querySelectorAll<HTMLElement>('.reveal-group').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('.reveal-item');
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 22 });
    ScrollTrigger.create({
      trigger: group,
      start: 'top 82%',
      once: true,
      onEnter: () =>
        gsap.to(items, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }),
    });
  });

  // Éléments reveal isolés (hors reveal-group), ex: dernières lignes de texte
  document.querySelectorAll<HTMLElement>('.reveal-item:not(.reveal-group .reveal-item)').forEach((el) => {
    gsap.set(el, { opacity: 0, y: 22 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }),
    });
  });
}

function initTableRowReveals() {
  document.querySelectorAll<HTMLElement>('.table-rows').forEach((tbody) => {
    const rows = tbody.querySelectorAll<HTMLElement>('tr');
    if (!rows.length) return;
    gsap.set(rows, { opacity: 0, y: 12 });
    ScrollTrigger.create({
      trigger: tbody,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(rows, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.045 }),
    });
  });
}

