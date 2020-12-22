const fs = require('fs')

exports.readCsv = readCsv
exports.writeToCsv = writeToCsv

function readCsv(fileName) {
  const rows = fs.readFileSync(fileName, 'utf8').split('\n')
  const fields = rows[0].split(',')
  let arr = []
  for (let i=1; i<rows.length; i++) {
    if (rows[i]==='') continue
    arr[i-1] = []
    const values = rows[i].split(',')
    values.forEach((v,k) => arr[i-1][fields[k]] = v)
  }
  return arr
}

function writeToCsv(obj, fileName) {
  const fields = Object.keys(obj[0])
  const header = fields.join(',')
  const body = obj.map(o => fields.map(f => `${o[f]}`).join(','))
  const fileContent = [header, ...body].join('\n')
  fs.writeFile(fileName, fileContent, function (err) {if (err) return console.log(err)})
  console.log(`Object written to file ${fileName}`) 
}