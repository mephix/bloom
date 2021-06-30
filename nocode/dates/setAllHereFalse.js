const firestoreApi = require('../apis/firestoreApi.js')

setAllHereFalse()

async function setAllHereFalse() {
  const USERS = 'Users-dev'

  // Get who's here
  querySnapshot = await firestoreApi.db.collection(USERS)
    .where('here', '==', true).get()

  // Set them to not here
  const batch = firestoreApi.db.batch()
  querySnapshot.forEach(doc => {
    batch.update(doc.ref, { here: false })
  })  
  return batch.commit()
}
