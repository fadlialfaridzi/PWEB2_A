exports.lihatRating = (req, res) => {
  res.render("kos/lihatRating", { title: "Lihat Rating Kos" });
};

exports.kasihRating = (req, res) => {
  const { rating, komentar } = req.body;
  console.log("Rating:", rating);
  console.log("Komentar:", komentar);
  res.redirect("/rating");
};
