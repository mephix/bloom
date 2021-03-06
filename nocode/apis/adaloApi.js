exports.augment = augment
exports.list = list
exports.get = get
exports.create = create
exports.update = update
exports.delete = remove

const axios = require('axios').default

let { adaloApiKey } = require('../DO_NOT_COMMIT.js')
let collectionIds = {
  Users:    't_d596551b629041f0accbbe30e2d0798c',
  Profiles: 't_fa9bd35a5fcb41e59f463f46963bb1d5',
  Dates:    't_737e58ba8418441faf1d88dc5a027774',
  Rounds:   't_e15c7e6e859a4ef6a91059b7638059c8',
  Cities:   't_ce22a13d75d0465b8b59274864cb6214',
  Rooms:    't_dfx71lkr27032sw3haummjqmr',
}
let appId = '871b2ce8-e87f-4c42-ba43-3b95add7639d' // Reborn

/*
 * USE OLD=true IF DOWNLOADING FROM THE PRE-REBORN DB
 */
const OLD = false
if (OLD) {
  appId = 'aca1def6-b11b-45a7-9d7c-4589fbb3c1f8' // pre Reborn
  const { adaloApiKey_before_Reborn } = require('../DO_NOT_COMMIT.js')
  adaloApiKey = adaloApiKey_before_Reborn
  collectionIds = {
    // pre Reborn
    'Users old':    't_16e4bbd16d6b46c59bd1866b587e6932',
    'People old':   't_dqcjvpuuluzz3fy8ezzfkln02',
    'Dates old':    't_ax27z3fv32ihnb0be77hclwyf',
    'Invites old':  't_ah951svi3ghqvexc9buzws0mx',
    'Rounds old':   't_dr4anrwrj0p61z8v49rnuk52v',
  }
}
const endpoint = `https://api.adalo.com/v0/apps/${appId}/collections/`
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + adaloApiKey,
}

async function augment(collection, offset) {
  if (offset === undefined) throw new Error(`offset should not start off undefined.`)
  // Adalo pagination limit is 100, but change it to 10 on the advice of
  // Adalo dev.
  let limit = 20
  let newRecords = []
  while (offset !== undefined) {
    const params = 
      (offset ? `offset=${offset}&` : ``) +
      (limit ? `limit=${limit}&` : ``)
    const url = endpoint + collectionIds[collection] + `?` + params
    let response = await axios({ url, method: 'get', headers })
    console.log(`${params}...${response.statusText}`)
    newRecords = [...newRecords, ...response.data.records]
    // If there are no more records remaining after these, offset will be
    // undefined.
    offset = response.data.offset
  }
  return newRecords
}

async function list(collection, N, LIMIT = 100) {
  // N is a guesstimate of the size of the collection. If it is too large
  // (modulus LIMIT), it will only incur one extra API call because the
  // loop will break once receiving no records.
  if (!N) throw new Error(`You must currently provide an estimate of the size of the collection.`)
  // Adalo pagination limit is 100.
  LIMIT = LIMIT > 100 ? 100 : LIMIT
  let responses = []
  for (let offset=0; offset<N; offset+=LIMIT) {
    const params = 
      (offset ? `offset=${offset}&` : ``) +
      (LIMIT ? `limit=${LIMIT}&` : ``)
    console.log(params)
    const url = endpoint + collectionIds[collection] + `?` + params
    let response = await axios({ url, method: 'get', headers })
    // !! NOTE could rewrite this better to use the response's own OFFSET field.
    if (response.data.records.length===0) break
    responses.push(response)
  }

  let records = responses.reduce((r, ri) => [...r, ...ri.data.records],[])
  if (records.length===N)
    console.warn(`Found as many records (${records.length}) as the upper bound you supplied,` +
    `suggesting your upper bound was probably too low.`)
  return records
}

async function get(collection, id) {
  if (!id) throw new Error(`"get" requires an id. Use "list" to get all records.`)
  const url = endpoint + collectionIds[collection] + `/${id}`
  const adaloResponse = await axios({ url, method: 'get', headers })
  return adaloResponse.data
}

async function remove(collection, id) {
  const url = endpoint + collectionIds[collection] + `/${id}`
  const adaloResponse = await axios({ url, method: 'delete', headers })
  if (adaloResponse.status !== '204')
  console.warn(`Deleting record with id ${id} from ${collection} failed.`)
  return adaloResponse
}

async function create(collection, data) {
  const url = endpoint + collectionIds[collection]
  let adaloResponse = []
  try {
    adaloResponse = await axios({ url, method: 'post', headers, data })
  } catch (e) {
    console.log(e)
  }
  return adaloResponse
}

async function update(collection, id, data) {
  const url = endpoint + collectionIds[collection] + `/${id}`
  const adaloResponse = await axios({ url, method: 'put', headers, data })
  return adaloResponse
}
