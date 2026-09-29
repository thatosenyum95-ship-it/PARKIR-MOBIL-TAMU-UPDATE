import { registerPlugin } from "@capacitor/core";
import { SpeechRecognition } from "@capgo/capacitor-speech-recognition";
import { SpeechSynthesis } from "@capgo/capacitor-speech-synthesis";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Camera } from "@capacitor/camera";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

const AppUpdater = registerPlugin("AppUpdater");

window.NativeAppPlugins = {
  SpeechRecognition,
  SpeechSynthesis,
  LocalNotifications,
  Camera,
  FirebaseMessaging,
  AppUpdater
};
