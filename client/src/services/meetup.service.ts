import { FirebaseService } from 'firebaseService'
import { PARAMETERS_COLLECTION } from 'firebaseService/constants'
import { useEffect } from 'react'
import { store, useAppSelector } from 'store'
import { setAppState } from 'store/app'
import {
  selectCurrentDate,
  selectIsDateNight,
  setBlindDates,
  setDateNightInfo,
  shiftCards
} from 'store/meetup'
import { DateNightInfo, DateObject } from 'store/meetup/types'
import { selectFinished, selectUserFree, selectUserHere } from 'store/user'
import { setTimeout } from 'timers'
import { PhoneNumberService } from './phone.number.service'
import { UserService } from './user.service'

const DATE_NIGHT_SETTINGS_DOC = 'date_night_settings'

export type DateFields = 'timeJoin' | 'timeLeft' | 'timeReplied' | 'timeSent'
export type RateToggles =
  | 'fun'
  | 'curious'
  | 'outgoing'
  | 'interesting'
  | 'creative'
  | 'goodListener'
  | 'asksInterestingQuestions'
  | 'heart'
export class MeetupService {
  static dateNightEndTimeout: null | NodeJS.Timeout

  static async getDateNightInfo() {
    const result = await FirebaseService.functions
      .httpsCallable('getDateNightData')()
      .catch(err => console.error(err))
    if (!result) throw new Error('Error while fetching date night info')

    return result.data as DateNightInfo
  }

  static async isBlindDates(): Promise<boolean> {
    const statusDoc = await FirebaseService.db
      .collection(PARAMETERS_COLLECTION)
      .doc(DATE_NIGHT_SETTINGS_DOC)
      .get()
    const status = statusDoc.data()?.blindDates
    return status
  }

  static async setupDateNight() {
    const dateNightInfo = await this.getDateNightInfo()
    const isBlindDates = await this.isBlindDates()
    store.dispatch(setDateNightInfo(dateNightInfo))
    store.dispatch(setBlindDates(isBlindDates))
    if (!dateNightInfo.currentDateNight) UserService.setHere(false)
    if (this.dateNightEndTimeout) clearTimeout(this.dateNightEndTimeout)
    this.dateNightEndTimeout = setTimeout(() => {
      console.log('reset date night')
      MeetupService.setupDateNight()
    }, dateNightInfo.timeTilDateNightEnd)
  }

  static async joinDateNight(date: DateObject) {
    const { data } = await FirebaseService.functions.httpsCallable(
      'checkDateRelevance'
    )(date.dateId)
    if (!data) return console.log('NOT JOIN')
    console.log('JOIN DATE')
    UserService.setFree(false)
    store.dispatch(setAppState('VIDEO'))
  }

  static async checkAvailabilityAfterCountdown(dateId: string) {
    const { data } = await FirebaseService.functions.httpsCallable(
      'checkDateRelevance'
    )(dateId)
    if (!data) {
      UserService.setFree(true)
      store.dispatch(setAppState('WAITING'))
      return false
    }
    return true
  }

  static async moveProspect(matches: boolean, here: boolean) {
    const [topCard] = store.getState().meetup.cards
    if (!topCard) return
    store.dispatch(shiftCards())
    return await FirebaseService.functions.httpsCallable('moveProspects')({
      id: topCard.userId,
      matches,
      createDate: here
    })
  }

  static async acceptDate(dateId: string, choice: boolean) {
    return await FirebaseService.functions.httpsCallable('acceptDate')({
      dateId,
      choice
    })
  }

  static async updateProspects() {
    await FirebaseService.functions.httpsCallable('updateProspects')()
  }
  static async updateMatches() {
    await FirebaseService.functions.httpsCallable('updateMatches')()
  }

  static async setRaiting(rate: Record<RateToggles, boolean>) {
    const dateId = store.getState().meetup.currentDate?.dateId
    const userId = store.getState().meetup.currentDate?.userId
    if (!dateId || !userId)
      return console.error('MeetupService: dateId or userId is undefined')
    if (rate.heart) PhoneNumberService.allowMyPhoneNumber(userId)
    await FirebaseService.functions.httpsCallable('updateDateField')({
      dateId,
      field: 'rate',
      data: rate
    })
  }

  static async setCurrentDateTimeField(field: DateFields) {
    const dateId = store.getState().meetup.currentDate?.dateId
    if (!dateId) return
    if (field === 'timeLeft')
      FirebaseService.functions.httpsCallable('deactivateDate')(dateId)
    await FirebaseService.functions.httpsCallable('updateDateField')({
      dateId,
      field
    })
  }
}

export const useDateObserver = () => {
  const currentDate = useAppSelector(selectCurrentDate)
  const isDateNight = useAppSelector(selectIsDateNight)
  const free = useAppSelector(selectUserFree)
  const here = useAppSelector(selectUserHere)
  const finished = useAppSelector(selectFinished)

  useEffect(() => {
    if (!currentDate || !isDateNight || !free || !here || finished) return
    MeetupService.joinDateNight(currentDate)
  }, [currentDate, isDateNight, free, here, finished])
}
