exports.lihatRating = (req, res) => {
  res.render("kos/lihatRating", { title: "Lihat Rating Kos" });
};

exports.kasihRating = (req, res) => {
  const { rating, komentar } = req.body;
  
  // Validasi rating harus 1-5
  if (rating < 1 || rating > 5) {
    return res.status(400).send("Rating harus antara 1-5!");
  }

  console.log("Rating:", rating);
  console.log("Komentar:", komentar);
  res.redirect("/rating");
};


exports.lihatListRating = (req, res) => {
  const ratings = [
    { rating: 5, komentar: "Kos nyaman banget" },
    { rating: 4, komentar: "Lumayan oke, bersih" },
    { rating: 3, komentar: "Agak berisik, tapi fasilitas oke" }
  ];
  res.render("kos/listRating", { title: "List Rating Kos", ratings });
};

exports.formBooking = (req, res) => {
  res.render("kos/formBooking", { title: "Booking Kos" });
};

exports.prosesBooking = (req, res) => {
  const { nama, tanggal, durasi } = req.body;
  console.log("Booking atas nama:", nama);
  console.log("Tanggal:", tanggal);
  console.log("Durasi:", durasi, "bulan");
  res.redirect("/booking");
};

exports.formFavorit = (req, res) => {
  res.render("kos/formFavorit", { title: "Favoritkan Kos" });
};

exports.prosesFavorit = (req, res) => {
  const { namaKos } = req.body;
  console.log("Kos yang difavoritkan:", namaKos);
  res.redirect("/favorit");
};
