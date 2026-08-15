const db = require('../config/db');

/**
 * Mencatat aktivitas pengguna ke tabel log_aktivitas.
 * @param {number} userId ID pengguna yang melakukan aktivitas.
 * @param {string} aktivitas Deskripsi aktivitas yang dilakukan.
 */
const logActivity = (userId, aktivitas) => {
    const query = 'INSERT INTO log_aktivitas (user_id, aktivitas, waktu) VALUES (?, ?, NOW())';
    db.query(query, [userId, aktivitas], (err) => {
        if (err) console.error('Error logging activity:', err);
    });
};

module.exports = { logActivity };