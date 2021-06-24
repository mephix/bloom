import * as firebaseAdmin from 'firebase-admin'

firebaseAdmin.initializeApp()

export class FirebaseService {
  static db = firebaseAdmin.firestore()
  static async getDataFromRef(ref: any) {
    const doc = await ref.get()
    return { ...doc.data(), id: ref.id } as any
  }
}

export const admin = firebaseAdmin
