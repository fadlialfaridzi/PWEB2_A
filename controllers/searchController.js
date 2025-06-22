const Kos = require('../models/Kos');
const db = require('../config/db');

// Search kos with filters
const searchKos = (req, res) => {
    // Memastikan pengguna sudah login dan memiliki role sebagai 'pencari'
    if (!req.session.user || req.session.user.role !== 'pencari') {
        return res.redirect('/login');
    }

    const {
        tipe_kos,
        payment_type,
        price_range,
        facilities
    } = req.query;

    // Ensure facilities is always an array
    const facilitiesArray = Array.isArray(facilities) ? facilities : (facilities ? [facilities] : []);

    // Build the base query
    let query = `
        SELECT 
            k.*,
            COALESCE(AVG(r.rating), 0) as average_rating,
            COUNT(r.id) as total_ratings,
            GROUP_CONCAT(fk.filename) as photo_filenames
        FROM kos k
        LEFT JOIN ratings r ON k.id = r.kos_id
        LEFT JOIN foto_kos fk ON k.id = fk.kos_id
        WHERE k.status = 'available'
    `;

    const queryParams = [];
    const conditions = [];

    // Add filters
    if (tipe_kos && tipe_kos !== '') {
        conditions.push('k.tipe_kos = ?');
        queryParams.push(tipe_kos);
    }

    if (payment_type && payment_type !== '') {
        conditions.push('k.payment_type = ?');
        queryParams.push(payment_type);
    }

    if (price_range && price_range !== '') {
        let priceCondition = '';
        switch (price_range) {
            case '1':
                priceCondition = 'k.price BETWEEN 100000 AND 500000';
                break;
            case '2':
                priceCondition = 'k.price BETWEEN 500000 AND 1000000';
                break;
            case '3':
                priceCondition = 'k.price BETWEEN 1000000 AND 2000000';
                break;
            case '4':
                priceCondition = 'k.price BETWEEN 2000000 AND 5000000';
                break;
            case '5':
                priceCondition = 'k.price > 5000000';
                break;
        }
        if (priceCondition) {
            conditions.push(priceCondition);
        }
    }

    // Add conditions to query
    if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
    }

    query += ' GROUP BY k.id ORDER BY k.id DESC';

    // Execute the main query
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Error searching kos:', err);
            return res.status(500).send('Gagal mencari kos');
        }

        // If facilities filter is applied, we need to filter by facilities
        if (facilitiesArray.length > 0) {
            const kosIds = results.map(kos => kos.id);
            if (kosIds.length === 0) {
                return res.render('hasilPencarian', {
                    title: 'Hasil Pencarian',
                    kos: [],
                    user: req.session.user,
                    searchParams: req.query,
                    totalResults: 0
                });
            }

            // Get facilities for all kos
            const facilityQuery = `
                SELECT kos_id, GROUP_CONCAT(fasilitas) as facilities
                FROM fasilitas_kos 
                WHERE kos_id IN (${kosIds.map(() => '?').join(',')})
                GROUP BY kos_id
            `;

            db.query(facilityQuery, kosIds, (err, facilityResults) => {
                if (err) {
                    console.error('Error fetching facilities:', err);
                    return res.status(500).send('Gagal mengambil fasilitas');
                }

                // Create a map of kos_id to facilities
                const facilityMap = {};
                facilityResults.forEach(row => {
                    facilityMap[row.kos_id] = row.facilities.split(',');
                });

                // Filter kos that have all selected facilities
                const filteredKos = results.filter(kos => {
                    const kosFacilities = facilityMap[kos.id] || [];
                    return facilitiesArray.every(facility => 
                        kosFacilities.some(kosFacility => 
                            kosFacility.toLowerCase().includes(facility.toLowerCase())
                        )
                    );
                });

                // Process photos and facilities for filtered results
                processKosResults(filteredKos, req, res);
            });
        } else {
            // No facilities filter, process all results
            processKosResults(results, req, res);
        }
    });
};

// Helper function to process kos results
const processKosResults = (kos, req, res) => {
    // Fetch fasilitas untuk setiap kos
    const kosWithFacilitiesPromises = kos.map((kosItem) => {
        return new Promise((resolve, reject) => {
            // Fetch facilities
            Kos.getFasilitasKos(kosItem.id, (err, fasilitas) => {
                if (err) {
                    console.error('Error fetching facilities for kos:', err);
                    reject(err);
                } else {
                    const facilities = fasilitas || [];
                    kosItem.facilities = facilities.map(facility => facility.fasilitas);
                    
                    // Process photos from the main query
                    if (kosItem.photo_filenames) {
                        kosItem.photos = kosItem.photo_filenames.split(',');
                    } else {
                        kosItem.photos = [];
                    }
                    
                    // Remove the photo_filenames field as it's not needed in the view
                    delete kosItem.photo_filenames;
                    
                    // Ensure photos is always an array
                    kosItem.photos = kosItem.photos || [];
                    
                    // Ensure rating data is properly formatted
                    kosItem.avg_rating = parseFloat(kosItem.average_rating || 0).toFixed(1);
                    kosItem.total_ratings = parseInt(kosItem.total_ratings || 0);
                    resolve(kosItem);
                }
            });
        });
    });

    Promise.all(kosWithFacilitiesPromises)
        .then(kosWithFacilities => {
            res.render('hasilPencarian', {
                title: 'Hasil Pencarian',
                kos: kosWithFacilities,
                user: req.session.user,
                searchParams: req.query,
                totalResults: kosWithFacilities.length
            });
        })
        .catch(err => {
            console.error('Error fetching facilities for some kos:', err);
            res.status(500).send('Gagal mengambil fasilitas kos');
        });
};

module.exports = {
    searchKos
}; 