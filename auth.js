// ==========================================================================
// auth.js — Login, Routing & Session Management
// Menangani autentikasi via sessionStorage. Wajib diload di semua halaman.
// ==========================================================================

/** Cek apakah user sudah login. Redirect ke login jika belum. */
function requireAuth() {
  const user = JSON.parse(sessionStorage.getItem('simegUser'));
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

/** Di halaman login: redirect jika sudah login */
function redirectIfLoggedIn() {
  const user = JSON.parse(sessionStorage.getItem('simegUser'));
  if (user) {
    window.location.href = user.role === 'Admin' ? 'admin.html' : 'karyawan.html';
  }
}

/** Proses login — dipanggil saat form submit */
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  const errorBox = document.getElementById('loginError');

  // Sembunyikan error sebelumnya
  if (errorBox) errorBox.classList.remove('show');

  // Validasi input kosong
  if (!username || !password) {
    showLoginError('Harap isi username dan password.');
    shakeLoginCard();
    return;
  }

  // Tampilkan loading state
  loginBtn.disabled = true;
  loginBtn.classList.add('loading');

  // Simulasi delay autentikasi
  setTimeout(() => {
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);

    if (!user) {
      loginBtn.disabled = false;
      loginBtn.classList.remove('loading');
      showLoginError('Username atau password salah. Coba lagi.');
      shakeLoginCard();
      return;
    }

    // Login berhasil
    sessionStorage.setItem('simegUser', JSON.stringify(user));
    showLoginSuccess();

    setTimeout(() => {
      window.location.href = user.role === 'Admin' ? 'admin.html' : 'karyawan.html';
    }, 800);
  }, 1000);
}

/** Tampilkan pesan error login */
function showLoginError(message) {
  const errorBox = document.getElementById('loginError');
  if (errorBox) {
    errorBox.querySelector('.error-text').textContent = message;
    errorBox.classList.add('show');
  }
}

/** Animasi shake pada card login saat error */
function shakeLoginCard() {
  const card = document.querySelector('.login-card');
  if (card) {
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 400);
  }
}

/** Tampilkan overlay sukses saat login berhasil */
function showLoginSuccess() {
  const overlay = document.getElementById('loginSuccessOverlay');
  if (overlay) {
    overlay.classList.add('show');
  }
}

/** Toggle visibilitas password */
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i data-lucide="eye-off"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i data-lucide="eye"></i>';
  }
  if (window.lucide) lucide.createIcons();
}

/** Logout — hapus session dan redirect ke login */
function handleLogout() {
  showConfirmDialog(
    'Logout dari Sistem?',
    'Anda akan keluar dari SIMPEG. Session Anda akan dihapus.',
    'Ya, Logout',
    'Batal',
    () => {
      sessionStorage.removeItem('simegUser');
      window.location.href = 'index.html';
    },
    'warning'
  );
}
