import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import userReducer from './user'
import meetupReducer from './meetup'
import appReducer from './app'

export const store = configureStore({
  reducer: {
    user: userReducer,
    meetup: meetupReducer,
    app: appReducer
  }
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

export * from './hooks'
