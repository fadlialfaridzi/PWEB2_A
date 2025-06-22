const Favorit = require('../models/Favorit');

// Menampilkan halaman favorit
exports.showFavorites = (req, res) => {
    const userId = req.session.user.id;

    console.log('Fetching favorites for user:', userId);

    Favorit.getFavoritesWithDetails(userId, (err, favorites) => {
        if (err) {
            console.error('Error fetching favorites:', err);
            return res.status(500).render('error', {
                message: 'Gagal memuat daftar favorit',
                error: err
            });
        }

        console.log('Favorites fetched successfully, count:', favorites ? favorites.length : 0);

        res.render('favorit', {
            title: 'Kos Favorit Saya',
            user: req.session.user,
            favorites: favorites || [],
            successMessage: req.query.success || null,
            errorMessage: req.query.error || null
        });
    });
};

// Menambahkan kos ke favorit
exports.addToFavorites = (req, res) => {
    const userId = req.session.user.id;
    const kosId = req.params.kosId;

    console.log('Adding to favorites - User:', userId, 'Kos:', kosId);

    // Cek apakah sudah difavoritkan
    Favorit.isFavorited(userId, kosId, (err, isFavorited) => {
        if (err) {
            console.error('Error checking favorite status:', err);
            return res.status(500).json({ success: false, message: 'Gagal mengecek status favorit' });
        }

        if (isFavorited) {
            return res.status(400).json({ success: false, message: 'Kos sudah ada di favorit' });
        }

        // Tambahkan ke favorit
        Favorit.addToFavorites(userId, kosId, (err, result) => {
            if (err) {
                console.error('Error adding to favorites:', err);
                return res.status(500).json({ success: false, message: 'Gagal menambahkan ke favorit' });
            }

            console.log('Successfully added to favorites');
            res.json({ success: true, message: 'Berhasil ditambahkan ke favorit' });
        });
    });
};

// Menghapus kos dari favorit
exports.removeFromFavorites = (req, res) => {
    const userId = req.session.user.id;
    const kosId = req.params.kosId;

    console.log('Removing from favorites - User:', userId, 'Kos:', kosId);

    Favorit.removeFromFavorites(userId, kosId, (err, result) => {
        if (err) {
            console.error('Error removing from favorites:', err);
            return res.status(500).json({ success: false, message: 'Gagal menghapus dari favorit' });
        }

        console.log('Successfully removed from favorites');
        res.json({ success: true, message: 'Berhasil dihapus dari favorit' });
    });
};

// Toggle favorit (add/remove)
exports.toggleFavorite = (req, res) => {
    const userId = req.session.user.id;
    const kosId = req.params.kosId;

    console.log('Toggling favorite - User:', userId, 'Kos:', kosId);

    // Cek status favorit
    Favorit.isFavorited(userId, kosId, (err, isFavorited) => {
        if (err) {
            console.error('Error checking favorite status:', err);
            return res.status(500).json({ success: false, message: 'Gagal mengecek status favorit' });
        }

        console.log('Current favorite status:', isFavorited);

        if (isFavorited) {
            // Hapus dari favorit
            Favorit.removeFromFavorites(userId, kosId, (err, result) => {
                if (err) {
                    console.error('Error removing from favorites:', err);
                    return res.status(500).json({ success: false, message: 'Gagal menghapus dari favorit' });
                }

                console.log('Successfully removed from favorites');
                res.json({ 
                    success: true, 
                    message: 'Berhasil dihapus dari favorit',
                    isFavorited: false
                });
            });
        } else {
            // Tambahkan ke favorit
            Favorit.addToFavorites(userId, kosId, (err, result) => {
                if (err) {
                    console.error('Error adding to favorites:', err);
                    return res.status(500).json({ success: false, message: 'Gagal menambahkan ke favorit' });
                }

                console.log('Successfully added to favorites');
                res.json({ 
                    success: true, 
                    message: 'Berhasil ditambahkan ke favorit',
                    isFavorited: true
                });
            });
        }
    });
};

// Mengecek status favorit untuk suatu kos
exports.checkFavoriteStatus = (req, res) => {
    const userId = req.session.user.id;
    const kosId = req.params.kosId;

    console.log('Checking favorite status - User:', userId, 'Kos:', kosId);

    Favorit.isFavorited(userId, kosId, (err, isFavorited) => {
        if (err) {
            console.error('Error checking favorite status:', err);
            return res.status(500).json({ success: false, message: 'Gagal mengecek status favorit' });
        }

        console.log('Favorite status result:', isFavorited);
        res.json({ success: true, isFavorited: isFavorited });
    });
}; 