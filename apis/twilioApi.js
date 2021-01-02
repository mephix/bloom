// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// and set the environment variables. See http://twil.io/secure
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
const { accountSid, authToken } = require('../DO_NOT_COMMIT.js').twilio
const twilio = require('twilio')
const client = new twilio(accountSid, authToken)

exports.client = client
exports.createRoom = createRoom
exports.sendSms = sendSms

function createRoom(params) {
  // params: { endTime, duration, uniqueName }\
  // returns a room object
  return client.video.rooms.create({ type: 'go', ...params })
}

function sendSms(params) {
  // params = { body, to }
  return client.messages.create({
    from: '+18482223235', // From a valid Twilio number
    ...params
  })
}
