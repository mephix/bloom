const firestore = require('../apis/firestoreApi.js')
const db = firestore.db
const time = firestore.db.Timestamp

module.exports = tryToJoinDate

async function tryToJoinDate(dateId) {
    const dateRef = db.collection('Dates').doc(dateId)
    const success = await db.runTransaction(async (transaction) => {
        const date = await transaction.get(dateRef)

        // Only accept the date if it is still active.
        // Otherwise, return.
        if (date.data().active) {
            const sender = date.data().with
            const recipient = date.data().for

            // Query all current active dates for and with the sender and recipient.
            let datesForSenderQ = 
                await transaction.get(
                    db.collection('Dates')
                        .where('for', '==', sender)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )

            let datesForRecipientQ = 
                await transaction.get(
                    db.collection('Dates')
                        .where('for', '==', recipient)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )

            let datesWithSenderQ = 
                await transaction.get(
                    db.collection('Dates')
                        .where('with', '==', sender)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )

            let datesWithRecipientQ = 
                await transaction.get(
                    db.collection('Dates')
                        .where('with', '==', recipient)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )

            // Get the docs from the queries, excluding the date we are accepting.
            let datesForSender = datesForSenderQ.docs.filter(d => d.id !== date.id)
            let datesForRecipient = datesForRecipientQ.docs.filter(d => d.id !== date.id)
            let datesWithSender = datesWithSenderQ.docs.filter(d => d.id !== date.id)
            let datesWithRecipient = datesWithRecipientQ.docs.filter(d => d.id !== date.id)

            // Logging output: how many dates of each kind.
            console.log(`datesForSender: ${datesForSender.length}`)
            console.log(`datesForRecipient: ${datesForRecipient.length}`)
            console.log(`datesWithSender: ${datesWithSender.length}`)
            console.log(`datesWithRecipient: ${datesWithRecipient.length}`)
    
            // Decline (accepted=false) all the other current active dates for the sender and recipient.
            console.log('Declining other dates...')
            let datesFor = [...datesForSender, ...datesForRecipient]
            datesFor.map(d => {
                transaction.update(d.ref, { accepted: false })
            })

            // Deactivate (active=false) all the other current active dates with the sender and recipient.
            console.log('Deactivating other dates...')
            let datesWith = [...datesWithSender, ...datesWithRecipient]
            datesWith.map(d => {
                    transaction.update(d.ref, { active: false })
                })

            // Accept the date.
            console.log('Accepting the successful date...')
            transaction.update(dateRef, {
                active: true,
                accepted: true,
                timeReplied: time.now(),
            })
            return true
        } else {
            // If the date is no longer active, return without taking any action.
            return false
        }
    })
    return success
}


