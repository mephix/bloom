const firestoreApi = require('../apis/firestoreApi.js')

setAllHereFalse()

async function setAllHereFalse() {
  // Get who's here
  querySnapshot = await firestoreApi.db.collection('Users')
    .where('here', '==', true).get()

  // Set them to not here
  const batch = firestoreApi.db.batch()
  querySnapshot.forEach(doc => {
    batch.update(doc.ref, { here: false })
  })  
  return batch.commit()
}
