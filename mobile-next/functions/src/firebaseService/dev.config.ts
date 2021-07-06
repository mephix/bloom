import * as admin from 'firebase-admin'

const serviceAccount = require('../../credentials.json')

export function getDevConfig() {
  return {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://bloom-dating.firebaseio.com'
  }
}
