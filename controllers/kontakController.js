// Controller untuk halaman kontak
const showKontak = (req, res) => {
    res.render('kontak', {
        title: 'Kontak - KOSAND',
        user: req.session.user || null
    });
};

module.exports = {
    showKontak
}; 