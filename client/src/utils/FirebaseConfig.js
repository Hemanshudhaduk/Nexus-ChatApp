// utils/FirebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB0ahZuEM9OKYO0DpDIu-k3yS_d3CJz3bQ",
  authDomain: "whatsapp-clone-89619.firebaseapp.com",
  projectId: "whatsapp-clone-89619",
  storageBucket: "whatsapp-clone-89619.firebasestorage.app",
  messagingSenderId: "1013401151503",
  appId: "1:1013401151503:web:d4569faff529d24e221b7a",
  measurementId: "G-EDYBBVTD8Y",
};

const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
