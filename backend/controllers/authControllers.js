const db = require('../config/db');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET belum dikonfigurasi');
}

// LOGIN
exports.login = async(req, res) => {

    try {
        const { email, password } = req.body;
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await db.query(query, [email]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const token = jwt.sign({ role: user.role },
            jwtSecret, { subject: String(user.id), expiresIn: '1h' }
        );

        return res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        });


    } catch (err) {
        console.log("login error: ", err);

        return res.status(500).json({
            message: "Terjadi kesalahan pada server"
        });
    }

};