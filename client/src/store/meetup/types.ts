export enum CardType {
  Prospect = 'prospect',
  Date = 'date'
}

export interface UserCard {
  userId: string
  firstName: string
  avatar: string
  bio: string
  type: CardType
  dateId?: string
}

export interface DateNightInfo {
  currentDateNight: boolean
  timeTilNextDateNight: number
  timeTilDateNightEnd: number
}

export interface DateObject {
  dateId: string
  userId: string
  firstName: string
  bio: string
  roomUrl: string
  token: string
  end: number
}
