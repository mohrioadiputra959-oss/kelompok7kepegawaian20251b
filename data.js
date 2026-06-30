// ==========================================================================
// data.js — Centralized Mock Data PT Nusantara Jaya SIMPEG
// Harus diload pertama di semua halaman sebelum script lain.
// Berisi: users, pegawai, absensi, cuti, notifikasi, jatah cuti, dan utilitas.
// ==========================================================================

// =========== MOCK USERS (Untuk Login) ===========
const MOCK_USERS = [
  {
    id: 'USR001', username: 'admin', password: 'admin123',
    role: 'Admin', nama: 'Siti Rahayu', jabatan: 'HRD Manager',
    divisi: 'Human Resources', foto: null, nip: 'NJ-2016-0002'
  },
  {
    id: 'USR002', username: 'budi.santoso', password: '123456',
    role: 'Karyawan', nama: 'Budi Santoso', jabatan: 'Software Engineer',
    divisi: 'IT & Digital', foto: null, nip: 'NJ-2021-0042'
  },
  {
    id: 'USR003', username: 'dewi.kusuma', password: '123456',
    role: 'Karyawan', nama: 'Dewi Kusuma', jabatan: 'Finance Manager',
    divisi: 'Keuangan', foto: null, nip: 'NJ-2020-0015'
  },
  {
    id: 'USR004', username: 'rizky.pratama', password: '123456',
    role: 'Karyawan', nama: 'Rizky Pratama', jabatan: 'UI/UX Designer',
    divisi: 'IT & Digital', foto: null, nip: 'NJ-2022-0088'
  }
];

// =========== MOCK PEGAWAI (Data Kepegawaian) ===========
let MOCK_PEGAWAI = [
  {
    id: 'EMP001', nip: 'NJ-2019-0001',
    nama: 'Ahmad Fauzi', jabatan: 'General Manager',
    divisi: 'Manajemen', status: 'Aktif',
    tanggalMasuk: '2019-03-01', email: 'ahmad.fauzi@nusantarajaya.co.id',
    telepon: '0812-3456-7890', gaji: 25000000,
    pendidikan: 'S2 Manajemen Bisnis', foto: null
  },
  {
    id: 'EMP002', nip: 'NJ-2020-0015',
    nama: 'Dewi Kusuma', jabatan: 'Finance Manager',
    divisi: 'Keuangan', status: 'Aktif',
    tanggalMasuk: '2020-06-15', email: 'dewi.kusuma@nusantarajaya.co.id',
    telepon: '0813-9876-5432', gaji: 18000000,
    pendidikan: 'S1 Akuntansi', foto: null
  },
  {
    id: 'EMP003', nip: 'NJ-2021-0042',
    nama: 'Budi Santoso', jabatan: 'Software Engineer',
    divisi: 'IT & Digital', status: 'Aktif',
    tanggalMasuk: '2021-01-10', email: 'budi.santoso@nusantarajaya.co.id',
    telepon: '0857-1122-3344', gaji: 12000000,
    pendidikan: 'S1 Teknik Informatika', foto: null
  },
  {
    id: 'EMP004', nip: 'NJ-2018-0007',
    nama: 'Ratna Sari', jabatan: 'Marketing Specialist',
    divisi: 'Pemasaran', status: 'Cuti',
    tanggalMasuk: '2018-08-20', email: 'ratna.sari@nusantarajaya.co.id',
    telepon: '0821-5566-7788', gaji: 10000000,
    pendidikan: 'S1 Komunikasi', foto: null
  },
  {
    id: 'EMP005', nip: 'NJ-2022-0088',
    nama: 'Rizky Pratama', jabatan: 'UI/UX Designer',
    divisi: 'IT & Digital', status: 'Aktif',
    tanggalMasuk: '2022-03-14', email: 'rizky.pratama@nusantarajaya.co.id',
    telepon: '0838-2233-4455', gaji: 11000000,
    pendidikan: 'S1 Desain Grafis', foto: null
  },
  {
    id: 'EMP006', nip: 'NJ-2017-0003',
    nama: 'Hendra Wijaya', jabatan: 'Operations Director',
    divisi: 'Operasional', status: 'Aktif',
    tanggalMasuk: '2017-11-05', email: 'hendra.wijaya@nusantarajaya.co.id',
    telepon: '0811-9988-7766', gaji: 22000000,
    pendidikan: 'S2 Teknik Industri', foto: null
  },
  {
    id: 'EMP007', nip: 'NJ-2023-0101',
    nama: 'Nurul Hidayah', jabatan: 'HR Specialist',
    divisi: 'Human Resources', status: 'Aktif',
    tanggalMasuk: '2023-01-02', email: 'nurul.hidayah@nusantarajaya.co.id',
    telepon: '0856-3344-5566', gaji: 8500000,
    pendidikan: 'S1 Psikologi', foto: null
  },
  {
    id: 'EMP008', nip: 'NJ-2020-0033',
    nama: 'Fajar Ramadhan', jabatan: 'Accountant',
    divisi: 'Keuangan', status: 'Tidak Aktif',
    tanggalMasuk: '2020-09-01', email: 'fajar.ramadhan@nusantarajaya.co.id',
    telepon: '0812-6677-8899', gaji: 9000000,
    pendidikan: 'S1 Akuntansi', foto: null
  }
];

const savedGlobalPegawai = localStorage.getItem('global_mock_pegawai');
if (savedGlobalPegawai) {
  try {
    MOCK_PEGAWAI = JSON.parse(savedGlobalPegawai);
  } catch (e) {
    console.error('Gagal parsing data pegawai dari localStorage', e);
  }
}

function saveMockPegawai() {
  localStorage.setItem('global_mock_pegawai', JSON.stringify(MOCK_PEGAWAI));
}

// =========== MOCK ABSENSI (7 hari terakhir untuk user yang login) ===========
const MOCK_ABSENSI = [
  { tanggal: '2025-07-07', checkIn: '07:58', checkOut: '17:02', status: 'Hadir' },
  { tanggal: '2025-07-06', checkIn: '08:15', checkOut: '17:00', status: 'Hadir' },
  { tanggal: '2025-07-05', checkIn: null, checkOut: null, status: 'Absen' },
  { tanggal: '2025-07-04', checkIn: '07:45', checkOut: '17:30', status: 'Hadir' },
  { tanggal: '2025-07-03', checkIn: '09:10', checkOut: '17:00', status: 'Terlambat' },
  { tanggal: '2025-07-02', checkIn: '07:55', checkOut: '17:05', status: 'Hadir' },
  { tanggal: '2025-07-01', checkIn: '08:00', checkOut: '17:00', status: 'Hadir' },
];

// =========== MOCK CUTI (Pengajuan cuti semua pegawai) ===========
let MOCK_CUTI = [
  {
    id: 'LV001', nip: 'NJ-2021-0042', namaPegawai: 'Budi Santoso',
    jenisCuti: 'Cuti Tahunan', tanggalMulai: '2025-07-15', tanggalSelesai: '2025-07-19',
    jumlahHari: 5, alasan: 'Liburan keluarga ke Yogyakarta', status: 'Pending',
    tanggalPengajuan: '2025-07-07'
  },
  {
    id: 'LV002', nip: 'NJ-2022-0088', namaPegawai: 'Rizky Pratama',
    jenisCuti: 'Cuti Sakit', tanggalMulai: '2025-07-08', tanggalSelesai: '2025-07-09',
    jumlahHari: 2, alasan: 'Demam dan perlu istirahat', status: 'Pending',
    tanggalPengajuan: '2025-07-07'
  },
  {
    id: 'LV003', nip: 'NJ-2020-0015', namaPegawai: 'Dewi Kusuma',
    jenisCuti: 'Cuti Tahunan', tanggalMulai: '2025-06-23', tanggalSelesai: '2025-06-27',
    jumlahHari: 5, alasan: 'Keperluan pribadi', status: 'Disetujui',
    tanggalPengajuan: '2025-06-15'
  },
  {
    id: 'LV004', nip: 'NJ-2019-0001', namaPegawai: 'Ahmad Fauzi',
    jenisCuti: 'Cuti Khusus', tanggalMulai: '2025-05-12', tanggalSelesai: '2025-05-14',
    jumlahHari: 3, alasan: 'Pernikahan adik', status: 'Disetujui',
    tanggalPengajuan: '2025-05-05'
  },
  {
    id: 'LV005', nip: 'NJ-2018-0007', namaPegawai: 'Ratna Sari',
    jenisCuti: 'Cuti Melahirkan', tanggalMulai: '2025-07-01', tanggalSelesai: '2025-09-28',
    jumlahHari: 90, alasan: 'Cuti melahirkan anak pertama', status: 'Disetujui',
    tanggalPengajuan: '2025-06-20'
  }
];

const savedGlobalCuti = localStorage.getItem('global_mock_cuti');
if (savedGlobalCuti) {
  try {
    MOCK_CUTI = JSON.parse(savedGlobalCuti);
  } catch (e) {
    console.error('Gagal parsing data cuti dari localStorage', e);
  }
}

function saveMockCuti() {
  localStorage.setItem('global_mock_cuti', JSON.stringify(MOCK_CUTI));
}

// =========== MOCK NOTIFIKASI ===========
const MOCK_NOTIFICATIONS = [
  { id: 'N001', type: 'success', pesan: 'Pengajuan cuti Anda telah disetujui oleh HRD.', waktu: '2 jam lalu', dibaca: false },
  { id: 'N002', type: 'info', pesan: 'Jangan lupa lakukan check-in hari ini sebelum pukul 08:00.', waktu: '5 jam lalu', dibaca: false },
  { id: 'N003', type: 'warning', pesan: 'Sisa jatah cuti Anda tinggal 3 hari untuk tahun ini.', waktu: '1 hari lalu', dibaca: true },
  { id: 'N004', type: 'info', pesan: 'Rapat bulanan divisi IT dijadwalkan hari Jumat pukul 10:00.', waktu: '2 hari lalu', dibaca: true },
];

// =========== MOCK PENGUMUMAN (Pengumuman Internal) ===========
let MOCK_PENGUMUMAN = [
  {
    id: 'P001',
    judul: 'Libur Nasional & Cuti Bersama',
    isi: 'Diberitahukan kepada seluruh karyawan bahwa perusahaan akan meliburkan operasional pada tanggal 17 Juni 2026 terkait cuti bersama.',
    tanggal: '2026-06-15'
  }
];

const savedGlobalPengumuman = localStorage.getItem('global_mock_pengumuman');
if (savedGlobalPengumuman) {
  try {
    MOCK_PENGUMUMAN = JSON.parse(savedGlobalPengumuman);
  } catch (e) {}
}

function saveMockPengumuman() {
  localStorage.setItem('global_mock_pengumuman', JSON.stringify(MOCK_PENGUMUMAN));
}

// Admin-specific notifications
const MOCK_ADMIN_NOTIFICATIONS = [
  { id: 'AN001', type: 'warning', pesan: 'Ada 2 permohonan cuti menunggu persetujuan Anda.', waktu: '1 jam lalu', dibaca: false },
  { id: 'AN002', type: 'info', pesan: 'Laporan kehadiran bulan Juni telah tersedia.', waktu: '3 jam lalu', dibaca: false },
  { id: 'AN003', type: 'success', pesan: 'Data pegawai baru Nurul Hidayah berhasil ditambahkan.', waktu: '1 hari lalu', dibaca: true },
  { id: 'AN004', type: 'error', pesan: 'Fajar Ramadhan belum melakukan check-in selama 3 hari berturut-turut.', waktu: '2 hari lalu', dibaca: true },
];

// =========== JATAH CUTI ===========
const MOCK_JATAH_CUTI = {
  total: 12,
  terpakai: 7,
  sisa: 5,
  pending: 1
};

// ==========================================================================
// UTILITY FUNCTIONS — Digunakan di semua halaman
// ==========================================================================

/** Format angka ke mata uang Rupiah */
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
}

/** Format tanggal ke format Indonesia panjang (e.g., "10 Januari 2021") */
function formatTanggal(tgl) {
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/** Format tanggal pendek (e.g., "10 Jan 2021") */
function formatTanggalPendek(tgl) {
  return new Date(tgl).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/** Generate inisial dari nama (max 2 karakter) */
function getInitials(nama) {
  return nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

/** Generate warna avatar otomatis berdasarkan hash nama */
function getAvatarColor(nama) {
  const colors = ['#1e4d9b', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0d9488', '#be185d', '#4338ca'];
  let hash = 0;
  for (let c of nama) hash += c.charCodeAt(0);
  return colors[hash % colors.length];
}

/** Hitung hari kerja antara 2 tanggal (exclude Sabtu-Minggu) */
function hitungHariKerja(tglMulai, tglSelesai) {
  let count = 0;
  let current = new Date(tglMulai);
  const end = new Date(tglSelesai);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/** Dapatkan nama hari dalam Bahasa Indonesia */
function getNamaHari(dateStr) {
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return hari[new Date(dateStr).getDay()];
}

/** Dapatkan nama hari pendek */
function getNamaHariPendek(dateStr) {
  const hari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return hari[new Date(dateStr).getDay()];
}

/** Generate ID unik */
function generateId(prefix) {
  return prefix + Date.now().toString(36).toUpperCase();
}

/** Dapatkan CSS class badge berdasarkan status */
function getBadgeClass(status) {
  const map = {
    'Aktif': 'badge-aktif',
    'Tidak Aktif': 'badge-tidak-aktif',
    'Cuti': 'badge-cuti',
    'Hadir': 'badge-hadir',
    'Terlambat': 'badge-terlambat',
    'Absen': 'badge-absen',
    'Pending': 'badge-pending',
    'Disetujui': 'badge-disetujui',
    'Ditolak': 'badge-ditolak'
  };
  return map[status] || 'badge-info';
}

/** Dapatkan icon untuk toast notification */
function getToastIcon(type) {
  const icons = {
    'success': '<i data-lucide="check-circle-2"></i>',
    'error': '<i data-lucide="x-circle"></i>',
    'warning': '<i data-lucide="alert-triangle"></i>',
    'info': '<i data-lucide="info"></i>'
  };
  return icons[type] || '<i data-lucide="info"></i>';
}

/** Tampilkan toast notification (universal) */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${getToastIcon(type)}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(toast);
  updateIcons();

  // Trigger animasi masuk
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  // Auto remove setelah duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/** Tampilkan custom confirm dialog (pengganti window.confirm) */
function showConfirmDialog(title, message, confirmText, cancelText, onConfirm, type = 'warning') {
  const icons = {
    'warning': '<i data-lucide="alert-triangle"></i>',
    'danger': '<i data-lucide="trash-2"></i>',
    'success': '<i data-lucide="check-circle-2"></i>',
    'info': '<i data-lucide="info"></i>'
  };

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay confirm-dialog active';
  overlay.innerHTML = `
    <div class="modal-content" style="width:420px; text-align:center; padding:32px;">
      <div class="confirm-icon">${icons[type] || '<i data-lucide="alert-triangle"></i>'}</div>
      <h3 class="confirm-title">${title}</h3>
      <p class="confirm-message">${message}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline" id="confirmCancel">${cancelText}</button>
        <button class="btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}" id="confirmOk">${confirmText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  updateIcons();

  overlay.querySelector('#confirmCancel').onclick = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.querySelector('#confirmOk').onclick = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
    if (onConfirm) onConfirm();
  };

  // Klik overlay untuk batal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  });
}

/** Tampilkan reject dialog dengan textarea alasan */
function showRejectDialog(id, onReject) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal-content" style="width:460px;">
      <div class="modal-header">
        <h3>Tolak Permohonan Cuti</h3>
        <button class="modal-close" id="rejectClose">×</button>
      </div>
      <div class="modal-body">
        <p style="font-size:14px; color:var(--color-text-secondary); margin-bottom:16px;">
          Berikan alasan penolakan untuk permohonan cuti ini:
        </p>
        <div class="form-group">
          <label class="form-label">Alasan Penolakan</label>
          <textarea class="form-input" id="rejectReason" rows="3" 
            placeholder="Tuliskan alasan penolakan..." required></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" id="rejectCancel">Batal</button>
        <button class="btn btn-danger" id="rejectConfirm">Tolak Permohonan</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.querySelector('#rejectClose').onclick = close;
  overlay.querySelector('#rejectCancel').onclick = close;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  overlay.querySelector('#rejectConfirm').onclick = () => {
    const reason = overlay.querySelector('#rejectReason').value.trim();
    if (!reason) {
      showToast('Harap isi alasan penolakan.', 'error');
      return;
    }
    close();
    if (onReject) onReject(reason);
  };
}

/** Dapatkan tanggal hari ini dalam format Indonesia */
function getTodayFormatted() {
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return now.toLocaleDateString('id-ID', options);
}

/** Dapatkan daftar divisi unik dari data pegawai */
function getDivisiList() {
  return [...new Set(MOCK_PEGAWAI.map(p => p.divisi))].sort();
}

/** Update seluruh icon Lucide yang baru dirender */
function updateIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

/** Render skeleton loader UI */
function renderSkeletonLoader() {
  return `
    <div class="skeleton-wrapper animate-fadeIn" style="padding: 24px;">
      <div class="skeleton-header">
        <div class="skeleton-line w-1/3 h-8 mb-4"></div>
        <div class="skeleton-line w-1/4 h-4"></div>
      </div>
      <div class="stats-grid mt-6">
        <div class="skeleton-card h-32"></div>
        <div class="skeleton-card h-32"></div>
        <div class="skeleton-card h-32"></div>
        <div class="skeleton-card h-32"></div>
      </div>
      <div class="skeleton-card mt-6 h-64"></div>
    </div>
  `;
}
