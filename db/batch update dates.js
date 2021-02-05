const axios = require('axios').default
const adaloApi = require('../adaloApi.js')
const fs = require('fs')
const errf = err => {if (err) return console.log(err)}
const Airtable = require('airtable')
const { airtable_api_key, airtable_base_id } = require('../DO_NOT_COMMIT.js')

testAdalo503Error()

async function testAdalo503Error() {
  let testIds = [1,2]
  let responses = await Promise.all(testIds.map(testId => {
    return adaloApi.get('People', testId)
  }))
  console.log(`${responses.map(r=>r.statusText)}`)
}

async function testAirtableApi() {
  const base = new Airtable({apiKey: airtable_api_key})
    .base(airtable_base_id)

  let record = await base('Rounds').find('recI5Rfxrvfc4YYLa')
  console.log(``)
  // , function(err, record) {
  //     if (err) { console.error(err); return; }
  //     console.log('Retrieved', record.id);
  // });
}

async function testUserOrdering() {
  let users = JSON.parse(fs.readFileSync('./csvs/Users (ids added).json', 'utf8'))
  let Here = users.map(u=>u.id).reverse().slice(0,20) // [2, 1, 20, 26, 19, 27]
  console.log(`POST: ${Here}`)
  await adaloApi.update('Rounds', 10, { Here })
  let round = await adaloApi.get('Rounds', 10)
  console.log(`GET: ${round.Here}`)
  let orderedUsers = []
  for (id of round.Here) {
    orderedUsers.push(...users.filter(u => id===u.id))
  }
  // users.filter(u => round.Here.includes(u.id))
  let orderedUsersCsv = jsonToCsv(orderedUsers)
  fs.writeFile('./csvs/ordered Users.csv', orderedUsersCsv, errf)
}

function jsonToCsv(items) {
  const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
  const header = Object.keys(items[0])
  let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  csv.unshift(header.join(','))
  return csv.join('\r\n')  
}

async function getActiveRound() {
  console.log(`Getting active Round(s)...`)
  // !! CHANGE BACK AFTER debug User 500 testing
  let rounds = await adaloApi.get('Rounds')
  let activeRounds = rounds.filter(r => r.Active)
  console.log(`found ${activeRounds.length}.`)
  console.log(`Users Here: ${activeRounds[0].Here}`)
}

async function setUsersHereToFalse() {
  console.log(`Setting all users to Here=false...`)
  let users = await adaloApi.get('Users')
  let usersHere = users.filter(d => d.Here || d.Finished || !d.Free)
  console.log(`found ${usersHere.length}.`)
  // !! SLICE FOR DEBUGGING !!
  let selectUsersHere = usersHere.slice(0,50)
  // !!

  let responses = await Promise.all(selectUsersHere.map(d => {
    try {
      return adaloApi.update('Users', d.id, {
        'Here': false,
        'Free': true,
        'Finished': false,
      })
    } catch (e) {
      console.warn(e)
      return { statusText: 'error'}
    }
  }))
  console.log(`${responses.map(r=>r.statusText)}`)
}

async function updateDatesEmailsField() {
  let dates = await adaloApi.get('Dates')
  let datesWithEmails = dates.filter(d => d.email1 && d.email2 && !d.emails)
  if (datesWithEmails.length===0) {
    console.log(`No dates found with email1 and email2 but not emails.`)
    return
  }
  // let datesWithEmails = datesWithEmails.slice(0,100)
  let responses = await Promise.all(datesWithEmails.map(d => {
    try { return adaloApi.update('Dates', d.id, { 'emails': d.email1 + ',' + d.email2 }) }
    catch (e) { return Promise.resolve({ statusText: 'fail', error: e })}
  }))
  console.log(`${responses.map(r=>r.statusText)}`)
}

async function setDatesToActiveFalse() {
  let dates = await adaloApi.get('Dates')
  let activeDates = dates.filter(d => d.Active)
  if (activeDates.length===0) {
    console.log(`No dates were active.`)
    return
  }
  let selectActiveDates = activeDates.slice(0,100)
  let responses = await Promise.all(selectActiveDates.map(d =>
    adaloApi.update('Dates', d.id, { 'Active': false })  
  ))
  console.log(`${responses.map(r=>r.statusText)}`)
}

async function findUsersWithWrongAgePrefs() {
  let users = await adaloApi.get('Users')
  let usersToSet = users.filter(u => 
    u['Age Preference Low'] &&
    u['Age Preference High'] &&
    u['Age Preference Low'] >= u['Age Preference High']
  )
  usersToSet.map(u => {
    u.lo = Math.round(Math.max(18, (u['Age']/2)+7))
    u.hi = Math.round(Math.min(99, (u['Age']-5)*1.5))
  })
  let selectUsersToSet = usersToSet //.slice(0,2)
  let responses = await Promise.all(selectUsersToSet.map(u =>
    adaloApi.update('Users', u.id, {
      'Age Preference Low': u.lo,
      'Age Preference High': u.hi,
    })  
  ))
  responses.map(r=>console.log(r.status))
}

async function setUsersHereToTrue() {
  const usersToSetHere = [
    // female
    'female_straight_25_SF@bloom.com',
    'jakiw2020@gmail.com',
    'nowms2u@yahoo.com',
    // male
    'tsikri3@gmail.com',
    'Jcdeleon95@gmail.com',
    'michael_30@bloommeetupuser.com',

    // 'georgedeljunco97@gmail.com',
    // 'alexisdsalazar50@gmail.com',
    // 'female_straight_33_LA@bloom.com',
    // 'juan189@yahoo.com',
    // 'sparekh@mail.sfsu.edu',
    // 'oluwatosin.akande@gmail.com',
    // 'acutts@gmail.com',
    // 'saritamoncadagirl@gmail.com',
    // 'timothynotwong95@gmail.com',
    // 'nowms2u@yahoo.com',
    // 'Zachs6000@gmail.com',
    // 'dastgheib@gmail.com',
    // 'agoll86@gmail.com',
    // 'anne.mcniel@gmail.com',
    // 'temple.celeste@gmail.com',
    // 'jeanniechun@gmail.com',
    // 'mark_72@bloommeetupuser.com',
    // 'sayyesgg@gmail.com',
    // 'alarcond1967@icloud.com',
    // 'asriram916@outlook.com',
    // 'tomas_31@bloommeetupuser.com',
    // 'noe_26@bloommeetupuser.com',
    // 'patrick.dakis@yahoo.com',
    // 'marcyspafford@gmail.com',
    // 'jessickarr@gmail.com',
    // 'shabani1@gmail.com',    
  ]
  console.log(`Setting ${usersToSetHere.length} users to Here=true, Free=true`)
  let users = await adaloApi.get('Users')
  let usersToSet = users.filter(d => usersToSetHere.includes(d.Email))
  let selectUsersToSet = usersToSet //.slice(0,2)
  let responses = await Promise.all(selectUsersToSet.map(d =>
    adaloApi.update('Users', d.id, { 'Here': true, 'Free': true })  
  ))
  console.log(`${responses.map(r=>r.statusText)}`)
}

async function mapUserLocationsToZipcodes() {
  const DEFAULT_ZIP = 94110
  const SF_ZIP = 94110
  const LA_ZIP = 90401
  let users = await adaloApi.get('Users')
  let selectUsers = users
    .filter(u => !u['Zipcode'])
    .map(u => {
      let locationText = u['Location']
      let location = Number(locationText)
      let zip
      if (location) {
        zip = location
      } else if (locationText === '' || locationText === null) {
        zip = DEFAULT_ZIP
      } else if (locationText.trim() === 'San Francisco') {
        zip = SF_ZIP
      } else if (locationText.trim() === 'Los Angeles') {
        zip = LA_ZIP
      } else {
        console.warn(`Unexpected location: ${locationText}`)
        zip = DEFAULT_ZIP
      }
      u['Zipcode'] = zip
      return u
    })
  // !!! FOR DEBUGGING !!!
  // selectUsers = selectUsers.slice(70,)

  let responses = await Promise.all(selectUsers.map(u =>
    adaloApi.update('Users', u.id, { 'Zipcode': u.Zipcode })  
  ))
  return responses
}

async function setNewGenderFields() {
  const genderMap = {
    1: 'X',
    2: 'F',
    3: 'M',
  }
  const genderPrefMap = {
    3: 'X',
    1: 'F',
    2: 'M',
  }
  let users = await adaloApi.get('Users')
  let unsetUsers = users.filter(u => !u['Gender'] || !u['Gender Preference'])
  let selectUnsetUsers = unsetUsers.slice(0,1)
  let responses = await Promise.all(unsetUsers.map(u =>
    adaloApi.update('Users', u.id, {
      'Gender': genderMap[u['Gender Rel']],
      'Gender Preference': genderPrefMap[u['Gender Preference Rel']],
    })
  ))
  return responses
}

async function deleteNullDates() {
  const appId = 'aca1def6-b11b-45a7-9d7c-4589fbb3c1f8'
  const adaloApiKey = 'b4tpvjmmetf0sk8d43e76te5b'
  const collectionId = 't_ax27z3fv32ihnb0be77hclwyf'
  const adaloResponse = await axios({
    url: `http://api.adalo.com/apps/${appId}/collections/${collectionId}`,
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + adaloApiKey,
    },
  })
  const allDates = adaloResponse.data

  // Delete dates with no Time Start, Name and Participants
  const nullDates = allDates.filter(d => 
    d['Time Start']===null &&
    !d['Name'] && 
    !d.Participants
  )

  const deletionResponses = await Promise.all(nullDates.map(d => {
    const idToDelete = d.id
    return axios({
      url: `http://api.adalo.com/apps/${appId}/collections/${collectionId}/${idToDelete}`,
      method: 'delete',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + adaloApiKey,
      },
    })
  }))
  if (deletionResponses.all(r => r.status===204)) {
    console.log(`${nullDates.length} dates deleted ok`)
  } else {
    console.warn(`not all dates deleted ok`)
  }
}