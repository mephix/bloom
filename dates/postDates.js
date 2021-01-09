
module.exports = postDates

async function postDates(dates, seqOrPar, params) {
  if (seqOrPar === 'parallel') {
    console.log(`Posting dates to Adalo in parallel...`)
    let adaloPostPromises = dates
      .map(date => postDateToAdalo(date, params))
      // Flatten out the pairs of dates generated.
      .reduce((t, c) => t.concat(c), [])
    let responses = await Promise.all(adaloPostPromises)
    console.log(`Date creation statuses: ${responses.map(r=>r.statusText)}`)
    return responses

  // !!! UNTESTED !!!
  } else if (seqOrPar === 'sequential') {
    console.log(`Posting dates to Adalo sequentially...`)
    let responses = []
    for (let i=0; i<dates.length; i++) {
      // Await the pair of dates generated.
      let responsepair = await Promise.all(postDateToAdalo(dates[i], params))
      console.log(`Creation statuses for date ${i}: ${responsepair.map(r=>r.statusText)}`)
      responses.push(responsepair)
    }
    return responses
  } else throw new Error(`"seqOrPar" must be "sequential" or "parallel", not ${seqOrPar}`)

}
