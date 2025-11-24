// script.js - Robust audio with WebAudio fallback and helpers.
// Plays audio after first user interaction (pointer/touch/keydown).
// If assets/ambient.mp3 exists it prefers that, otherwise creates a soft drone via WebAudio.

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

      // slow LFO to modulate gain
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

  // first interaction to start audio
  function firstInteraction() {
    startAudioOrFallback();
    window.removeEventListener("pointerdown", firstInteraction);
    window.removeEventListener("touchstart", firstInteraction);
    window.removeEventListener("keydown", firstInteraction);
  }
  window.addEventListener("pointerdown", firstInteraction, {passive:true});
  window.addEventListener("touchstart", firstInteraction, {passive:true});
  window.addEventListener("keydown", firstInteraction, {passive:true});

  // hook buttons
  musicButtons.forEach(btn => btn && btn.addEventListener('click', toggleAudio));

  // Expose for debugging
  window._guruAudio = {
    start: startAudioOrFallback,
    stop: function(){ if (audioEl && !audioEl.paused) audioEl.pause(); stopWebAudioDrone(); },
    status: () => ({ started, useWebAudio })
  };
});
