// Functions for interacting with Firebase.
// Mostly functions that can be called async and don't involve
// setting state in React.

import { db, time } from '../config/firebase';

async function updateUser(email: string, params: any): Promise<void> {
  await db.collection('Users').doc(email).update(params);
}

async function updateDateObject(id: string, params: any): Promise<void> {
  await db.collection('Dates').doc(id).update(params);
}

async function getProspect() {
  let prospect = await db.collection('Prospects').doc('john.prins@gmail.com').get();
  console.log(prospect.data());
}

async function nextProspect(email: string): Promise<void> {
  let prospect = (await db.collection('Prospects').doc(email).get()).data();
  db.collection('Nexts').doc(email).set({prospect});
  db.collection('Prospects').doc(email).delete();
}

async function heartProspect(email: string): Promise<void> {
  let prospect = (await db.collection('Prospects').doc(email).get()).data();
  db.collection('Likes').doc(email).set({prospect});
  db.collection('Prospects').doc(email).delete();
}

async function inviteProspect(email: string): Promise<void> {
  let prospect = (await db.collection('Prospects').doc(email).get()).data();
  db.collection('Likes').doc(email).set({prospect});
  db.collection('Dates').doc().set({
    for: email,
    with: ''
  });
  db.collection('Prospects').doc(email).delete();
}

async function nextDate(email: string): Promise<void> {
  let prospect = (await db.collection('Prospects').doc(email).get()).data();
  db.collection('Nexts').doc(email).set({prospect});
  db.collection('Dates').doc().set({
    for: email,
    with: '',
    accepted: false
  });
  db.collection('Prospects').doc(email).delete();
}

export {
  updateUser,
  updateDateObject,
  nextProspect,
  heartProspect,
  inviteProspect,
  nextDate,
  getProspect
};
