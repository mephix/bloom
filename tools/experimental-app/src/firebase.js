import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgNTDmX1h96iiRR8sveNvzLFHzCqrJrQg",
  authDomain: "bloom-dating.firebaseapp.com",
  databaseURL: "https://bloom-dating.firebaseio.com",
  projectId: "bloom-dating",
  storageBucket: "bloom-dating.appspot.com",
  messagingSenderId: "671960082645",
  appId: "1:671960082645:web:a7867703decb3b8bc19a5c",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const time = firebase.firestore.Timestamp;
