// controllers/adminController.js

const adminController = {
  // ===== KELOLA PENGGUNA =====
  kelolaPengguna: (req, res) => {
    const penggunaDummy = [
      { id: 1, nama: "Saskia", email: "saskia@example.com", role: "Pencari Kos" },
      { id: 2, nama: "Budi", email: "budi@example.com", role: "Pemilik Kos" }
    ];
    res.render('admin/kelolaPengguna', { pengguna: penggunaDummy });
  },

  // ===== KELOLA KOS =====
  kelolaKos: (req, res) => {
    const kosDummy = [
      { id: 1, nama: "Kos Mawar", pemilik: "Budi", harga: 700000, status: "Tersedia" },
      { id: 2, nama: "Kos Melati", pemilik: "Saskia", harga: 600000, status: "Tidak Tersedia" }
    ];
    res.render('admin/kelolaKos', { kos: kosDummy });
  },

  // ===== PANTAU BOOKING =====
  pantauBooking: (req, res) => {
    const bookingDummy = [
      { id: 1, namaPenyewa: "Andi", namaKos: "Kos Mawar", tanggal: "2025-06-21" },
      { id: 2, namaPenyewa: "Rina", namaKos: "Kos Melati", tanggal: "2025-06-20" }
    ];
    res.render('admin/pantauBooking', { bookings: bookingDummy });
  },

  // ===== KELOLA REPORT =====
  kelolaReport: (req, res) => {
    const laporanDummy = [
      { id: 1, kos: "Kos Mawar", pelapor: "Andi", alasan: "Kamar kotor" },
      { id: 2, kos: "Kos Melati", pelapor: "Rina", alasan: "Tidak sesuai foto" }
    ];
    res.render('admin/kelolaReport', { laporan: laporanDummy });
  },

  // ===== LIHAT STATISTIK =====
  lihatStatistik: (req, res) => {
    const statistik = {
      totalKos: 12,
      totalPengguna: 24,
      totalBooking: 8,
      totalReport: 3
    };
    res.render('admin/statistik', { statistik });
  }
};

module.exports = adminController;
