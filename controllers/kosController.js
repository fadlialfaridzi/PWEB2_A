exports.lihatRating = (req, res) => {
  res.render("kos/lihatRating", { title: "Lihat Rating Kos" });
};

exports.kasihRating = (req, res) => {
  const { rating, komentar } = req.body;
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
