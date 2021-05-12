const firestore = require('../apis/firestoreApi.js')
const db = firestore.db
const time = firestore.db.Timestamp
// import { runTransaction } from "firebase/firestore";

module.exports = tryToJoinDate

async function tryToJoinDate(dateId) {
    // firestore.modify('Dates', dateId, {
    //     accepted: true,
    //     timeReplied: firestore.db.Timestamp.now(),
    // })
    // return
    const dateRef = db.collection('Dates').doc(dateId)
    const success = await db.runTransaction(async (transaction) => {
        const date = await transaction.get(dateRef)

        // Only accept the date if it is still active.
        // Otherwise, do nothing.
        if (date.data().active) {
            const sender = date.data().with
            const recipient = date.data().for

            // Get all other current active dates for the recipient
            const datesForRecipient = 
                await transaction.get(
                    db.collection('Dates')
                        .where('for', '==', recipient)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )
            // Get all other current active dates with the recipient
            const datesWithRecipient = 
                await transaction.get(
                    db.collection('Dates')
                        .where('with', '==', recipient)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )
            // Get all other current active dates for the sender
            const datesForSender = 
                await transaction.get(
                    db.collection('Dates')
                        .where('for', '==', sender)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )
      
            // Set accepted=false for all other current active dates for the recipient
            datesForRecipient.docs.map(d => {
                transaction.update(d.ref, { accepted: false })
            })

            // Set active=false for all other current active dates with the recipient
            datesWithRecipient.docs.map(d => {
                transaction.update(d.ref, { active: false })
            })

            // Set active=false for all other current active dates for the sender
            datesForSender.docs.map(d => {
                transaction.update(d.ref, { active: false })
            })

            // Accept the date.
            transaction.update(dateRef, {
                accepted: true,
                timeReplied: time.now(),
            })
        }
    })
    return success
}


