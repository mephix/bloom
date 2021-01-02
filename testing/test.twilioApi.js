const twilio = require('../apis/twilioApi.js')

// const amel = '+13126191462'
// const john = '+14153201331'
// let to = amel
// let body = 'is it champagne time yet?'
// testSendSms({ body, to })

// { endTime, duration, uniqueName }
testCreateRoom({ uniqueName: 'get a room' })

async function testCreateRoom(params) {
  let room = await twilio.createRoom(params)
  console.log(`This room is at ${room.url}\n\n`)
  console.log(JSON.stringify(room))
}

async function testSendSms(params) {
  let response = await twilio.sendSms(params)
  console.log(`Message from ${response.from} to ${response.to} is created and ${response.status}`)
  console.log(`"${response.body}"`)
}
