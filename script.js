// --- Theme Toggle ---
function toggleTheme() {
  document.body.classList.toggle('light-mode');
}

// --- Remove Loading Screen ---
window.onload = () => {
  document.getElementById('loading-screen').style.display = 'none';
  createDNABackground();
}

// --- DNA Background Animation ---
function createDNABackground(){
  const bg = document.getElementById('dna-bg');
  for(let i=0; i<60; i++){
    const ray = document.createElement('div');
    ray.className = 'dna-ray';
    ray.style.left = Math.random()*100 + '%';
    ray.style.height = 50 + Math.random()*200 + 'px';
    ray.style.animationDuration = 3 + Math.random()*5 + 's';
    bg.appendChild(ray);
  }
}
