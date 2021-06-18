const today = '2021-06-17'

const { db } = require('../apis/firestoreApi.js')
const RestoreUsersData = require(`../output/Users ${today}.json`)
const RESTORE_USERS_COLLECTION = 'RestoreUsers'

async function main() {
    const batch = db.batch()
    // Max batch size is 500.
    // Most recently used: 1066.
    let users = RestoreUsersData.slice(1066,)
    for (const user of users) {
        console.log('Creating ' + user['Email'])
        const ref = db.collection(RESTORE_USERS_COLLECTION).doc(user['Email'])
        batch.set(ref, {
            firstName: user['First Name'],
            phone: user['Phone Number'] ? '+1' + user['Phone Number'] : '',
            avatar: user['Face'] ? user['Face'].url : '',
            bio: user['Bio'],
            gender: user['Gender'] ? user['Gender'].toLowerCase() : '',
            genderPreference: user['Gender Preference']
                ? user['Gender Preference'].toLowerCase()
                : '',
            age: user['Age'],
            agePreferences: {
                low: user['Age Preference Low'] || 18,
                high: user['Age Preference High'] || 99
            },
            city: user['City'] || '',
            zipcode: user['Zipcode'] || null,
        })
    }
    let response = await batch.commit()
    console.log(`Batch of ${users.length} committed at ${response[0].writeTime.toDate()}`)
    return
  }

main()
