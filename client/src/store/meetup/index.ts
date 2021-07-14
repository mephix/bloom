import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserMatch } from 'services/matches.service/types'
import { RootState } from 'store'
import { DateNightInfo, DateObject, UserCard } from './types'

export interface MeetupState {
  blindDates: boolean
  matchesLoading: boolean
  matches: UserMatch[]
  cards: UserCard[]
  dateNightInfo: Omit<DateNightInfo, 'timeTilDateNightEnd'>
  currentDate: DateObject | null
}

const initialState: MeetupState = {
  blindDates: false,
  matchesLoading: false,
  matches: [],
  cards: [],
  dateNightInfo: {
    currentDateNight: false,
    timeTilNextDateNight: 0
  },
  currentDate: null
}

export const meetupSlice = createSlice({
  name: 'meetup',
  initialState,
  reducers: {
    setMatches: (store, action: PayloadAction<UserMatch[]>) => {
      store.matches = action.payload
      store.matchesLoading = false
    },
    setDateNightInfo: (store, action: PayloadAction<DateNightInfo>) => {
      store.dateNightInfo = action.payload
    },
    startDateNight: store => {
      store.dateNightInfo = { ...store.dateNightInfo, currentDateNight: true }
    },
    setCurrentDate: (store, action: PayloadAction<DateObject | null>) => {
      store.currentDate = action.payload
    },
    setCards: (store, action: PayloadAction<UserCard[]>) => {
      store.cards = action.payload
    },
    shiftCards: store => {
      store.cards.shift()
    },
    setBlindDates: (store, action: PayloadAction<boolean>) => {
      store.blindDates = action.payload
    }
  }
})

export const {
  setMatches,
  setDateNightInfo,
  startDateNight,
  setCurrentDate,
  setCards,
  shiftCards,
  setBlindDates
} = meetupSlice.actions

export const selectMatches = (state: RootState) => state.meetup.matches
export const selectMatchesLoading = (state: RootState) =>
  state.meetup.matchesLoading
export const selectCards = (state: RootState) => state.meetup.cards
export const selectIsDateNight = (state: RootState) =>
  state.meetup.dateNightInfo.currentDateNight
export const selectCurrentDate = (state: RootState) => state.meetup.currentDate
export const selectBlindDate = (state: RootState) => state.meetup.blindDates
export const selectTimeTilDateNight = (state: RootState) =>
  state.meetup.dateNightInfo.timeTilNextDateNight

export * from './actions'

export default meetupSlice.reducer
