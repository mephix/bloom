const fetch = require('node-fetch')
const axios = require('axios').default
const { daily_api_key } = require('../DO_NOT_COMMIT.js')

exports.getRoom = getRoom
exports.makeRoom = makeRoom
exports.getToken = getToken

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
