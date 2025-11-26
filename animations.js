// animations.js - subtle hologram floating/glow animations
(function(){
  // small animated background float for elements with class .glow-float
  const floats = document.querySelectorAll('.glow-float');
  if (!floats || floats.length === 0) return;
  let t = 0;
  function tick(){
    t += 0.01;
    floats.forEach((el, i) => {
      const s = Math.sin(t * (0.6 + i*0.05)) * 6;
      el.style.transform = `translateY(${s}px)`;
      el.style.opacity = 0.92 + (Math.sin(t*0.3 + i)*0.02);
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
