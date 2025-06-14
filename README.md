# ✈️ Sundaero Line Fleet Management

Fleet management system statis berbasis HTML + JS + Supabase

## 📂 Struktur Project

```
├── index.html
├── dashboard.html
├── fleet.html
├── input.html
├── import.html
├── hub-management.html
├── report.html
├── history.html
├── route.html
├── logout.html
├── 404.html              # redirect ke index jika tidak ditemukan
├── service-worker.js     # opsional, cache offline
├── assets/
│   ├── css/              # per-page styling
│   ├── js/               # per-page logic + auth/common
│   ├── js/utils/         # bonus.js, helper
│   ├── data/             # airports.json, manifest.json
│   └── img/              # favicon.ico
```

## ⚙️ Teknologi

* HTML, CSS (dark theme, clean UI)
* Vanilla JavaScript (modular per halaman)
* Supabase (PostgreSQL + REST API)
* Chart.js, jsPDF, PapaParse

## 🔐 Login Manual

* Username: `sundaero`
* Password: `sundaero!`
* Autentikasi via `localStorage.isLoggedIn`

## 📋 Fitur Utama

* Dashboard statistik fleet, hub, idle, routes
* Tambah aircraft dengan autogen REG dan autocomplete ICAO
* Import CSV untuk batch fleet entry
* Laporan PDF generator (download langsung)
* History aktivitas tersimpan di browser
* Hub management CRUD

## 🔧 Bonus

* Favicon custom & manifest PWA-ready
* Protected route: redirect otomatis jika belum login
* Modular script & asset loading (`common-init.js`)
* Filter/search realtime di fleet.html
* 404 page auto-redirect
* Offline support via `service-worker.js`
* Toast UI notifikasi
* Theme toggle (dark/light)
* Export CSV dari fleet table
* Sortable table per kolom
* Bulk delete fleet entry (checkbox)
* Tombol edit fleet
* Auto refresh + sync data Supabase
* Performa boost via local cache fallback

## 🚀 Deploy via GitHub Pages

1. Upload semua file ke repositori GitHub
2. Aktifkan Pages via `Settings > Pages`
3. Pilih branch: `main`, folder: `/ (root)`
4. Akses via `https://reyzae.github.io/sl-fleet-v1/`

## 📄 License

MIT (open use & customization allowed)
