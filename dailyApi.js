const axios = require('axios').default
const { daily_api_key } = require('./DO_NOT_COMMIT.js')

exports.getDailyRoom = getDailyRoom
exports.makeDailyRoom = makeDailyRoom

async function getDailyRoom(roomId) {
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

async function makeDailyRoom ({ nbf, exp }) {
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
