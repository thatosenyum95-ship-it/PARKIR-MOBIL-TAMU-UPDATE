const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

exports.sendAnnouncementPush = onDocumentCreated(
  { document: "pengumuman/{docId}", region: "asia-southeast2" },
  async (event) => {
    const data = event.data?.data();
    if (!data || typeof data.isi !== "string") return null;

    const body = data.isi.trim();
    if (!body) return null;

    return getMessaging().send({
      topic: "parkir_semua",
      notification: {
        title: "📢 Pengumuman Parkir",
        body
      },
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
      data: {
        type: "pengumuman",
        docId: event.params.docId
      }
    });
  }
);

exports.autoCheckoutAtTen = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "Asia/Jakarta",
    region: "asia-southeast2"
  },
  async () => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setHours(10, 0, 0, 0);

    if (now < cutoff) return null;

    const snap = await db
      .collection("parkir")
      .where("status", "==", "Masuk")
      .get();

    if (snap.empty) return null;

    const batch = db.batch();
    snap.forEach((item) => {
      batch.update(item.ref, {
        status: "Keluar",
        waktuKeluar: Date.now()
      });
    });

    await batch.commit();
    return null;
  }
);
