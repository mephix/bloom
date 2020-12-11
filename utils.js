exports.deepCopy = deepCopy

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object))
}