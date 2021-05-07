import { db, time } from '../firebase'

export default function tryToJoinDate(dateId) {
    firebase.modify('Dates', dateToJoin.id, {
        accepted: true,
        timeReplied: firebase.db.Timestamp.now(),
    })
    const dateRef = db.collection('Dates').doc(dateId)
    const success = await runTransaction(db, async (transaction) => {
        const date = await transaction.get(dateRef)

        // Only accept the date if it is still active.
        // Otherwise, do nothing.
        if (date.data().active) {
            const sender = date.data().with
            const recipient = date.data().for

            // Get all other current active dates for the recipient
            const datesForRecipient = 
                await transaction.get(
                    db.collection(DATES_COLLECTION)
                        .where('for', '==', recipient)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )
            // Get all other current active dates with the recipient
            const datesWithRecipient = 
                await transaction.get(
                    db.collection(DATES_COLLECTION)
                        .where('with', '==', recipient)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )
            // Get all other current active dates for the sender
            const datesForSender = 
                await transaction.get(
                    db.collection(DATES_COLLECTION)
                        .where('for', '==', sender)
                        .where('active', '==', true)
                        .where('end', '>', time.now())
                )
      
            // Set accepted=false for all other current active dates for the recipient
            datesForRecipient.map(d => {
                transaction.update(d.ref, { accepted: false })
            })

            // Set active=false for all other current active dates with the recipient
            datesWithRecipient.map(d => {
                transaction.update(d.ref, { active: false })
            })

            // Set active=false for all other current active dates for the sender
            datesForSender.map(d => {
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


