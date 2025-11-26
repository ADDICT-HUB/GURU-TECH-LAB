// ===========================================================
//  AUDIO SYSTEM (Your Original Script + Optimized)
// ===========================================================

document.addEventListener("DOMContentLoaded", function () {
  const audioEl = document.getElementById("bg-audio");
  const musicButtons = document.querySelectorAll("#music-toggle, #music-toggle-hero");

  let started = false;
  let useWebAudio = false;
  let webAudioCtx = null;
  let webAudioOscs = null;
  let webAudioGain = null;

  function safePlayAudioElement() {
    if (!audioEl) return Promise.reject(new Error("No audio element"));
    audioEl.volume = 0.25;
    return audioEl.play().then(() => {
      started = true;
      musicButtons.forEach(b => { if (b) b.textContent = "🔊 Music On"; });
    });
  }

  function startWebAudioDrone() {
    if (started) return;
    try {
      webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o1 = webAudioCtx.createOscillator();
      const o2 = webAudioCtx.createOscillator();
      webAudioGain = webAudioCtx.createGain();

      o1.type = "sine"; o2.type = "sine";
      o1.frequency.value = 110; o2.frequency.value = 112.5;
      o1.detune.value = -10; o2.detune.value = 10;

      webAudioGain.gain.value = 0.12;

      o1.connect(webAudioGain);
      o2.connect(webAudioGain);
      webAudioGain.connect(webAudioCtx.destination);

      const lfo = webAudioCtx.createOscillator();
      lfo.frequency.value = 0.08;
      const lfoGain = webAudioCtx.createGain();
      lfoGain.gain.value = 0.08;
      lfo.connect(lfoGain);
      lfoGain.connect(webAudioGain.gain);

      o1.start(); o2.start(); lfo.start();

      webAudioOscs = [o1, o2, lfo];
      started = true; useWebAudio = true;
      musicButtons.forEach(b => { if (b) b.textContent = "🔊 Music On"; });
    } catch (err) {
      console.warn("WebAudio start failed:", err);
      started = false;
    }
  }

  function stopWebAudioDrone() {
    if (!useWebAudio || !webAudioOscs || !webAudioCtx) return;
    try {
      webAudioOscs.forEach(o => o.stop && o.stop());
      webAudioCtx.close && webAudioCtx.close();
    } catch (e) { console.warn("Error stopping WebAudio:", e); }
    webAudioOscs = null; webAudioCtx = null; webAudioGain = null; useWebAudio = false; started = false;
  }

  function startAudioOrFallback() {
    if (started) return;
    if (audioEl && audioEl.querySelector("source") && audioEl.querySelector("source").src) {
      safePlayAudioElement().catch((err) => {
        console.warn("Audio element play failed, falling back:", err);
        startWebAudioDrone();
      });
    } else {
      startWebAudioDrone();
    }
  }

  function toggleAudio() {
    if (audioEl && audioEl.querySelector("source") && audioEl.querySelector("source").src) {
      if (audioEl.paused) {
        safePlayAudioElement().catch(() => startWebAudioDrone());
      } else {
        audioEl.pause();
        musicButtons.forEach(b => { if (b) b.textContent = "🔈 Paused"; });
      }
      return;
    }
    if (!useWebAudio) startWebAudioDrone();
    else { stopWebAudioDrone(); musicButtons.forEach(b => { if (b) b.textContent = "🔈 Paused"; }); }
  }

  function firstInteraction() {
    startAudioOrFallback();
    window.removeEventListener("pointerdown", firstInteraction);
    window.removeEventListener("touchstart", firstInteraction);
    window.removeEventListener("keydown", firstInteraction);
  }
  window.addEventListener("pointerdown", firstInteraction, {passive:true});
  window.addEventListener("touchstart", firstInteraction, {passive:true});
  window.addEventListener("keydown", firstInteraction, {passive:true});
  musicButtons.forEach(btn => btn && btn.addEventListener('click', toggleAudio));

  window._guruAudio = {
    start: startAudioOrFallback,
    stop: function(){ if (audioEl && !audioEl.paused) audioEl.pause(); stopWebAudioDrone(); },
    status: () => ({ started, useWebAudio })
  };
});


// ===========================================================
//  MPESA PAYMENT SYSTEM — SIMPLE, NO BACKEND
// ===========================================================

(function(){
  const TILL = "3420564";
  const TILL_NAME = "AKIDA RAJAB";
  const BAL_KEY = "gtm_balance";

  function $(sel) { return document.querySelector(sel); }

  function openPaymentModal(service, amount){
    const modal = $("#mpesa-modal");
    if (!modal) return;

    $("#mpesa-service").textContent = service;
    $("#mpesa-amount").textContent = Number(amount).toLocaleString() + " KES";

    const waText = encodeURIComponent(
      `Hi, I paid for *${service}*.\nAmount: KES ${amount}\nTill: ${TILL}\nName: ${TILL_NAME}\nUsername/Link: `
    );

    $("#open-wa").href = `https://wa.me/254763986398?text=${waText}`;
    $("#mpesa-note").textContent = "";
    modal.style.display = "flex";
  }

  function closeModal(){
    const modal = $("#mpesa-modal");
    if (modal) modal.style.display = "none";
  }

  function copyTill(){
    const text = TILL;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(()=> $("#mpesa-note").textContent = "Till copied to clipboard.")
        .catch(()=> $("#mpesa-note").textContent = "Copy failed.");
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); $("#mpesa-note").textContent = "Till copied."; }
      catch { $("#mpesa-note").textContent = "Copy manually: " + text; }
      ta.remove();
    }
  }

  function refreshBalanceUI(){
    const el = $("#balance");
    if (!el) return;
    const val = parseFloat(localStorage.getItem(BAL_KEY) || "0");
    el.textContent = "Balance: KES " + Number(val).toLocaleString();
  }

  function markAsPaid(amount){
    const cur = parseFloat(localStorage.getItem(BAL_KEY) || "0");
    const total = cur + Number(amount);
    localStorage.setItem(BAL_KEY, total);
    refreshBalanceUI();
    $("#mpesa-note").textContent = "Marked as paid — Balance updated.";
    setTimeout(closeModal, 1500);
  }

  document.addEventListener("click", function(e){
    if (e.target.matches(".buy-btn")) {
      const svc = e.target.getAttribute("data-service");
      const price = e.target.getAttribute("data-price");
      openPaymentModal(svc, price);
    }
    if (e.target.id === "mpesa-close") closeModal();
    if (e.target.id === "copy-till") copyTill();
    if (e.target.id === "mark-paid") {
      const amt = $("#mpesa-amount").textContent.replace(/[^\d]/g,"");
      markAsPaid(Number(amt));
    }
    if (e.target.id === "mpesa-help") {
      window.open("https://www.youtube.com/results?search_query=how+to+pay+with+m-pesa", "_blank");
    }
  });

  document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") closeModal(); });

  window.addEventListener("message", ev => {
    if (ev.data?.type === "gtm_balance_update") {
      localStorage.setItem(BAL_KEY, ev.data.balance);
      refreshBalanceUI();
    }
  });

  document.addEventListener("DOMContentLoaded", refreshBalanceUI);
})();
