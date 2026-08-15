const db = require('../config/db');

exports.getLogs = (req, res) => {
    const { page = 1, user_id, aktivitas } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;

    let query = 'SELECT l.*, u.name as user_name FROM log_aktivitas l JOIN users u ON l.user_id = u.id WHERE 1=1';
    let params = [];

    if (user_id) {
        query += ' AND l.user_id = ?';
        params.push(user_id);
    }
    if (aktivitas) {
        query += ' AND l.aktivitas = ?';
        params.push(aktivitas);
    }

    query += ' ORDER BY l.waktu DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json(err);

        db.query('SELECT COUNT(*) as total FROM log_aktivitas', (err, countRes) => {
            if (err) return res.status(500).json(err);
            const total = countRes[0].total;
            res.json({
                logs: results,
                totalPages: Math.ceil(total / limit)
            });
        });
    });
};