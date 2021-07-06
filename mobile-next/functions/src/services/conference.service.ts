import axios from 'axios'
import { DateTime } from 'luxon'
import * as admin from 'firebase-admin'

const DAILY_API_KEY =
  '9c4e3a1da340dbd0c8407205f1379abe5aaaed4dd9ee0e95a730d97d0b5268d5'
const ISO_OPTIONS = { suppressMilliseconds: true, suppressSeconds: true }

export class ConferenceService {
  static instance = axios.create({
    baseURL: 'https://api.daily.co/v1/',
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`
    }
  })

  static async makeConferenceRoom(
    dateStartTimestamp: admin.firestore.Timestamp,
    dateEndTimestamp: admin.firestore.Timestamp,
    preentry = 1
  ) {
    const dateStartIso = DateTime.fromJSDate(dateStartTimestamp.toDate()).toISO(
      ISO_OPTIONS
    )
    const dateEndIso = DateTime.fromJSDate(dateEndTimestamp.toDate()).toISO(
      ISO_OPTIONS
    )
    const nbf = this.calcNbf(dateStartIso, preentry)
    const exp = this.calcExp(dateEndIso)
    const response = await this.instance.post('rooms', {
      privacy: 'public',
      properties: {
        nbf,
        exp,
        eject_at_room_exp: true,
        autojoin: true,
        enable_screenshare: false,
        enable_chat: false
      }
    })
    return response.data.url
  }

  static async getToken(name: string) {
    const response = await this.instance.post('meeting-tokens', {
      properties: { user_name: name }
    })
    const { token } = await response.data
    return token
  }

  private static calcNbf(startTime: string, preentry: number) {
    const startDateTimestamp = Math.floor(new Date(startTime).getTime() / 1000)
    const nbf = startDateTimestamp - preentry * 60
    return nbf
  }

  private static calcExp(endTime: string) {
    const endDateTimestamp = Math.floor(new Date(endTime).getTime() / 1000)
    const BUFFER = 3
    const exp = endDateTimestamp + BUFFER
    return exp
  }
}
