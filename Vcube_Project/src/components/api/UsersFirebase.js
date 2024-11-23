// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyDQDiQQgZTpgK_yYPt3bO7fQZa6HNmVFH8",
  authDomain: "my-api-xei9yl.firebaseapp.com",
  projectId: "my-api-xei9yl",
  storageBucket: "my-api-xei9yl.appspot.com",
  messagingSenderId: "58137323797",
  appId: "1:58137323797:web:177e700f9365e005db611c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const db=getFirestore(app)
export default app;