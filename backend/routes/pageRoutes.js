const express = require("express");
const router = express.Router();

const pageController = require("../controllers/pageControllers.js");

router.get("/", (req, res) => {
    res.redirect("/login");
});
router.get("/login", pageController.login);
router.get("/dashboard", pageController.dashboard);
router.get("/barang", pageController.barang);
router.get("/peminjaman", pageController.peminjaman);
router.get("/laporan", pageController.laporan);
router.get("/log-aktivitas", pageController.log_aktivitas);
router.get("/profil", pageController.profil);

module.exports = router;