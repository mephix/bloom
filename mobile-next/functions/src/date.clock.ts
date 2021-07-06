import * as functions from 'firebase-functions'
import { DateClockService } from './services/date.clock.service'

export const getDateNightData = functions.https.onCall(async () => {
  return await DateClockService.getDateNightData()
})
