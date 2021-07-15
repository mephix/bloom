const firestoreApi = require('../apis/firestoreApi.js')

setAllHereFalse()

async function setAllHereFalse() {
  const COLLECTION = 'UserStatuses'

  // Get who's here
  querySnapshot = await firestoreApi.db.collection(COLLECTION)
    .where('finished', '==', true).get()
  console.log(`Setting ${querySnapshot.docs.length} users here to not here.`)

  // Set them to not here
  const batch = firestoreApi.db.batch()
  querySnapshot.forEach(doc => {
    batch.update(doc.ref, {
      here: false,
      free: true,
      finished: false,
    })
  })  
  return batch.commit()
}
