const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();

const route = require('./route');
const { addUser, getRoomUsers, removeUser, findUser } = require('./users');
const { getCurrentVideoUrl, setCurrentVideoUrl } = require('./movies');

app.use(cors({ origin: "*" }));
app.use(route);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    socket.on('checkIfExists', ({ values }) => {
        const user = findUser(values);

        if (!user) {
            socket.emit('doesntExist', { values });
        } else {    
            socket.emit('userExists');
        }
    });

    socket.on('checkIfLogged', ({ name, room }) => {
        const user = findUser({ name, room });

        if (!user) {
            socket.emit('notLogged', ({ name, room }));
        } else {
            socket.emit('logged');
        }
    });

    socket.on('join', ({ name, room }) => {
        socket.join(room);

        const videoUrl = getCurrentVideoUrl(room);
        socket.emit('videoUpdate', { videoUrl });

        const { user } = addUser({ name, room });

        socket.emit('message', {
            data: { user: { name: "Chat" }, message: `Hello, ${name}` }
        });

        socket.broadcast.to(user.room).emit('message', {
            data: { user: { name: "Chat" }, message: `${user.name} has joined` }
        });

        socket.on('sendMessage', ({ message, params }) => {
            const user = findUser(params);

            if (user) {
                io.to(user.room).emit('message', { data: { user, message } });
            }
        });

        socket.on('synchronize', ({ currentTime, params }) => {
            const user = findUser(params);
            if (user) {
                io.to(user.room).emit('synchronizeVideo', { currentTime });
            }
        });

        socket.on('videoPlay', ({ videoOn, params }) => {
            const user = findUser(params);
            if (user) {
                io.to(user.room).emit('videoPlay', !videoOn );
            }
        });
        
        socket.on('videoPause', ({ videoOn, params }) => {
            const user = findUser(params);
            if (user) {
                io.to(user.room).emit('videoPause', !videoOn);
            }
        });

        socket.on('updateVideo', ({ videoUrl, params }) => {
            const user = findUser(params);
            if (user) {
                setCurrentVideoUrl(videoUrl, params);
                io.to(user.room).emit('videoUpdate', { videoUrl });
            }
        });

        io.to(user.room).emit('joinRoom');

        io.to(room).emit('refreshUsers', { 
            data: {users: getRoomUsers(room)}
        });

        socket.on("leftRoom", ({ params }) => {
            const user = removeUser(params);

            if (user) {
                const { room, name } = user

                io.to(room).emit("message", { data: { user: { name: "Chat" }, message: `${name} has left` },});

                io.to(room).emit('refreshUsers', { 
                    data: {users: getRoomUsers(room)}
                });
            }
        })
    });

    socket.on("disconnect", () => {
        console.log("Disconnect");
    });
});
 
server.listen(5000, () => {
    console.log("Server is running");
});
