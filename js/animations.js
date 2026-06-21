// Carrusel del hero — crossfade automático
function startHeroCarousel() {
  const carousel = document.getElementById('hero-carousel');
  if (!carousel) return;
  const imgs = carousel.querySelectorAll('img');
  if (imgs.length < 2) return;
  let i = 0;
  setInterval(() => {
    imgs[i].classList.remove('active');
    i = (i + 1) % imgs.length;
    imgs[i].classList.add('active');
  }, 4000);
}

// Animaciones de entrada al hacer scroll ("barridos")
function startScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    targets.forEach(t => t.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  targets.forEach(t => observer.observe(t));
}

document.addEventListener('DOMContentLoaded', () => {
  startHeroCarousel();
  startScrollReveal();
});
