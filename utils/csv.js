const fs = require('fs')

exports.readCsv = readCsv
exports.writeToCsv = writeToCsv

function readCsv(fileName) {
  let rows = []
  try { rows = fs.readFileSync(fileName, 'utf8').split('\n') } catch (e) { console.warn(e) }
  let arr = []
  if (rows.length > 0) {
    const fields = rows[0].split(',')
    for (let i=1; i<rows.length; i++) {
      if (rows[i]==='') continue
      arr[i-1] = []
      const values = rows[i].split(',')
      values.forEach((v,k) => arr[i-1][fields[k]] = v)
    }
  }
  return arr
}

function writeToCsv(obj, fileName, delimiter = ',') {
  const fields = Object.keys(obj[0])
  const header = fields.join(delimiter)
  const body = obj.map(o => fields.map(f => `${o[f]}`).join(delimiter))
  const fileContent = [header, ...body].join('\n')
  fs.writeFile(fileName, fileContent, function (err) {if (err) return console.log(err)})
  console.log(`Object written to file ${fileName}`) 
}