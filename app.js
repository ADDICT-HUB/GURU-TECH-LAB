// app.js - common site functions: audio, modal-based payments, buy-button wiring
(function(){
  // Audio: play on first touch (required by browsers)
  const audio = document.getElementById('bg-audio');
  const musicToggles = document.querySelectorAll('[data-music-toggle]');
  let audioStarted = false;
  function startAudio() {
    if (audioStarted || !audio) return;
    audio.volume = 0.28;
    audio.play().then(()=> { audioStarted = true; updateMusicButtons(true); }).catch(()=>{});
  }
  function updateMusicButtons(on){
    musicToggles.forEach(b => { if (b) b.textContent = on ? '🔊 Music On' : '🔈 Play Music'; });
  }
  ['pointerdown','touchstart','keydown'].forEach(ev => {
    window.addEventListener(ev, startAudio, {passive:true, once:true});
  });
  musicToggles.forEach(btn => {
    btn && btn.addEventListener('click', ()=>{
      if (!audio) return;
      if (audio.paused) { audio.play().catch(()=>{}); updateMusicButtons(true); }
      else { audio.pause(); updateMusicButtons(false); }
    });
  });

  // Modal & Buy handlers
  const modalBack = document.getElementById('pay-modal-back');
  const modal = document.getElementById('pay-modal');
  const modalService = document.getElementById('modal-service');
  const modalPrice = document.getElementById('modal-price');
  const modalPhone = document.getElementById('modal-phone');
  const modalBtn = document.getElementById('modal-confirm');
  const modalCloseBtns = document.querySelectorAll('[data-modal-close]');

  function openPayModal(service, price){
    if (!modalBack) return;
    modalBack.classList.add('open');
    if (modalService) modalService.textContent = service;
    if (modalPrice) modalPrice.textContent = price + ' KES';
    modalPhone && (modalPhone.value = '');
    modalPhone && modalPhone.focus();
    // store on confirm dataset
    modalBtn.dataset.service = service;
    modalBtn.dataset.price = price;
  }
  function closePayModal(){
    if (!modalBack) return;
    modalBack.classList.remove('open');
  }
  // connect buy buttons
  document.addEventListener('click', function(e){
    const b = e.target.closest('[data-buy-service]');
    if (!b) return;
    e.preventDefault();
    const svc = b.dataset.buyService || b.getAttribute('data-buy-service');
    const pr  = b.dataset.buyPrice || b.getAttribute('data-buy-price');
    openPayModal(svc, pr);
  });

  modalCloseBtns.forEach(b => b.addEventListener('click', closePayModal));
  if (modalBack) modalBack.addEventListener('click', (e)=> { if (e.target === modalBack) closePayModal(); });

  // confirm button: opens WhatsApp with template message
  if (modalBtn) modalBtn.addEventListener('click', function(){
    const service = this.dataset.service || '';
    const price = this.dataset.price || '';
    const phone = modalPhone ? modalPhone.value.trim() : '';
    const till = '3420564';
    const msg = encodeURIComponent(
      `Hello Guru Tech Lab,%0A%0AI have paid / want to pay.%0A• Service: ${service}%0A• Amount: ${price} KES%0A• Till: ${till}%0A• Phone: ${phone}%0A• Transaction ID: (enter here)`
    );
    const url = `https://wa.me/254763986398?text=${msg}`;
    // open whatsapp in new tab
    window.open(url, '_blank');
    closePayModal();
  });

  // keyboard: Esc closes modal
  document.addEventListener('keydown', (e)=> { if (e.key === 'Escape') closePayModal(); });

  // Expose helper for debugging
  window._guruApp = { openPayModal, closePayModal, startAudio };

})();
