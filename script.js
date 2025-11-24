// script.js - Music autoplay on first user interaction + helpers

document.addEventListener("DOMContentLoaded", function () {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const audio = document.getElementById("bg-audio");
  const musicToggle = document.getElementById("music-toggle");
  let started = false;

  // Ensure audio exists
  if (!audio) return;

  // Set a safe low volume by default
  audio.volume = 0.25; // small volume

  // Function to start playing the audio (returns Promise)
  function startAudio() {
    return audio.play().then(() => {
      started = true;
      if (musicToggle) musicToggle.textContent = "🔊 Music On";
    }).catch((err) => {
      // Playback might be blocked — leave toggle button for user
      console.warn("Autoplay blocked or unavailable:", err);
      if (musicToggle) musicToggle.textContent = "🔊 Play Music";
    });
  }

  // Start audio on first user interaction (click / touch / keydown)
  function firstInteractionHandler() {
    if (!started) {
      startAudio();
    }
    // Remove listeners after first interaction
    window.removeEventListener("pointerdown", firstInteractionHandler);
    window.removeEventListener("keydown", firstInteractionHandler);
    window.removeEventListener("touchstart", firstInteractionHandler);
  }

  window.addEventListener("pointerdown", firstInteractionHandler, {passive:true});
  window.addEventListener("touchstart", firstInteractionHandler, {passive:true});
  window.addEventListener("keydown", firstInteractionHandler, {passive:true});

  // Toggle button
  if (musicToggle) {
    musicToggle.addEventListener("click", function () {
      if (audio.paused) {
        startAudio();
      } else {
        audio.pause();
        musicToggle.textContent = "🔈 Paused";
      }
    });
  }
});
