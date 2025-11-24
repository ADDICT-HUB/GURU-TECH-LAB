// script.js - Robust audio: uses <audio src="assets/ambient.mp3"> if present,
// otherwise falls back to a generated ambient drone via WebAudio API.
// Music starts after first user interaction (pointer/touch/keydown).

document.addEventListener("DOMContentLoaded", function () {
  // Footer year update if present
  const yearEls = document.querySelectorAll("#year, #year2, #year3, #year4, #year5");
  yearEls.forEach(el => { if (el) el.textContent = new Date().getFullYear(); });

  const audioEl = document.getElementById("bg-audio");
  const musicToggle = document.getElementById("music-toggle");
  let started = false;
  let useWebAudio = false;
  let webAudioCtx = null;
  let webAudioGain = null;
  let webAudioOsc = null;

  // Safe low default volume for file playback
  function safePlayAudioElement() {
    if (!audioEl) return Promise.reject(new Error("No audio element"));
    audioEl.volume = 0.22;
    return audioEl.play().then(() => {
      started = true;
      if (musicToggle) musicToggle.textContent = "🔊 Music On";
    });
  }

  // Create a gentle ambient drone using WebAudio API
  function startWebAudioDrone() {
    if (started) return;
    try {
      webAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // create two detuned oscillators + noise via buffer source for texture
      const o1 = webAudioCtx.createOscillator();
      const o2 = webAudioCtx.createOscillator();
      webAudioGain = webAudioCtx.createGain();

      o1.type = "sine";
      o2.type = "sine";
      o1.frequency.value = 110; // low A-ish
      o2.frequency.value = 112.5; // slightly detuned

      // slow LFO to modulate gain for a breathing effect
      const lfo = webAudioCtx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.08; // very slow
      const lfoGain = webAudioCtx.createGain();
      lfoGain.gain.value = 0.08;

      webAudioGain.gain.value = 0.12; // base volume

      o1.connect(webAudioGain);
      o2.connect(webAudioGain);
      webAudioGain.connect(webAudioCtx.destination);

      lfo.connect(lfoGain);
      lfoGain.connect(webAudioGain.gain);

      o1.start();
      o2.start();
      lfo.start();

      // Gentle detune for texture
      o1.detune.value = -10;
      o2.detune.value = 10;

      // store references to stop later
      webAudioOsc = [o1, o2, lfo];

      started = true;
      useWebAudio = true;
      if (musicToggle) musicToggle.textContent = "🔊 Music On";
    } catch (err) {
      console.warn("WebAudio start failed:", err);
      started = false;
    }
  }

  // Try to play audio element first; if fails, fall back to WebAudio drone
  function startAudioOrFallback() {
    if (started) return;
    if (audioEl && audioEl.querySelector("source") && audioEl.querySelector("source").src) {
      // Try file audio
      safePlayAudioElement().catch((err) => {
        // If playback blocked or file missing, fallback
        console.warn("Audio element playback failed, falling back to WebAudio:", err);
        startWebAudioDrone();
      });
    } else {
      // No valid audio source — fallback to WebAudio drone
      startWebAudioDrone();
    }
  }

  // Stop WebAudio drone cleanly
  function stopWebAudioDrone() {
    if (!useWebAudio || !webAudioOsc || !webAudioCtx) return;
    try {
      webAudioOsc.forEach(o => o.stop && o.stop());
      webAudioCtx.close && webAudioCtx.close();
    } catch (e) {
      console.warn("Error stopping WebAudio:", e);
    }
    webAudioOsc = null;
    webAudioCtx = null;
    webAudioGain = null;
    useWebAudio = false;
    started = false;
  }

  // Global first-interaction handler to start audio
  function firstInteractionHandler() {
    if (!started) startAudioOrFallback();

    // remove listeners after first interaction
    window.removeEventListener("pointerdown", firstInteractionHandler);
    window.removeEventListener("touchstart", firstInteractionHandler);
    window.removeEventListener("keydown", firstInteractionHandler);
  }

  window.addEventListener("pointerdown", firstInteractionHandler, {passive:true});
  window.addEventListener("touchstart", firstInteractionHandler, {passive:true});
  window.addEventListener("keydown", firstInteractionHandler, {passive:true});

  // Music toggle button logic
  if (musicToggle) {
    musicToggle.addEventListener("click", function () {
      // If using audio element
      if (audioEl && audioEl.querySelector("source") && audioEl.querySelector("source").src) {
        if (audioEl.paused) {
          safePlayAudioElement().catch(() => {
            // fallback
            startWebAudioDrone();
          });
        } else {
          audioEl.pause();
          musicToggle.textContent = "🔈 Paused";
        }
        return;
      }

      // Else audio element not available — toggle WebAudio
      if (!useWebAudio) {
        startWebAudioDrone();
      } else {
        stopWebAudioDrone();
        if (musicToggle) musicToggle.textContent = "🔈 Paused";
      }
    });
  }

  // If the page has an audio element and the file is present, update UI accordingly (but DO NOT auto-play)
  if (audioEl && audioEl.querySelector("source") && audioEl.querySelector("source").src) {
    if (musicToggle) musicToggle.textContent = "🔊 Play Music";
  } else {
    if (musicToggle) musicToggle.textContent = "🔊 Play Music";
  }

  // Expose some helpers for debugging in console (optional)
  window._guruAudio = {
    start: startAudioOrFallback,
    stop: function() {
      if (audioEl && !audioEl.paused) audioEl.pause();
      stopWebAudioDrone();
    },
    status: () => ({started, useWebAudio})
  };
});
