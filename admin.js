// ==========================================================================
// admin.js — Logika Portal Admin/HRD SIMPEG
// CRUD pegawai, approval cuti, live search, export PDF, laporan
// ==========================================================================

let adminUser = null;
let adminCurrentPage = 'dashboard';
let currentCutiFilter = 'Semua';
let editingPegawaiId = null;

// ==========================================================================
// INISIALISASI
// ==========================================================================

/** Inisialisasi portal admin saat halaman dimuat */
function initAdmin() {
  adminUser = requireAuth();
  if (!adminUser || adminUser.role !== 'Admin') {
    window.location.href = 'index.html';
    return;
  }

  setupAdminSidebar();
  setupAdminTopbar();
  updateAdminNotifBadge();
  updatePendingBadge();

  // Render dashboard
  adminNavigateTo('dashboard');
}

// ==========================================================================
// SIDEBAR & TOPBAR SETUP
// ==========================================================================

function setupAdminSidebar() {
  const avatarColor = getAvatarColor(adminUser.nama);
  const initials = getInitials(adminUser.nama);

  const avatarEl = document.getElementById('sidebarAvatar');
  if (avatarEl) {
    avatarEl.style.background = avatarColor;
    avatarEl.textContent = initials;
  }

  const nameEl = document.getElementById('sidebarUserName');
  if (nameEl) nameEl.textContent = adminUser.nama;

  const roleEl = document.getElementById('sidebarUserRole');
  if (roleEl) roleEl.textContent = adminUser.jabatan;
}

function setupAdminTopbar() {
  const avatarColor = getAvatarColor(adminUser.nama);
  const initials = getInitials(adminUser.nama);

  const topAvatar = document.getElementById('topbarAvatar');
  if (topAvatar) {
    topAvatar.style.background = avatarColor;
    topAvatar.textContent = initials;
  }
}

// ==========================================================================
// SPA NAVIGATION
// ==========================================================================

function adminNavigateTo(page) {
  adminCurrentPage = page;

  // Update active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update judul topbar
  const titles = {
    'dashboard': 'Dashboard Overview',
    'data-pegawai': 'Data Pegawai',
    'manajemen-absensi': 'Manajemen Absensi',
    'approval-cuti': 'Approval Cuti',
    'pengumuman': 'Pengumuman Internal',
    'laporan': 'Laporan & Statistik',
    'pengaturan': 'Pengaturan Sistem'
  };
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) titleEl.textContent = titles[page] || 'Dashboard';

  // Render konten dengan Skeleton Loading simulasi (400ms)
  const content = document.getElementById('pageContent');
  
  if (typeof renderSkeletonLoader === 'function') {
    content.innerHTML = renderSkeletonLoader();
  }

  setTimeout(() => {
    switch (page) {
      case 'dashboard':
        content.innerHTML = renderAdminDashboard();
        break;
      case 'data-pegawai':
        content.innerHTML = renderDataPegawai();
        initPegawaiSearch();
        break;
      case 'manajemen-absensi':
        content.innerHTML = renderManajemenAbsensi();
        break;
      case 'approval-cuti':
        content.innerHTML = renderApprovalCuti();
        break;
      case 'laporan':
        content.innerHTML = renderLaporan();
        break;
      case 'pengumuman':
        content.innerHTML = renderPengumuman();
        break;
      case 'pengaturan':
        content.innerHTML = renderPengaturan();
        break;
      default:
        content.innerHTML = renderAdminDashboard();
    }
    
    if (window.updateIcons) updateIcons();
  }, 400);

  closeSidebar();

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
// NOTIFIKASI (Admin)
// ==========================================================================

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (panel.classList.contains('hidden')) {
    panel.classList.remove('hidden');
    renderAdminNotifications();
  } else {
    panel.classList.add('hidden');
  }
}

function renderAdminNotifications() {
  const panel = document.getElementById('notifPanel');
  const unread = MOCK_ADMIN_NOTIFICATIONS.filter(n => !n.dibaca);

  panel.innerHTML = `
    <div class="notif-header">
      <h4>Notifikasi</h4>
      <span class="notif-count">${unread.length} belum dibaca</span>
      <button class="notif-mark-read" onclick="markAllAdminRead()">Tandai semua dibaca</button>
    </div>
    <div class="notif-list">
      ${MOCK_ADMIN_NOTIFICATIONS.map(n => `
        <div class="notif-item ${n.dibaca ? 'read' : 'unread'}" onclick="markAdminRead('${n.id}')">
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

function markAdminRead(id) {
  const notif = MOCK_ADMIN_NOTIFICATIONS.find(n => n.id === id);
  if (notif) notif.dibaca = true;
  renderAdminNotifications();
  updateAdminNotifBadge();
}

function markAllAdminRead() {
  MOCK_ADMIN_NOTIFICATIONS.forEach(n => n.dibaca = true);
  renderAdminNotifications();
  updateAdminNotifBadge();
  showToast('Semua notifikasi ditandai dibaca.', 'success');
}

function updateAdminNotifBadge() {
  const count = MOCK_ADMIN_NOTIFICATIONS.filter(n => !n.dibaca).length;
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

/** Update badge pending cuti di sidebar */
function updatePendingBadge() {
  const pendingCount = MOCK_CUTI.filter(c => c.status === 'Pending').length;
  const badge = document.getElementById('pendingCutiBadge');
  if (badge) {
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
}

// ==========================================================================
// 1. DASHBOARD ADMIN
// ==========================================================================

function renderAdminDashboard() {
  const totalPegawai = MOCK_PEGAWAI.length;
  const hadirHariIni = MOCK_PEGAWAI.filter(p => p.status === 'Aktif').length - 1;
  const cutiAktif = MOCK_PEGAWAI.filter(p => p.status === 'Cuti').length;
  const absenHariIni = 1;
  const pendingCuti = MOCK_CUTI.filter(c => c.status === 'Pending').length;

  // Data untuk donut chart divisi
  const divisiCounts = {};
  MOCK_PEGAWAI.forEach(p => {
    divisiCounts[p.divisi] = (divisiCounts[p.divisi] || 0) + 1;
  });
  const divisiColors = ['#1e4d9b', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0d9488'];
  const divisiEntries = Object.entries(divisiCounts);
  let conicGradient = '';
  let cumPercent = 0;
  divisiEntries.forEach(([divisi, count], i) => {
    const percent = (count / totalPegawai) * 100;
    const color = divisiColors[i % divisiColors.length];
    conicGradient += `${color} ${cumPercent}% ${cumPercent + percent}%`;
    if (i < divisiEntries.length - 1) conicGradient += ', ';
    cumPercent += percent;
  });

  return `
    <div class="animate-fadeInUp">
      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card stagger-1">
          <div class="stat-card-header">
            <div class="stat-card-icon blue"><i data-lucide="users"></i></div>
          </div>
          <div class="stat-card-label">Total Pegawai</div>
          <div class="stat-card-value">${totalPegawai}</div>
          <div class="stat-card-sub"><span class="highlight">↑ 2 baru</span> bulan ini</div>
        </div>
        <div class="stat-card stagger-2">
          <div class="stat-card-header">
            <div class="stat-card-icon green"><i data-lucide="check-circle-2"></i></div>
          </div>
          <div class="stat-card-label">Hadir Hari Ini</div>
          <div class="stat-card-value">${hadirHariIni}</div>
          <div class="stat-card-sub">${Math.round(hadirHariIni/totalPegawai*100)}% dari total</div>
        </div>
        <div class="stat-card stagger-3">
          <div class="stat-card-header">
            <div class="stat-card-icon orange"><i data-lucide="hourglass"></i></div>
          </div>
          <div class="stat-card-label">Cuti Aktif</div>
          <div class="stat-card-value">${cutiAktif}</div>
          <div class="stat-card-sub">${Math.round(cutiAktif/totalPegawai*100)}% karyawan</div>
        </div>
        <div class="stat-card stagger-4">
          <div class="stat-card-header">
            <div class="stat-card-icon red"><i data-lucide="x-circle"></i></div>
          </div>
          <div class="stat-card-label">Absen Hari Ini</div>
          <div class="stat-card-value">${absenHariIni}</div>
          <div class="stat-card-sub"><span class="alert">Cek segera</span></div>
        </div>
      </div>

      <!-- Charts -->
      <div class="chart-grid">
        <!-- Bar Chart: Kehadiran 7 hari -->
        <div class="chart-card">
          <div class="chart-title"><i data-lucide="trending-up"></i> Kehadiran Pegawai (7 Hari Terakhir)</div>
          <div class="chart-container">
            ${MOCK_ABSENSI.slice().reverse().map(a => {
              const totalEmployees = totalPegawai;
              let attendees = 0;
              let barClass = 'hadir';
              if (a.status === 'Hadir') { attendees = totalEmployees - 2; }
              else if (a.status === 'Terlambat') { attendees = totalEmployees - 3; barClass = 'terlambat'; }
              else { attendees = totalEmployees - 3; barClass = 'absen'; }
              const height = Math.round((attendees / totalEmployees) * 100);
              return `
                <div class="chart-bar-group">
                  <span class="bar-value">${attendees}</span>
                  <div class="bar ${barClass}" style="height:${height}%"></div>
                  <span class="bar-label">${getNamaHariPendek(a.tanggal)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Donut Chart: Distribusi Divisi -->
        <div class="chart-card">
          <div class="chart-title"><i data-lucide="building"></i> Distribusi Divisi</div>
          <div class="donut-chart-wrapper">
            <div class="donut-chart" style="background:conic-gradient(${conicGradient})">
              <div class="donut-center">
                <div class="donut-center-value">${totalPegawai}</div>
                <div class="donut-center-label">Pegawai</div>
              </div>
            </div>
            <div class="donut-legend">
              ${divisiEntries.map(([divisi, count], i) => `
                <div class="legend-item">
                  <div class="legend-dot" style="background:${divisiColors[i % divisiColors.length]}"></div>
                  <span>${divisi} (${count})</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Aktivitas Terbaru -->
      <div>
        <div class="section-header">
          <span class="section-title"><i data-lucide="clipboard-list"></i> Pengajuan Cuti Terbaru</span>
          <button class="section-link" onclick="adminNavigateTo('approval-cuti')">Lihat semua →</button>
        </div>
        <div class="table-wrapper">
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>Jenis</th>
                  <th>Tanggal</th>
                  <th>Durasi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${MOCK_CUTI.slice(0, 5).map(c => `
                  <tr>
                    <td>
                      <div class="employee-cell">
                        <div class="employee-avatar" style="background:${getAvatarColor(c.namaPegawai)}">${getInitials(c.namaPegawai)}</div>
                        <div>
                          <div class="employee-name">${c.namaPegawai}</div>
                          <div class="employee-nip">${c.nip}</div>
                        </div>
                      </div>
                    </td>
                    <td>${c.jenisCuti}</td>
                    <td>${formatTanggalPendek(c.tanggalMulai)} - ${formatTanggalPendek(c.tanggalSelesai)}</td>
                    <td>${c.jumlahHari} hari</td>
                    <td><span class="badge ${getBadgeClass(c.status)}">${c.status}</span></td>
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

// ==========================================================================
// 2. DATA PEGAWAI (CRUD)
// ==========================================================================

function renderDataPegawai() {
  return `
    <div class="animate-fadeInUp">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrapper">
          <span class="search-icon"><i data-lucide="search"></i></span>
          <input type="text" id="searchPegawai" placeholder="Cari nama, NIP, atau divisi..." oninput="filterPegawai()">
        </div>
        <select class="toolbar-select" id="filterDivisi" onchange="filterPegawai()">
          <option value="">Semua Divisi</option>
          ${getDivisiList().map(d => `<option value="${d}">${d}</option>`).join('')}
        </select>
        <select class="toolbar-select" id="filterStatus" onchange="filterPegawai()">
          <option value="">Semua Status</option>
          <option>Aktif</option>
          <option>Cuti</option>
          <option>Tidak Aktif</option>
        </select>
        <span class="search-count" id="searchCount">${MOCK_PEGAWAI.length} pegawai</span>
        <div class="toolbar-right">
          <button class="btn btn-primary" onclick="openAddPegawaiModal()"><i data-lucide="plus"></i> Tambah Pegawai</button>
          <button class="btn btn-outline" onclick="exportTableToPDF()">📄 Export PDF</button>
        </div>
      </div>

      <!-- Tabel Pegawai -->
      <div class="table-wrapper">
        <div class="table-scroll">
          <table class="data-table" id="tablePegawai">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th class="hide-mobile">Jabatan</th>
                <th class="hide-mobile">Divisi</th>
                <th class="hide-mobile">Tgl Masuk</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="tbodyPegawai">
              ${renderPegawaiRows(MOCK_PEGAWAI)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/** Render baris tabel pegawai */
function renderPegawaiRows(data, keyword = '') {
  if (data.length === 0) {
    return `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="users"></i></div>
            <div class="empty-state-title">Tidak ada pegawai ditemukan</div>
            <div class="empty-state-desc">Coba ubah filter pencarian Anda.</div>
          </div>
        </td>
      </tr>
    `;
  }

  return data.map(p => `
    <tr data-id="${p.id}">
      <td>
        <div class="employee-cell">
          <div class="employee-avatar" style="background:${getAvatarColor(p.nama)}">${getInitials(p.nama)}</div>
          <div>
            <div class="employee-name">${keyword ? highlightText(p.nama, keyword) : p.nama}</div>
            <div class="employee-nip">${keyword ? highlightText(p.nip, keyword) : p.nip}</div>
          </div>
        </div>
      </td>
      <td class="hide-mobile">${keyword ? highlightText(p.jabatan, keyword) : p.jabatan}</td>
      <td class="hide-mobile">${keyword ? highlightText(p.divisi, keyword) : p.divisi}</td>
      <td class="hide-mobile">${formatTanggalPendek(p.tanggalMasuk)}</td>
      <td><span class="badge ${getBadgeClass(p.status)}">${p.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" title="Lihat Detail" onclick="viewPegawaiDetail('${p.id}')"><i data-lucide="eye"></i></button>
          <button class="action-btn edit" title="Edit" onclick="openEditPegawaiModal('${p.id}')"><i data-lucide="edit"></i></button>
          <button class="action-btn delete" title="Hapus" onclick="deletePegawai('${p.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

/** Highlight teks pencarian dalam hasil */
function highlightText(text, keyword) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
}

/** Inisialisasi pencarian pegawai */
function initPegawaiSearch() {
  // Focus pada search field
  const searchField = document.getElementById('searchPegawai');
  if (searchField) searchField.focus();
}

/** Filter dan render ulang tabel pegawai */
function filterPegawai() {
  const keyword = document.getElementById('searchPegawai').value.toLowerCase().trim();
  const divisi = document.getElementById('filterDivisi').value;
  const status = document.getElementById('filterStatus').value;

  const filtered = MOCK_PEGAWAI.filter(p => {
    const matchSearch = !keyword ||
      p.nama.toLowerCase().includes(keyword) ||
      p.nip.toLowerCase().includes(keyword) ||
      p.jabatan.toLowerCase().includes(keyword) ||
      p.divisi.toLowerCase().includes(keyword);
    const matchDivisi = !divisi || p.divisi === divisi;
    const matchStatus = !status || p.status === status;
    return matchSearch && matchDivisi && matchStatus;
  });

  document.getElementById('tbodyPegawai').innerHTML = renderPegawaiRows(filtered, keyword);
  document.getElementById('searchCount').textContent = `${filtered.length} pegawai`;
  if (window.updateIcons) updateIcons();
}

/** Buka modal tambah pegawai baru */
function openAddPegawaiModal() {
  editingPegawaiId = null;
  openPegawaiFormModal('Tambah Pegawai Baru', null);
}

/** Buka modal edit pegawai */
function openEditPegawaiModal(id) {
  editingPegawaiId = id;
  const pegawai = MOCK_PEGAWAI.find(p => p.id === id);
  if (!pegawai) return;
  openPegawaiFormModal('Edit Data Pegawai', pegawai);
}

/** Buka modal form pegawai (tambah / edit) */
function openPegawaiFormModal(title, data) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay modal-wide active';
  overlay.id = 'modalPegawai';

  overlay.innerHTML = `
    <div class="modal-content" style="width:680px;">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="modal-close" onclick="closeModal('modalPegawai')">×</button>
      </div>
      <div class="modal-body">
        <form id="formPegawai" onsubmit="savePegawai(event)">
          <div class="modal-form-grid">
            <div class="form-group">
              <label class="form-label">Nama Lengkap *</label>
              <input type="text" class="form-input" id="pegNama" value="${data?.nama || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">NIP *</label>
              <input type="text" class="form-input" id="pegNip" value="${data?.nip || ''}" required placeholder="NJ-YYYY-XXXX" style="font-family:var(--font-mono)">
            </div>
            <div class="form-group">
              <label class="form-label">Jabatan *</label>
              <input type="text" class="form-input" id="pegJabatan" value="${data?.jabatan || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Divisi *</label>
              <select class="form-input" id="pegDivisi" required>
                <option value="">Pilih Divisi</option>
                ${['Manajemen', 'Human Resources', 'IT & Digital', 'Keuangan', 'Pemasaran', 'Operasional'].map(d =>
                  `<option value="${d}" ${data?.divisi === d ? 'selected' : ''}>${d}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status *</label>
              <select class="form-input" id="pegStatus" required>
                <option value="Aktif" ${data?.status === 'Aktif' ? 'selected' : ''}>Aktif</option>
                <option value="Cuti" ${data?.status === 'Cuti' ? 'selected' : ''}>Cuti</option>
                <option value="Tidak Aktif" ${data?.status === 'Tidak Aktif' ? 'selected' : ''}>Tidak Aktif</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Tanggal Masuk *</label>
              <input type="date" class="form-input" id="pegTanggalMasuk" value="${data?.tanggalMasuk || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input type="email" class="form-input" id="pegEmail" value="${data?.email || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Telepon *</label>
              <input type="tel" class="form-input" id="pegTelepon" value="${data?.telepon || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Pendidikan *</label>
              <input type="text" class="form-input" id="pegPendidikan" value="${data?.pendidikan || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Gaji</label>
              <input type="number" class="form-input" id="pegGaji" value="${data?.gaji || ''}" placeholder="Contoh: 12000000">
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('modalPegawai')">Batal</button>
        <button class="btn btn-primary" onclick="document.getElementById('formPegawai').requestSubmit()">
          <i data-lucide="save"></i> ${data ? 'Simpan Perubahan' : 'Tambah Pegawai'}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Klik overlay untuk tutup
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal('modalPegawai');
  });
  if (window.updateIcons) updateIcons();
}

/** Simpan data pegawai (tambah baru / update) */
function savePegawai(event) {
  event.preventDefault();

  const data = {
    nama: document.getElementById('pegNama').value.trim(),
    nip: document.getElementById('pegNip').value.trim(),
    jabatan: document.getElementById('pegJabatan').value.trim(),
    divisi: document.getElementById('pegDivisi').value,
    status: document.getElementById('pegStatus').value,
    tanggalMasuk: document.getElementById('pegTanggalMasuk').value,
    email: document.getElementById('pegEmail').value.trim(),
    telepon: document.getElementById('pegTelepon').value.trim(),
    pendidikan: document.getElementById('pegPendidikan').value.trim(),
    gaji: parseInt(document.getElementById('pegGaji').value) || 0,
    foto: null
  };

  if (editingPegawaiId) {
    // Update pegawai yang sudah ada
    const index = MOCK_PEGAWAI.findIndex(p => p.id === editingPegawaiId);
    if (index !== -1) {
      MOCK_PEGAWAI[index] = { ...MOCK_PEGAWAI[index], ...data };
      showToast(`Data ${data.nama} berhasil diperbarui.`, 'success');
    }
  } else {
    // Tambah pegawai baru
    const newPegawai = {
      id: generateId('EMP'),
      ...data
    };
    MOCK_PEGAWAI.push(newPegawai);
    showToast(`Pegawai baru ${data.nama} berhasil ditambahkan.`, 'success');
  }

  if (typeof saveMockPegawai === 'function') saveMockPegawai();

  closeModal('modalPegawai');
  adminNavigateTo('data-pegawai');
}

/** Hapus pegawai */
function deletePegawai(id) {
  const pegawai = MOCK_PEGAWAI.find(p => p.id === id);
  if (!pegawai) return;

  showConfirmDialog(
    'Hapus Data Pegawai?',
    `Data pegawai <strong>${pegawai.nama}</strong> (${pegawai.nip}) akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
    'Ya, Hapus',
    'Batal',
    () => {
      // Animasi fade-out baris
      const row = document.querySelector(`tr[data-id="${id}"]`);
      if (row) {
        row.style.transition = 'all 0.4s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';

        setTimeout(() => {
          const index = MOCK_PEGAWAI.findIndex(p => p.id === id);
          if (index !== -1) {
            MOCK_PEGAWAI.splice(index, 1);
            if (typeof saveMockPegawai === 'function') saveMockPegawai();
          }
          filterPegawai();
          showToast(`Data ${pegawai.nama} berhasil dihapus.`, 'success');
        }, 400);
      }
    },
    'danger'
  );
}

/** Lihat detail pegawai */
function viewPegawaiDetail(id) {
  const pegawai = MOCK_PEGAWAI.find(p => p.id === id);
  if (!pegawai) return;

  const cutiPegawai = MOCK_CUTI.filter(c => c.nip === pegawai.nip);

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.id = 'modalDetail';

  overlay.innerHTML = `
    <div class="modal-content" style="width:640px;">
      <div class="modal-header">
        <h3>Detail Pegawai</h3>
        <button class="modal-close" onclick="closeModal('modalDetail')">×</button>
      </div>
      <div class="modal-body">
        <!-- Avatar Section -->
        <div class="detail-avatar-section">
          <div class="detail-avatar-large" style="background:${getAvatarColor(pegawai.nama)}">
            ${getInitials(pegawai.nama)}
          </div>
          <div class="detail-name">${pegawai.nama}</div>
          <div class="detail-jabatan">${pegawai.jabatan} • ${pegawai.divisi}</div>
          <div style="margin-top:8px"><span class="badge ${getBadgeClass(pegawai.status)}">${pegawai.status}</span></div>
        </div>

        <!-- Tabs -->
        <div class="detail-tabs">
          <button class="detail-tab active" onclick="switchDetailTab(this, 'tabInfo')">Informasi Dasar</button>
          <button class="detail-tab" onclick="switchDetailTab(this, 'tabCuti')">Riwayat Cuti (${cutiPegawai.length})</button>
        </div>

        <!-- Tab: Informasi Dasar -->
        <div id="tabInfo">
          <div class="detail-info-grid">
            <div class="detail-field">
              <div class="detail-field-label">NIP</div>
              <div class="detail-field-value" style="font-family:var(--font-mono); color:var(--color-primary-600)">${pegawai.nip}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Tanggal Masuk</div>
              <div class="detail-field-value">${formatTanggal(pegawai.tanggalMasuk)}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Email</div>
              <div class="detail-field-value">${pegawai.email}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Telepon</div>
              <div class="detail-field-value">${pegawai.telepon}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Pendidikan</div>
              <div class="detail-field-value">${pegawai.pendidikan}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Gaji</div>
              <div class="detail-field-value">${pegawai.gaji ? formatRupiah(pegawai.gaji) : '-'}</div>
            </div>
          </div>
        </div>

        <!-- Tab: Riwayat Cuti -->
        <div id="tabCuti" class="hidden">
          ${cutiPegawai.length === 0 ? `
            <div class="empty-state" style="padding:24px;">
              <div class="empty-state-icon"><i data-lucide="umbrella"></i></div>
              <div class="empty-state-desc">Belum ada riwayat cuti</div>
            </div>
          ` : `
            <table class="data-table" style="font-size:13px;">
              <thead>
                <tr>
                  <th>Jenis</th>
                  <th>Tanggal</th>
                  <th>Durasi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${cutiPegawai.map(c => `
                  <tr>
                    <td>${c.jenisCuti}</td>
                    <td>${formatTanggalPendek(c.tanggalMulai)} - ${formatTanggalPendek(c.tanggalSelesai)}</td>
                    <td>${c.jumlahHari} hari</td>
                    <td><span class="badge ${getBadgeClass(c.status)}">${c.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('modalDetail')">Tutup</button>
        <button class="btn btn-primary" onclick="closeModal('modalDetail'); openEditPegawaiModal('${id}')"><i data-lucide="edit"></i> Edit Data</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal('modalDetail');
  });
  if (window.updateIcons) updateIcons();
}

/** Switch tab di modal detail */
function switchDetailTab(btn, tabId) {
  // Update active tab button
  btn.parentElement.querySelectorAll('.detail-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide tab content
  ['tabInfo', 'tabCuti'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', id !== tabId);
  });
}

/** Tutup modal berdasarkan ID */
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// ==========================================================================
// 3. MANAJEMEN ABSENSI
// ==========================================================================

function renderManajemenAbsensi() {
  return `
    <div class="animate-fadeInUp">
      <div class="card-static" style="padding:24px;">
        <h3 style="font-family:var(--font-heading); font-size:18px; font-weight:700; margin-bottom:20px; color:var(--color-text-primary);">
          <i data-lucide="calendar"></i> Rekap Absensi Seluruh Pegawai
        </h3>
        <p style="font-size:14px; color:var(--color-text-secondary); margin-bottom:20px;">
          Data absensi hari ini (${getTodayFormatted()})
        </p>
        <div class="table-wrapper" style="box-shadow:none; border:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>Divisi</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${MOCK_PEGAWAI.filter(p => p.status !== 'Tidak Aktif').map((p, i) => {
                const statuses = ['Hadir', 'Hadir', 'Hadir', 'Cuti', 'Hadir', 'Hadir', 'Terlambat'];
                const checkIns = ['07:55', '08:02', '07:48', '-', '07:59', '08:10', '09:15'];
                const checkOuts = ['17:00', '17:05', '17:30', '-', '17:02', '17:00', '17:00'];
                let st = p.status === 'Cuti' ? 'Cuti' : statuses[i % statuses.length];
                let checkIn = st === 'Cuti' ? '-' : checkIns[i % checkIns.length];
                let checkOut = st === 'Cuti' ? '-' : checkOuts[i % checkOuts.length];

                // Override dengan data live dari localStorage
                const todayStr = new Date().toISOString().split('T')[0];
                const savedDate = localStorage.getItem('absensi_date_' + p.nip);
                if (savedDate === todayStr) {
                  const savedIn = localStorage.getItem('absensi_checkin_' + p.nip);
                  const savedOut = localStorage.getItem('absensi_checkout_' + p.nip);
                  if (savedIn) {
                    checkIn = savedIn;
                    checkOut = savedOut || '-';
                    // Hitung status sederhana: jika lewat jam 8 maka terlambat
                    const isLate = parseInt(checkIn.split(':')[0]) >= 8 && parseInt(checkIn.split(':')[1]) > 0;
                    st = isLate ? 'Terlambat' : 'Hadir';
                  }
                }

                return `
                  <tr>
                    <td>
                      <div class="employee-cell">
                        <div class="employee-avatar" style="background:${getAvatarColor(p.nama)}">${getInitials(p.nama)}</div>
                        <div>
                          <div class="employee-name">${p.nama}</div>
                          <div class="employee-nip">${p.nip}</div>
                        </div>
                      </div>
                    </td>
                    <td>${p.divisi}</td>
                    <td style="font-family:var(--font-mono); font-size:13px">${checkIn}</td>
                    <td style="font-family:var(--font-mono); font-size:13px">${checkOut}</td>
                    <td><span class="badge ${getBadgeClass(st)}">${st}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 4. APPROVAL CUTI
// ==========================================================================

function renderApprovalCuti() {
  const pendingCount = MOCK_CUTI.filter(c => c.status === 'Pending').length;
  const approvedCount = MOCK_CUTI.filter(c => c.status === 'Disetujui').length;
  const rejectedCount = MOCK_CUTI.filter(c => c.status === 'Ditolak').length;

  return `
    <div class="animate-fadeInUp">
      <!-- Header -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
        <div>
          <h2 style="font-family:var(--font-heading); font-size:20px; font-weight:700; color:var(--color-text-primary);">
            Permohonan Cuti Masuk
          </h2>
        </div>
        ${pendingCount > 0 ? `
          <span class="badge badge-warning" style="font-size:14px; padding:8px 16px;">
            <i data-lucide="circle-dot"></i> ${pendingCount} Menunggu Persetujuan
          </span>
        ` : ''}
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button class="filter-tab ${currentCutiFilter === 'Semua' ? 'active' : ''}" onclick="filterCuti('Semua')">
          Semua <span class="tab-count">${MOCK_CUTI.length}</span>
        </button>
        <button class="filter-tab ${currentCutiFilter === 'Pending' ? 'active' : ''}" onclick="filterCuti('Pending')">
          Pending <span class="tab-count">${pendingCount}</span>
        </button>
        <button class="filter-tab ${currentCutiFilter === 'Disetujui' ? 'active' : ''}" onclick="filterCuti('Disetujui')">
          Disetujui <span class="tab-count">${approvedCount}</span>
        </button>
        <button class="filter-tab ${currentCutiFilter === 'Ditolak' ? 'active' : ''}" onclick="filterCuti('Ditolak')">
          Ditolak <span class="tab-count">${rejectedCount}</span>
        </button>
      </div>

      <!-- Tabel Cuti -->
      <div class="table-wrapper">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Pegawai</th>
                <th>Jenis Cuti</th>
                <th class="hide-mobile">Tanggal</th>
                <th>Durasi</th>
                <th class="hide-mobile">Alasan</th>
                <th class="hide-mobile">Diajukan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="tbodyCuti">
              ${renderCutiRows()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/** Render baris tabel cuti berdasarkan filter */
function renderCutiRows() {
  const filtered = currentCutiFilter === 'Semua'
    ? MOCK_CUTI
    : MOCK_CUTI.filter(c => c.status === currentCutiFilter);

  if (filtered.length === 0) {
    return `
      <tr>
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="umbrella"></i></div>
            <div class="empty-state-title">Tidak ada permohonan cuti</div>
            <div class="empty-state-desc">Belum ada permohonan cuti dengan status "${currentCutiFilter}".</div>
          </div>
        </td>
      </tr>
    `;
  }

  return filtered.map(c => `
    <tr data-id="${c.id}">
      <td>
        <div class="employee-cell">
          <div class="employee-avatar" style="background:${getAvatarColor(c.namaPegawai)}">${getInitials(c.namaPegawai)}</div>
          <div>
            <div class="employee-name">${c.namaPegawai}</div>
            <div class="employee-nip">${c.nip}</div>
          </div>
        </div>
      </td>
      <td>${c.jenisCuti}</td>
      <td class="hide-mobile">${formatTanggalPendek(c.tanggalMulai)} - ${formatTanggalPendek(c.tanggalSelesai)}</td>
      <td>${c.jumlahHari} hari</td>
      <td class="hide-mobile" style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${c.alasan}</td>
      <td class="hide-mobile">${formatTanggalPendek(c.tanggalPengajuan)}</td>
      <td><span class="badge ${getBadgeClass(c.status)}">${c.status}</span></td>
      <td>
        ${c.status === 'Pending' ? `
          <div class="approval-btns">
            <button class="btn-approve" onclick="approveCuti('${c.id}')"><i data-lucide="check-circle-2"></i> Setujui</button>
            <button class="btn-reject" onclick="rejectCuti('${c.id}')"><i data-lucide="x-circle"></i> Tolak</button>
          </div>
        ` : `<span style="font-size:12px; color:var(--color-text-muted);">—</span>`}
      </td>
    </tr>
  `).join('');
}

/** Filter cuti berdasarkan tab */
function filterCuti(status) {
  currentCutiFilter = status;
  adminNavigateTo('approval-cuti');
}

/** Setujui permohonan cuti */
function approveCuti(id) {
  showConfirmDialog(
    'Setujui Permohonan Cuti?',
    'Permohonan cuti ini akan disetujui dan karyawan akan diberitahu.',
    'Setujui',
    'Batal',
    () => {
      const cuti = MOCK_CUTI.find(c => c.id === id);
      if (cuti) cuti.status = 'Disetujui';
      if (typeof saveMockCuti === 'function') saveMockCuti();

      // Animasi fade-out baris
      const row = document.querySelector(`tr[data-id="${id}"]`);
      if (row) {
        row.style.transition = 'all 0.4s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';

        setTimeout(() => {
          showToast('<i data-lucide="check-circle-2"></i> Cuti disetujui. Notifikasi telah dikirim ke karyawan.', 'success');
          updatePendingBadge();
          adminNavigateTo('approval-cuti');
        }, 400);
      }
    },
    'success'
  );
}

/** Tolak permohonan cuti */
function rejectCuti(id) {
  showRejectDialog(id, (alasan) => {
    const cuti = MOCK_CUTI.find(c => c.id === id);
    if (cuti) {
      cuti.status = 'Ditolak';
      cuti.alasanTolak = alasan;
    }
    if (typeof saveMockCuti === 'function') saveMockCuti();

    // Animasi fade-out baris
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (row) {
      row.style.transition = 'all 0.4s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(-20px)';

      setTimeout(() => {
        showToast('Permohonan cuti ditolak.', 'warning');
        updatePendingBadge();
        adminNavigateTo('approval-cuti');
      }, 400);
    }
  });
}

// ==========================================================================
// 5. LAPORAN & STATISTIK
// ==========================================================================

function renderLaporan() {
  const aktifCount = MOCK_PEGAWAI.filter(p => p.status === 'Aktif').length;
  const cutiCount = MOCK_PEGAWAI.filter(p => p.status === 'Cuti').length;
  const tidakAktifCount = MOCK_PEGAWAI.filter(p => p.status === 'Tidak Aktif').length;

  return `
    <div class="animate-fadeInUp">
      <h2 style="font-family:var(--font-heading); font-size:20px; font-weight:700; margin-bottom:24px; color:var(--color-text-primary);">
        <i data-lucide="trending-up"></i> Laporan & Statistik Kepegawaian
      </h2>

      <!-- Ringkasan Status Pegawai -->
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr); margin-bottom:24px;">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-card-icon green"><i data-lucide="check-circle-2"></i></div>
          </div>
          <div class="stat-card-label">Pegawai Aktif</div>
          <div class="stat-card-value">${aktifCount}</div>
          <div class="stat-card-sub">${Math.round(aktifCount/MOCK_PEGAWAI.length*100)}% dari total</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-card-icon orange"><i data-lucide="umbrella"></i></div>
          </div>
          <div class="stat-card-label">Sedang Cuti</div>
          <div class="stat-card-value">${cutiCount}</div>
          <div class="stat-card-sub">${Math.round(cutiCount/MOCK_PEGAWAI.length*100)}% dari total</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-card-icon red">⛔</div>
          </div>
          <div class="stat-card-label">Tidak Aktif</div>
          <div class="stat-card-value">${tidakAktifCount}</div>
          <div class="stat-card-sub">${Math.round(tidakAktifCount/MOCK_PEGAWAI.length*100)}% dari total</div>
        </div>
      </div>

      <!-- Tabel Ringkasan per Divisi -->
      <div class="card-static" style="padding:24px; margin-bottom:24px;">
        <h3 style="font-family:var(--font-heading); font-size:16px; font-weight:700; margin-bottom:16px; color:var(--color-text-primary);">
          <i data-lucide="layout-dashboard"></i> Distribusi Pegawai per Divisi
        </h3>
        <div class="table-wrapper" style="box-shadow:none; border:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Divisi</th>
                <th>Jumlah</th>
                <th>Aktif</th>
                <th>Cuti</th>
                <th>Tidak Aktif</th>
                <th>Rata-rata Gaji</th>
              </tr>
            </thead>
            <tbody>
              ${getDivisiList().map(divisi => {
                const divPeg = MOCK_PEGAWAI.filter(p => p.divisi === divisi);
                const divAktif = divPeg.filter(p => p.status === 'Aktif').length;
                const divCuti = divPeg.filter(p => p.status === 'Cuti').length;
                const divNA = divPeg.filter(p => p.status === 'Tidak Aktif').length;
                const avgGaji = divPeg.reduce((sum, p) => sum + (p.gaji || 0), 0) / divPeg.length;
                return `
                  <tr>
                    <td style="font-weight:600">${divisi}</td>
                    <td>${divPeg.length}</td>
                    <td><span class="badge badge-aktif">${divAktif}</span></td>
                    <td><span class="badge badge-cuti">${divCuti}</span></td>
                    <td><span class="badge badge-tidak-aktif">${divNA}</span></td>
                    <td style="font-family:var(--font-mono); font-size:13px">${formatRupiah(Math.round(avgGaji))}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Export Button -->
      <div style="text-align:center;">
        <button class="btn btn-primary btn-lg" onclick="exportTableToPDF()" style="gap:8px;">
          📄 Export Laporan ke PDF
        </button>
      </div>
    </div>
  `;
}

// ==========================================================================
// 6. PENGATURAN SISTEM
// ==========================================================================

function renderPengaturan() {
  const currentTheme = localStorage.getItem('simegTheme') || 'light';

  return `
    <div class="animate-fadeInUp settings-wrapper">
      <div class="settings-header" style="margin-bottom: 32px;">
        <h2 style="font-family:var(--font-heading); font-size:24px; font-weight:800; color:var(--color-text-primary); display:flex; align-items:center; gap:10px;">
          <div style="padding:10px; background:rgba(59, 130, 246, 0.1); border-radius:12px; color:var(--color-primary-500);">
            <i data-lucide="settings" style="width:24px; height:24px;"></i>
          </div>
          Pengaturan Sistem
        </h2>
        <p style="color:var(--color-text-secondary); margin-top:8px; font-size:15px;">Kelola preferensi antarmuka, keamanan, dan informasi teknis.</p>
      </div>

      <div class="settings-layout">
        <!-- Settings Sidebar / Tabs -->
        <div class="settings-tabs card-static">
          <button class="settings-tab active" onclick="switchSettingsTab('tampilan', this)">
            <i data-lucide="palette"></i> Tampilan
          </button>
          <button class="settings-tab" onclick="switchSettingsTab('keamanan', this)">
            <i data-lucide="shield-check"></i> Keamanan
          </button>
          <button class="settings-tab" onclick="switchSettingsTab('sistem', this)">
            <i data-lucide="server"></i> Info Sistem
          </button>
        </div>

        <!-- Settings Content Area -->
        <div class="settings-content">
          
          <!-- Tab: Tampilan -->
          <div id="tab-tampilan" class="settings-pane active card-static">
            <h3 class="pane-title">Tampilan & Tema</h3>
            <p class="pane-desc">Sesuaikan antarmuka sesuai kenyamanan visual Anda saat bekerja.</p>
            
            <div class="settings-row">
              <div class="settings-label">
                <h4>Mode Tema</h4>
                <p>Aktifkan tampilan gelap untuk mengurangi silau pada mata</p>
              </div>
              <button class="btn btn-outline" onclick="toggleTheme(); adminNavigateTo('pengaturan')">
                ${currentTheme === 'dark' ? '<i data-lucide="sun"></i> Mode Terang Aktif' : '<i data-lucide="moon"></i> Mode Gelap Aktif'}
              </button>
            </div>
          </div>

          <!-- Tab: Keamanan -->
          <div id="tab-keamanan" class="settings-pane card-static" style="display: none;">
            <h3 class="pane-title">Keamanan Akun</h3>
            <p class="pane-desc">Kelola sesi login dan akses kredensial admin Anda.</p>
            
            <div class="settings-row">
              <div class="settings-label">
                <h4>Session Login</h4>
                <p>Keluar dari sesi perangkat ini dengan aman.</p>
              </div>
              <button class="btn btn-danger" style="background:#ef4444; color:white; border:none; padding:10px 16px; border-radius:8px; display:flex; gap:8px; font-weight:600; cursor:pointer;" onclick="handleLogout()">
                <i data-lucide="log-out"></i> Logout
              </button>
            </div>
          </div>

          <!-- Tab: Info Sistem -->
          <div id="tab-sistem" class="settings-pane card-static" style="display: none;">
            <h3 class="pane-title">Informasi Sistem</h3>
            <p class="pane-desc">Detail teknis versi aplikasi dan database yang digunakan.</p>
            
            <div class="settings-row">
              <div class="settings-label">
                <h4>Versi Aplikasi</h4>
                <p>SIMPEG PT Nusantara Jaya Enterprise</p>
              </div>
              <span class="badge" style="background:rgba(59, 130, 246, 0.1); color:var(--color-primary-500); padding:6px 12px; border-radius:99px; font-weight:700; font-family:var(--font-mono);">v2.0.0</span>
            </div>
            <div class="settings-row">
              <div class="settings-label">
                <h4>Database Engine</h4>
                <p>Koneksi penyimpanan data pegawai</p>
              </div>
              <span class="badge" style="background:rgba(16, 185, 129, 0.1); color:#10b981; padding:6px 12px; border-radius:99px; font-weight:700;">Mock Data (Frontend)</span>
            </div>
            <div class="settings-row" style="border-bottom:none;">
              <div class="settings-label">
                <h4>Statistik Kapasitas</h4>
                <p>Jumlah data pegawai yang dikelola saat ini</p>
              </div>
              <span style="font-family:var(--font-heading); font-size:18px; font-weight:800; color:var(--color-text-primary);">${MOCK_PEGAWAI.length} Pegawai</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}// ==========================================================================
// PENGUMUMAN INTERNAL
// ==========================================================================

function renderPengumuman() {
  return `
    <div class="animate-fadeInUp">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="font-family:var(--font-heading); font-size:20px; font-weight:700; color:var(--color-text-primary);">
          Pengumuman Internal
        </h2>
        <button class="btn btn-primary" onclick="openPengumumanModal()">
          <i data-lucide="plus"></i> Buat Pengumuman
        </button>
      </div>

      <div class="card-static" style="padding:20px;">
        <div class="table-wrapper" style="box-shadow:none; border:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:15%">Tanggal</th>
                <th style="width:25%">Judul</th>
                <th style="width:45%">Isi Pengumuman</th>
                <th style="width:15%; text-align:right;">Aksi</th>
              </tr>
            </thead>
            <tbody id="tbodyPengumuman">
              ${renderPengumumanRows()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderPengumumanRows() {
  if (MOCK_PENGUMUMAN.length === 0) {
    return `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="megaphone"></i></div>
            <div class="empty-state-title">Belum ada pengumuman</div>
          </div>
        </td>
      </tr>
    `;
  }
  return MOCK_PENGUMUMAN.map(p => `
    <tr>
      <td style="font-family:var(--font-mono); font-size:13px">${formatTanggalPendek(p.tanggal)}</td>
      <td style="font-weight:600">${p.judul}</td>
      <td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.isi}</td>
      <td style="text-align:right;">
        <div class="action-buttons" style="justify-content:flex-end;">
          <button class="btn-icon text-primary" onclick="openPengumumanModal('${p.id}')"><i data-lucide="edit-2"></i></button>
          <button class="btn-icon text-danger" onclick="deletePengumuman('${p.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openPengumumanModal(id = null) {
  let data = null;
  if (id) {
    data = MOCK_PENGUMUMAN.find(p => p.id === id);
    if (!data) return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay modal-wide active';
  overlay.id = 'modalPengumuman';

  overlay.innerHTML = `
    <div class="modal-content" style="width:500px;">
      <div class="modal-header">
        <h3>${data ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}</h3>
        <button class="modal-close" onclick="closeModal('modalPengumuman')">×</button>
      </div>
      <div class="modal-body">
        <form id="formPengumuman" onsubmit="savePengumuman(event, '${id || ''}')">
          <div class="form-group">
            <label class="form-label">Judul Pengumuman</label>
            <input type="text" class="form-input" id="pengJudul" value="${data ? data.judul : ''}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Isi Pengumuman</label>
            <textarea class="form-input" id="pengIsi" rows="4" required>${data ? data.isi : ''}</textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="closeModal('modalPengumuman')">Batal</button>
        <button class="btn btn-primary" onclick="document.getElementById('formPengumuman').requestSubmit()">
          <i data-lucide="save"></i> Simpan
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal('modalPengumuman');
  });
  if (window.updateIcons) updateIcons();
}

function savePengumuman(event, id) {
  event.preventDefault();
  const judul = document.getElementById('pengJudul').value.trim();
  const isi = document.getElementById('pengIsi').value.trim();
  
  if (id) {
    const p = MOCK_PENGUMUMAN.find(p => p.id === id);
    if (p) {
      p.judul = judul;
      p.isi = isi;
      showToast('Pengumuman berhasil diperbarui.', 'success');
    }
  } else {
    MOCK_PENGUMUMAN.unshift({
      id: generateId('P'),
      judul,
      isi,
      tanggal: new Date().toISOString().split('T')[0]
    });
    showToast('Pengumuman baru berhasil dipublikasikan.', 'success');
  }

  if (typeof saveMockPengumuman === 'function') saveMockPengumuman();
  closeModal('modalPengumuman');
  adminNavigateTo('pengumuman');
}

function deletePengumuman(id) {
  showConfirmDialog(
    'Hapus Pengumuman?',
    'Pengumuman ini akan dihapus secara permanen dan tidak lagi tampil di dashboard karyawan.',
    'Ya, Hapus',
    'Batal',
    () => {
      const index = MOCK_PENGUMUMAN.findIndex(p => p.id === id);
      if (index !== -1) {
        MOCK_PENGUMUMAN.splice(index, 1);
        if (typeof saveMockPengumuman === 'function') saveMockPengumuman();
        adminNavigateTo('pengumuman');
        showToast('Pengumuman berhasil dihapus.', 'success');
      }
    },
    'danger'
  );
}


function switchSettingsTab(tabId, btnElement) {
  // Hide all panes
  document.querySelectorAll('.settings-pane').forEach(pane => {
    pane.style.display = 'none';
    pane.classList.remove('active');
  });
  // Remove active class from all tabs
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Show target pane
  const targetPane = document.getElementById('tab-' + tabId);
  if (targetPane) {
    targetPane.style.display = 'block';
    // Small timeout to allow display:block to apply before animating opacity if we added css animations
    setTimeout(() => targetPane.classList.add('active'), 10);
  }

  // Set active class on clicked button
  if (btnElement) {
    btnElement.classList.add('active');
  }

  if (window.updateIcons) updateIcons();
}

// ==========================================================================
// EXPORT PDF
// ==========================================================================

/** Export tabel pegawai sebagai halaman cetak PDF */
function exportTableToPDF() {
  showToast('Menyiapkan dokumen PDF...', 'info');

  setTimeout(() => {
    const printContent = `
      <html>
      <head>
        <title>Direktori Pegawai — PT Nusantara Jaya</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 11px; color: #333; padding: 20px; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 3px solid #1e4d9b; padding-bottom: 12px; }
          .header h2 { color: #1e4d9b; margin: 0 0 4px; font-size: 20px; }
          .header p { color: #666; margin: 0; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { background: #1e4d9b; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
          td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
          tr:nth-child(even) { background: #f8fafc; }
          .status-aktif { color: #16a34a; font-weight: bold; }
          .status-cuti { color: #1e4d9b; font-weight: bold; }
          .status-tidak-aktif { color: #dc2626; font-weight: bold; }
          .footer { margin-top: 24px; font-size: 9px; color: #94a3b8; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>PT Nusantara Jaya</h2>
          <p>Direktori Data Pegawai — Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>NIP</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Divisi</th>
              <th>Status</th>
              <th>Tgl Masuk</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK_PEGAWAI.map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td style="font-family:monospace">${p.nip}</td>
                <td>${p.nama}</td>
                <td>${p.jabatan}</td>
                <td>${p.divisi}</td>
                <td class="status-${p.status.toLowerCase().replace(' ', '-')}">${p.status}</td>
                <td>${formatTanggalPendek(p.tanggalMasuk)}</td>
                <td>${p.email}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Dokumen ini dicetak dari SIMPEG PT Nusantara Jaya. Bersifat rahasia.
          Total pegawai: ${MOCK_PEGAWAI.length}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }, 500);
}

// ==========================================================================
// INISIALISASI SAAT HALAMAN DIMUAT
// ==========================================================================
document.addEventListener('DOMContentLoaded', initAdmin);
