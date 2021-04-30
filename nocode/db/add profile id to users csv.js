const fs = require('fs')
const USERS_FILE_IN = './output/for upload to Bloom Reborn - Users.json'
const USERS_FILE_OUT = './output/for upload to Bloom Reborn - Users - Edited.csv'
const adaloApi = require('../adaloApi.js')
const { readCsv, writeToCsv } = require('../csv.js')

copyUsers()

async function copyUsers() {
  // Cannot read as csv because some fields (especially Bio) contain commas.
  let users = JSON.parse(fs.readFileSync(USERS_FILE_IN, 'utf8'))
  
  // Get profiles from Adalo.
  let profiles = await adaloApi.list('Profiles', 280)
  const profileMap = []
  profiles.map(({ Email, id }) => profileMap[Email] = id)

  // Get cities from Adalo.
  let cities = await adaloApi.list('Cities', 30)
  const cityMap = []
  cities.map(({ Name, id }) => cityMap[Name.trim()] = id)

  // Add in the Profile and City fields to users.
  users.forEach(u => {
    u.Profile = profileMap[u.Email]
    u.City = cityMap[u.City]
  })

  // Write users out to csv.
  writeToCsv(users, USERS_FILE_OUT)
  
}