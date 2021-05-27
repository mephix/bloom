import axios from 'axios'

const DAILY_API_KEY = process.env.REACT_APP_DAILY_API_KEY

type Properties = { user_name: string }

export class ConferenceService {
  static instance = axios.create({
    baseURL: 'https://api.daily.co/v1/',
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`
    }
  })

  static async makeConferenceRoom(
    dateStartTime: string,
    dateEndTime: string,
    preentry = 1
  ) {
    // const time = DateClockService.currentRoundStartEnd()
    const nbf = this.calcNbf(dateStartTime, preentry)
    const exp = this.calcExp(dateEndTime)
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
