const db = require('../config/db');
const { logActivity } = require('../services/logService');

exports.getUserStats = (req, res) => {
    const userId = req.user.id;
    const query = `
        SELECT 
            SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) as peminjamanAktif,
            COUNT(*) as totalPeminjaman,
            SUM(CASE WHEN status = 'disetujui' AND tanggal_kembali < CURDATE() THEN 1 ELSE 0 END) as peminjamanTerlambat
        FROM peminjaman WHERE user_id = ?
    `;
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0] || { peminjamanAktif: 0, totalPeminjaman: 0, peminjamanTerlambat: 0 });
    });
};

exports.changePassword = (req, res) => {
    const { passwordLama, passwordBaru } = req.body;
    const userId = req.user.id;

    db.query('SELECT password FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

        const user = results[0];
        if (passwordLama !== user.password) {
            return res.status(401).json({ message: 'Password lama salah' });
        }

        db.query('UPDATE users SET password = ? WHERE id = ?', [passwordBaru, userId], (err) => {
            if (err) return res.status(500).json(err);
            logActivity(userId, 'Mengubah password akun');
            res.json({ message: 'Password berhasil diubah' });
        });
    });
};