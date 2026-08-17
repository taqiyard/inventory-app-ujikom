const path = require("path");

const login = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../../frontend/login.html")
    );
};

const dashboard = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../../frontend/index.html")
    );
};

const barang = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../../frontend/barang.html")
    );
};

const peminjaman = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../../frontend/peminjaman.html")
    );
};

const laporan = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../../frontend/laporan.html")
    );
};

const log_aktivitas = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../../frontend/log-aktivitas.html")
    );
};

const profil = (req, res) => {
    res.sendFile(
        path.join(__dirname, "../../frontend/profil.html")
    );
};


module.exports = {
    login,
    dashboard,
    barang,
    peminjaman,
    laporan,
    log_aktivitas,
    profil
};