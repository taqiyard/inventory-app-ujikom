const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');

router.get('/getallbarang', barangController.getAllBarang);
router.post('/', barangController.createBarang);

module.exports = router;