// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app"
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIacQxpSGF15VS0dvl_uRSEJHgMp-1XIA",
  authDomain: "campus-discovery-cdb51.firebaseapp.com",
  projectId: "campus-discovery-cdb51",
  storageBucket: "campus-discovery-cdb51.appspot.com",
  messagingSenderId: "576709577866",
  appId: "1:576709577866:web:8cf0adce19cf4c2b89f173",
  measurementId: "G-QFHHVV2SFM"
};

// Initialize Firebase

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.setPersistence('none');

const db = firebase.firestore();

export { auth, db } 