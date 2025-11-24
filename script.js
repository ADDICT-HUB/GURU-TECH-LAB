// Theme Switcher
function toggleTheme() {
  document.body.classList.toggle('light-mode');
}

// Remove loading screen
window.onload = () => {
  document.getElementById('loading-screen').style.display = 'none';
};
