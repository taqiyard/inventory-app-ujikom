const db = require('./db');

exports.verifyToken = async(req, res, next) => {

    try {

        const authHeader = req.headers['authorization'];
        const userId = authHeader && authHeader.split(' ')[1];
        const query = 'SELECT * FROM users WHERE id = ?';

        if (!userId) return res.status(401).json({ message: 'Akses ditolak, silahkan login kembali' });

        // Cari user berdasarkan ID (Token sederhana adalah ID User)
        const [results] = await db.query(query, [userId]);
        if (results.length === 0) {
            return res.status(401).json({
                message: 'User tidak ditemukan'
            });
        }
        req.user = results[0];
        next();

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "error memanggil token"
        });
    };




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