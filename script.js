// script.js — Hologram UI helpers: audio autoplay on first touch, canvas grid, desktop-lock helpers, pay autofill.
(function () {
  // AUDIO: autoplay after first user interaction
  const audioEl = document.getElementById('bg-audio');
  const musicToggle = document.getElementById('music-toggle');
  let audioStarted = false;

  function startAudio() {
    if (audioStarted || !audioEl) return;
    audioEl.volume = 0.35;
    audioEl.play().then(() => {
      audioStarted = true;
      if (musicToggle) musicToggle.textContent = '🔊 Music On';
    }).catch((e) => {
      console.warn('Autoplay blocked or failed:', e);
    });
  }

  function onFirstInteraction() {
    startAudio();
    window.removeEventListener('pointerdown', onFirstInteraction);
    window.removeEventListener('touchstart', onFirstInteraction);
    window.removeEventListener('keydown', onFirstInteraction);
  }

  window.addEventListener('pointerdown', onFirstInteraction, { passive: true });
  window.addEventListener('touchstart', onFirstInteraction, { passive: true });
  window.addEventListener('keydown', onFirstInteraction);

  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      if (!audioEl) return;
      if (audioEl.paused) { audioEl.play().catch(()=>{}); musicToggle.textContent='🔊 Music On'; }
      else { audioEl.pause(); musicToggle.textContent='🔈 Paused'; }
    });
  }

  // Prevent zoom (wheel+ctrl, pinch)
  document.addEventListener('wheel', function (e) { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
  document.addEventListener('keydown', function (e) { if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) e.preventDefault(); });
  document.addEventListener('touchmove', function (e) { if (e.scale && e.scale !== 1) e.preventDefault(); }, { passive: false });

  // Canvas grid background animation (subtle)
  const canvas = document.getElementById('gridCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    function draw() {
      t += 0.5;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(0, 0);
      // grid lines
      ctx.strokeStyle = 'rgba(76,201,255,0.06)';
      ctx.lineWidth = 1;
      const spacing = 36;
      const offset = Math.sin(t * 0.02) * 6;
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + offset % spacing, 0);
        ctx.lineTo(x + offset % spacing, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset % spacing);
        ctx.lineTo(canvas.width, y + offset % spacing);
        ctx.stroke();
      }
      ctx.restore();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  // Year fill
  document.addEventListener('DOMContentLoaded', function () {
    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  });

  // Autofill pay.html fields when user navigates there
  (function populatePay() {
    if (!location.pathname.endsWith('pay.html')) return;
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service') || '';
    const price = params.get('price') || '';
    const svcEl = document.getElementById('pay-service');
    const amtEl = document.getElementById('pay-amount');
    const si = document.getElementById('service-input');
    const ai = document.getElementById('amount-input');
    const totalEl = document.getElementById('balance-info');
    if (svcEl) svcEl.textContent = service;
    if (amtEl) amtEl.textContent = (price ? price + ' KES' : '—');
    if (si) si.value = service;
    if (ai) ai.value = price;
    if (totalEl) totalEl.textContent = (price ? 'Total: ' + price + ' KES' : '');
  })();

})();
