// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOQpYINjEKNKiqnb9Gd551uOTaTxtP4Yg",
  authDomain: "vcube-project-11a91.firebaseapp.com",
  projectId: "vcube-project-11a91",
  storageBucket: "vcube-project-11a91.firebasestorage.app",
  messagingSenderId: "206820155774",
  appId: "1:206820155774:web:e63441b4d3ce1f1ab3132f",
  measurementId: "G-NSLJE47HM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const stdAuth=getAuth(app)
export const db=getFirestore(app)
export default app;