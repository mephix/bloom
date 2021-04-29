import firebase from "firebase/app";
import "firebase/firestore";
import { firebaseConfig } from './DO_NOT_COMMIT.js'
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const time = firebase.firestore.Timestamp;
