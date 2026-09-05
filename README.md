# Project Context: Aplikasi Manajemen Inventaris Peralatan Kantor

## Deskripsi
Aplikasi ini adalah sistem manajemen inventaris peralatan kantor berbasis web yang digunakan oleh bagian logistik untuk mencatat, melacak, dan mengelola barang seperti komputer, proyektor, meja, dan perangkat kantor lainnya.

Aplikasi dibangun menggunakan:
- Backend: Node.js dengan Express
- Database: MySQL
- Frontend: HTML, CSS, JavaScript (Vanilla) + Bootstrap

## Menjalankan Backend

1. Salin `.env.example` menjadi `.env` dan isi `JWT_SECRET` dengan secret acak yang panjang.
2. Pastikan database `inventaris_ujikom` sudah dibuat dari `db.sql`.
3. Jalankan `npm install`, lalu `npm run dev` atau `npm start`.

Login tersedia di `POST /auth/login` dengan body JSON `{ "email": "...", "password": "..." }`.
Respons login mengandung JWT yang berlaku selama 1 jam. Kirim token tersebut untuk endpoint terlindungi:
`Authorization: Bearer <token>`.

---

## Role Pengguna
1. Admin
   - Melihat seluruh data inventaris
   - Melihat laporan peminjaman
   - Melihat log aktivitas

2. Petugas Inventaris
   - Menambah, mengedit, menghapus data barang
   - Mengelola peminjaman (approve / tolak / kembalikan)

3. Staf
   - Melihat daftar barang
   - Mengajukan peminjaman barang

---

## 🎨 UI Theme (Dark Mode Soft)

Aplikasi ini menggunakan tema **dark mode dengan nuansa abu-abu (soft dark)** agar nyaman di mata dan tetap modern.

### 🔹 Warna Utama
- Background utama: `#1E1E1E`
- Background card/container: `#252526`
- Background hover/section: `#2D2D30`

### 🔹 Warna Teks
- Teks utama: `#E4E4E4`
- Teks sekunder: `#C5C5C5`
- Teks non-aktif: `#9E9E9E`

### 🔹 Warna Aksen
- Primary (biru): `#4FC3F7`
- Success: `#66BB6A`
- Warning: `#FFA726`
- Danger: `#EF5350`

### 🔹 Border & Divider
- `#3C3C3C`

---

### 🎯 Tujuan Penggunaan Tema
- Mengurangi kelelahan mata saat penggunaan lama
- Memberikan tampilan modern dan profesional
- Meningkatkan kontras tanpa menggunakan warna hitam pekat

---

## Fitur Utama

### 1. Manajemen Barang
- Tambah barang
- Edit barang
- Hapus barang
- Cari barang
- Menampilkan status barang (tersedia / dipinjam / rusak)

### 2. Peminjaman Barang
- Input permintaan peminjaman
- Persetujuan peminjaman oleh petugas
- Pengembalian barang
- Status peminjaman (menunggu, disetujui, ditolak, dikembalikan)

### 3. Laporan
- Rekap data peminjaman
- Rekap data inventaris
- Ditampilkan dalam bentuk tabel atau grafik sederhana

---

## Struktur Database

### Tabel users
- id (PK)
- name
- email
- password
- role (admin, petugas, staf)
- created_at

### Tabel barang
- id (PK)
- nama_barang
- kategori
- jumlah_total
- jumlah_tersedia
- kondisi (baik, rusak)
- lokasi
- created_at
- updated_at

### Tabel peminjaman
- id (PK)
- user_id (FK)
- tanggal_pinjam
- tanggal_kembali
- status (menunggu, disetujui, ditolak, dikembalikan)
- keterangan
- created_at

### Tabel detail_peminjaman
- id (PK)
- peminjaman_id (FK)
- barang_id (FK)
- jumlah

### Tabel log_aktivitas (opsional)
- id (PK)
- user_id
- aktivitas
- waktu

---

## Relasi Database
- Satu user dapat memiliki banyak peminjaman
- Satu peminjaman dapat memiliki banyak detail barang
- Satu barang dapat muncul di banyak detail peminjaman

---

## API Endpoint (Backend Express)

### Barang
- GET /barang
- POST /barang
- PUT /barang/:id
- DELETE /barang/:id

### Peminjaman
- GET /peminjaman
- POST /peminjaman
- PUT /peminjaman/:id/approve
- PUT /peminjaman/:id/tolak
- PUT /peminjaman/:id/kembalikan

---

## Aturan Bisnis (Business Logic)
- Barang hanya bisa dipinjam jika jumlah_tersedia > 0
- Saat peminjaman disetujui → jumlah_tersedia berkurang
- Saat barang dikembalikan → jumlah_tersedia bertambah
- Status barang otomatis menyesuaikan (tersedia / dipinjam / rusak)

---

## Testing
- Menggunakan Jest untuk unit testing
- Menggunakan Supertest untuk pengujian endpoint API

---

## Tujuan Pengembangan
- Membantu pengelolaan inventaris secara terstruktur
- Meminimalisir kehilangan atau kesalahan pencatatan barang
- Mempermudah monitoring dan pelaporan inventaris