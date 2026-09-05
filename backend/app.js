const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const authControllers = require('./controllers/authControllers');
const barangController = require('./controllers/barangController');
const peminjamanController = require('./controllers/peminjamanController');
const userController = require('./controllers/userController');
const logController = require('./controllers/logController');
const { logActivity } = require('./services/logService'); // Impor logActivity
const { verifyToken, authorizeRoles } = require('./config/auth');

//using routes
const pageRoutes = require("./routes/pageRoutes");
const barangRoutes = require("./routes/barangRoutes"); //still unused

//Frontend static middleware
const path = require("path");
app.use(express.static(path.join(__dirname, '../frontend')));

//Page Route
app.use("/", pageRoutes);
app.use("/barang", barangRoutes);

// Auth Route
app.post('/auth/login', authControllers.login);

// Barang Routes
app.get('/api/barang', verifyToken, barangController.getAllBarang);
app.post('/api/barang', verifyToken, authorizeRoles('admin', 'petugas'), barangController.createBarang);
app.put('/api/barang/:id', verifyToken, authorizeRoles('admin', 'petugas'), barangController.updateBarang);
app.delete('/api/barang/:id', verifyToken, authorizeRoles('admin', 'petugas'), barangController.deleteBarang);

// Peminjaman Routes
app.get('/api/peminjaman', verifyToken, peminjamanController.getAllPeminjaman);
app.post('/api/peminjaman', verifyToken, peminjamanController.ajukanPeminjaman);
app.put('/api/peminjaman/:id/approve', verifyToken, authorizeRoles('admin', 'petugas'), peminjamanController.approvePeminjaman);
//app.put('/api/peminjaman/:id/tolak', verifyToken, authorizeRoles('admin', 'petugas'), peminjamanController.tolakPeminjaman);
//app.put('/api/peminjaman/:id/kembalikan', verifyToken, peminjamanController.kembalikanBarang);

// Stats & Logs (Stubs untuk melengkapi permintaan frontend)
app.get('/api/stats', verifyToken, async(req, res) => {
    try {
        const query = `
            SELECT
                (SELECT COUNT(*) FROM barang) AS totalBarang,
                (SELECT SUM(jumlah_tersedia) FROM barang) AS barangTersedia,
                (SELECT COUNT(*) FROM barang WHERE kondisi = 'rusak') AS barangRusak,
                (SELECT COUNT(*) FROM peminjaman WHERE status = 'menunggu') AS peminjamanMenunggu
        `;

        const [results] = await db.query(query);

        res.json(results[0]);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Gagal mengambil statistik"
        });
    }
});
app.get('/api/user/stats', verifyToken, userController.getUserStats);
app.post('/api/user/change-password', verifyToken, userController.changePassword);
app.get('/api/log-aktivitas', verifyToken, authorizeRoles('admin'), logController.getLogs);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});