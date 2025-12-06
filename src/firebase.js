
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDkl6Qvlkggg_Hr9xaZ7AsQ-LLUf4Fnm6A",
  authDomain: "tp2appweb2-35f8c.firebaseapp.com",
  projectId: "tp2appweb2-35f8c",
  storageBucket: "tp2appweb2-35f8c.firebasestorage.app",
  messagingSenderId: "1011552424426",
  appId: "1:1011552424426:web:52b29fe00aaf021b6fe293",
  measurementId: "G-T3Y4V6J4Y8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app)
const db = getFirestore(app);


export { storage, db, auth }