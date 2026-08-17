const db = require('../config/db');

// LOGIN
exports.login = (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const user = results[0];

        // Sederhana dulu (ujikom)
        if (user.password !== password) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        res.json({
            message: 'Login berhasil',
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });
    });
};