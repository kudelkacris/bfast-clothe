// ===== Barra de progreso de scroll =====
function startScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max * 100) : 0) + '%';
  }, { passive: true });
}

// ===== Hero carousel con dots + swipe táctil =====
function startHeroCarousel() {
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;
  const imgs = carousel.querySelectorAll('img');
  if (imgs.length < 2) return;
  let idx = 0;

  function goToSlide(n) {
    imgs[idx].classList.remove('active');
    document.querySelectorAll('.hero-dot')[idx]?.classList.remove('active');
    idx = ((n % imgs.length) + imgs.length) % imgs.length;
    imgs[idx].classList.add('active');
    document.querySelectorAll('.hero-dot')[idx]?.classList.add('active');
  }

  window.heroGoTo = goToSlide;
  setInterval(() => goToSlide(idx + 1), 4000);

  // Touch swipe
  let tx = 0;
  carousel.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) goToSlide(d > 0 ? idx + 1 : idx - 1);
  }, { passive: true });
}

// ===== Scroll reveal =====
function startScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('in-view')); return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  targets.forEach(t => obs.observe(t));
}

// ===== Header glassmorphism al scrollear =====
function startHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 60), { passive: true });
}

// ===== Nav link activo según sección =====
function startActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-menu a[href^="#"]');
  if (!sections.length || !links.length) return;
  const update = () => {
    let cur = '';
    sections.forEach(s => { if (s.getBoundingClientRect().top <= 130) cur = s.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ===== Scroll to top =====
function startScrollTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== Countdown de promo =====
function startCountdown() {
  const KEY = 'bfast_promo_end';
  let end = parseInt(localStorage.getItem(KEY) || '0');
  if (!end || end < Date.now()) {
    end = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem(KEY, end);
  }
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const diff = end - Date.now();
    if (diff <= 0) { document.getElementById('promo-countdown')?.remove(); return; }
    const cd = document.getElementById('promo-countdown');
    if (!cd) return;
    cd.querySelector('#cd-d').textContent = pad(Math.floor(diff / 86400000));
    cd.querySelector('#cd-h').textContent = pad(Math.floor((diff % 86400000) / 3600000));
    cd.querySelector('#cd-m').textContent = pad(Math.floor((diff % 3600000) / 60000));
    cd.querySelector('#cd-s').textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  tick();
  setInterval(tick, 1000);
}

// ===== Mobile nav =====
function openMobileNav() {
  document.getElementById('mobile-nav')?.classList.add('open');
  document.getElementById('mobile-nav-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileNav() {
  document.getElementById('mobile-nav')?.classList.remove('open');
  document.getElementById('mobile-nav-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  startScrollProgress();
  startHeroCarousel();
  startScrollReveal();
  startHeaderScroll();
  startActiveNav();
  startScrollTop();
  startCountdown();
});
