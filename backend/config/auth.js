const db = require('./db');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET belum dikonfigurasi');
}

exports.verifyToken = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Akses ditolak, silahkan login kembali'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, jwtSecret);

        const userId = decoded.sub;

        if (!userId) {
            return res.status(401).json({
                message: 'Token tidak valid'
            });
        }

        // Cari user berdasarkan ID yang terdapat pada payload JWT
        const query = 'SELECT * FROM users WHERE id = ?';

        const [results] = await db.query(query, [userId]);

        if (results.length === 0) {
            return res.status(401).json({
                message: 'User tidak ditemukan'
            });
        }

        req.user = results[0];

        next();

    } catch (err) {

        if (
            err.name === 'TokenExpiredError' ||
            err.name === 'JsonWebTokenError'
        ) {
            return res.status(401).json({
                message: 'Token tidak valid atau sudah kedaluwarsa'
            });
        }

        console.error('Token verification error:', err);

        return res.status(500).json({
            message: 'Terjadi kesalahan saat memverifikasi token'
        });
    }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: 'User belum terautentikasi'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role ${req.user.role} tidak memiliki izin untuk akses ini`
            });
        }

        next();
    };
};