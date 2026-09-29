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
  { schedule: "every 1 minutes", timeZone: "Asia/Jakarta", region: "asia-southeast2" },
  async () => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setHours(10, 0, 0, 0);
    if (now < cutoff) return null;
    const snapshot = await db.collection("parkir").where("status", "==", "Masuk").get();
    if (snapshot.empty) return null;
    const batch = db.batch();
    snapshot.forEach(docSnap => batch.update(docSnap.ref, { status: "Keluar", waktuKeluar: Date.now() }));
    await batch.commit();
    return null;
  }
);
