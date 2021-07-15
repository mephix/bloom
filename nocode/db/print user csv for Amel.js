const fs = require('fs')
const fserr = err => {if (err) return console.log(err)}
const consoleColorLog = require('../utils/consoleColorLog.js')
const firestoreApi = require('../apis/firestoreApi.js')

/*
 * PARAMETERS TO SET
 */
today = '2021-07-13'
const dev = '-dev' // '' //
const filepath = `./nocode/output`


printUserCsv(today)

async function printUserCsv(today) {
  let outFileName = `${filepath}/Amel Users${dev} ${today}.csv`
  let users = JSON.parse(fs.readFileSync(`${filepath}/firebase Users${dev} ${today}.json`, 'utf8'))
  let phones = JSON.parse(fs.readFileSync(`${filepath}/firebase Phones ${today}.json`, 'utf8'))
  let outFileContent = 'signupDate,name,phone,id,gender,age,photo\n' + 
    users
      .sort((u,v) => v.createTime._seconds - u.createTime._seconds)
      .map(u => {
        let phone = phones.filter(p => p.id === u.id)?.[0]?.phone || ''
        let avatarURL = u.avatar ? 
          u.avatar.slice(0,23) === 'https://firebasestorage' 
            ? u.avatar 
            : 'https://res.cloudinary.com/the-zero-date/image/upload/' + u.avatar
          : ''
        let createDate = (new firestoreApi.db.Timestamp(u.createTime._seconds, u.createTime._nanoseconds )).toDate()
        return `${createDate},${u.firstName},${phone},${u.id},${u.gender},${u.age || ''},${avatarURL}`
      })
      .join('\n')
  fs.writeFile(outFileName, outFileContent, fserr)
  consoleColorLog(`${outFileName} written`, 'green')
}
