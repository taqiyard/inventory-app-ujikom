const db = require('../config/db');
const { logActivity } = require('../services/logService');

exports.getAllPeminjaman = async(req, res) => {
    try {
        let query = `
        SELECT p.*, u.name as user_name, b.nama_barang as barang_nama, dp.jumlah
        FROM peminjaman p
        JOIN users u ON p.user_id = u.id
        JOIN detail_peminjaman dp ON p.id = dp.peminjaman_id
        JOIN barang b ON dp.barang_id = b.id
    `;
        let params = [];

        // Staf hanya dapat melihat peminjamannya sendiri
        if (req.user.role === 'staf') {
            query += ' WHERE p.user_id = ?';
            params.push(req.user.id);
        }

        const [results] = await db.query(query, params);
        res.json(results);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Gagal mengambil statistik"
        });

    };
};

exports.ajukanPeminjaman = async(req, res) => {
        const { tanggal_pinjam, tanggal_kembali, keterangan, barang } = req.body; // barang: [{id, jumlah}]
        const user_id = req.user.id;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const queryPeminjaman = `
            INSERT INTO peminjaman
            (user_id, tanggal_pinjam, tanggal_kembali, status, keterangan)
            VALUES (?, ?, ?, "menunggu", ?)
        `;

            const [result] = await connection.query(queryPeminjaman, [user_id, tanggal_pinjam, tanggal_kembali, keterangan]);

            const peminjamanId = result.insertId;

            const detailValues = barang.map(b => [peminjamanId, b.id, b.jumlah]);

            const queryDetail = `
            INSERT INTO detail_peminjaman
            (peminjaman_id, barang_id, jumlah)
            VALUES ?
        `;

            await connection.query(queryDetail, [detailValues]);

            await connection.commit();

            await logActivity(
                    user_id,
                    `Mengajukan peminjaman (ID: ${peminjamanId}) untuk barang: ${
                barang
                    .map(b => `${b.id} (${b.jumlah})`)
                    .join(', ')
                    }`
        );

        return res.json({
            message : "Peminjaman berhasil diajukan"
        }); 

    } catch (err) {

        await connection.rollback();

        console.error(err); 
        
        return res.status(500).json({
            message : "Gagal mengajukan peminjaman"
        });

    } finally {
        connection.release()
    };
}
    

exports.approvePeminjaman = async(req, res) => {
    const { id } = req.params;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [details] = await connection.query(
            `SELECT barang_id, jumlah
             FROM detail_peminjaman
             WHERE peminjaman_id = ?`, [id]
        );

        for (const d of details) {
            await connection.query(
                `UPDATE barang
                 SET jumlah_tersedia = jumlah_tersedia - ?
                 WHERE id = ?`, [d.jumlah, d.barang_id]
            );
            
        }

        await connection.commit();

        const [result] = await db.query(
            'SELECT user_id FROM peminjaman WHERE id = ?', [id]
        );
        

        if (result.length > 0) {
            logActivity(
                result[0].user_id,
                `Peminjaman (ID: ${id}) disetujui`
            );
        }

        res.json({
            message: "Peminjaman disetujui"
        });

    } catch (error) {
        await connection.rollback();

        console.error(error);

        res.status(500).json({
            message: "Gagal menyetujui peminjaman"
        });

    } finally {
        connection.release();
    }
};















/*
//pakai callback (error)

db.beginTransaction(err => {
        if (err) return res.status(500).json(err);

        const queryPeminjaman = 'INSERT INTO peminjaman (user_id, tanggal_pinjam, tanggal_kembali, status, keterangan) VALUES (?, ?, ?, "menunggu", ?)';
        db.query(queryPeminjaman, [user_id, tanggal_pinjam, tanggal_kembali, keterangan], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json(err));

            const peminjamanId = result.insertId;
            const detailValues = barang.map(b => [peminjamanId, b.id, b.jumlah]);

            const queryDetail = 'INSERT INTO detail_peminjaman (peminjaman_id, barang_id, jumlah) VALUES ?';
            db.query(queryDetail, [detailValues], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));

                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json(err));
                    logActivity(user_id, `Mengajukan peminjaman (ID: ${peminjamanId}) untuk barang: ${barang.map(b => b.id + ' (' + b.jumlah + ')').join(', ')}`);
                    res.json({ message: 'Peminjaman berhasil diajukan' });
                });
            });
        });
    });
};
exports.approvePeminjaman = (req, res) => {
    const { id } = req.params;

    db.beginTransaction(err => {
        // Ambil detail barang untuk dikurangi stoknya
        db.query('SELECT barang_id, jumlah FROM detail_peminjaman WHERE peminjaman_id = ?', [id], (err, details) => {
            if (err) return db.rollback(() => res.status(500).json(err));

            // Update status peminjaman
            db.query('UPDATE peminjaman SET status = "disetujui" WHERE id = ?', [id], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));

                // Kurangi stok barang tersedia
                const updates = details.map(d => {
                    return new Promise((resolve, reject) => {
                        db.query('UPDATE barang SET jumlah_tersedia = jumlah_tersedia - ? WHERE id = ?', [d.jumlah, d.barang_id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });

                Promise.all(updates)
                    .then(() => db.commit((err) => {
                        if (err) return db.rollback(() => res.status(500).json(err));

                        // Logging dilakukan setelah commit sukses
                        db.query('SELECT user_id FROM peminjaman WHERE id = ?', [id], (err, result) => {
                            if (!err && result.length > 0) logActivity(result[0].user_id, `Peminjaman (ID: ${id}) disetujui`);
                        });
                        res.json({ message: 'Peminjaman disetujui' });
                    }))
                    .catch(err => db.rollback(() => res.status(500).json(err)));
            });
        });
    });
};

exports.kembalikanBarang = (req, res) => {
    const { id } = req.params;

    db.beginTransaction(err => {
        db.query('SELECT barang_id, jumlah FROM detail_peminjaman WHERE peminjaman_id = ?', [id], (err, details) => {
            if (err) return db.rollback(() => res.status(500).json(err));

            db.query('UPDATE peminjaman SET status = "dikembalikan" WHERE id = ?', [id], (err) => {
                if (err) return db.rollback(() => res.status(500).json(err));

                const updates = details.map(d => {
                    return new Promise((resolve, reject) => {
                        db.query('UPDATE barang SET jumlah_tersedia = jumlah_tersedia + ? WHERE id = ?', [d.jumlah, d.barang_id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });

                Promise.all(updates)
                    .then(() => db.commit((err) => {
                        if (err) return db.rollback(() => res.status(500).json(err));

                        db.query('SELECT user_id FROM peminjaman WHERE id = ?', [id], (err, result) => {
                            if (!err && result.length > 0) logActivity(result[0].user_id, `Barang dari peminjaman (ID: ${id}) dikembalikan`);
                        });
                        res.json({ message: 'Barang berhasil dikembalikan' });
                    }))
                    .catch(err => db.rollback(() => res.status(500).json(err)));
            });
        });
    });
};

exports.tolakPeminjaman = (req, res) => {
    const { id } = req.params;
    db.query('UPDATE peminjaman SET status = "ditolak" WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json(err);
        // Ambil user_id dari peminjaman untuk logging
        db.query('SELECT user_id FROM peminjaman WHERE id = ?', [id], (err, result) => {
            if (!err && result.length > 0) logActivity(result[0].user_id, `Peminjaman (ID: ${id}) ditolak`);
        });
        res.json({ message: 'Peminjaman ditolak' });
    });
};

*/