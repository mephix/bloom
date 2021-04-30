const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const adaloApi = require('../apis/adaloApi.js')

/*
 * ADD new cities to this list when they are added to the db
 */
let cityToZipcodes = {
  "Bay Area":     94110,
  "Los Angeles":  90210,
  "Miami":        33132,
	"New York":     10021,
	"Chicago":      60637,
	"Seattle":      98109,
  "Austin":       78704,
  "Boston":       2128,
	"San Diego":    92101,
	"San Jose":     95110,
	"Sacramento":   95814,
	"Other":        94110,
	"Portland":     97205,
	"Houston":      77002,
  "Salt Lake City": 84111,
}
fileName = `./scores/cityToZipcode.json`
cityToZipcode()

async function cityToZipcode() {
  const cities = await adaloApi.list('Cities', 30)
  const cityMap = cities.map(({ Name, id, ...rest }) => 
    ({ name: Name.trim(), id, zipcode: (cityToZipcodes[Name.trim()] || 94111) })
  )
  fs.writeFile(fileName, JSON.stringify(cityMap), fserr)
  console.log(`${fileName} written successfully.`)
}
