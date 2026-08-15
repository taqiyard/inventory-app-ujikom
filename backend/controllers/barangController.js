const db = require('../config/db');
const { logActivity } = require('../services/logService');

// GET semua barang dengan filter
exports.getAllBarang = (req, res) => {
    const { kategori, search } = req.query;
    let query = 'SELECT * FROM barang WHERE 1=1';
    let params = [];

    if (kategori) {
        query += ' AND kategori = ?';
        params.push(kategori);
    }
    if (search) {
        query += ' AND nama_barang LIKE ?';
        params.push(`%${search}%`);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
};

// POST tambah barang
exports.createBarang = (req, res) => {
    const { nama_barang, kategori, jumlah_total, kondisi, lokasi } = req.body;
    const jumlah_tersedia = jumlah_total; // Awalnya tersedia semua

    const query = `
    INSERT INTO barang (nama_barang, kategori, jumlah_total, jumlah_tersedia, kondisi, lokasi)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    db.query(query, [nama_barang, kategori, jumlah_total, jumlah_tersedia, kondisi, lokasi], (err, result) => {
        if (err) return res.status(500).json(err);
        logActivity(req.user.id, `Menambahkan barang baru: ${nama_barang} (ID: ${result.insertId})`);
        res.json({ message: 'Barang berhasil ditambahkan' });
    });
};

// PUT update barang
exports.updateBarang = (req, res) => {
    const { id } = req.params;
    const { nama_barang, kategori, jumlah_total, jumlah_tersedia, kondisi, lokasi } = req.body;

    const query = `
        UPDATE barang SET nama_barang=?, kategori=?, jumlah_total=?, jumlah_tersedia=?, kondisi=?, lokasi=?
        WHERE id=?
    `;

    db.query(query, [nama_barang, kategori, jumlah_total, jumlah_tersedia, kondisi, lokasi, id], (err, result) => {
        if (err) return res.status(500).json(err);
        logActivity(req.user.id, `Memperbarui barang: ${nama_barang} (ID: ${id})`);
        res.json({ message: 'Barang berhasil diperbarui' });
    });
};

// DELETE hapus barang
exports.deleteBarang = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM barang WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        logActivity(req.user.id, `Menghapus barang dengan ID: ${id}`);
        res.json({ message: 'Barang berhasil dihapus' });
    });
};