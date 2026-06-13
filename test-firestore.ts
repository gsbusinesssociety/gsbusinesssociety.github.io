import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzXZ0jH_7imDsmckFeidYsgn69a67T9Dk",
  authDomain: "gsbs-web.firebaseapp.com",
  projectId: "gsbs-web",
  storageBucket: "gsbs-web.firebasestorage.app",
  messagingSenderId: "374883194931",
  appId: "1:374883194931:web:a3e3ecc6ea64e32bcdab46"
};

const app = initializeApp(firebaseConfig);
// Force long polling to see if it makes a difference
const db = initializeFirestore(app, { experimentalForceLongPolling: true });

async function run() {
  console.log("Testing Firestore connection...");
  try {
    const ref = doc(db, "members", "ms7251@columbia.edu");
    const snap = await getDoc(ref);
    console.log("SUCCESS! Document exists:", snap.exists());
    if (snap.exists()) {
      console.log("Data:", snap.data());
    }
  } catch (err) {
    console.error("FIRESTORE ERROR:", err.message);
  }
  process.exit(0);
}

run();
