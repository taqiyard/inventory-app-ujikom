const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const authController = require('./controllers/authController');
const barangController = require('./controllers/barangController');
const peminjamanController = require('./controllers/peminjamanController');
const userController = require('./controllers/userController');
const logController = require('./controllers/logController');
const { logActivity } = require('./services/logService'); // Impor logActivity
const { verifyToken, authorizeRoles } = require('./config/auth');

//using routes
const pageRoutes = require("./routes/pageRoutes");
const barangRoutes = require("./routes/barangRoutes");

//Frontend static middleware
const path = require("path");
app.use(express.static(path.join(__dirname, '../frontend')));

//Page Route
app.use("/", pageRoutes);
app.use("/barang", barangRoutes);

// Auth Route
app.post('/auth/login', authController.login);

// Barang Routes
app.get('/api/barang', verifyToken, barangController.getAllBarang);
app.post('/api/barang', verifyToken, authorizeRoles('admin', 'petugas'), barangController.createBarang);
app.put('/api/barang/:id', verifyToken, authorizeRoles('admin', 'petugas'), barangController.updateBarang);
app.delete('/api/barang/:id', verifyToken, authorizeRoles('admin', 'petugas'), barangController.deleteBarang);

// Peminjaman Routes
app.get('/api/peminjaman', verifyToken, peminjamanController.getAllPeminjaman);
app.post('/api/peminjaman', verifyToken, peminjamanController.ajukanPeminjaman);
app.put('/api/peminjaman/:id/approve', verifyToken, authorizeRoles('admin', 'petugas'), peminjamanController.approvePeminjaman);
app.put('/api/peminjaman/:id/tolak', verifyToken, authorizeRoles('admin', 'petugas'), peminjamanController.tolakPeminjaman);
app.put('/api/peminjaman/:id/kembalikan', verifyToken, peminjamanController.kembalikanBarang);

// Stats & Logs (Stubs untuk melengkapi permintaan frontend)
app.get('/api/stats', verifyToken, (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM barang) as totalBarang,
            (SELECT SUM(jumlah_tersedia) FROM barang) as barangTersedia,
            (SELECT COUNT(*) FROM barang WHERE kondisi = 'rusak') as barangRusak,
            (SELECT COUNT(*) FROM peminjaman WHERE status = 'menunggu') as peminjamanMenunggu
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results[0]);
    });
});
app.get('/api/user/stats', verifyToken, userController.getUserStats);
app.post('/api/user/change-password', verifyToken, userController.changePassword);
app.get('/api/log-aktivitas', verifyToken, authorizeRoles('admin'), logController.getLogs);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});