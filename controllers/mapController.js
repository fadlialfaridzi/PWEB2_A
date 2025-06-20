const Kos = require('../models/Kos');

// Controller function to display the map page
exports.showMap = async (req, res) => {
    try {
        // Fetch all kos data with coordinates
        Kos.getAllWithFoto(null, (err, kosList) => {
            if (err) {
                console.error('Error fetching kos data:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Check if kos data exists
            if (!kosList || kosList.length === 0) {
                // If no kos data is available, send a custom message or an empty list
                return res.render('map', { kos: [], message: 'No kos available in the area.' });
            }

            // If kos data is found, pass it to the map.ejs page for rendering
            res.render('map', { 
                title: 'Lokasi Kos Tersedia',
                kos: kosList,
                user: req.session.user
            });
        });
    } catch (error) {
        console.error('Error fetching kos data:', error);
        res.status(500).send('Internal Server Error');
    }
};
