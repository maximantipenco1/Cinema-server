let users = [];

const findUser = (user) => {
    const userName = user.name.trim().toLowerCase();
    const userRoom = user.room.trim().toLowerCase();

    return users.find(
        (u) => (u.name).trim().toLowerCase() === userName && (u.room).trim().toLowerCase() === userRoom
    );
};

const addUser = (user) => {
    const isExist = findUser(user);

    !isExist && users.push(user);

    const currentUser = isExist || user;

    return { isExist: !!isExist, user: currentUser };
};

const getRoomUsers = (room) => {
    return users.filter((u) => u.room === room);
};

const removeUser = (user) => {
    const found = findUser(user);

    if (found) {
        const foundIndex = users.findIndex(u => u.name === user.name && u.room === user.room);

        if (foundIndex !== -1) {
            users.splice(foundIndex, 1);
        }
    }
    return found;
};

module.exports = { addUser, getRoomUsers, removeUser, findUser }