const db = require('../config/db');

/**
 * Mencatat aktivitas pengguna ke tabel log_aktivitas.
 * @param {number} userId ID pengguna yang melakukan aktivitas.
 * @param {string} aktivitas Deskripsi aktivitas yang dilakukan.
 */
const logActivity = async(userId, aktivitas) => {
    const query = 'INSERT INTO log_aktivitas (user_id, aktivitas, waktu) VALUES (?, ?, NOW())';

    try {
        await db.query(query, [userId, aktivitas]);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = { logActivity };