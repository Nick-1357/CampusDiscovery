import firebase from "firebase/compat/app"
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKqN3EwJoa0s7iqRuekHnLFYn2Ft4VK2k",
  authDomain: "campusprototype.firebaseapp.com",
  projectId: "campusprototype",
  storageBucket: "campusprototype.appspot.com",
  messagingSenderId: "9862705095",
  appId: "1:9862705095:web:5665b137379a04385f73e2",
  measurementId: "G-LD8WKGK025"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.setPersistence('none');

const db = firebase.firestore();

export { auth, db }