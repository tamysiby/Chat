const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const PORT = process.env.PORT || 5000
console.log(process.env.PORT)
const router = require('./router')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})
//const io = socketio(server)
app.use(cors());

io.on('connection', (socket)=>{
    console.log("we have a connection:')")

    socket.on('join', ({ name, room }, callback)=>{
        console.log(name, room)
   // const { error, user } = addUser({ id: socket.id, name, room });
        const user = addUser({ id: socket.id, name, room });
        //if(error) return callback(error);

        socket.emit('message', { user: 'admin', text:`${user.name}, welcome to ${user.room}`}); //letting the person know he's in the room
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!`}); //letting the rest of the people know

        socket.join(user.room);

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        
        callback();
    })

    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id);
        //so this was const user, but it won't work. user was undefined. let works. wtf.

        io.to(user.room).emit('message', {user: user.name, text: message});
        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});

        callback();
    });

    socket.on('disconnect', ()=>{
        console.log('User had left:)')
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', {user: 'admin', text:`${user.name} has left.`});
        }
    })//specific socket that joins
})

app.use(router)

server.listen(PORT, ()=> console.log(`Server has started on port ${PORT}`))