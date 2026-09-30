const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore, getMessaging } = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");

initializeApp();
const db = getFirestore();

exports.sendAnnouncementPush = onDocumentCreated(
  { document: "pengumuman/{docId}", region: "asia-southeast2" },
  async (event) => {
    const data = event.data?.data();
    if (!data?.isi) return null;
    const text = String(data.isi).trim();
    if (!text) return null;
    return getMessaging().send({
      topic: "parkir_semua",
      notification: { title: "📢 Pengumuman Parkir", body: text },
      android: {
        priority: "high",
        notification: {
          channelId: "pengumuman_fcm_v3",
          sound: "notif",
          defaultSound: false,
          defaultVibrateTimings: true,
          notificationPriority: "PRIORITY_HIGH"
        }
      },
      data: { type: "pengumuman", docId: event.params.docId, body: text }
    });
  }
);

exports.autoCheckoutAtTen = onSchedule(
  { schedule: "every 1 minutes", timeZone: "Asia/Makassar", region: "asia-southeast2" },
  async () => {
    // Pontianak uses WITA (Asia/Makassar). Do not rely on the server's
    // runtime timezone when deciding whether the 10:00 cutoff has passed.
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Makassar",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());

    const hour = Number(parts.find(p => p.type === "hour")?.value || 0);
    const minute = Number(parts.find(p => p.type === "minute")?.value || 0);
    if (hour < 10) return null;

    const snapshot = await db.collection("parkir").where("status", "==", "Masuk").get();
    if (snapshot.empty) return null;

    const batch = db.batch();
    const waktuKeluar = Date.now();
    snapshot.forEach(docSnap => {
      batch.update(docSnap.ref, { status: "Keluar", waktuKeluar });
    });
    await batch.commit();
    return null;
  }
);
