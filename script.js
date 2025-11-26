// script.js - Audio engine with theme-matched UI feedback (blue neon)

document.addEventListener("DOMContentLoaded", function () {
  const audioEl = document.getElementById("bg-audio");
  const musicButtons = document.querySelectorAll("#music-toggle, #music-toggle-hero");

  let started = false;
  let useWebAudio = false;
  let webAudioCtx = null;
  let webAudioOscs = null;
  let webAudioGain = null;

  // Apply neon button style
  function setBtnActive(btn) {
    if (!btn) return;
    btn.style.background = "rgba(0, 180, 255, 0.25)";
    btn.style.boxShadow = "0 0 18px rgba(0, 200, 255, 0.8)";
    btn.style.border = "1px solid rgba(0, 200, 255, 0.6)";
    btn.textContent = "🔊 Music On";
  }

  function setBtnInactive(btn) {
    if (!btn) return;
    btn.style.background = "rgba(255,255,255,0.08)";
    btn.style.boxShadow = "0 0 10px rgba(255,255,255,0.15)";
    btn.style.border = "1px solid rgba(255,255,255,0.2)";
    btn.textContent = "🔈 Paused";
  }

  function updateAllButtons(active) {
    musicButtons.forEach(btn => {
      if (active) setBtnActive(btn);
      else setBtnInactive(btn);
    });
  }

  function safePlayAudioElement() {
    if (!audioEl) return Promise.reject(new Error("No audio element"));
    audioEl.volume = 0.25;
    return audioEl.play().then(() => {
      started = true;
      updateAllButtons(true);
    });
  }

  function startWebAudioDrone() {
    if (started) return;
    try {
      webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o1 = webAudioCtx.createOscillator();
      const o2 = webAudioCtx.createOscillator();
      webAudioGain = webAudioCtx.createGain();

      o1.type = "sine"; 
      o2.type = "sine";
      o1.frequency.value = 110; 
      o2.frequency.value = 112.5;
      o1.detune.value = -10; 
      o2.detune.value = 10;

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

      o1.start(); 
      o2.start(); 
      lfo.start();

      webAudioOscs = [o1, o2, lfo];
      started = true;
      useWebAudio = true;
      updateAllButtons(true);

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

    webAudioOscs = null;
    webAudioCtx = null;
    webAudioGain = null;
    useWebAudio = false;
    started = false;
  }

  function startAudioOrFallback() {
    if (started) return;
    if (audioEl && audioEl.querySelector("source")?.src) {
      safePlayAudioElement().catch(() => startWebAudioDrone());
    } else {
      startWebAudioDrone();
    }
  }

  function toggleAudio() {
    if (audioEl && audioEl.querySelector("source")?.src) {
      if (audioEl.paused) {
        safePlayAudioElement().catch(startWebAudioDrone);
      } else {
        audioEl.pause();
        updateAllButtons(false);
      }
      return;
    }
    if (!useWebAudio) {
      startWebAudioDrone();
    } else {
      stopWebAudioDrone();
      updateAllButtons(false);
    }
  }

  function firstInteraction() {
    startAudioOrFallback();
    window.removeEventListener("pointerdown", firstInteraction);
    window.removeEventListener("touchstart", firstInteraction);
    window.removeEventListener("keydown", firstInteraction);
  }

  window.addEventListener("pointerdown", firstInteraction, { passive: true });
  window.addEventListener("touchstart", firstInteraction, { passive: true });
  window.addEventListener("keydown", firstInteraction, { passive: true });

  musicButtons.forEach(btn => btn?.addEventListener("click", toggleAudio));

  window._guruAudio = {
    start: startAudioOrFallback,
    stop: function () {
      if (audioEl && !audioEl.paused) audioEl.pause();
      stopWebAudioDrone();
      updateAllButtons(false);
    },
    status: () => ({ started, useWebAudio })
  };
});
