const fetch = require('node-fetch')
const axios = require('axios').default
const { daily_api_key } = require('../DO_NOT_COMMIT.js')

exports.whosInTheir = whosInTheir
exports.getRoom = getRoom
exports.makeRoom = makeRoom
exports.getToken = getToken
exports.calcNbf = calcNbf
exports.calcExp = calcExp

async function whosInTheir(dates) {
  // `response` is { roomName: [ participants ]}
  let response = await axios({
    url: `https://api.daily.co/v1/presence`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + daily_api_key,
    },
  })

/*
{
  "cool-room": [
    {
      "id": "4c8dee53-fd51-445c-92d4-917701401d14",
      "userId": "309cf686-64ba-4afa-9e6b-05fe13c56fbf",
      "userName": "sean",
      "joinTime": "2020-11-01T23:46:38.000Z",
      "duration": 543,
      "room": "cool-room"
    },
    ... more participants ...
  ]
}
*/

  // !! THIS FUNCTION HASNT BEEN COMPLETED !!
}

/*
 * example: properties = { user_name: 'John' }
 */
async function getToken(properties) {
  let url = 'https://api.daily.co/v1/meeting-tokens'
  let options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', 
      Authorization: 'Bearer ' + daily_api_key
    },
    body: JSON.stringify({properties})
  }
  let responsePromise = await fetch(url, options)
  let { token } = await responsePromise.json()
  return token
/*
curl --request POST \
     --url https://api.daily.co/v1/meeting-tokens \
     --header 'authorization: Bearer 9c4e3a1da340dbd0c8407205f1379abe5aaaed4dd9ee0e95a730d97d0b5268d5' \
     --header 'content-type: application/json' \
     --data '{"properties":{"user_name":"Jolkie"}}'
*/
}

async function getRoom(roomId) {
  let response = await axios({
    url: `https://api.daily.co/v1/meetings?room=${roomId}`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + daily_api_key,
    },
  })
  return response
  /*
curl --request GET \
       --url https://api.daily.co/v1/meetings/jessica-reza \
       --header 'authorization: Bearer 9c4e3a1da340dbd0c8407205f1379abe5aaaed4dd9ee0e95a730d97d0b5268d5'
  */
}

async function makeRoom ({ nbf, exp }) {
  let response = await axios({
    url: 'https://api.daily.co/v1/rooms/',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + daily_api_key,
    },
    data: {
      'privacy': 'public',
      'properties': {
        nbf,
        exp,
        eject_at_room_exp: true,
        autojoin: true,
        enable_screenshare: false,
        enable_chat: false,
      },
    }
  })
  return response
}

function calcNbf({ startTime, preentry }) {
  // `preentry`: allow entry sometime before start
  let startDateTimestamp = Math.floor(new Date(startTime).getTime()/1000)
  let nbf = startDateTimestamp - preentry*60
  return nbf
}

function calcExp({ endTime }) {
  let endDateTimestamp = Math.floor(new Date(endTime).getTime()/1000)
  // `exp`: kick everyone out right at the end.
  let exp = endDateTimestamp
  return exp
}
