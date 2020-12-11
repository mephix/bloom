const axios = require('axios').default
const { adaloApiKey } = require('./DO_NOT_COMMIT.js')

exports.get = get
exports.create = create
exports.update = update
exports.delete = remove

const appId = 'aca1def6-b11b-45a7-9d7c-4589fbb3c1f8'
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + adaloApiKey,
}
const collectionIds = {
  Users:    't_16e4bbd16d6b46c59bd1866b587e6932',
  Dates:    't_ax27z3fv32ihnb0be77hclwyf',
  Invites:  't_ah951svi3ghqvexc9buzws0mx',
  Rounds:   't_dr4anrwrj0p61z8v49rnuk52v',
}

async function get(collection, id) {
  const url = `http://api.adalo.com/apps/${appId}/collections/`
    + collectionIds[collection]
    + (id ? `/${id}` : ``)
  const adaloResponse = await axios({ url, method: 'get', headers })
  return adaloResponse.data
}

async function remove(collection, id) {
  const url = `http://api.adalo.com/apps/${appId}/collections/`
    + collectionIds[collection]
    + `/${id}`
  const adaloResponse = await axios({ url, method: 'delete', headers })
  if (adaloResponse.status !== '204')
  console.warn(`Deleting record with id ${id} from ${collection} failed.`)
  return adaloResponse
}

async function create(collection, data) {
  const url = `http://api.adalo.com/apps/${appId}/collections/`
    + collectionIds[collection]
  const adaloResponse = await axios({ url, method: 'post', headers, data })
  return adaloResponse
}

async function update(collection, id, data) {
  const url = `http://api.adalo.com/apps/${appId}/collections/`
    + collectionIds[collection]
    + `/${id}`
  const adaloResponse = await axios({ url, method: 'put', headers, data })
  return adaloResponse
}
