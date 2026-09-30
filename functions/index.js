const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const TOPIC = "parkir_semua";
const CHANNEL_ID = "pengumuman_fcm_v3";

exports.sendAnnouncementPush = onDocumentCreated("pengumuman/{docId}", async (event) => {
  const data = event.data?.data();
  if (!data || !data.isi) {
    logger.info("Pengumuman tanpa isi, dilewati.");
    return;
  }

  const text = String(data.isi).trim();
  if (!text) return;

  const message = {
    topic: TOPIC,
    notification: {
      title: "📢 Pengumuman Parkir",
      body: text
    },
    android: {
      priority: "high",
      notification: {
        channelId: CHANNEL_ID,
        sound: "notif",
        defaultSound: false,
        defaultVibrateTimings: true,
        notificationPriority: "PRIORITY_HIGH"
      }
    },
    data: {
      type: "pengumuman",
      docId: event.params.docId,
      body: text
    }
  };

  const id = await getMessaging().send(message);
  logger.info("FCM pengumuman terkirim", { id, docId: event.params.docId });
  return id;
});

exports.autoCheckoutAtTen = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "Asia/Jakarta",
    region: "asia-southeast2"
  },
  async () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    const hour = Number(parts.find(p => p.type === "hour")?.value || 0);
    if (hour < 10) return;

    const snapshot = await db.collection("parkir")
      .where("status", "==", "Masuk")
      .get();

    if (snapshot.empty) return;

    const batch = db.batch();
    let count = 0;

    snapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        status: "Keluar",
        waktuKeluar: Date.now()
      });
      count++;
    });

    await batch.commit();
    logger.info("Auto checkout server-side selesai", { count });
  }
);
