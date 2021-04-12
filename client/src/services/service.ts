// Functions for interacting with Firebase.
// Mostly functions that can be called async and don't involve
// setting state in React.

import firebase from "firebase/app";
import "firebase/firestore";
import { db, time } from '../config/firebase';

async function updateUser(email: string, params: any): Promise<void> {
  await db.collection('Users').doc(email).update(params);
}

async function updateDateObject(id: string, params: any): Promise<void> {
  await db.collection('Dates').doc(id).update(params);
}

async function nextProspect(email: string, prospect_email: string): Promise<void> {
  let prospects_ref = await db.collection('Prospects').doc(email);
  let nexts_ref = await db.collection('Nexts').doc(email);

  nexts_ref.update({
    nexts: firebase.firestore.FieldValue.arrayUnion(db.collection('Users').doc(prospect_email))
  });

  prospects_ref.update({
    prospects: firebase.firestore.FieldValue.arrayRemove(db.collection('Users').doc(prospect_email))
  });
}

async function heartProspect(email: string, prospect_email: string): Promise<void> {
  let prospects_ref = await db.collection('Prospects').doc(email);
  let likes_ref = await db.collection('Likes').doc(email);

  likes_ref.update({
    likes: firebase.firestore.FieldValue.arrayUnion(db.collection('Users').doc(prospect_email))
  });

  prospects_ref.update({
    prospects: firebase.firestore.FieldValue.arrayRemove(db.collection('Users').doc(prospect_email))
  });
}

async function nextDate(email: string, prospect_email: string, date_ref: string): Promise<void> {
  let prospects_ref = await db.collection('Prospects').doc(email);
  let nexts_ref = await db.collection('Nexts').doc(email);
  let prospect_user_ref = db.collection('Users').doc(prospect_email);

  nexts_ref.update({
    nexts: firebase.firestore.FieldValue.arrayUnion(prospect_user_ref)
  });

  prospects_ref.update({
    prospects: firebase.firestore.FieldValue.arrayRemove(prospect_user_ref)
  });

  db.collection('Dates').doc(date_ref).set({
    accepted: false,
    timeReplied: time.now()
  });
}

async function inviteProspect(email: string, prospect_email: string, date_ref: string): Promise<void> {
  let prospects_ref = await db.collection('Prospects').doc(email);
  let likes_ref = await db.collection('Likes').doc(email);
  let prospect_user_ref = db.collection('Users').doc(prospect_email);

  likes_ref.update({
    likes: firebase.firestore.FieldValue.arrayUnion(prospect_user_ref)
  });

  prospects_ref.update({
    prospects: firebase.firestore.FieldValue.arrayRemove(prospect_user_ref)
  });

  db.collection('Dates').doc(date_ref).set({
    accepted: true,
    timeReplied: time.now()
  });
}

export {
  updateUser,
  updateDateObject,
  nextProspect,
  heartProspect,
  inviteProspect,
  nextDate
};
