const db = require('../config/db');
const { logActivity } = require('../services/logService');

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

        const user = results[0];

        // Perbandingan password teks biasa
        if (password !== user.password) {
            return res.status(401).json({ message: 'Password salah' });
        }

        // Mengirimkan ID user sebagai token
        res.json({
            token: user.id,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }
        });
        // Catat aktivitas login setelah respons berhasil dikirim
        logActivity(user.id, `Login berhasil`);
    });
};