import { FirebaseService } from 'firebaseService'
import { useEffect } from 'react'
import { store, useAppSelector } from 'store'
import { setAppState } from 'store/app'
import {
  selectCurrentDate,
  selectIsDateNight,
  setDateNightInfo,
  shiftCards
} from 'store/meetup'
import { DateNightInfo, DateObject } from 'store/meetup/types'
import { selectUserFree, selectUserHere } from 'store/user'
import { setTimeout } from 'timers'
import { UserService } from './user.service'

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

  static async setupDateNight() {
    const dateNightInfo = await this.getDateNightInfo()
    store.dispatch(setDateNightInfo(dateNightInfo))
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
    console.log('move')
    return await FirebaseService.functions.httpsCallable('moveProspects')({
      id: topCard.userId,
      matches,
      createDate: here
    })
  }

  static async acceptDate(dateId: string, choice: boolean) {
    console.log('accept')

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
    if (!dateId) return
    await FirebaseService.functions.httpsCallable('updateDateField')({
      dateId,
      field: 'rate',
      data: rate
    })
  }

  // static async set

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

  useEffect(() => {
    if (!currentDate || !isDateNight || !free || !here) return
    MeetupService.joinDateNight(currentDate)
  }, [currentDate, isDateNight, free, here])
}
