const db = require('./db');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const userId = authHeader && authHeader.split(' ')[1];

    if (!userId) return res.status(401).json({ message: 'Akses ditolak, silahkan login kembali' });

    // Cari user berdasarkan ID (Token sederhana adalah ID User)
    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(403).json({ message: 'Sesi tidak valid' });
        }
        req.user = results[0];
        next();
    });
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Role ${req.user.role} tidak memiliki izin untuk akses ini`
            });
        }
        next();
    };
};