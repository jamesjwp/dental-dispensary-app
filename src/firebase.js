import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgdj4ArhnOt3-N3VMzjWs7s0si-yW-Sws",
  authDomain: "dispensary-app-dcd10.firebaseapp.com",
  projectId: "dispensary-app-dcd10",
  storageBucket: "dispensary-app-dcd10.firebasestorage.app",
  messagingSenderId: "601463239089",
  appId: "1:601463239089:web:441b4d4d1888bb073c8d90"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const auth = getAuth(app);