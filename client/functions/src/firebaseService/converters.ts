import { User } from './types'

export const userConverter = {
  toFirestore(user: User): FirebaseFirestore.DocumentData {
    return { ...user }
  },
  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): User {
    const data = snapshot.data()!
    return {
      id: snapshot.id,
      firstName: data.firstName,
      bio: data.bio,
      age: data.age,
      gender: data.gender,
      socialMedia: data.socialMedia,
      avatar: data.avatar
    }
  }
}
