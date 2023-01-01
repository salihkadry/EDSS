const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')
const TeachersAndThereRooms = {} //roomID = [teacherId,socketid]


app.use(express.static('./public'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/room.html'));
})

// io.on('connection', socket => {
//   socket.on('join-room', (roomId, userId) => {
//     socket.join(roomId)
//     const clients = io.sockets.adapter.rooms.get(roomId);

//     if(clients.size != 1)
//           io.to(TeachersAndThereRooms[roomId][1]).emit('user-connected', userId)
//           //socket.to(roomId).emit('user-connected', userId)
//     else
//           TeachersAndThereRooms[roomId] = [userId,socket.id]  

//     socket.on('disconnect', () => {
//       if(clients.size != 0)
//           io.to(TeachersAndThereRooms[roomId][1]).emit('user-disconnected', userId)    
//     }) 
//   })
// })

// setInterval(()=> console.log(TeachersAndThereRooms),10000)
server.listen(3000)