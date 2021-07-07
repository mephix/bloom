const { db } = require('./firebase')
const RestoreUsersData = require('./RestoreUsers.json')
const RESTORE_USERS_COLLECTION = 'RestoreUsers'

async function main() {
  for (const user of RestoreUsersData) {
    console.log('Creating ' + user['Email'])
    await db
      .collection(RESTORE_USERS_COLLECTION)
      .doc(user['Email'])
      .set({
        firstName: user['First Name'],
        avatar: user['Face']
          ? user['Face'].url +
            '?auto=compress&w=250&h=250%20&fit=facearea&facepad=3'
          : '',
        age: user['Age'],
        phone: user['Phone Number'] ? '+1' + user['Phone Number'] : '',
        bio: user['Bio'],
        gender: user['Gender'] ? user['Gender'].toLowerCase() : '',
        genderPreference: user['Gender Preference']
          ? user['Gender Preference'].toLowerCase()
          : '',
        agePreferences: {
          low: user['Age Preference Low'] || 18,
          high: user['Age Preference High'] || 99
        }
      })
  }
}

main()
