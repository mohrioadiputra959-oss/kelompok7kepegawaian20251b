// ==========================================================================
// theme.js — Dark/Light Mode Toggle Logic
// Persisten via localStorage. Diload kedua setelah data.js.
// ==========================================================================

/** Inisialisasi tema saat halaman pertama dimuat */
function initTheme() {
  const saved = localStorage.getItem('simegTheme') || 'light';
  document.body.setAttribute('data-theme', saved);
  updateThemeToggleIcons(saved);
}

/** Toggle antara dark dan light mode */
function toggleTheme() {
  const current = document.body.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', next);
  localStorage.setItem('simegTheme', next);
  updateThemeToggleIcons(next);
}

/** Update semua ikon toggle tema di sidebar dan topbar */
function updateThemeToggleIcons(theme) {
  // Sidebar toggle
  const sidebarToggle = document.getElementById('themeToggle');
  if (sidebarToggle) {
    const icon = sidebarToggle.querySelector('.nav-item-icon') || sidebarToggle.querySelector('.theme-icon');
    if (icon) icon.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    const label = sidebarToggle.querySelector('.theme-label');
    if (label) label.textContent = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
  }

  // Topbar toggle (mobile)
  const topbarToggle = document.getElementById('topbarThemeToggle');
  if (topbarToggle) {
    topbarToggle.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    topbarToggle.title = theme === 'dark' ? 'Mode Terang' : 'Mode Gelap';
  }
  
  if (window.updateIcons) updateIcons();
}

// Jalankan inisialisasi tema segera saat script dimuat
// untuk mencegah flash of unstyled content (FOUC)
initTheme();
