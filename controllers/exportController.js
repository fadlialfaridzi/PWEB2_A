const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const db = require('../config/db');

// Export Users to PDF
const exportUsersPDF = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Unauthorized');
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

        // Create PDF document
        const doc = new PDFDocument();
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=users_report.pdf');
        
        // Pipe PDF to response
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Laporan Data Users', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        doc.moveDown(2);

        // Add table headers
        const tableTop = doc.y;
        const tableLeft = 50;
        const colWidth = 100;
        const rowHeight = 20;

        // Headers
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('ID', tableLeft, tableTop);
        doc.text('Nama', tableLeft + colWidth, tableTop);
        doc.text('Email', tableLeft + colWidth * 2, tableTop);
        doc.text('Phone', tableLeft + colWidth * 3, tableTop);
        doc.text('Role', tableLeft + colWidth * 4, tableTop);
        doc.text('Tanggal Daftar', tableLeft + colWidth * 5, tableTop);

        // Data rows
        doc.fontSize(9).font('Helvetica');
        let y = tableTop + rowHeight;
        
        users.forEach((user, index) => {
            if (y > 700) { // New page if near bottom
                doc.addPage();
                y = 50;
            }
            
            doc.text(user.id.toString(), tableLeft, y);
            doc.text(user.name, tableLeft + colWidth, y);
            doc.text(user.email, tableLeft + colWidth * 2, y);
            doc.text(user.phone || '-', tableLeft + colWidth * 3, y);
            doc.text(user.role, tableLeft + colWidth * 4, y);
            doc.text(new Date(user.created_at).toLocaleDateString('id-ID'), tableLeft + colWidth * 5, y);
            
            y += rowHeight;
        });

        // Add summary
        doc.moveDown(2);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total Users: ${users.length}`, { align: 'center' });

        doc.end();
    });
};

// Export Users to CSV
const exportUsersCSV = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Unauthorized');
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

        // Format data for CSV
        const csvData = users.map(user => ({
            ID: user.id,
            Nama: user.name,
            Email: user.email,
            Phone: user.phone || '-',
            Role: user.role,
            'Tanggal Daftar': new Date(user.created_at).toLocaleDateString('id-ID')
        }));

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users_report.csv');
        res.send(csv);
    });
};

// Export Kos to PDF
const exportKosPDF = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Unauthorized');
    }

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

        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=kos_report.pdf');
        
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Laporan Data Kos', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        doc.moveDown(2);

        // Add table headers
        const tableTop = doc.y;
        const tableLeft = 30;
        const colWidth = 80;
        const rowHeight = 25;

        // Headers
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('ID', tableLeft, tableTop);
        doc.text('Nama Kos', tableLeft + colWidth, tableTop);
        doc.text('Pemilik', tableLeft + colWidth * 2, tableTop);
        doc.text('Harga', tableLeft + colWidth * 3, tableTop);
        doc.text('Status', tableLeft + colWidth * 4, tableTop);
        doc.text('Rating', tableLeft + colWidth * 5, tableTop);

        // Data rows
        doc.fontSize(7).font('Helvetica');
        let y = tableTop + rowHeight;
        
        kos.forEach((kosItem, index) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            
            doc.text(kosItem.id.toString(), tableLeft, y);
            doc.text(kosItem.name.substring(0, 15), tableLeft + colWidth, y);
            doc.text(kosItem.owner_name ? kosItem.owner_name.substring(0, 12) : '-', tableLeft + colWidth * 2, y);
            doc.text(`Rp ${(kosItem.price || 0).toLocaleString('id-ID')}`, tableLeft + colWidth * 3, y);
            doc.text(kosItem.status || '-', tableLeft + colWidth * 4, y);
            doc.text(parseFloat(kosItem.avg_rating || 0).toFixed(1), tableLeft + colWidth * 5, y);
            
            y += rowHeight;
        });

        // Add summary
        doc.moveDown(2);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total Kos: ${kos.length}`, { align: 'center' });

        doc.end();
    });
};

// Export Kos to CSV
const exportKosCSV = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Unauthorized');
    }

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

        const csvData = kos.map(kosItem => ({
            ID: kosItem.id,
            'Nama Kos': kosItem.name || '-',
            'Pemilik': kosItem.owner_name || '-',
            'Email Pemilik': kosItem.owner_email || '-',
            'Harga': `Rp ${(kosItem.price || 0).toLocaleString('id-ID')}`,
            'Tipe Pembayaran': kosItem.payment_type || '-',
            'Status': kosItem.status || '-',
            'Rating Rata-rata': parseFloat(kosItem.avg_rating || 0).toFixed(1),
            'Total Rating': kosItem.total_ratings || 0,
            'Alamat': kosItem.address || '-',
            'Deskripsi': kosItem.description || '-'
        }));

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=kos_report.csv');
        res.send(csv);
    });
};

// Export Bookings to PDF
const exportBookingsPDF = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Unauthorized');
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

        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings_report.pdf');
        
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Laporan Data Pemesanan', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        doc.moveDown(2);

        // Add table headers
        const tableTop = doc.y;
        const tableLeft = 30;
        const colWidth = 80;
        const rowHeight = 25;

        // Headers
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('ID', tableLeft, tableTop);
        doc.text('Kos', tableLeft + colWidth, tableTop);
        doc.text('Pemesan', tableLeft + colWidth * 2, tableTop);
        doc.text('Tanggal', tableLeft + colWidth * 3, tableTop);
        doc.text('Status', tableLeft + colWidth * 4, tableTop);
        doc.text('Harga', tableLeft + colWidth * 5, tableTop);

        // Data rows
        doc.fontSize(7).font('Helvetica');
        let y = tableTop + rowHeight;
        
        bookings.forEach((booking, index) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            
            doc.text(booking.id.toString(), tableLeft, y);
            doc.text(booking.kos_name ? booking.kos_name.substring(0, 15) : '-', tableLeft + colWidth, y);
            doc.text(booking.user_name ? booking.user_name.substring(0, 12) : '-', tableLeft + colWidth * 2, y);
            doc.text(new Date(booking.booking_date).toLocaleDateString('id-ID'), tableLeft + colWidth * 3, y);
            doc.text(booking.status || '-', tableLeft + colWidth * 4, y);
            doc.text(`Rp ${(booking.kos_price || 0).toLocaleString('id-ID')}`, tableLeft + colWidth * 5, y);
            
            y += rowHeight;
        });

        // Add summary
        doc.moveDown(2);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total Pemesanan: ${bookings.length}`, { align: 'center' });

        doc.end();
    });
};

// Export Bookings to CSV
const exportBookingsCSV = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Unauthorized');
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

        const csvData = bookings.map(booking => ({
            ID: booking.id,
            'Nama Kos': booking.kos_name || '-',
            'Pemesan': booking.user_name || '-',
            'Email Pemesan': booking.user_email || '-',
            'Phone Pemesan': booking.user_phone || '-',
            'Tanggal Pemesanan': new Date(booking.booking_date).toLocaleDateString('id-ID'),
            'Status': booking.status || '-',
            'Harga': `Rp ${(booking.kos_price || 0).toLocaleString('id-ID')}`,
            'Tipe Pembayaran': booking.kos_payment_type || '-'
        }));

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=bookings_report.csv');
        res.send(csv);
    });
};

// Export Ratings to PDF
const exportRatingsPDF = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Unauthorized');
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

        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=ratings_report.pdf');
        
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Laporan Data Rating', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        doc.moveDown(2);

        // Add table headers
        const tableTop = doc.y;
        const tableLeft = 30;
        const colWidth = 100;
        const rowHeight = 25;

        // Headers
        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('ID', tableLeft, tableTop);
        doc.text('Kos', tableLeft + colWidth, tableTop);
        doc.text('User', tableLeft + colWidth * 2, tableTop);
        doc.text('Rating', tableLeft + colWidth * 3, tableTop);
        doc.text('Tanggal', tableLeft + colWidth * 4, tableTop);

        // Data rows
        doc.fontSize(7).font('Helvetica');
        let y = tableTop + rowHeight;
        
        ratings.forEach((rating, index) => {
            if (y > 700) {
                doc.addPage();
                y = 50;
            }
            
            doc.text(rating.id.toString(), tableLeft, y);
            doc.text(rating.kos_name ? rating.kos_name.substring(0, 20) : '-', tableLeft + colWidth, y);
            doc.text(rating.user_name ? rating.user_name.substring(0, 15) : '-', tableLeft + colWidth * 2, y);
            doc.text((rating.rating || 0).toString(), tableLeft + colWidth * 3, y);
            doc.text(new Date(rating.created_at).toLocaleDateString('id-ID'), tableLeft + colWidth * 4, y);
            
            y += rowHeight;
        });

        // Add summary
        doc.moveDown(2);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`Total Rating: ${ratings.length}`, { align: 'center' });

        doc.end();
    });
};

// Export Ratings to CSV
const exportRatingsCSV = (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Unauthorized');
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

        const csvData = ratings.map(rating => ({
            ID: rating.id,
            'Nama Kos': rating.kos_name || '-',
            'User': rating.user_name || '-',
            'Email User': rating.user_email || '-',
            'Rating': rating.rating || 0,
            'Komentar': rating.comment || '-',
            'Tanggal Rating': new Date(rating.created_at).toLocaleDateString('id-ID')
        }));

        const parser = new Parser();
        const csv = parser.parse(csvData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=ratings_report.csv');
        res.send(csv);
    });
};

module.exports = {
    exportUsersPDF,
    exportUsersCSV,
    exportKosPDF,
    exportKosCSV,
    exportBookingsPDF,
    exportBookingsCSV,
    exportRatingsPDF,
    exportRatingsCSV
}; 