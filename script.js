/* ============================================================
   GURU TECH LAB – MASTER SCRIPT.JS  
   - Audio (Hero + Global)
   - Payment Modal
   - MPESA Simulation (Direct Till 3420564)
   ============================================================ */

/* ------------------------------------------------------------
   🎵 BACKGROUND AUDIO + FALLBACK WEB AUDIO DRONE
------------------------------------------------------------ */
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
      musicButtons.forEach(b => b.textContent = "🔊 Music On");
    });
  }

  function startWebAudioDrone() {
    if (started) return;

    try {
      webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

      const o1 = webAudioCtx.createOscillator();
      const o2 = webAudioCtx.createOscillator();
      webAudioGain = webAudioCtx.createGain();
      const lfo = webAudioCtx.createOscillator();
      const lfoGain = webAudioCtx.createGain();

      o1.type = "sine"; o2.type = "sine";
      o1.frequency.value = 110; 
      o2.frequency.value = 112.3;

      webAudioGain.gain.value = 0.08;

      o1.connect(webAudioGain);
      o2.connect(webAudioGain);
      webAudioGain.connect(webAudioCtx.destination);

      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain);
      lfoGain.connect(webAudioGain.gain);

      o1.start(); o2.start(); lfo.start();

      webAudioOscs = [o1, o2, lfo];
      useWebAudio = true;
      started = true;

      musicButtons.forEach(b => b.textContent = "🔊 Music On");
    } catch (err) {
      console.warn("WebAudio error:", err);
    }
  }

  function toggleAudio() {
    if (audioEl && audioEl.src) {
      if (audioEl.paused) {
        safePlayAudioElement().catch(() => startWebAudioDrone());
      } else {
        audioEl.pause();
        musicButtons.forEach(b => b.textContent = "🔈 Paused");
      }
      return;
    }

    if (!useWebAudio) startWebAudioDrone();
    else {
      if (webAudioCtx) webAudioCtx.close();
      started = false;
      useWebAudio = false;
      musicButtons.forEach(b => b.textContent = "🔈 Paused");
    }
  }

  function firstInteraction() {
    safePlayAudioElement().catch(startWebAudioDrone);
    window.removeEventListener("pointerdown", firstInteraction);
  }

  window.addEventListener("pointerdown", firstInteraction, { passive: true });

  musicButtons.forEach(btn => btn && btn.addEventListener("click", toggleAudio));
});

/* ------------------------------------------------------------
   💰 PAYMENT SYSTEM (MPESA – DIRECT TILL 3420564)
------------------------------------------------------------ */

// GLOBAL BALANCE TRACKER
let accountBalance = 0;

/* OPEN PAYMENT MODAL */
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("buy-btn")) {
    const service = e.target.dataset.service;
    const price = parseInt(e.target.dataset.price);

    document.getElementById("payServiceName").textContent = service;
    document.getElementById("payAmount").textContent = price;

    document.getElementById("paymentModal").style.display = "flex";
  }
});

/* CLOSE PAYMENT MODAL */
function closeModal() {
  document.getElementById("paymentModal").style.display = "none";
}

/* PROCESS PAYMENT (SIMULATED MPESA DIRECT TILL 3420564) */
function confirmPayment() {
  const amount = parseInt(document.getElementById("payAmount").textContent);

  // Simulate deposit into business balance
  accountBalance += amount;

  // Show confirmation
  alert(
    "✔ PAYMENT SUCCESSFUL\n\n" +
    "Till Number: 3420564\n" +
    "Account Name: AKIDA RAJAB\n" +
    "Amount Paid: KES " + amount + "\n\n" +
    "Your order is being processed!"
  );

  // Update balance display if present
  const bal = document.getElementById("balanceDisplay");
  if (bal) bal.textContent = `KES ${accountBalance}`;

  closeModal();
}

/* Make functions available to HTML */
window.closeModal = closeModal;
window.confirmPayment = confirmPayment;
