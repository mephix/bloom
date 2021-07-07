import { UserMatch } from 'services/matches.service/types'
// import { MatchesService } from 'services/matches.service'
import { AppThunk } from 'store'
import { setMatches } from '.'

// export const fetchMatches = createAsyncThunk(
//   'meetup/fetchMatches',
//   async (_: unknown, { dispatch }) => {
//     const matches = await MatchesService.fetchLastMatches()
//     console.log('maatches', matches)
//     dispatch(setMatches(matches))
//   }
// )

export const blockMatch =
  (dateId: string): AppThunk =>
  (dispatch, getState) => {
    console.log('blocking')
    const currentMatches = getState().meetup.matches
    const newMatches = currentMatches.filter(match => match.dateId !== dateId)
    dispatch(setMatches(newMatches))
  }

export const heartMatch =
  (dateId: string): AppThunk =>
  (dispatch, getState) => {
    const currentMatches = getState().meetup.matches
    const newMatches: UserMatch[] = currentMatches.map(match =>
      match.dateId === dateId ? { ...match, type: 'me' } : match
    )
    dispatch(setMatches(newMatches))
  }
