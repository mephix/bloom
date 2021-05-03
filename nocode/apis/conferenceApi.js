const fetch = require('node-fetch')
const axios = require('axios').default

exports.makeRoom = makeRoom
exports.getToken = getToken
exports.getRoom = getRoom

const daily_api_key = process.env.DAILY_API_KEY

async function makeRoom ({ startTime, endTime, preentry = 1 }) {
    let nbf = calcNbf({ startTime, preentry })
    let exp = calcExp({ endTime })
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
  // Add a BUFFER of 3 seconds.
  // !! parameterize this later? !!
  let BUFFER = 3
  let exp = endDateTimestamp + BUFFER
  return exp
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
