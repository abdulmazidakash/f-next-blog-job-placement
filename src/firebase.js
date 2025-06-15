// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "minister-next-blog.firebaseapp.com",
  projectId: "minister-next-blog",
  storageBucket: "minister-next-blog.firebasestorage.app",
  messagingSenderId: "165882863676",
  appId: "1:165882863676:web:9f623db8ee2661a23c6339"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);