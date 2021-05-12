import axios from 'axios'
import { DateClockService } from './dateClock.service'

const DAILY_API_KEY = process.env.REACT_APP_DAILY_API_KEY

type Properties = { user_name: string }

export class ConferenceService {
  static instance = axios.create({
    baseURL: 'https://api.daily.co/v1/',
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`
    }
  })

  static async makeConferenceRoom(preentry = 1) {
    const time = DateClockService.currentRoundStartEnd()
    const nbf = this.calcNbf(time.roundStartTime, preentry)
    const exp = this.calcExp(time.roundEndTime)
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
    return {
      roomUrl: response.data.url,
      start: new Date(time.roundStartTime),
      end: new Date(time.roundEndTime)
    }
  }

  static async getToken(properties: Properties) {
    const response = await this.instance.post('meeting-tokens', { properties })
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
