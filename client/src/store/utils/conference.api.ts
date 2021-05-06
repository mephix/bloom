import axios from 'axios'
import { DateTime } from 'luxon'

const DAILY_API_KEY = process.env.REACT_APP_DAILY_API_KEY
const ROUND_MINUTES = 15

export async function makeConferenceRoom(preentry = 1) {
  const time = currentRoundStartEnd()
  if (!time) return

  // console.log(timefire.fromDate(new Date(time.roundStartTime)))

  let nbf = calcNbf(time.roundStartTime, preentry)
  let exp = calcExp(time.roundEndTime)
  let response = await axios({
    url: 'https://api.daily.co/v1/rooms/',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DAILY_API_KEY}`
    },
    data: {
      privacy: 'public',
      properties: {
        nbf,
        exp,
        eject_at_room_exp: true,
        autojoin: true,
        enable_screenshare: false,
        enable_chat: false
      }
    }
  })
  return {
    roomUrl: response.data.url,
    start: new Date(time.roundStartTime),
    end: new Date(time.roundEndTime)
  }
}

function calcNbf(startTime: string, preentry: number) {
  const startDateTimestamp = Math.floor(new Date(startTime).getTime() / 1000)
  const nbf = startDateTimestamp - preentry * 60
  return nbf
}

function calcExp(endTime: string) {
  const endDateTimestamp = Math.floor(new Date(endTime).getTime() / 1000)
  const BUFFER = 3
  const exp = endDateTimestamp + BUFFER
  return exp
}

function currentRoundStartEnd() {
  const now = DateTime.now()
  const { minute, second, millisecond } = now.toObject()
  if (!minute || !second || !millisecond) return
  const elapsedMillis =
    (minute % ROUND_MINUTES) * 60000 + second * 1000 + millisecond
  const remainingMillis = ROUND_MINUTES * 60000 - elapsedMillis
  // `plus` and `minus` can accept a number of milliseconds.
  const roundStartTime = now
    .minus(elapsedMillis)
    .toISO({ suppressMilliseconds: true, suppressSeconds: true })
  const roundEndTime = now
    .plus(remainingMillis)
    .toISO({ suppressMilliseconds: true, suppressSeconds: true })
  return { roundStartTime, roundEndTime }
}

/*
 * example: properties = { user_name: 'John' }
 */
type Properties = { user_name: string }

export async function getToken(properties: Properties) {
  let url = 'https://api.daily.co/v1/meeting-tokens'
  let responsePromise = await axios.post(
    url,
    { properties },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`
      }
    }
  )
  let { token } = await responsePromise.data
  return token
}

// async function getRoom(roomId) {
//   let response = await axios({
//     url: `https://api.daily.co/v1/meetings?room=${roomId}`,
//     method: 'get',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${DAILY_API_KEY}`
//     }
//   })
//   return response
// }
