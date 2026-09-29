PARKIR MOBIL TAMU — UPDATE SYSTEM v1.1.0

Perubahan utama:
- index.html sekarang memeriksa update.json GitHub saat startup.
- current version: versionCode 2 / versionName 1.1.0.
- update hanya diterima melalui HTTPS.
- manifest dapat memuat packageName, versionCode, minimumVersionCode, mandatory, downloadUrl, sha256, dan changelog.
- AppUpdater native pada workflow mengunduh APK, membatasi sumber ke github.com, memverifikasi SHA-256 bila manifest menyediakan hash, memeriksa package name dan versionCode APK, lalu membuka installer Android.
- Android tetap dapat meminta izin pemasangan dari sumber ini. Silent install tidak dipaksakan.

Manifest saat ini di server tetap versi 1.0.0 sampai APK v1.1.0 selesai dibuild dan Release v1.1.0 sudah dibuat. Setelah itu update.json perlu diubah ke versionCode 2/versionName 1.1.0 dan downloadUrl Release v1.1.0. Untuk keamanan maksimum, isi sha256 dengan hash APK hasil build.
