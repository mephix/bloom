// Services for interacting with Firebase
import { db, time } from '../config/firebase';

async function getUser(email: string): Promise<any> {
  return await db.collection('Users').doc(email);
}

async function updateUser(email: string, params: any): Promise<void> {
  await db.collection('Users').doc(email).update(params);
}

async function updateDateObject(id: string, params: any): Promise<void> {
  await db.collection('Dates').doc(id).update(params);
}

function getCards(email: string): any[] {
  let cards = [];

  cards.push(getActiveDates(email));
  cards.push(getActiveProspects(email));

  return cards;
}

function getActiveDates(email: string): any {
  return db
    .collection('Dates')
    .where('for', '==', email)
    .where('active', '==', true)
    .where('end', '>', time.now())
    .onSnapshot((querySnapshot) => {
      return querySnapshot.docs.filter((result) => {
        result.data().start.seconds < time.now().seconds;
      });
    });
}

function getActiveProspects(email: string): any {
  return db
    .collection('Prospects')
    .where('for', '==', email)
    .onSnapshot((querySnapshot) => {
      return querySnapshot.docs;
    });
}

export default {
  getUser,
  updateUser,
  updateDateObject,
  getCards
};
