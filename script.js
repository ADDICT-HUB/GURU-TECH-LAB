// script.js - Guru Tech full-site helpers
document.addEventListener('DOMContentLoaded', () => {
  const audioEl = document.getElementById('bg-audio');
  const musicToggle = document.getElementById('music-toggle');
  let audioStarted = false;

  // Start audio on first user interaction
  function startAudio() {
    if (audioStarted) return;
    if (!audioEl) return;
    audioEl.volume = 0.35;
    audioEl.play().then(()=> {
      audioStarted = true;
      if (musicToggle) musicToggle.textContent = '🔊 Music On';
    }).catch(()=> {
      // fallback: do nothing; WebAudio fallback could be added if needed
    });
  }

  function firstInteraction() {
    startAudio();
    window.removeEventListener('pointerdown', firstInteraction);
    window.removeEventListener('touchstart', firstInteraction);
    window.removeEventListener('keydown', firstInteraction);
  }

  window.addEventListener('pointerdown', firstInteraction, {passive:true});
  window.addEventListener('touchstart', firstInteraction, {passive:true});
  window.addEventListener('keydown', firstInteraction);

  if (musicToggle) musicToggle.addEventListener('click', () => {
    if (!audioEl) return;
    if (audioEl.paused) { audioEl.play(); musicToggle.textContent='🔊 Music On' }
    else { audioEl.pause(); musicToggle.textContent='🔈 Paused' }
  });

  // Prevent zoom: key + wheel + pinch
  document.addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, {passive:false});
  document.addEventListener('keydown', (e) => { if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) e.preventDefault(); });
  document.addEventListener('touchmove', (e) => { if (e.scale && e.scale !== 1) e.preventDefault(); }, {passive:false});

  // Add buy button handlers (if any are normal anchors to pay.html this is optional)
  document.querySelectorAll('[data-buy]').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      // default anchor will navigate; prevent double processing
    });
  });

  // Auto-fill pay.html if present
  (function populatePay(){
    const url = new URL(window.location.href);
    const service = url.searchParams.get('service');
    const price = url.searchParams.get('price');
    if (!service || !price) return;
    const svcEl = document.getElementById('pay-service');
    const amtEl = document.getElementById('pay-amount');
    const hiddenSvc = document.getElementById('service-input');
    const hiddenAmt = document.getElementById('amount-input');
    const totalEl = document.getElementById('balance-info');
    if (svcEl) svcEl.textContent = service;
    if (amtEl) amtEl.textContent = price + ' KES';
    if (hiddenSvc) hiddenSvc.value = service;
    if (hiddenAmt) hiddenAmt.value = price;
    if (totalEl) totalEl.textContent = 'Total: ' + price + ' KES';
  })();

});
