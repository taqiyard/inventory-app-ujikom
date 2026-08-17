//not used yet

const express = require('express');
const app = express();
const cors = require('cors');

const barangRoutes = require('./routes/barangRoutes');

app.use(cors());
app.use(express.json());


// pakai routes
app.use('/barang', barangRoutes);
app.use('/auth', require('./routes/authRoutes'));
app.use('/barang', require('./routes/barangRoutes'));

app.listen(3000, () => {
    console.log('Server berjalan di port 3000');
});