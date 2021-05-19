const fs = require('fs')

exports.zipcodeDistance = zipcodeDistance
exports.loadZipLatlons = loadZipLatlons

function loadZipLatlons() {
  ZIPCODE_LATLONGS = './nocode/scores/US Zip Codes from 2013 Government Data.csv'
  const contents = fs.readFileSync(ZIPCODE_LATLONGS, 'utf8');
  const rows = contents.split('\n')
  var zipLatLons = {}
  // Don't parse row 0 because it is a header row.
  // ZIP,LAT,LNG
  for (let i=1; i<rows.length; i++) {
    let [ zip, lat, lon ] = rows[i].split(',')
    zip = Number(zip)
    lat = Number(lat)
    lon = Number(lon)
    zipLatLons[zip] = [lat, lon]
  }
  return zipLatLons
}

// Distance between two zip codes.
function zipcodeDistance(z1, z2, zipLatLons) {
  if (!zipLatLons[z1]) {
    console.warn(`Zipcode ${z1} not found.`)
    return -1
  }
  if (!zipLatLons[z2]) {
    console.warn(`Zipcode ${z2} not found.`)
    return -1
  }
  return latlongDistance(zipLatLons[z1], zipLatLons[z2])
}

// Distance between two (latitude, longitude) pairs.
function latlongDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c     // in metres
  const m = d / 1609  // in miles
  return m
}