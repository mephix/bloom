import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UserMatch } from 'services/matches.service/types'
import { RootState } from 'store'

export interface MeetupState {
  loading: boolean
  matches: UserMatch[]
}

const initialState: MeetupState = {
  loading: true,
  matches: []
}

export const meetupSlice = createSlice({
  name: 'meetup',
  initialState,
  reducers: {
    setMatches: (store, action: PayloadAction<UserMatch[]>) => {
      store.matches = action.payload
      store.loading = false
    }
  }
})

export const { setMatches } = meetupSlice.actions

export const selectMatches = (state: RootState) => state.meetup.matches
export const selectMatchesLoading = (state: RootState) => state.meetup.loading

// export const selectAuth = (state: RootState) => state.user.auth

// export const incrementIfOdd =
//   (amount: number): AppThunk =>
//   (dispatch, getState) => {
//     const currentValue = selectCount(getState())
//     if (currentValue % 2 === 1) {
//       dispatch(incrementByAmount(amount))
//     }
//   }

export * from './actions'

export default meetupSlice.reducer
