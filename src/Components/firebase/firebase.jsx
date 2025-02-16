import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCYXcibxc2c8zgzrzu6aEdz43oA3RvbvLw",
  authDomain: "brainshub00.firebaseapp.com",
  projectId: "brainshub00",
  storageBucket: "brainshub00.firebasestorage.app",
  messagingSenderId: "305087704913",
  appId: "1:305087704913:web:dbf6b7df9bb553e3c26d70"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, onAuthStateChanged };
