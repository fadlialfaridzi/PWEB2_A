const db = require('../config/db');
const Kos = require('../models/Kos');

// Admin Dashboard
const adminDashboard = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    // Set timeout for the entire request
    const timeout = setTimeout(() => {
        console.error('Admin dashboard request timeout');
        if (!res.headersSent) {
            res.status(500).send('Request timeout - silakan coba lagi');
        }
    }, 30000); // 30 second timeout

    // Use Promise.all to run multiple optimized queries in parallel
    const userStatsQuery = `
        SELECT 
            SUM(CASE WHEN role = 'pencari' THEN 1 ELSE 0 END) as total_pencari,
            SUM(CASE WHEN role = 'pemilik' THEN 1 ELSE 0 END) as total_pemilik
        FROM users
    `;

    const kosStatsQuery = `
        SELECT 
            SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as total_kos_available,
            SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as total_kos_booked
        FROM kos
    `;

    const bookingStatsQuery = `
        SELECT 
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as total_bookings_pending,
            SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) as total_bookings_completed
        FROM bookings
    `;

    const ratingStatsQuery = `
        SELECT 
            COUNT(*) as total_ratings,
            COALESCE(AVG(rating), 0) as avg_rating
        FROM ratings
    `;

    // Execute all queries in parallel with individual timeouts
    Promise.all([
        new Promise((resolve, reject) => {
            const queryTimeout = setTimeout(() => reject(new Error('User stats query timeout')), 10000);
            db.query(userStatsQuery, (err, result) => {
                clearTimeout(queryTimeout);
                if (err) reject(err);
                else resolve(result[0]);
            });
        }),
        new Promise((resolve, reject) => {
            const queryTimeout = setTimeout(() => reject(new Error('Kos stats query timeout')), 10000);
            db.query(kosStatsQuery, (err, result) => {
                clearTimeout(queryTimeout);
                if (err) reject(err);
                else resolve(result[0]);
            });
        }),
        new Promise((resolve, reject) => {
            const queryTimeout = setTimeout(() => reject(new Error('Booking stats query timeout')), 10000);
            db.query(bookingStatsQuery, (err, result) => {
                clearTimeout(queryTimeout);
                if (err) reject(err);
                else resolve(result[0]);
            });
        }),
        new Promise((resolve, reject) => {
            const queryTimeout = setTimeout(() => reject(new Error('Rating stats query timeout')), 10000);
            db.query(ratingStatsQuery, (err, result) => {
                clearTimeout(queryTimeout);
                if (err) reject(err);
                else resolve(result[0]);
            });
        })
    ])
    .then(([userStats, kosStats, bookingStats, ratingStats]) => {
        clearTimeout(timeout);
        const dashboardStats = {
            ...userStats,
            ...kosStats,
            ...bookingStats,
            ...ratingStats
        };
        
        res.render('indexAdmin', {
            title: 'Admin Dashboard',
            user: req.session.user,
            stats: dashboardStats
        });
    })
    .catch((err) => {
        clearTimeout(timeout);
        console.error('Error fetching admin stats:', err);
        if (!res.headersSent) {
            res.status(500).send('Gagal mengambil statistik dashboard - silakan coba lagi');
        }
    });
};

// Manage Users
const manageUsers = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    const query = `
        SELECT id, name, email, phone, role, created_at
        FROM users 
        ORDER BY created_at DESC
    `;

    db.query(query, (err, users) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).send('Gagal mengambil data users');
        }

        res.render('admin/manageUsers', {
            title: 'Kelola Users',
            user: req.session.user,
            users: users
        });
    });
};

// Delete User
const deleteUser = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    const userId = req.params.id;

    // Check if user is trying to delete themselves
    if (parseInt(userId) === req.session.user.id) {
        return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun sendiri' });
    }

    // Use transaction for safe deletion
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ success: false, message: 'Database connection error' });
        }

        connection.beginTransaction((err) => {
            if (err) {
                console.error('Error starting transaction:', err);
                connection.release();
                return res.status(500).json({ success: false, message: 'Transaction error' });
            }

            // Step 1: Delete foto kos (if user is pemilik)
            const deletePhotosQuery = `
                DELETE fk FROM foto_kos fk 
                INNER JOIN kos k ON fk.kos_id = k.id 
                WHERE k.user_id = ?
            `;
            
            connection.query(deletePhotosQuery, [userId], (err) => {
                if (err) {
                    console.error('Error deleting photos:', err);
                    connection.rollback(() => {
                        connection.release();
                        return res.status(500).json({ success: false, message: 'Gagal menghapus foto kos' });
                    });
                    return;
                }

                // Step 2: Delete fasilitas kos (if user is pemilik)
                const deleteFacilitiesQuery = `
                    DELETE fk FROM fasilitas_kos fk 
                    INNER JOIN kos k ON fk.kos_id = k.id 
                    WHERE k.user_id = ?
                `;
                
                connection.query(deleteFacilitiesQuery, [userId], (err) => {
                    if (err) {
                        console.error('Error deleting facilities:', err);
                        connection.rollback(() => {
                            connection.release();
                            return res.status(500).json({ success: false, message: 'Gagal menghapus fasilitas kos' });
                        });
                        return;
                    }

                    // Step 3: Delete ratings untuk kos user (if user is pemilik)
                    const deleteRatingsQuery = `
                        DELETE r FROM ratings r 
                        INNER JOIN kos k ON r.kos_id = k.id 
                        WHERE k.user_id = ?
                    `;
                    
                    connection.query(deleteRatingsQuery, [userId], (err) => {
                        if (err) {
                            console.error('Error deleting ratings:', err);
                            connection.rollback(() => {
                                connection.release();
                                return res.status(500).json({ success: false, message: 'Gagal menghapus rating kos' });
                            });
                            return;
                        }

                        // Step 4: Delete bookings untuk kos user (if user is pemilik)
                        const deleteBookingsQuery = `
                            DELETE b FROM bookings b 
                            INNER JOIN kos k ON b.kos_id = k.id 
                            WHERE k.user_id = ?
                        `;
                        
                        connection.query(deleteBookingsQuery, [userId], (err) => {
                            if (err) {
                                console.error('Error deleting bookings:', err);
                                connection.rollback(() => {
                                    connection.release();
                                    return res.status(500).json({ success: false, message: 'Gagal menghapus booking kos' });
                                });
                                return;
                            }

                            // Step 5: Delete kos (if user is pemilik)
                            const deleteKosQuery = 'DELETE FROM kos WHERE user_id = ?';
                            connection.query(deleteKosQuery, [userId], (err) => {
                                if (err) {
                                    console.error('Error deleting kos:', err);
                                    connection.rollback(() => {
                                        connection.release();
                                        return res.status(500).json({ success: false, message: 'Gagal menghapus kos' });
                                    });
                                    return;
                                }

                                // Step 6: Delete ratings user (if user is pencari)
                                const deleteUserRatingsQuery = 'DELETE FROM ratings WHERE user_id = ?';
                                connection.query(deleteUserRatingsQuery, [userId], (err) => {
                                    if (err) {
                                        console.error('Error deleting user ratings:', err);
                                        connection.rollback(() => {
                                            connection.release();
                                            return res.status(500).json({ success: false, message: 'Gagal menghapus rating user' });
                                        });
                                        return;
                                    }

                                    // Step 7: Delete bookings user (if user is pencari)
                                    const deleteUserBookingsQuery = 'DELETE FROM bookings WHERE user_id = ?';
                                    connection.query(deleteUserBookingsQuery, [userId], (err) => {
                                        if (err) {
                                            console.error('Error deleting user bookings:', err);
                                            connection.rollback(() => {
                                                connection.release();
                                                return res.status(500).json({ success: false, message: 'Gagal menghapus booking user' });
                                            });
                                            return;
                                        }

                                        // Step 8: Finally delete the user
                                        const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
                                        connection.query(deleteUserQuery, [userId], (err) => {
                                            if (err) {
                                                console.error('Error deleting user:', err);
                                                connection.rollback(() => {
                                                    connection.release();
                                                    return res.status(500).json({ success: false, message: 'Gagal menghapus user' });
                                                });
                                                return;
                                            }

                                            // Commit transaction
                                            connection.commit((err) => {
                                                if (err) {
                                                    console.error('Error committing transaction:', err);
                                                    connection.rollback(() => {
                                                        connection.release();
                                                        return res.status(500).json({ success: false, message: 'Gagal commit transaction' });
                                                    });
                                                    return;
                                                }

                                                connection.release();
                                                res.json({ success: true, message: 'User berhasil dihapus' });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

// Manage Kos
const manageKos = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    // Optimized query without GROUP BY for better performance
    const query = `
        SELECT 
            k.*,
            u.name as owner_name,
            u.email as owner_email,
            COALESCE((SELECT AVG(rating) FROM ratings WHERE kos_id = k.id), 0) as avg_rating,
            COALESCE((SELECT COUNT(*) FROM ratings WHERE kos_id = k.id), 0) as total_ratings
        FROM kos k
        LEFT JOIN users u ON k.user_id = u.id
        ORDER BY k.id DESC
    `;

    db.query(query, (err, kos) => {
        if (err) {
            console.error('Error fetching kos:', err);
            return res.status(500).send('Gagal mengambil data kos');
        }

        res.render('admin/manageKos', {
            title: 'Kelola Kos',
            user: req.session.user,
            kos: kos
        });
    });
};

// Delete Kos
const deleteKos = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    const kosId = req.params.id;

    // Delete kos photos first
    const deletePhotosQuery = 'DELETE FROM foto_kos WHERE kos_id = ?';
    db.query(deletePhotosQuery, [kosId], (err) => {
        if (err) {
            console.error('Error deleting kos photos:', err);
            return res.status(500).json({ success: false, message: 'Gagal menghapus foto kos' });
        }

        // Delete kos facilities
        const deleteFacilitiesQuery = 'DELETE FROM fasilitas_kos WHERE kos_id = ?';
        db.query(deleteFacilitiesQuery, [kosId], (err) => {
            if (err) {
                console.error('Error deleting kos facilities:', err);
                return res.status(500).json({ success: false, message: 'Gagal menghapus fasilitas kos' });
            }

            // Delete kos ratings
            const deleteRatingsQuery = 'DELETE FROM ratings WHERE kos_id = ?';
            db.query(deleteRatingsQuery, [kosId], (err) => {
                if (err) {
                    console.error('Error deleting kos ratings:', err);
                    return res.status(500).json({ success: false, message: 'Gagal menghapus rating kos' });
                }

                // Delete kos bookings
                const deleteBookingsQuery = 'DELETE FROM bookings WHERE kos_id = ?';
                db.query(deleteBookingsQuery, [kosId], (err) => {
                    if (err) {
                        console.error('Error deleting kos bookings:', err);
                        return res.status(500).json({ success: false, message: 'Gagal menghapus booking kos' });
                    }

                    // Finally delete the kos
                    const deleteKosQuery = 'DELETE FROM kos WHERE id = ?';
                    db.query(deleteKosQuery, [kosId], (err) => {
                        if (err) {
                            console.error('Error deleting kos:', err);
                            return res.status(500).json({ success: false, message: 'Gagal menghapus kos' });
                        }

                        res.json({ success: true, message: 'Kos berhasil dihapus' });
                    });
                });
            });
        });
    });
};

// Manage Bookings
const manageBookings = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    const query = `
        SELECT 
            b.*,
            k.name as kos_name,
            k.price as kos_price,
            k.payment_type as kos_payment_type,
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone
        FROM bookings b
        LEFT JOIN kos k ON b.kos_id = k.id
        LEFT JOIN users u ON b.user_id = u.id
        ORDER BY b.booking_date DESC
    `;

    db.query(query, (err, bookings) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            return res.status(500).send('Gagal mengambil data bookings');
        }

        res.render('admin/manageBookings', {
            title: 'Kelola Pemesanan',
            user: req.session.user,
            bookings: bookings
        });
    });
};

// Update Booking Status
const updateBookingStatus = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    const { bookingId, status } = req.body;

    const query = 'UPDATE bookings SET status = ? WHERE id = ?';
    db.query(query, [status, bookingId], (err) => {
        if (err) {
            console.error('Error updating booking status:', err);
            return res.status(500).json({ success: false, message: 'Gagal memperbarui status booking' });
        }

        res.json({ success: true, message: 'Status booking berhasil diperbarui' });
    });
};

// Manage Ratings
const manageRatings = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    const query = `
        SELECT 
            r.*,
            k.name as kos_name,
            u.name as user_name,
            u.email as user_email
        FROM ratings r
        LEFT JOIN kos k ON r.kos_id = k.id
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
    `;

    db.query(query, (err, ratings) => {
        if (err) {
            console.error('Error fetching ratings:', err);
            return res.status(500).send('Gagal mengambil data ratings');
        }

        res.render('admin/manageRatings', {
            title: 'Kelola Rating',
            user: req.session.user,
            ratings: ratings
        });
    });
};

// Delete Rating
const deleteRating = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    const ratingId = req.params.id;

    const query = 'DELETE FROM ratings WHERE id = ?';
    db.query(query, [ratingId], (err) => {
        if (err) {
            console.error('Error deleting rating:', err);
            return res.status(500).json({ success: false, message: 'Gagal menghapus rating' });
        }

        res.json({ success: true, message: 'Rating berhasil dihapus' });
    });
};

module.exports = {
    adminDashboard,
    manageUsers,
    deleteUser,
    manageKos,
    deleteKos,
    manageBookings,
    updateBookingStatus,
    manageRatings,
    deleteRating
}; 