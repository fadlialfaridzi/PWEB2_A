const kosController = {
  // ===== RATING =====
  lihatRating: (req, res) => {
    res.render("kos/ratingPopup", { title: "Kasih Rating" });
  },

  kasihRating: (req, res) => {
    const { rating, komentar } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).send("Rating harus antara 1-5!");
    }
    console.log("Rating:", rating);
    console.log("Komentar:", komentar);
    res.redirect("/kos/rating");
  },

  lihatListRating: (req, res) => {
    const ratings = [
      { rating: 5, komentar: "Kos nyaman banget" },
      { rating: 4, komentar: "Lumayan oke, bersih" },
      { rating: 3, komentar: "Agak berisik, tapi fasilitas oke" }
    ];
    res.render("kos/listRating", { title: "List Rating Kos", ratings });
  },

  // ===== BOOKING =====
  formBooking: (req, res) => {
    res.render("kos/formBooking", { title: "Booking Kos" });
  },

  prosesBooking: (req, res) => {
    const { nama, tanggal, durasi } = req.body;
    console.log("Booking atas nama:", nama);
    console.log("Tanggal:", tanggal);
    console.log("Durasi:", durasi, "bulan");
    res.redirect("/kos/booking");
  },

  // ===== FAVORIT =====
  formFavorit: (req, res) => {
    res.render("kos/formFavorit", { title: "Favoritkan Kos" });
  },

  prosesFavorit: (req, res) => {
    const { namaKos } = req.body;
    console.log("Kos yang difavoritkan:", namaKos);
    res.redirect("/kos/favorit");
  },

  // ===== PROFIL PEMILIK =====
  lihatProfilPemilik: (req, res) => {
    const pemilikDummy = {
      nama: "Budi Santoso",
      email: "budi@example.com",
      telepon: "08123456789",
      deskripsi: "Pemilik kos ramah, responsif, dan terpercaya."
    };
    const pemilikId = req.params.id;
    res.render('kos/profilPemilik', { pemilik: pemilikDummy });
  },

  // ===== REPORT KOS =====
  reportKosForm: (req, res) => {
    const kosId = req.params.id;
    const kos = { nama: "Kos Mawar UNAND" };
    res.render('kos/formReport', { kos });
  },

  reportKosSubmit: (req, res) => {
    const { nama_kos, alasan, keterangan } = req.body;
    console.log("Laporan dikirim:", { nama_kos, alasan, keterangan });
    res.redirect('/');
  },

  // ===== FASILITAS =====
  tampilFasilitas: (req, res) => {
    const fasilitasDummy = [
      { id: 1, nama: 'WiFi' },
      { id: 2, nama: 'Kamar Mandi Dalam' },
      { id: 3, nama: 'AC' }
    ];
    res.render('kos/kelolaFasilitas', { fasilitas: fasilitasDummy });
  },

  // ===== DASHBOARD PEMILIK =====
  dashboardPemilik: (req, res) => {
    const data = {
      totalKos: 3,
      totalBooking: 7,
      totalReview: 5
    };
    res.render('pemilik/dashboard', { data });
  },

  // ===== FORM TAMBAH KOS =====
  formTambahKos: (req, res) => {
    res.render('pemilik/tambahKos');
  },

  prosesTambahKos: (req, res) => {
    const { nama, harga, fasilitas, alamat, status } = req.body;
    console.log("Kos baru ditambahkan:");
    console.log("Nama:", nama);
    console.log("Harga:", harga);
    console.log("Fasilitas:", fasilitas);
    console.log("Alamat:", alamat);
    console.log("Status:", status);
    res.redirect('/kos/pemilik/dashboard');
  }
};

module.exports = kosController;