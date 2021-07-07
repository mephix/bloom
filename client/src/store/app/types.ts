export type AppStateType =
  | 'WAITING'
  | 'VIDEO'
  | 'RATING'
  | 'NO_PERMISSIONS'
  | 'NOT_SAFARI'
  | null

// export enum AppState {
//   WAITING = 'WAITING',
//   VIDEO = 'VIDEO',
//   RATING = 'RATING',
//   NO_PERMISSIONS = 'NO_PERMISSIONS',
//   NOT_SAFARI = 'NOT_SAFARI',
//   NULL = ''
// }

export enum Params {
  SETTING_YOU_UP = 'setting_you_up',
  WANT_TO_GO_ON_DATES = 'want_to_go_on_dates',
  DONT_WANT_TO_GO_ON_DATES = 'dont_want_to_go_on_dates',
  NOT_DATE_NIGHT = 'not_date_night',
  FINISHED = 'finished'
}
