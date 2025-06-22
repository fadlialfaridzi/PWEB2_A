const pool = require('../db'); // koneksi ke database dari db.js

// ========================
// Booking Kos
// ========================

// Menampilkan semua booking kos dengan status confirmed, bisa cari berdasarkan nama penyewa atau nama kos
exports.getAllBookings = async (req, res) => {
  const search = req.query.search || '';

  try {
    const [rows] = await pool.query(`
      SELECT
        b.nama_penyewa,
        b.tanggal_booking,
        b.status,
        k.nama AS nama_kos,
        k.harga,
        k.info,
        k.gambar
      FROM bookings b
      JOIN kos k ON b.kos_id = k.id
      WHERE b.status = 'confirmed'
        AND (b.nama_penyewa LIKE ? OR k.nama LIKE ?)
    `, [`%${search}%`, `%${search}%`]);

    res.render('owner/booking', {
      bookings: rows,
      search
    });
  } catch (err) {
    console.error('Gagal mengambil data booking:', err);
    res.status(500).send('Terjadi kesalahan saat mengambil data booking.');
  }
};

// ========================
// Daftar Kos + Filter
// ========================

exports.getKosList = async (req, res) => {
  const search = req.query.search || '';
  const status = req.query.status || '';

  let query = `
    SELECT id, nama, harga, info, gambar, status
    FROM kos
    WHERE nama LIKE ?
  `;
  const params = [`%${search}%`];

  if (status === 'tersedia' || status === 'full') {
    query += ' AND status = ?';
    params.push(status);
  }

  try {
    const [rows] = await pool.query(query, params);
    res.render('owner/kosList', {
      daftarKos: rows,
      search,
      status
    });
  } catch (err) {
    console.error('Gagal mengambil data kos:', err);
    res.status(500).send('Terjadi kesalahan saat mengambil data kos.');
  }
};

// ========================
// Toggle Status Kos
// ========================

exports.toggleKosAvailability = async (req, res) => {
  const kosId = req.params.id;

  try {
    const [rows] = await pool.query(`SELECT status FROM kos WHERE id = ?`, [kosId]);
    if (rows.length === 0) return res.status(404).send('Kos tidak ditemukan.');

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === 'tersedia' ? 'full' : 'tersedia';

    await pool.query(`UPDATE kos SET status = ? WHERE id = ?`, [newStatus, kosId]);

    res.redirect('/owner/list-kos');
  } catch (err) {
    console.error('Gagal mengubah status kos:', err);
    res.status(500).send('Terjadi kesalahan saat memperbarui status kos.');
  }
};
