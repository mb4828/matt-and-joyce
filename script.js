/* ============================================================
   1. Rose Petal Animation
   Creates individually-animated petals that fall and sway
   across the full viewport.
============================================================ */
(function () {
  'use strict';

  const container = document.getElementById('petals');
  if (!container) return;

  const isMobile   = window.matchMedia('(max-width: 600px)').matches;
  const petalCount = isMobile ? 15 : 26;

  // Blush / rose tones to match the palette
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

    // One unique @keyframes rule per petal for individualised sway
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

  // Inject all keyframes in one style element
  const style = document.createElement('style');
  style.textContent = keyframes.join('\n');
  document.head.appendChild(style);
}());


/* ============================================================
   2. Scroll-cue arrow buttons
   Each button scrolls to the next slide.
============================================================ */
(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));

  document.querySelectorAll('.scroll-cue').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const parentSlide = btn.closest('.slide');
      const index       = slides.indexOf(parentSlide);
      if (index !== -1 && index < slides.length - 1) {
        slides[index + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}());
