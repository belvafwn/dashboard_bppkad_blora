# Website Realisasi APBD BPPKAD Blora

Website untuk menampilkan dan mengelola data realisasi APBD Kabupaten Blora tahun 2017-2024.

## 📋 Fitur Website

### User Mode
- **Dashboard Utama**: Ringkasan data semua kategori dengan grafik
- **Halaman Kategori**: Data detail untuk Pendapatan, Pembelanjaan, dan Pembiayaan
- **Visualisasi**: Grafik bar untuk kategori dan subkategori
- **Export Data**: Export data ke format CSV
- **Responsive Design**: Dapat diakses di desktop dan mobile

### Admin Mode
- **Input Data**: Tambah data baru dengan validasi form
- **Hapus Data**: Hapus data individual atau bulk delete
- **Import/Export**: Import CSV dan export data lengkap
- **Preview Data**: Preview sebelum menyimpan data
- **Manajemen Data**: Refresh dan monitoring statistik

## 🏗️ Struktur Project

```
/ (root)
├── index.html              # Halaman utama
├── pendapatan.html         # Halaman data pendapatan
├── pembelanjaan.html       # Halaman data pembelanjaan
├── pembiayaan.html         # Halaman data pembiayaan
├── admin.html              # Panel administrator
├── css/
│   └── style.css           # Stylesheet utama
├── js/
│   ├── script.js           # Fungsi utama website
│   └── supabase.js         # Koneksi database
└── README.md               # Dokumentasi (file ini)
```

## 🛠️ Setup dan Konfigurasi

### 1. Persiapan Database Supabase

1. Buat akun di [Supabase](https://supabase.com)
2. Buat project baru
3. Buat tabel dengan struktur berikut:

```sql
CREATE TABLE apbd_data (
    id SERIAL PRIMARY KEY,
    tahun INTEGER NOT NULL CHECK (tahun >= 2017 AND tahun <= 2024),
    kategori VARCHAR(50) NOT NULL CHECK (kategori IN ('Pendapatan', 'Pembelanjaan', 'Pembiayaan')),
    subkategori VARCHAR(200) NOT NULL,
    keterangan TEXT NOT NULL,
    nilai DECIMAL(15,2) NOT NULL CHECK (nilai >= 0),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_apbd_kategori ON apbd_data(kategori);
CREATE INDEX idx_apbd_tahun ON apbd_data(tahun);
CREATE INDEX idx_apbd_subkategori ON apbd_data(subkategori);

-- Row Level Security (opsional)
ALTER TABLE apbd_data ENABLE ROW LEVEL SECURITY;

-- Policy untuk read access (public)
CREATE POLICY "Allow public read access" ON apbd_data
    FOR SELECT USING (true);

-- Policy untuk write access (admin only - opsional)
CREATE POLICY "Allow admin write access" ON apbd_data
    FOR ALL USING (auth.role() = 'authenticated');
```

### 2. Konfigurasi Koneksi

Edit file `js/supabase.js` dan ganti:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

**Cara mendapatkan URL dan Key:**
1. Di dashboard Supabase, pilih project Anda
2. Klik **Settings** > **API**
3. Copy **URL** dan **anon public** key

### 3. Deploy ke GitHub Pages

1. **Upload ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/bppkad-blora.git
   git push -u origin main
   ```

2. **Aktifkan GitHub Pages:**
   - Di repository GitHub, klik **Settings**
   - Scroll ke bagian **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / **root**
   - Klik **Save**

3. **Website akan tersedia di:**
   `https://username.github.io/bppkad-blora/`

## 📊 Struktur Data

### Tabel: apbd_data

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Primary key |
| tahun | INTEGER | Tahun anggaran (2017-2024) |
| kategori | VARCHAR(50) | Pendapatan/Pembelanjaan/Pembiayaan |
| subkategori | VARCHAR(200) | Nama subkategori |
| keterangan | TEXT | Rincian/keterangan data |
| nilai | DECIMAL(15,2) | Nilai dalam rupiah |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

### Contoh Data:

```sql
INSERT INTO apbd_data (tahun, kategori, subkategori, keterangan, nilai) VALUES
(2024, 'Pendapatan', 'Pendapatan Asli Daerah', 'Pajak Daerah', 5000000000),
(2024, 'Pendapatan', 'Pendapatan Asli Daerah', 'Retribusi Daerah', 2500000000),
(2024, 'Pembelanjaan', 'Belanja Operasi', 'Belanja Pegawai', 15000000000),
(2024, 'Pembelanjaan', 'Belanja Modal', 'Belanja Aset Tetap', 8000000000),
(2024, 'Pembiayaan', 'Penerimaan Pembiayaan', 'Pencairan Dana Cadangan', 1000000000);
```

## 🎨 Kustomisasi

### Mengubah Warna Tema
Edit file `css/style.css`, cari variabel warna:
```css
/* Warna primer */
background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);

/* Warna sekunder */
color: #2c5282;
```

### Menambah Validasi Data
Edit file `js/supabase.js`, fungsi `validateDataInput()`:
```javascript
function validateDataInput(dataObj) {
    // Tambah validasi custom di sini
}
```

### Mengubah Format Currency
Edit file `js/script.js`, fungsi `formatCurrency()`:
```javascript
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}
```

## 🔧 Teknologi Yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js v3.9.1
- **Hosting**: GitHub Pages
- **Styling**: CSS Grid, Flexbox, Responsive Design

## 📱 Responsive Design

Website otomatis menyesuaikan dengan:
- **Desktop**: Layout penuh dengan sidebar
- **Tablet**: Layout grid yang responsif  
- **Mobile**: Stack layout dengan menu collapsed

## 🛡️ Keamanan

### Data Validation
- Validasi input di frontend dan backend
- Sanitasi data sebelum insert
- Type checking untuk semua field

### Database Security
- Row Level Security (RLS) enabled
- Policy-based access control
- Input parameter validation

## 📈 Performance

### Optimasi Loading
- Lazy loading untuk chart
- Pagination untuk tabel data besar
- Caching untuk query yang sering diakses

### Best Practices
- Destroy chart instances untuk mencegah memory leak
- Error handling yang comprehensive
- Loading states untuk UX yang baik

## 🐛 Troubleshooting

### Error Koneksi Database
```javascript
// Cek apakah Supabase URL dan key sudah benar
console.log('Supabase URL:', SUPABASE_URL);
console.log('Supabase Key:', SUPABASE_ANON_KEY);
```

### Chart Tidak Muncul
```javascript
// Pastikan Chart.js sudah load
if (typeof Chart === 'undefined') {
    console.error('Chart.js not loaded');
}
```

### Data Tidak Tersimpan
1. Cek koneksi internet
2. Periksa console browser untuk error
3. Cek policy Supabase untuk write access
4. Validasi format data input

## 📞 Support

Untuk pertanyaan dan dukungan:
- **Email**: support@bppkadblora.go.id
- **Telepon**: (0296) 531234
- **Alamat**: Jl. Pemuda No. 1, Blora, Jawa Tengah

## 📝 Changelog

### Version 1.0.0 (2024)
- ✅ Sistem CRUD lengkap
- ✅ Visualisasi data dengan Chart.js
- ✅ Export/Import CSV
- ✅ Responsive design
- ✅ Admin panel dengan preview
- ✅ Validasi form real-time

### Planned Features
- 🔄 Backup/restore database
- 🔄 User authentication
- 🔄 Audit trail
- 🔄 Advanced filtering
- 🔄 Print reports

## 📄 License

© 2024 BPPKAD Kabupaten Blora. All rights reserved.

---

**Developed for BPPKAD Kabupaten Blora**  
*Sistem Informasi Realisasi APBD*
