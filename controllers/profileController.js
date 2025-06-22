const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Menampilkan halaman profile user
exports.showProfile = (req, res) => {
    const user = req.session.user;

    res.render('profile', {
        title: 'Profile - ' + user.name,
        user: user,
        successMessage: req.query.success || null,
        errorMessage: req.query.error || null
    });
};

// Menampilkan halaman edit profile
exports.showEditProfile = (req, res) => {
    const user = req.session.user;

    res.render('editProfile', {
        title: 'Edit Profile - ' + user.name,
        user: user,
        errorMessage: req.query.error || null
    });
};

// Update profile user
exports.updateProfile = (req, res) => {
    const userId = req.session.user.id;
    const { name, email, phone } = req.body;

    // Validasi input
    if (!name || !email || !phone) {
        return res.redirect('/editProfile?error=Semua field harus diisi');
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.redirect('/editProfile?error=Format email tidak valid');
    }

    // Validasi nomor telepon (minimal 10 digit, maksimal 15 digit)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        return res.redirect('/editProfile?error=Format nomor telepon tidak valid');
    }

    // Cek apakah email sudah digunakan oleh user lain
    User.checkEmailExists(email, userId, (err, emailExists) => {
        if (err) {
            console.error('Error checking email:', err);
            return res.redirect('/editProfile?error=Gagal memverifikasi email');
        }

        if (emailExists) {
            return res.redirect('/editProfile?error=Email sudah digunakan oleh user lain');
        }

        // Update data user di database
        User.updateUser(userId, { name, email, phone }, (err, result) => {
            if (err) {
                console.error('Error updating user profile:', err);
                return res.redirect('/editProfile?error=Gagal mengupdate profile');
            }

            // Update session dengan data baru
            req.session.user = {
                ...req.session.user,
                name: name,
                email: email,
                phone: phone
            };

            res.redirect('/profile?success=Profile berhasil diupdate');
        });
    });
};

// Menampilkan halaman ganti password
exports.showChangePassword = (req, res) => {
    const user = req.session.user;

    res.render('changePassword', {
        title: 'Ganti Password - ' + user.name,
        user: user,
        errorMessage: req.query.error || null,
        successMessage: req.query.success || null
    });
};

// Update password user
exports.updatePassword = (req, res) => {
    const userId = req.session.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validasi input
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.redirect('/changePassword?error=Semua field harus diisi');
    }

    if (newPassword !== confirmPassword) {
        return res.redirect('/changePassword?error=Password baru dan konfirmasi password tidak cocok');
    }

    if (newPassword.length < 6) {
        return res.redirect('/changePassword?error=Password minimal 6 karakter');
    }

    // Verifikasi password lama
    User.findUserById(userId, (err, user) => {
        if (err) {
            console.error('Error finding user:', err);
            return res.redirect('/changePassword?error=Gagal memverifikasi password');
        }

        if (!user) {
            return res.redirect('/changePassword?error=User tidak ditemukan');
        }

        // Check if password is hashed
        const isHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));
        
        if (isHashed) {
            // Password is hashed, use bcrypt.compare
            bcrypt.compare(currentPassword, user.password, (err, isPasswordValid) => {
                if (err) {
                    console.error('Error comparing password:', err);
                    return res.redirect('/changePassword?error=Gagal memverifikasi password');
                }

                if (!isPasswordValid) {
                    return res.redirect('/changePassword?error=Password lama tidak benar');
                }

                // Hash password baru
                bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error('Error hashing new password:', err);
                        return res.redirect('/changePassword?error=Gagal mengupdate password');
                    }

                    // Update password baru
                    User.updatePassword(userId, hashedPassword, (err, result) => {
                        if (err) {
                            console.error('Error updating password:', err);
                            return res.redirect('/changePassword?error=Gagal mengupdate password');
                        }

                        res.redirect('/changePassword?success=Password berhasil diubah');
                    });
                });
            });
        } else {
            // Password is plain text, compare directly
            if (user.password !== currentPassword) {
                return res.redirect('/changePassword?error=Password lama tidak benar');
            }

            // Hash password baru
            bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error hashing new password:', err);
                    return res.redirect('/changePassword?error=Gagal mengupdate password');
                }

                // Update password baru
                User.updatePassword(userId, hashedPassword, (err, result) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.redirect('/changePassword?error=Gagal mengupdate password');
                    }

                    res.redirect('/changePassword?success=Password berhasil diubah');
                });
            });
        }
    });
}; 