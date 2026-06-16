/* =========================================
   FRISPES – script.js
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- BURGER MENU ---- */
  const burger    = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on mobile-nav link click
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }


  /* ---- GENERIC SLIDER FACTORY ---- */
  function makeSlider({ sliderId, prevBtn, nextBtn, dotsId, visibleFn }) {
    const slider = document.getElementById(sliderId);
    const dotsEl = document.getElementById(dotsId);
    const prev   = document.getElementById(prevBtn);
    const next   = document.getElementById(nextBtn);
    if (!slider) return;

    const cards = Array.from(slider.children);
    let current = 0;

    function visible() {
      if (typeof visibleFn === 'function') return visibleFn();
      const w = window.innerWidth;
      if (w >= 1025) return 4;
      if (w >= 769)  return 3;
      if (w >= 481)  return 2;
      return 1;
    }

    function maxIndex() { return Math.max(0, cards.length - visible()); }

    function render() {
      current = Math.min(current, maxIndex());
      const cardW = cards[0].getBoundingClientRect().width;
      const gap   = 20;
      slider.style.transform = `translateX(-${current * (cardW + gap)}px)`;
      slider.style.transition = 'transform .4s ease';

      if (dotsEl) {
        const total = maxIndex() + 1;
        dotsEl.innerHTML = '';
        for (let i = 0; i < total; i++) {
          const d = document.createElement('span');
          d.className = 'dot' + (i === current ? ' active' : '');
          d.addEventListener('click', () => { current = i; render(); });
          dotsEl.appendChild(d);
        }
      }
    }

    if (prev) prev.addEventListener('click', () => { current = Math.max(0, current - 1); render(); });
    if (next) next.addEventListener('click', () => { current = Math.min(maxIndex(), current + 1); render(); });

    // Swipe support
    addSwipe(slider,
      () => { current = Math.min(maxIndex(), current + 1); render(); },
      () => { current = Math.max(0, current - 1); render(); }
    );

    window.addEventListener('resize', render);
    render();
  }

  /* Make Spaces slider work */
  // Wrap slider in overflow:hidden container
  const spacesSlider = document.getElementById('spacesSlider');
  if (spacesSlider) {
    spacesSlider.style.display = 'flex';
    spacesSlider.style.gap     = '20px';
    spacesSlider.style.overflow = 'hidden';
  }
  makeSlider({
    sliderId: 'spacesSlider',
    prevBtn:  'spacesPrev',
    nextBtn:  'spacesNext',
    dotsId:   'spacesDots',
  });
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('#facilityTabs .tab-item');
  const images = document.querySelectorAll('#facilityImages img');
  const counter = document.querySelector('.facilities__counter');
  const totalTabs = tabs.length;

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // 1. Перемикаємо активний таб (текст)
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // 2. Перемикаємо активну картинку за її індексом (номером)
      images.forEach(img => img.classList.remove('active'));
      images[index].classList.add('active');
      
      // 3. Автоматично оновлюємо лічильник (01/05, 02/05 і т.д.)
      counter.textContent = `0${index + 1}/0${totalTabs}`;
    });
  });
});
  /* Make Reviews slider work on mobile */
  const reviewsSlider = document.getElementById('reviewsSlider');
  if (reviewsSlider) {
    reviewsSlider.style.display  = 'flex';
    reviewsSlider.style.gap      = '20px';
    reviewsSlider.style.overflow = 'hidden';
  }
  makeSlider({
    sliderId: 'reviewsSlider',
    prevBtn:  'reviewsPrev',
    nextBtn:  'reviewsNext',
    dotsId:   'reviewsDots',
    visibleFn: () => {
      const w = window.innerWidth;
      if (w >= 769) return 3;
      if (w >= 481) return 2;
      return 1;
    },
  });


  /* ---- TOUCH / SWIPE HELPER ---- */
  function addSwipe(el, onLeft, onRight) {
    let startX = 0;
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) < 40) return;
      dx < 0 ? onLeft() : onRight();
    }, { passive: true });
  }


  /* ---- FACILITIES TABS ---- */
  const facilityImages = [
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=700&q=80', // parking
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80', // comfortable
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&q=80',   // cozy cafe
    'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=700&q=80', // playground
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=700&q=80', // outdoor
  ];

  const facilityImg  = document.querySelector('#facilityImg img');
  const tabItems     = document.querySelectorAll('.tab-item');
  const counterEl    = document.querySelector('.facilities__counter');

  tabItems.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      tabItems.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (facilityImg) {
        facilityImg.style.opacity = '0';
        facilityImg.style.transition = 'opacity .3s';
        setTimeout(() => {
          facilityImg.src = facilityImages[i];
          facilityImg.alt = tab.textContent;
          facilityImg.style.opacity = '1';
        }, 200);
      }
      if (counterEl) counterEl.textContent = String(i + 1).padStart(2, '0') + '/04';
    });
  });


  /* ---- FAQ TOGGLE ---- */
  const faqCards = document.querySelectorAll('.faq-card');
  faqCards.forEach(card => {
    card.addEventListener('click', () => {
      faqCards.forEach(c => c.classList.remove('faq-card--active'));
      card.classList.add('faq-card--active');
    });
  });


  /* ---- STICKY HEADER SHADOW ---- */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10 ? '0 2px 16px rgba(26,46,74,.12)' : 'none';
    }, { passive: true });
  }


  /* ---- SCROLL-REVEAL (Intersection Observer) ---- */
  const style = document.createElement('style');
  style.textContent = `
    .reveal { opacity: 0; transform: translateY(28px); transition: opacity .6s ease, transform .6s ease; }
    .reveal.visible { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  const revealEls = document.querySelectorAll(
    '.space-card, .stat, .review-card, .news-card, .faq-card, .why-card, .facilities__inner, .gallery__inner, .cta-banner__inner'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), idx * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => observer.observe(el));

});