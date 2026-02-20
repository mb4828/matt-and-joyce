/* ============================================================
   Rose Petal Animation
   Creates individually-animated petals that fall and sway
   across the full viewport.
============================================================ */
(function () {
  'use strict';

  const container = document.getElementById('petals');
  if (!container) return;

  const isMobile   = window.matchMedia('(max-width: 600px)').matches;
  const petalCount = isMobile ? 15 : 26;

  // Match the site's blush / rose palette
  const colors = [
    '#E8A0B0',
    '#F5C8D5',
    '#F0B8C8',
    '#D98AA0',
    '#F7D0DC',
    '#E8B5C2',
  ];

  const keyframes = [];

  for (let i = 0; i < petalCount; i++) {
    const size     = Math.random() * 10 + 8;               // 8–18 px
    const left     = Math.random() * 110 - 5;              // –5% to 105%
    const duration = (Math.random() * 8 + 7).toFixed(1);   // 7–15 s per loop
    const delay    = -(Math.random() * 14).toFixed(1);     // negative = appear immediately
    const opacity  = (Math.random() * 0.35 + 0.28).toFixed(2);
    const color    = colors[Math.floor(Math.random() * colors.length)];
    const r0       = Math.round(Math.random() * 360);
    const swayA    = Math.round((Math.random() - 0.5) * 90); // ±45 px
    const swayB    = Math.round((Math.random() - 0.5) * 90);

    // Each petal needs its own keyframes so sway paths don't repeat
    keyframes.push(`
      @keyframes fall-${i} {
        0%   { transform: translate(0,              -30px)  rotate(${r0}deg);       opacity: 0; }
        8%   {                                                                        opacity: ${opacity}; }
        35%  { transform: translate(${swayA}px,      30vh)  rotate(${r0 + 200}deg); }
        65%  { transform: translate(${swayB}px,      68vh)  rotate(${r0 + 460}deg); }
        92%  {                                                                        opacity: ${(opacity * 0.5).toFixed(2)}; }
        100% { transform: translate(${Math.round(swayA * 0.4)}px, 112vh) rotate(${r0 + 720}deg); opacity: 0; }
      }
    `);

    const el = document.createElement('div');
    el.className = 'petal';
    el.style.cssText = [
      `left: ${left.toFixed(1)}%`,
      `width: ${size.toFixed(1)}px`,
      `height: ${(size * 1.5).toFixed(1)}px`,
      `background: ${color}`,
      `animation: fall-${i} ${duration}s ${delay}s linear infinite`,
    ].join('; ');

    container.appendChild(el);
  }

  // Batch-inject all keyframes to avoid multiple style reflows
  const style = document.createElement('style');
  style.textContent = keyframes.join('\n');
  document.head.appendChild(style);
}());


/* ============================================================
   Full-page Slide Navigation
   Slides are position:fixed; JS drives transitions via
   transform: translateY(). Handles wheel, touch, keys, and buttons.
============================================================ */
(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  if (!slides.length) return;

  let current = 0;
  let busy    = false;

  // Show slide 1: suppress the transform transition so it never slides up on load,
  // then restore it before adding slide--visible so the opacity fade fires cleanly.
  slides[0].style.transition = 'none';
  slides[0].style.transform  = 'translateY(0)';
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      slides[0].style.transition = '';
      slides[0].classList.add('slide--visible');

      const heroNames = slides[0].querySelector('.hero__names');
      if (heroNames) {
        heroNames.classList.add('hero__names--animate');
      }
    });
  });

  function goTo(index) {
    if (busy || index === current || index < 0 || index >= slides.length) return;
    busy = true;

    const from = current;
    const to   = index;

    if (to > from) {
      // Forward: standard speed (CSS 0.75s)
      slides[to].style.transform = 'translateY(0)';
    } else {
      // Backward: twice as fast via inline override
      slides[from].style.transition = 'transform 0.375s cubic-bezier(0.76, 0, 0.24, 1)';
      slides[from].style.transform  = 'translateY(100%)';
      // Reset inline transition after it finishes so forward still uses CSS speed
      setTimeout(function () { slides[from].style.transition = ''; }, 400);
    }

    // Fade in content on first visit
    if (!slides[to].classList.contains('slide--visible')) {
      setTimeout(function () {
        slides[to].classList.add('slide--visible');
      }, 150);
    }

    current = to;
    setTimeout(function () { busy = false; }, to < from ? 400 : 800);
  }

  // Steps one slide at a time toward target, chaining transitions
  function goToChained(target) {
    const step = target > current ? 1 : -1;
    goTo(current + step);
    if (current !== target) {
      setTimeout(function () { goToChained(target); }, 425);
    }
  }

  // Keyboard — arrow keys
  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  goTo(current - 1);
  });

  // Wheel — `busy` flag debounces so one flick = one slide
  window.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (!busy) {
      if (e.deltaY >  10) goTo(current + 1);
      if (e.deltaY < -10) goTo(current - 1);
    }
  }, { passive: false });

  // Touch swipe
  let touchStartY = 0;
  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', function (e) {
    const dy = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(dy) > 40) {
      if (dy > 0) goTo(current + 1);
      else        goTo(current - 1);
    }
  }, { passive: true });

  // Down-arrow buttons navigate to the next slide
  document.querySelectorAll('.scroll-cue').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const i = slides.indexOf(btn.closest('.slide'));
      if (i !== -1) goTo(i + 1);
    });
  });

  // Up-arrow button chains back to slide 1
  const topBtn = document.querySelector('.scroll-top');
  if (topBtn) {
    topBtn.addEventListener('click', function () { goToChained(0); });
  }
}());
