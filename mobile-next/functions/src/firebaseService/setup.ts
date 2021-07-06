import * as firebaseAdmin from 'firebase-admin'
import { getDevConfig } from './dev.config'

const config = getDevConfig()

firebaseAdmin.initializeApp(config)

export class FirebaseService {
  static db = firebaseAdmin.firestore()
  static time = firebaseAdmin.firestore.Timestamp
  static auth = firebaseAdmin.auth()
  static async getDataFromRef(ref: any) {
    const doc = await ref.get()
    return { ...doc.data(), id: ref.id } as any
  }
}

export const admin = firebaseAdmin
