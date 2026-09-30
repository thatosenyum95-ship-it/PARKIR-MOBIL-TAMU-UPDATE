# Security next step

This v2.6 source keeps the existing admin password flow so the current app remains usable. That password/localStorage flag is **not** a real security boundary.

Before production distribution, replace the client-side admin login with Firebase Authentication (email/password) plus a Firestore `admins/{uid}` role document, then enforce the same role in Firestore Rules. App Check/Play Integrity should also be enabled and enforced after testing.

Do not put Firebase Admin service-account keys in the APK.
