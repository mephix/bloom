import * as functions from 'firebase-functions'

export const taskManager = functions.pubsub
  .schedule('* * * * *')
  .onRun(async context => {})
