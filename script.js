// script.js – GuruTech PRO Audio + Desktop-Only Layout + Payment Routing
document.addEventListener("DOMContentLoaded", function () {
  const audioEl = document.getElementById("bg-audio");
  const musicButtons = document.querySelectorAll("#music-toggle, #music-toggle-hero");

  let audioStarted = false;

  /* -------------------------------------------------
       AUTOPLAY HANDLER (Starts after first touch)
  ---------------------------------------------------*/
  function tryStartAudio() {
    if (audioStarted) return;

    if (audioEl) {
      audioEl.volume = 0.35;

      audioEl.play().then(() => {
        audioStarted = true;
        musicButtons.forEach(btn => btn.textContent = "🔊 Music On");
      }).catch(() => {
        console.warn("Autoplay blocked.");
      });
    }
  }

  function firstUserInteraction() {
    tryStartAudio();

    window.removeEventListener("pointerdown", firstUserInteraction);
    window.removeEventListener("touchstart", firstUserInteraction);
    window.removeEventListener("keydown", firstUserInteraction);
  }

  window.addEventListener("pointerdown", firstUserInteraction, { passive: true });
  window.addEventListener("touchstart", firstUserInteraction, { passive: true });
  window.addEventListener("keydown", firstUserInteraction);

  /* -------------------------------------------------
      TOGGLE BUTTON
  ---------------------------------------------------*/
  musicButtons.forEach(btn =>
    btn?.addEventListener("click", () => {
      if (!audioEl) return;

      if (audioEl.paused) {
        audioEl.play();
        btn.textContent = "🔊 Music On";
      } else {
        audioEl.pause();
        btn.textContent = "🔈 Paused";
      }
    })
  );

  /* -------------------------------------------------
      FORCE DESKTOP VIEW ON MOBILE (No zoom)
  ---------------------------------------------------*/
  const meta = document.querySelector("meta[name=viewport]");
  if (meta) {
    meta.setAttribute(
      "content",
      "width=1200, initial-scale=0.55, maximum-scale=0.55, user-scalable=no"
    );
  }

  document.body.style.touchAction = "none";

  /* -------------------------------------------------
      AUTO-FILL PAY.HTML (READ SERVICE + PRICE)
  ---------------------------------------------------*/
  const urlParams = new URLSearchParams(window.location.search);
  const svc = urlParams.get("service");
  const price = urlParams.get("price");

  if (svc && price && document.getElementById("pay-service")) {
    document.getElementById("pay-service").textContent = svc;
    document.getElementById("pay-amount").textContent = price + " KES";

    const hiddenService = document.getElementById("service-input");
    const hiddenAmount = document.getElementById("amount-input");

    if (hiddenService) hiddenService.value = svc;
    if (hiddenAmount) hiddenAmount.value = price;

    const balanceField = document.getElementById("balance-info");
    if (balanceField) {
      balanceField.textContent = `Total: ${price} KES`;
    }
  }
});
