const db = require('../config/db');

exports.getLogs = async(req, res) => {
    try {
        const { page = 1, user_id, aktivitas } = req.query;

        const limit = 10;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                l.*, 
                u.name AS user_name
            FROM log_aktivitas l
            JOIN users u ON l.user_id = u.id
            WHERE 1=1
        `;

        let countQuery = `
            SELECT COUNT(*) AS total
            FROM log_aktivitas l
            JOIN users u ON l.user_id = u.id
            WHERE 1=1
        `;

        let params = [];
        let countParams = [];

        if (user_id) {
            query += ' AND l.user_id = ?';
            countQuery += ' AND l.user_id = ?';

            params.push(user_id);
            countParams.push(user_id);
        }

        if (aktivitas) {
            query += ' AND l.aktivitas = ?';
            countQuery += ' AND l.aktivitas = ?';

            params.push(aktivitas);
            countParams.push(aktivitas);
        }

        query += ' ORDER BY l.waktu DESC LIMIT ? OFFSET ?';

        params.push(limit, offset);

        const [results] = await db.query(query, params);

        const [countResults] = await db.query(
            countQuery,
            countParams
        );

        const total = countResults[0].total;

        res.json({
            logs: results,
            totalPages: Math.ceil(total / limit),
            total
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Gagal mengambil log aktivitas"
        });
    }
};