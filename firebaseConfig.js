// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBFlkN9vzGxbU1AyJCJPgzYLIIho2cCUHU",
    authDomain: "my-web-app-f786b.firebaseapp.com",
    projectId: "my-web-app-f786b",
    storageBucket: "my-web-app-f786b.firebasestorage.app",
    messagingSenderId: "561812171510",
    appId: "1:561812171510:web:03dfce2fad73e9f1ec1ad7",
    measurementId: "G-FL0K1NXD1K"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
