// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSiqhU0ot9Hn9kp3J8qcwseayfCbhQnWE",
  authDomain: "e-comm-62705.firebaseapp.com",
  projectId: "e-comm-62705",
  storageBucket: "e-comm-62705.firebasestorage.app",
  messagingSenderId: "130052679504",
  appId: "1:130052679504:web:fb3b34a7d0a50d145d6e55",
  measurementId: "G-DV8B3TQL4D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);