const { db } = require('./firestoreApi')

async function main() {
  let query = await db.collection('Users-dev').where('here', '==', true).get()
  let usersHere = query.docs
  const setUsersHere = usersHere.map(async user => {
    await db.collection('Users-dev').doc(user.id).update({ here: false })
  })
  await Promise.all(setUsersHere)
}

main()
