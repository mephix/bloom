import { db, PROSPECTS_COLLECTION, USERS_COLLECTION } from 'firebaseService'
import user from 'state/user'

const ids: string[] = [
  'P1AXzbNy6aUWc2zmmwTluscdUPo2',
  'Gqe3l00zGPRAhTXEEhwdAimUjOm1',
  'n1m7d9h3LKZbyZYmO0rG7p0o8un1'
]

export class ProspectsService {
  static addTestingProspects(quantity: number) {
    const userRefs = []
    for (let i = 0; i < quantity; i++) {
      for (const id of ids) {
        const userRef = db.collection(USERS_COLLECTION).doc(id)
        userRefs.push(userRef)
      }
    }
    const prospectsRef = db.collection(PROSPECTS_COLLECTION).doc(user.id)

    prospectsRef.update({ prospects: userRefs })
  }
}
