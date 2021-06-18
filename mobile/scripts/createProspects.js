const { db } = require('./firestoreApi')
const ids = [
  '87d2hovnQ8ZTvZDVJaOeTFkREtL2',
  '9Z3PHTpJWOhxi2YAnpapP3hHL652',
  'sltYAEsWs8hHIS3M208foDWMoQm2'
]

const PROSPECTS_COLLECTION = 'Prospects-dev'
const USERS_COLLECTION = 'Users-dev'

async function main() {
  console.log('Creating prospects...')
  for (const userId of ids) {
    // console.log(userId)
    const shuffledIds = shuffle(ids)
    for (const someId of shuffledIds) {
      if (userId === someId) continue
      console.log(`Adding ${someId} to ${userId}`)
      await addToProspects(userId, someId)
    }
  }
  console.log('Finished')
}

async function addToProspects(to, id) {
  const ref = db.collection(PROSPECTS_COLLECTION).doc(to)
  const userRef = db.collection(USERS_COLLECTION).doc(id)
  const prospectsDoc = await ref.get()
  const prospectsData = prospectsDoc.data()
  const prospects = prospectsData.prospects || []
  ref.update({ prospects: [userRef, ...prospects] })
}

function shuffle(arr) {
  const array = [...arr]
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex]
    ]
  }

  return array
}

main()
