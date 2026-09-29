# PARKIR MOBIL TAMU — Security Setup

## Admin

Admin tidak lagi memakai password yang ditanam di JavaScript.

1. Aktifkan **Email/Password** di Firebase Authentication.
2. Buat satu akun admin.
3. Ambil UID akun tersebut.
4. Di Firestore buat dokumen `admins/{UID}`.
5. Isi `role: "admin"`.

Aplikasi memeriksa dokumen tersebut sebelum menampilkan panel admin. Firestore Rules tetap menjadi pengaman sebenarnya untuk operasi tulis.

## Notifications

Cloud Functions:
- `sendAnnouncementPush`: Firestore `pengumuman/{docId}` → FCM topic `parkir_semua`.
- `autoCheckoutAtTen`: mengubah kendaraan berstatus `Masuk` menjadi `Keluar` setelah 10:00 WIB.

Deploy:
`firebase deploy --project parkir-mobil --only firestore:rules,functions`

Scheduled Functions dapat memerlukan billing/Blaze sesuai konfigurasi Firebase.

## Icon

Build **harus gagal** jika `assets/icon.png` tidak ada. Tidak ada fallback icon agar icon CEK VAR tidak pernah diam-diam terganti.
