let currentVideoTitle = {};

const getCurrentVideoUrl = (room) => {
    return currentVideoTitle[room];
};

const setCurrentVideoUrl = (title, params) => {
    currentVideoTitle[params.room] = title;
    return currentVideoTitle;
};

module.exports = { getCurrentVideoUrl, setCurrentVideoUrl }