const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001; // Port akan diatur oleh cPanel

// 1. Mengaktifkan CORS
// Ini sangat penting agar Replit bisa berkomunikasi dengan backend ini
app.use(cors());

// 2. Membuat folder 'uploads' bisa diakses secara publik
// URL: https://domain-anda.com/uploads/avatars/namafile.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Konfigurasi Multer untuk penyimpanan file
const createStorage = (folder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, `uploads/${folder}`);
            // Membuat direktori jika belum ada
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            // Membuat nama file yang unik untuk menghindari duplikat
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    });
};

const uploadAvatar = multer({ storage: createStorage('avatars') });
const uploadBackground = multer({ storage: createStorage('backgrounds') });

// 4. Membuat Endpoint untuk Unggah Avatar
app.post('/upload-avatar', uploadAvatar.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
    }
    // Konstruksi URL publik
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
});

// 5. Membuat Endpoint untuk Unggah Latar Belakang
app.post('/upload-background', uploadBackground.single('background'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file yang diunggah.' });
    }
    // Konstruksi URL publik
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/backgrounds/${req.file.filename}`;
    res.json({ success: true, url: fileUrl });
});

// 6. Menjalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});
