import { FirebaseService } from 'firebaseService'
import { RDB_CONNECTED, RDB_ONLINE_REF } from 'firebaseService/constants'
import { useEffect } from 'react'
import { useAppSelector } from 'store'
import { selectUserId } from 'store/user'

const setStatus = (status: boolean) => ({
  status,
  changed: FirebaseService.database.ServerValue.TIMESTAMP
})
const ONLINE = () => setStatus(true)
const OFFLINE = () => setStatus(false)

export const useOnline = () => {
  const userId = useAppSelector(selectUserId)

  useEffect(() => {
    if (!userId) return
    const userStatusDatabaseRef = FirebaseService.database().ref(
      RDB_ONLINE_REF(userId)
    )
    const off = FirebaseService.database()
      .ref(RDB_CONNECTED)
      .on('value', snapshot => {
        if (!snapshot) return userStatusDatabaseRef.set(OFFLINE())
        if (!snapshot.val()) return
        userStatusDatabaseRef
          .onDisconnect()
          .set(OFFLINE())
          .then(() => userStatusDatabaseRef.set(ONLINE()))
      })
    return () => off(null)
  }, [userId])
}
