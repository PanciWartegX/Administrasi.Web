import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsiESCFtIaXEGTSv0KGDKWVaYdZymZ-lA",
  authDomain: "web-foksi-9acb9.firebaseapp.com",
  projectId: "web-foksi-9acb9",
  storageBucket: "web-foksi-9acb9.firebasestorage.app",
  messagingSenderId: "811305636316",
  appId: "1:811305636316:web:e1bd04f39bc192b9203f19",
  measurementId: "G-MPSB02XT5P"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
