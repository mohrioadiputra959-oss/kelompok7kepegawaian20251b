// ==========================================================================
// karyawan.js — Logika Portal Karyawan SIMPEG
// SPA navigation, dashboard, absensi, cuti, profil, ganti password
// ==========================================================================

let currentUser = null;
let currentPage = 'dashboard';
let clockInterval = null;
let todayCheckIn = null;
let todayCheckOut = null;

// ==========================================================================
// INISIALISASI
// ==========================================================================

/** Inisialisasi portal karyawan saat halaman dimuat */
function initKaryawan() {
  currentUser = requireAuth();
  if (!currentUser || currentUser.role !== 'Karyawan') {
    window.location.href = 'index.html';
    return;
  }

  // Setup UI dengan data user
  setupSidebar();
  setupTopbar();
  updateNotifBadge();

  // Render halaman default
  navigateTo('dashboard');
}

// ==========================================================================
// SIDEBAR & TOPBAR SETUP
// ==========================================================================

/** Setup sidebar dengan data user yang login */
function setupSidebar() {
  const avatarColor = getAvatarColor(currentUser.nama);
  const initials = getInitials(currentUser.nama);
  const foto = localStorage.getItem('userFoto_' + currentUser.nip) || sessionStorage.getItem('userFoto');

  // User avatar & info
  const avatarEl = document.getElementById('sidebarAvatar');
  if (avatarEl) {
    if (foto) {
      avatarEl.innerHTML = `<img src="${foto}" alt="${currentUser.nama}">`;
    } else {
      avatarEl.style.background = avatarColor;
      avatarEl.textContent = initials;
    }
  }

  const userNameEl = document.getElementById('sidebarUserName');
  if (userNameEl) userNameEl.textContent = currentUser.nama;

  const userRoleEl = document.getElementById('sidebarUserRole');
  if (userRoleEl) userRoleEl.textContent = currentUser.jabatan;
}

/** Setup topbar dengan data user */
function setupTopbar() {
  const avatarColor = getAvatarColor(currentUser.nama);
  const initials = getInitials(currentUser.nama);
  const foto = localStorage.getItem('userFoto_' + currentUser.nip) || sessionStorage.getItem('userFoto');

  const topAvatar = document.getElementById('topbarAvatar');
  if (topAvatar) {
    if (foto) {
      topAvatar.innerHTML = `<img src="${foto}" alt="${currentUser.nama}">`;
    } else {
      topAvatar.style.background = avatarColor;
      topAvatar.textContent = initials;
    }
  }
}

// ==========================================================================
// SPA NAVIGATION
// ==========================================================================

/** Navigasi SPA — render halaman berdasarkan nama */
function navigateTo(page) {
  currentPage = page;

  // Clear interval jam jika ada
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }

  // Update active state sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update judul topbar
  const titles = {
    'dashboard': 'Dashboard',
    'absensi': 'Absensi Hari Ini',
    'riwayat-absensi': 'Riwayat Absensi',
    'ajukan-cuti': 'Ajukan Cuti',
    'riwayat-cuti': 'Riwayat Cuti',
    'profil': 'Profil Saya',
    'ganti-password': 'Ganti Password'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[page] || 'Dashboard';

  // Render konten halaman dengan Skeleton Loading simulasi (400ms)
  const content = document.getElementById('pageContent');
  
  if (typeof renderSkeletonLoader === 'function') {
    content.innerHTML = renderSkeletonLoader();
  }

  setTimeout(() => {
    switch (page) {
      case 'dashboard':
        content.innerHTML = renderDashboardKaryawan();
        break;
      case 'absensi':
        content.innerHTML = renderAbsensiHariIni();
        startClock();
        break;
      case 'riwayat-absensi':
        content.innerHTML = renderRiwayatAbsensi();
        break;
      case 'ajukan-cuti':
        content.innerHTML = renderFormCuti();
        initFormCuti();
        break;
      case 'riwayat-cuti':
        content.innerHTML = renderRiwayatCuti();
        break;
      case 'profil':
        content.innerHTML = renderProfil();
        break;
      case 'ganti-password':
        content.innerHTML = renderGantiPassword();
        break;
      default:
        content.innerHTML = renderDashboardKaryawan();
    }
    
    if (window.updateIcons) updateIcons();
  }, 400);

  // Tutup sidebar di mobile
  closeSidebar();

  // Tutup notif panel jika terbuka
  const notifPanel = document.getElementById('notifPanel');
  if (notifPanel) notifPanel.classList.add('hidden');
  
  if (window.updateIcons) updateIcons();
}

// ==========================================================================
// SIDEBAR TOGGLE (Mobile)
// ==========================================================================

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

// ==========================================================================
// NOTIFIKASI
// ==========================================================================

/** Toggle panel notifikasi */
function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    renderNotifications();
  } else {
    panel.classList.add('hidden');
  }
}

/** Render daftar notifikasi */
function renderNotifications() {
  const panel = document.getElementById('notifPanel');
  const unread = MOCK_NOTIFICATIONS.filter(n => !n.dibaca);

  panel.innerHTML = `
    <div class="notif-header">
      <h4>Notifikasi</h4>
      <span class="notif-count">${unread.length} belum dibaca</span>
      <button class="notif-mark-read" onclick="markAllRead()">Tandai semua dibaca</button>
    </div>
    <div class="notif-list">
      ${MOCK_NOTIFICATIONS.length === 0 ? `
        <div class="empty-state" style="padding:32px;">
          <div class="empty-state-icon"><i data-lucide="bell"></i></div>
          <p class="empty-state-desc">Tidak ada notifikasi</p>
        </div>
      ` : MOCK_NOTIFICATIONS.map(n => `
        <div class="notif-item ${n.dibaca ? 'read' : 'unread'}" onclick="markRead('${n.id}')">
          <div class="notif-dot ${n.type}"></div>
          <div>
            <p>${n.pesan}</p>
            <small>${n.waktu}</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  if (window.updateIcons) updateIcons();
}

/** Tandai satu notifikasi sebagai dibaca */
function markRead(id) {
  const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
  if (notif) notif.dibaca = true;
  renderNotifications();
  updateNotifBadge();
}

/** Tandai semua notifikasi sebagai dibaca */
function markAllRead() {
  MOCK_NOTIFICATIONS.forEach(n => n.dibaca = true);
  renderNotifications();
  updateNotifBadge();
  showToast('Semua notifikasi ditandai dibaca.', 'success');
}

/** Update badge angka notifikasi yang belum dibaca */
function updateNotifBadge() {
  const count = MOCK_NOTIFICATIONS.filter(n => !n.dibaca).length;
  const badge = document.getElementById('notifBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

// ==========================================================================
// 1. DASHBOARD KARYAWAN
// ==========================================================================

function renderDashboardKaryawan() {
  const pegawai = MOCK_PEGAWAI.find(p => p.nip === currentUser.nip);
  const hadirCount = MOCK_ABSENSI.filter(a => a.status === 'Hadir' || a.status === 'Terlambat').length;
  const todayAbsensi = MOCK_ABSENSI[0];
  const foto = sessionStorage.getItem('userFoto');

  return `
    <div class="animate-fadeInUp">
      <!-- Welcome Banner -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <p class="welcome-date">${getTodayFormatted()}</p>
          <h2>Selamat Datang, ${currentUser.nama.split(' ')[0]}! <i data-lucide="smile"></i></h2>
          <p>${todayAbsensi && todayAbsensi.checkIn ? 'Kamu sudah check-in hari ini. Semangat bekerja!' : 'Jangan lupa check-in hari ini ya!'}</p>
        </div>
        <div class="welcome-illustration"><i data-lucide="building"></i></div>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card stagger-1">
          <div class="stat-card-header">
            <div class="stat-card-icon blue"><i data-lucide="layout-dashboard"></i></div>
          </div>
          <div class="stat-card-label">Hadir Bulan Ini</div>
          <div class="stat-card-value">${hadirCount}</div>
          <div class="stat-card-sub">dari 7 hari kerja</div>
        </div>
        <div class="stat-card stagger-2">
          <div class="stat-card-header">
            <div class="stat-card-icon green"><i data-lucide="umbrella"></i></div>
          </div>
          <div class="stat-card-label">Sisa Cuti</div>
          <div class="stat-card-value">${MOCK_JATAH_CUTI.sisa}</div>
          <div class="stat-card-sub">dari ${MOCK_JATAH_CUTI.total} hari total</div>
        </div>
        <div class="stat-card stagger-3">
          <div class="stat-card-header">
            <div class="stat-card-icon orange"><i data-lucide="clock"></i></div>
          </div>
          <div class="stat-card-label">Check-in Hari Ini</div>
          <div class="stat-card-value" style="font-family:var(--font-mono)">${todayAbsensi?.checkIn || '--:--'}</div>
          <div class="stat-card-sub">${todayAbsensi?.checkIn ? 'Tercatat' : 'Belum check-in'}</div>
        </div>
        <div class="stat-card stagger-4">
          <div class="stat-card-header">
            <div class="stat-card-icon ${todayAbsensi?.status === 'Hadir' ? 'green' : 'red'}">
              ${todayAbsensi?.status === 'Hadir' ? '<i data-lucide="check-circle-2"></i>' : todayAbsensi?.status === 'Terlambat' ? '<i data-lucide="clock"></i>' : '<i data-lucide="x-circle"></i>'}
            </div>
          </div>
          <div class="stat-card-label">Status Hari Ini</div>
          <div class="stat-card-value" style="font-size:20px">${todayAbsensi?.status || 'Belum'}</div>
          <div class="stat-card-sub">${todayAbsensi?.status === 'Hadir' ? 'Tepat waktu' : ''}</div>
        </div>
      </div>

      <!-- Chart & ID Card -->
      <div class="chart-section">
        <div class="chart-card">
          <div class="chart-title"><i data-lucide="trending-up"></i> Kehadiran 7 Hari Terakhir</div>
          <div class="chart-container">
            ${MOCK_ABSENSI.slice().reverse().map(a => {
              let height = 0;
              let barClass = 'absen';
              if (a.status === 'Hadir') { height = 90; barClass = 'hadir'; }
              else if (a.status === 'Terlambat') { height = 70; barClass = 'terlambat'; }
              else { height = 15; barClass = 'absen'; }
              return `
                <div class="chart-bar-group">
                  <span class="bar-value">${a.checkIn || '-'}</span>
                  <div class="bar ${barClass}" style="height:${height}%"></div>
                  <span class="bar-label">${getNamaHariPendek(a.tanggal)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ID Card Digital -->
        <div class="id-card">
          <div class="id-card-header">
            <span style="font-size:20px"><i data-lucide="building-2"></i></span>
            <div class="company-name">PT <span class="gold">Nusantara</span> Jaya</div>
          </div>
          <div class="id-card-body">
            <div class="id-card-avatar" style="background:${getAvatarColor(currentUser.nama)}">
              ${foto ? `<img src="${foto}" alt="${currentUser.nama}">` : getInitials(currentUser.nama)}
            </div>
            <div class="id-card-name">${currentUser.nama.toUpperCase()}</div>
            <div class="id-card-jabatan">${currentUser.jabatan}</div>
            <div class="id-card-divisi">${currentUser.divisi}</div>
            <div class="id-card-nip">${currentUser.nip}</div>
            <div class="id-card-date">Bergabung: ${pegawai ? formatTanggal(pegawai.tanggalMasuk) : '-'}</div>
          </div>
        </div>
        </div>
      </div>

      <!-- Pengumuman Internal -->
      <div style="margin-top:24px;">
        <h3 style="margin-bottom:16px; font-family:var(--font-heading); font-size:18px; color:var(--color-text-primary);">
          <i data-lucide="megaphone" style="color:var(--color-warning);"></i> Pengumuman Terbaru
        </h3>
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${MOCK_PENGUMUMAN.length === 0 ? '<div class="empty-state" style="padding:24px;"><p>Belum ada pengumuman.</p></div>' : MOCK_PENGUMUMAN.map(p => `
            <div style="padding:16px; border-left:4px solid var(--color-warning); background:var(--color-bg-card); border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <h4 style="font-size:16px; font-weight:600; color:var(--color-text-primary); margin:0;">${p.judul}</h4>
                <span style="font-size:12px; color:var(--color-text-muted);">${formatTanggalPendek(p.tanggal)}</span>
              </div>
              <p style="font-size:14px; color:var(--color-text-secondary); line-height:1.5; margin:0;">${p.isi}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 2. ABSENSI HARI INI
// ==========================================================================

function renderAbsensiHariIni() {
  // Cek session absensi hari ini
  const savedCheckIn = sessionStorage.getItem('todayCheckIn');
  const savedCheckOut = sessionStorage.getItem('todayCheckOut');
  todayCheckIn = savedCheckIn || null;
  todayCheckOut = savedCheckOut || null;

  return `
    <div class="animate-fadeInUp">
      <div class="absensi-grid">
        <!-- Widget Absensi -->
        <div class="clock-widget">
          <div class="digital-clock" id="digitalClock">--:--:--</div>
          <div class="clock-date">${getTodayFormatted()}</div>
          <div class="checkin-status" id="checkinStatus">
            ${todayCheckIn ? `<i data-lucide="check-circle-2"></i> Sudah check-in pukul ${todayCheckIn}` : '<i data-lucide="hourglass"></i> Belum check-in hari ini'}
          </div>
          
          ${!todayCheckIn ? `
            <button class="btn-checkin check-in" id="btnCheckIn" onclick="doCheckIn()">
              <i data-lucide="map-pin"></i> CHECK-IN SEKARANG
            </button>
          ` : !todayCheckOut ? `
            <button class="btn-checkin check-out" id="btnCheckOut" onclick="doCheckOut()">
              <i data-lucide="log-out"></i> CHECK-OUT
            </button>
          ` : `
            <button class="btn-checkin check-out" disabled>
              <i data-lucide="check-circle-2"></i> Selesai — Durasi kerja tercatat
            </button>
          `}

          ${todayCheckOut ? `
            <div class="work-duration" id="workDuration">
              <i data-lucide="timer"></i> Durasi kerja: ${calculateDuration(todayCheckIn, todayCheckOut)}
            </div>
          ` : ''}
        </div>

        <!-- Riwayat Absensi Mini -->
        <div class="card-static" style="padding:24px;">
          <h3 style="font-family:var(--font-heading); font-size:16px; font-weight:700; margin-bottom:16px; color:var(--color-text-primary);">
            <i data-lucide="clipboard-list"></i> Riwayat 5 Hari Terakhir
          </h3>
          <div class="table-wrapper" style="box-shadow:none; border:none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${MOCK_ABSENSI.slice(0, 5).map(a => `
                  <tr>
                    <td>${formatTanggalPendek(a.tanggal)}</td>
                    <td style="font-family:var(--font-mono); font-size:13px">${a.checkIn || '-'}</td>
                    <td style="font-family:var(--font-mono); font-size:13px">${a.checkOut || '-'}</td>
                    <td><span class="badge ${getBadgeClass(a.status)}">${a.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Proses Check-In */
function doCheckIn() {
  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  todayCheckIn = time;
  sessionStorage.setItem('todayCheckIn', time);

  if (typeof currentUser !== 'undefined' && currentUser && currentUser.nip) {
    localStorage.setItem('absensi_checkin_' + currentUser.nip, time);
    localStorage.setItem('absensi_date_' + currentUser.nip, now.toISOString().split('T')[0]);
  }

  const todayStr = now.toISOString().split('T')[0];
  if (typeof MOCK_ABSENSI !== 'undefined' && MOCK_ABSENSI.length > 0) {
    if (MOCK_ABSENSI[0].tanggal !== todayStr) {
      MOCK_ABSENSI.unshift({
        id: 'A' + (Math.floor(Math.random() * 10000)),
        tanggal: todayStr,
        checkIn: time,
        checkOut: null,
        status: 'Hadir'
      });
    } else {
      MOCK_ABSENSI[0].checkIn = time;
      MOCK_ABSENSI[0].status = 'Hadir';
    }
  }

  showToast(`<i data-lucide="check-circle-2"></i> Check-in berhasil pukul ${time}`, 'success');

  // Re-render halaman absensi
  navigateTo('absensi');
}

/** Proses Check-Out */
function doCheckOut() {
  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  todayCheckOut = time;
  sessionStorage.setItem('todayCheckOut', time);

  if (typeof currentUser !== 'undefined' && currentUser && currentUser.nip) {
    localStorage.setItem('absensi_checkout_' + currentUser.nip, time);
  }

  if (typeof MOCK_ABSENSI !== 'undefined' && MOCK_ABSENSI.length > 0) {
    MOCK_ABSENSI[0].checkOut = time;
  }

  showToast(`<i data-lucide="log-out"></i> Check-out berhasil pukul ${time}. Durasi kerja: ${calculateDuration(todayCheckIn, time)}`, 'success');

  // Re-render halaman absensi
  navigateTo('absensi');
}

/** Hitung durasi kerja antara check-in dan check-out */
function calculateDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '-';
  const [h1, m1] = checkIn.replace('.', ':').split(':').map(Number);
  const [h2, m2] = checkOut.replace('.', ':').split(':').map(Number);
  const diffMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours} jam ${mins} menit`;
}

/** Mulai jam digital berjalan */
function startClock() {
  if (clockInterval) clearInterval(clockInterval);
  function updateClock() {
    const now = new Date();
    const el = document.getElementById('digitalClock');
    if (el) {
      el.textContent = now.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).replace(/\./g, ':');
    }
  }
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}

// ==========================================================================
// 3. RIWAYAT ABSENSI
// ==========================================================================

function renderRiwayatAbsensi() {
  return `
    <div class="animate-fadeInUp">
      <div class="card-static" style="padding:24px;">
        <h3 style="font-family:var(--font-heading); font-size:18px; font-weight:700; margin-bottom:20px; color:var(--color-text-primary);">
          <i data-lucide="calendar"></i> Riwayat Absensi Lengkap
        </h3>
        <div class="table-wrapper" style="box-shadow:none; border:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Hari</th>
                <th>Tanggal</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Durasi</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${MOCK_ABSENSI.map(a => `
                <tr>
                  <td>${getNamaHari(a.tanggal)}</td>
                  <td>${formatTanggal(a.tanggal)}</td>
                  <td style="font-family:var(--font-mono); font-size:13px">${a.checkIn || '-'}</td>
                  <td style="font-family:var(--font-mono); font-size:13px">${a.checkOut || '-'}</td>
                  <td style="font-family:var(--font-mono); font-size:13px">${a.checkIn && a.checkOut ? calculateDuration(a.checkIn, a.checkOut) : '-'}</td>
                  <td><span class="badge ${getBadgeClass(a.status)}">${a.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${MOCK_ABSENSI.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="calendar"></i></div>
            <div class="empty-state-title">Belum ada data absensi</div>
            <div class="empty-state-desc">Riwayat absensi akan muncul di sini setelah Anda melakukan check-in.</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ==========================================================================
// 4. FORM AJUKAN CUTI
// ==========================================================================

function renderFormCuti() {
  return `
    <div class="animate-fadeInUp">
      <!-- Info jatah cuti -->
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px;">
        <div class="stat-card">
          <div class="stat-card-label">Total Jatah Cuti</div>
          <div class="stat-card-value">${MOCK_JATAH_CUTI.total}</div>
          <div class="stat-card-sub">hari / tahun</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Sudah Terpakai</div>
          <div class="stat-card-value">${MOCK_JATAH_CUTI.terpakai}</div>
          <div class="stat-card-sub">hari digunakan</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">Sisa Cuti</div>
          <div class="stat-card-value" style="color:var(--color-success-600)">${MOCK_JATAH_CUTI.sisa}</div>
          <div class="stat-card-sub">hari tersedia</div>
        </div>
      </div>

      <div class="form-card">
        <h3><i data-lucide="edit-3"></i> Ajukan Permohonan Cuti</h3>

        <form id="formCuti" onsubmit="submitCuti(event)">
          <!-- Jenis Cuti -->
          <div class="form-group">
            <label class="form-label">Jenis Cuti</label>
            <div class="pill-selector" id="pillSelector">
              <button type="button" class="pill active" data-value="Cuti Tahunan" onclick="selectPill(this)">Cuti Tahunan</button>
              <button type="button" class="pill" data-value="Cuti Sakit" onclick="selectPill(this)">Cuti Sakit</button>
              <button type="button" class="pill" data-value="Cuti Melahirkan" onclick="selectPill(this)">Cuti Melahirkan</button>
              <button type="button" class="pill" data-value="Cuti Khusus" onclick="selectPill(this)">Cuti Khusus</button>
            </div>
            <input type="hidden" id="jenisCuti" value="Cuti Tahunan">
          </div>

          <!-- Tanggal -->
          <div class="form-grid" style="margin-bottom:16px;">
            <div class="form-group">
              <label class="form-label">Tanggal Mulai</label>
              <input type="date" class="form-input" id="tglMulai" required onchange="updateJumlahHari()">
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Selesai</label>
              <input type="date" class="form-input" id="tglSelesai" required onchange="updateJumlahHari()">
            </div>
          </div>

          <!-- Counter hari -->
          <div class="info-box hidden" id="jumlahHariInfo">
            <i data-lucide="calendar"></i> Permohonan cuti selama <strong id="jumlahHariDisplay">0</strong> hari kerja
            (Sisa jatah: <strong>${MOCK_JATAH_CUTI.sisa} hari</strong>)
          </div>

          <!-- Alasan -->
          <div class="form-group">
            <label class="form-label">Alasan Cuti</label>
            <textarea class="form-input" id="alasanCuti" rows="3" 
              placeholder="Tuliskan alasan cuti Anda..." required maxlength="200"
              oninput="updateCharCount()"></textarea>
            <span class="char-count"><span id="charCount">0</span>/200</span>
          </div>

          <!-- Submit -->
          <button type="submit" class="btn btn-primary btn-lg" style="width:100%">
            <i data-lucide="send"></i> Kirim Permohonan
          </button>
        </form>
      </div>
    </div>
  `;
}

/** Inisialisasi form cuti — set min date */
function initFormCuti() {
  const today = new Date().toISOString().split('T')[0];
  const tglMulai = document.getElementById('tglMulai');
  const tglSelesai = document.getElementById('tglSelesai');
  if (tglMulai) tglMulai.min = today;
  if (tglSelesai) tglSelesai.min = today;
}

/** Pilih pill jenis cuti */
function selectPill(el) {
  document.querySelectorAll('#pillSelector .pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('jenisCuti').value = el.dataset.value;
}

/** Update counter jumlah hari kerja */
function updateJumlahHari() {
  const mulai = document.getElementById('tglMulai').value;
  const selesai = document.getElementById('tglSelesai').value;
  const infoBox = document.getElementById('jumlahHariInfo');
  const display = document.getElementById('jumlahHariDisplay');

  if (mulai && selesai) {
    if (new Date(selesai) < new Date(mulai)) {
      showToast('Tanggal selesai tidak boleh sebelum tanggal mulai.', 'error');
      document.getElementById('tglSelesai').value = '';
      infoBox.classList.add('hidden');
      return;
    }

    const days = hitungHariKerja(mulai, selesai);
    display.textContent = days;
    infoBox.classList.remove('hidden');

    if (days > MOCK_JATAH_CUTI.sisa) {
      showToast(`Jumlah hari (${days}) melebihi sisa jatah cuti (${MOCK_JATAH_CUTI.sisa} hari).`, 'warning');
    }
  } else {
    infoBox.classList.add('hidden');
  }
}

/** Update karakter counter textarea */
function updateCharCount() {
  const textarea = document.getElementById('alasanCuti');
  const counter = document.getElementById('charCount');
  if (textarea && counter) {
    counter.textContent = textarea.value.length;
  }
}

/** Submit permohonan cuti */
function submitCuti(event) {
  event.preventDefault();

  const jenis = document.getElementById('jenisCuti').value;
  const mulai = document.getElementById('tglMulai').value;
  const selesai = document.getElementById('tglSelesai').value;
  const alasan = document.getElementById('alasanCuti').value.trim();

  // Validasi
  if (!mulai || !selesai || !alasan) {
    showToast('Harap lengkapi semua field.', 'error');
    return;
  }

  if (new Date(selesai) < new Date(mulai)) {
    showToast('Tanggal selesai tidak boleh sebelum tanggal mulai.', 'error');
    return;
  }

  const jumlahHari = hitungHariKerja(mulai, selesai);

  if (jumlahHari > MOCK_JATAH_CUTI.sisa) {
    showToast(`Jumlah hari (${jumlahHari}) melebihi sisa jatah cuti Anda (${MOCK_JATAH_CUTI.sisa} hari).`, 'error');
    return;
  }

  // Push ke MOCK_CUTI
  const newCuti = {
    id: generateId('LV'),
    nip: currentUser.nip,
    namaPegawai: currentUser.nama,
    jenisCuti: jenis,
    tanggalMulai: mulai,
    tanggalSelesai: selesai,
    jumlahHari: jumlahHari,
    alasan: alasan,
    status: 'Pending',
    tanggalPengajuan: new Date().toISOString().split('T')[0]
  };

  MOCK_CUTI.push(newCuti);
  if (typeof saveMockCuti === 'function') saveMockCuti();

  // Update jatah cuti
  MOCK_JATAH_CUTI.pending += 1;

  showToast('<i data-lucide="check-circle-2"></i> Permohonan cuti berhasil diajukan! Menunggu persetujuan HRD.', 'success');

  // Navigasi ke riwayat cuti
  setTimeout(() => navigateTo('riwayat-cuti'), 500);
}

// ==========================================================================
// 5. RIWAYAT CUTI
// ==========================================================================

function renderRiwayatCuti() {
  const myCuti = MOCK_CUTI.filter(c => c.nip === currentUser.nip);

  return `
    <div class="animate-fadeInUp">
      <div class="card-static" style="padding:24px;">
        <h3 style="font-family:var(--font-heading); font-size:18px; font-weight:700; margin-bottom:20px; color:var(--color-text-primary);">
          <i data-lucide="file-text"></i> Riwayat Pengajuan Cuti
        </h3>
        ${myCuti.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="umbrella"></i></div>
            <div class="empty-state-title">Belum ada pengajuan cuti</div>
            <div class="empty-state-desc">Ajukan cuti pertama Anda melalui menu "Ajukan Cuti".</div>
          </div>
        ` : `
          <div class="table-wrapper" style="box-shadow:none; border:none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Jenis Cuti</th>
                  <th>Tanggal</th>
                  <th>Durasi</th>
                  <th>Alasan</th>
                  <th>Diajukan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${myCuti.map(c => `
                  <tr>
                    <td style="font-weight:600">${c.jenisCuti}</td>
                    <td>${formatTanggalPendek(c.tanggalMulai)} - ${formatTanggalPendek(c.tanggalSelesai)}</td>
                    <td>${c.jumlahHari} hari</td>
                    <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${c.alasan}</td>
                    <td>${formatTanggalPendek(c.tanggalPengajuan)}</td>
                    <td><span class="badge ${getBadgeClass(c.status)}">${c.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

// ==========================================================================
// 6. PROFIL SAYA
// ==========================================================================

function renderProfil() {
  const pegawai = MOCK_PEGAWAI.find(p => p.nip === currentUser.nip);
  if (!pegawai) return '<div class="empty-state"><div class="empty-state-title">Data profil tidak ditemukan.</div></div>';

  const foto = sessionStorage.getItem('userFoto');
  const avatarColor = getAvatarColor(pegawai.nama);

  return `
    <div class="animate-fadeInUp">
      <div class="profile-grid">
        <!-- Kiri: Foto & Info Dasar -->
        <div class="profile-card">
          <div class="profile-avatar-large" id="previewFotoContainer" style="background:${avatarColor}">
            ${foto ? `<img src="${foto}" alt="${pegawai.nama}" id="previewFoto">` : getInitials(pegawai.nama)}
          </div>
          <div class="profile-name">${pegawai.nama}</div>
          <div class="profile-jabatan">${pegawai.jabatan} • ${pegawai.divisi}</div>
          <div style="margin-top:16px">
            <input type="file" id="fotoInput" accept="image/*" style="display:none" onchange="handleFotoUpload(event)">
            <button class="btn btn-outline btn-sm profile-upload-btn" onclick="document.getElementById('fotoInput').click()">
              <i data-lucide="camera"></i> Upload Foto
            </button>
          </div>
        </div>

        <!-- Kanan: Detail Profil -->
        <div class="profile-detail-card">
          <div class="profile-detail-header">
            <h3>Informasi Pribadi</h3>
            <button class="btn btn-outline btn-sm" id="btnEditProfil" onclick="toggleEditProfil()"><i data-lucide="edit"></i> Edit Profil</button>
          </div>

          <div id="profilView">
            <div class="profile-field">
              <span class="profile-field-label">Nama Lengkap</span>
              <span class="profile-field-value">${pegawai.nama}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">NIP</span>
              <span class="profile-field-value" style="font-family:var(--font-mono); color:var(--color-primary-600)">${pegawai.nip}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">Jabatan</span>
              <span class="profile-field-value">${pegawai.jabatan}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">Divisi</span>
              <span class="profile-field-value">${pegawai.divisi}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">Email</span>
              <span class="profile-field-value">${pegawai.email}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">Telepon</span>
              <span class="profile-field-value">${pegawai.telepon || '-'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">Alamat Lengkap</span>
              <span class="profile-field-value" style="grid-column: span 2;">${pegawai.alamat || '-'}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">Pendidikan</span>
              <span class="profile-field-value">${pegawai.pendidikan}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">Tanggal Masuk</span>
              <span class="profile-field-value">${formatTanggal(pegawai.tanggalMasuk)}</span>
            </div>
            <div class="profile-field">
              <span class="profile-field-label">Status</span>
              <span class="profile-field-value"><span class="badge ${getBadgeClass(pegawai.status)}">${pegawai.status}</span></span>
            </div>
          </div>

          <!-- Form Edit (hidden by default) -->
          <div id="profilEdit" class="hidden">
            <form onsubmit="saveProfil(event)">
              <div class="form-group">
                <label class="form-label">Nama Lengkap</label>
                <input type="text" class="form-input" id="editNama" value="${pegawai.nama}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="editEmail" value="${pegawai.email}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Telepon / HP</label>
                <input type="tel" class="form-input" id="editTelepon" value="${pegawai.telepon || ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Alamat Lengkap</label>
                <textarea class="form-input" id="editAlamat" rows="3" required>${pegawai.alamat || ''}</textarea>
              </div>
              <div style="display:flex; gap:12px; margin-top:16px;">
                <button type="submit" class="btn btn-primary"><i data-lucide="save"></i> Simpan Perubahan</button>
                <button type="button" class="btn btn-outline" onclick="toggleEditProfil()">Batal</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Toggle mode edit/view profil */
function toggleEditProfil() {
  const viewEl = document.getElementById('profilView');
  const editEl = document.getElementById('profilEdit');
  const btn = document.getElementById('btnEditProfil');

  if (editEl.classList.contains('hidden')) {
    viewEl.classList.add('hidden');
    editEl.classList.remove('hidden');
    btn.classList.add('hidden');
  } else {
    viewEl.classList.remove('hidden');
    editEl.classList.add('hidden');
    btn.classList.remove('hidden');
  }
}

/** Simpan perubahan profil */
function saveProfil(event) {
  event.preventDefault();

  const nama = document.getElementById('editNama').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const telepon = document.getElementById('editTelepon').value.trim();
  const alamat = document.getElementById('editAlamat').value.trim();

  // Update mock data
  const pegawai = MOCK_PEGAWAI.find(p => p.nip === currentUser.nip);
  if (pegawai) {
    pegawai.nama = nama;
    pegawai.email = email;
    pegawai.telepon = telepon;
    pegawai.alamat = alamat;
  }

  if (typeof saveMockPegawai === 'function') saveMockPegawai();

  // Update user session
  currentUser.nama = nama;
  sessionStorage.setItem('simegUser', JSON.stringify(currentUser));

  showToast('Profil berhasil diperbarui!', 'success');

  // Re-render
  setupSidebar();
  setupTopbar();
  navigateTo('profil');
}

/** Upload foto profil */
function handleFotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Hanya file gambar yang diperbolehkan.', 'error');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast('Ukuran file maksimal 2MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    const base64 = ev.target.result;
    sessionStorage.setItem('userFoto', base64);
    if (currentUser && currentUser.nip) {
      localStorage.setItem('userFoto_' + currentUser.nip, base64);
    }

    showToast('Foto profil berhasil diperbarui!', 'success');

    // Re-render
    setupSidebar();
    setupTopbar();
    navigateTo('profil');
  };
  reader.readAsDataURL(file);
}

// ==========================================================================
// 7. GANTI PASSWORD
// ==========================================================================

function renderGantiPassword() {
  return `
    <div class="animate-fadeInUp">
      <div class="password-form-card">
        <h3 style="font-family:var(--font-heading); font-size:18px; font-weight:700; margin-bottom:24px; color:var(--color-text-primary);">
          <i data-lucide="lock"></i> Ganti Password
        </h3>

        <form onsubmit="submitGantiPassword(event)">
          <div class="form-group password-field">
            <label class="form-label">Password Lama</label>
            <input type="password" class="form-input" id="oldPassword" required placeholder="Masukkan password lama">
            <button type="button" class="password-toggle" onclick="togglePwField('oldPassword', this)"><i data-lucide="eye"></i></button>
          </div>

          <div class="form-group password-field">
            <label class="form-label">Password Baru</label>
            <input type="password" class="form-input" id="newPassword" required placeholder="Masukkan password baru" oninput="checkPasswordStrength()">
            <button type="button" class="password-toggle" onclick="togglePwField('newPassword', this)"><i data-lucide="eye"></i></button>
            <div class="strength-meter" id="strengthMeter">
              <div class="strength-bar" id="str1"></div>
              <div class="strength-bar" id="str2"></div>
              <div class="strength-bar" id="str3"></div>
              <div class="strength-bar" id="str4"></div>
            </div>
            <div class="strength-text" id="strengthText"></div>
          </div>

          <div class="form-group password-field">
            <label class="form-label">Konfirmasi Password Baru</label>
            <input type="password" class="form-input" id="confirmPassword" required placeholder="Ulangi password baru">
            <button type="button" class="password-toggle" onclick="togglePwField('confirmPassword', this)"><i data-lucide="eye"></i></button>
          </div>

          <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top:8px;">
            🔐 Ubah Password
          </button>
        </form>
      </div>
    </div>
  `;
}

/** Toggle visibilitas field password */
function togglePwField(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '<i data-lucide="eye-off"></i>';
  } else {
    input.type = 'password';
    btn.textContent = '<i data-lucide="eye"></i>';
  }
}

/** Cek kekuatan password baru */
function checkPasswordStrength() {
  const pw = document.getElementById('newPassword').value;
  let strength = 0;

  if (pw.length >= 6) strength++;
  if (pw.length >= 10) strength++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) strength++;
  if (/[0-9]/.test(pw)) strength++;
  if (/[^A-Za-z0-9]/.test(pw)) strength++;

  // Normalize to 0-4 scale
  strength = Math.min(strength, 4);

  const bars = ['str1', 'str2', 'str3', 'str4'];
  const labels = ['', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
  const classes = ['', 'weak', 'weak', 'medium', 'strong'];

  bars.forEach((id, i) => {
    const bar = document.getElementById(id);
    bar.classList.remove('active', 'weak', 'medium', 'strong');
    if (i < strength) {
      bar.classList.add('active', classes[strength]);
    }
  });

  const textEl = document.getElementById('strengthText');
  textEl.textContent = pw ? labels[strength] : '';
  textEl.className = 'strength-text ' + (pw ? classes[strength] : '');
}

/** Submit ganti password */
function submitGantiPassword(event) {
  event.preventDefault();

  const oldPw = document.getElementById('oldPassword').value;
  const newPw = document.getElementById('newPassword').value;
  const confirmPw = document.getElementById('confirmPassword').value;

  // Cek password lama
  if (oldPw !== currentUser.password) {
    showToast('Password lama tidak sesuai.', 'error');
    return;
  }

  // Cek konfirmasi
  if (newPw !== confirmPw) {
    showToast('Konfirmasi password tidak cocok.', 'error');
    return;
  }

  // Cek panjang minimal
  if (newPw.length < 6) {
    showToast('Password baru minimal 6 karakter.', 'error');
    return;
  }

  // Update di mock data
  const user = MOCK_USERS.find(u => u.id === currentUser.id);
  if (user) user.password = newPw;

  currentUser.password = newPw;
  sessionStorage.setItem('simegUser', JSON.stringify(currentUser));

  showToast('Password berhasil diubah!', 'success');

  // Reset form
  document.getElementById('oldPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  checkPasswordStrength();
}

// ==========================================================================
// INISIALISASI SAAT HALAMAN DIMUAT
// ==========================================================================
document.addEventListener('DOMContentLoaded', initKaryawan);
