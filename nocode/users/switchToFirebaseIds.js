module.exports = switchToFirebaseIds

function switchToFirebaseIds(users) {
    let usersById = {}
    users.map(({ id, ...rest }) => usersById[id] = { id, ...rest })
    users = users.map(u => {
        u.adaloId = u.id
        u.id = u.Email
        u.Likes = u.Likes.map(aid => usersById[aid].Email)
        u.Nexts = u.Nexts.map(aid => usersById[aid].Email)
        return u
    })
    return users
}